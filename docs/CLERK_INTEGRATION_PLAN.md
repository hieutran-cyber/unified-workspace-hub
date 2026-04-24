# Clerk Integration Plan (branch: `clerk`)

Mục tiêu: thêm Clerk làm auth provider **song song** với Keycloak. Giữ nguyên toàn bộ code Keycloak hiện có. Dùng feature flag `AUTH_PROVIDER=clerk|keycloak` để chọn provider ở runtime.

---

## 1. Chiến lược coexistence

### Frontend (`hub-web`, `pms-web`)
- Biến env `NEXT_PUBLIC_AUTH_PROVIDER` (mặc định `keycloak`).
- Wrap root bằng provider chọn theo flag: `<KeycloakProviders>` (NextAuth hiện tại) hoặc `<ClerkProviders>` (mới).
- Tạo abstraction `lib/auth-adapter.ts` expose các hàm chung: `useAuthSession()`, `signInWithProvider()`, `getAccessToken()`. Các component/hook hiện tại dùng adapter thay vì gọi thẳng `next-auth/react`.
- Các trang hiện tại (`page.tsx`, `UserNav.tsx`) đọc flag và chọn code path phù hợp. Không xoá nhánh Keycloak.

### Backend (`hub-api`, `pms-api`)
- Thêm `ClerkStrategy` (passport) dùng JWKS của Clerk, song song `JwtStrategy` Keycloak.
- Tạo custom guard `MultiAuthGuard` thử cả hai strategy, pass nếu một trong hai verify thành công. Payload chuẩn hoá: `{ userId, email, roles, permissions, name, provider }`.
- Thêm `ClerkAdminService` tương đương `KeycloakAdminService` (tạo/sửa user, org, role). Provisioning service nhận provider flag → gọi service tương ứng.
- Endpoint `/auth/sync` hoạt động với cả hai: lấy `sub` / `clerkUserId`, lưu vào cột mới `clerkUserId` trong `User`.

### Database
- Migration mới: thêm cột nullable `clerkUserId String?` trên `User`, `clerkOrgId String?` trên `Organization`. Không đụng `keycloakId`.

---

## 2. Việc cần làm trên Clerk Dashboard

Thực hiện trước khi code chạy được:

1. **Tạo Application** trên https://dashboard.clerk.com → chọn "Next.js".
2. **Copy keys** vào `.env`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. **Authentication methods**: bật Email + Password, Google OAuth (nếu cần SSO giống Keycloak hiện tại). Có thể bật Magic Link.
4. **Sessions → JWT Templates**: tạo template tên `hub-api` với custom claims:
   ```json
   {
     "email": "{{user.primary_email_address}}",
     "name": "{{user.full_name}}",
     "roles": "{{user.public_metadata.roles}}",
     "permissions": "{{user.public_metadata.permissions}}",
     "hub_permissions": "{{user.public_metadata.hub_permissions}}",
     "org_id": "{{org.id}}",
     "org_role": "{{org.role}}"
   }
   ```
   Dùng template này khi FE gọi `getToken({ template: 'hub-api' })`.
5. **Organizations**: bật feature Organizations (Dashboard → Organizations → Enable). Tạo custom organization roles khớp với role nội bộ (ví dụ: `admin`, `manager`, `staff`).
6. **Paths**: cấu hình sign-in URL = `/sign-in`, sign-up URL = `/sign-up`, after-sign-in = `/select-org`.
7. **Webhooks**: tạo endpoint trỏ đến `https://<host>/api/webhooks/clerk`, subscribe events: `user.created`, `user.updated`, `user.deleted`, `organization.created`, `organizationMembership.created`. Copy signing secret → `CLERK_WEBHOOK_SECRET`.
8. **Allowed origins / redirect URLs**: thêm `http://localhost:3000`, `http://localhost:3002` (hoặc port các app đang chạy).
9. **API Keys → Backend API**: lấy `CLERK_SECRET_KEY` cho NestJS. Nếu muốn gọi Backend API từ khác domain, tạo machine-to-machine key.
10. (Optional) **Branding**: upload logo KiNEX, set primary color khớp theme.

---

## 3. Environment variables mới

### `apps/hub-web/.env` và `apps/pms-web/.env`
```
NEXT_PUBLIC_AUTH_PROVIDER=clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/select-org
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/select-org
CLERK_JWT_ISSUER=https://<your-subdomain>.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_...
```

### `apps/hub-api/.env` và `apps/pms-api/.env`
```
AUTH_PROVIDER=clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER=https://<your-subdomain>.clerk.accounts.dev
CLERK_JWKS_URL=https://<your-subdomain>.clerk.accounts.dev/.well-known/jwks.json
```

---

## 4. Files sẽ thêm (không sửa file Keycloak cũ)

### Frontend (`hub-web`, mirror cho `pms-web`)
- `src/lib/clerk-auth.ts` — helper build trên `@clerk/nextjs`.
- `src/lib/auth-adapter.ts` — abstraction chung (`useAuthSession`, `getAccessToken`, `signInWithProvider`, `signOut`).
- `src/components/shared/ClerkProviders.tsx` — wrapper `<ClerkProvider>` + React Query.
- `src/components/shared/AuthProviders.tsx` — chọn giữa Keycloak/Clerk provider theo flag.
- `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/app/sign-up/[[...sign-up]]/page.tsx` — Clerk hosted components.
- `src/middleware.ts` — `clerkMiddleware` chỉ active khi flag = clerk.
- `src/app/api/webhooks/clerk/route.ts` — verify Svix + forward về `hub-api`.

### Backend (`hub-api`, mirror cho `pms-api`)
- `src/auth/clerk.strategy.ts` — passport strategy name `clerk-jwt` verify qua Clerk JWKS.
- `src/auth/clerk-admin.service.ts` — wrap `@clerk/backend` (`createClerkClient`) cho: `createUser`, `updateUserMetadata`, `createOrganization`, `createOrganizationMembership`.
- `src/auth/multi-auth.guard.ts` — guard try `jwt` → fallback `clerk-jwt`.
- `src/provisioning/clerk-provisioning.ts` — tương tự `provisioning.service.ts` nhưng cho Clerk.
- `src/webhooks/clerk-webhook.controller.ts` — nhận event, sync Prisma.

### Database
- `packages/database/prisma/migrations/<ts>_add_clerk_ids/migration.sql`
- Update `schema.prisma`: `clerkUserId String? @unique` trên `User`, `clerkOrgId String? @unique` trên `Organization`.

---

## 5. Thứ tự implement

1. ✅ Viết plan này.
2. Cài dependencies: `@clerk/nextjs` (web), `@clerk/backend` (api), `svix` (webhook verify).
3. Thêm biến env + update `.env.example`.
4. Prisma: thêm `clerkUserId`, `clerkOrgId`, migrate.
5. Backend: `ClerkStrategy` + `MultiAuthGuard`, đăng ký trong `AuthModule`.
6. Backend: `ClerkAdminService` + webhook controller + update `/auth/sync` nhận `provider`.
7. Frontend: `auth-adapter` + `ClerkProviders` + `AuthProviders` wrapper.
8. Frontend: trang `sign-in`, `sign-up`, middleware, sửa `page.tsx` + `UserNav.tsx` dùng adapter.
9. Test E2E với `AUTH_PROVIDER=clerk`: login → sync user → gọi API với Clerk JWT → verify pass.
10. Test regression với `AUTH_PROVIDER=keycloak` vẫn chạy.

---

## 6. Checklist test

- [ ] Đăng nhập mới bằng Clerk → redirect `/select-org`.
- [ ] `hub-api` verify được JWT của Clerk (curl với Bearer token từ `getToken`).
- [ ] `/auth/sync` lưu `clerkUserId` vào DB.
- [ ] Webhook tạo user mới từ Clerk dashboard → xuất hiện trong Prisma.
- [ ] Switch flag về `keycloak` → flow Keycloak cũ không hỏng.
- [ ] `pms-api` nhận cả hai loại token.
- [ ] Org switcher hoạt động (Clerk `<OrganizationSwitcher/>`).
