# Đề xuất Kiến trúc: Hệ sinh thái Workspace Hợp nhất (KiNEX Ecosystem)

Tài liệu này trình bày chiến lược hợp nhất các ứng dụng đang vận hành độc lập (Odoo, PMS, POS) thành một hệ sinh thái duy nhất, được quản trị từ một nền tảng Workspace trung tâm.

---

## 1. Bối cảnh và Vấn đề

Hiện tại, hệ thống đang vận hành với nhiều ứng dụng riêng biệt, mỗi ứng dụng có cách quản lý người dùng, phân quyền và cấu trúc tổ chức khác nhau. Điều này dẫn đến:

- **Người dùng bị phân mảnh**: Một nhân viên phải tạo tài khoản riêng ở từng app, với mật khẩu khác nhau.
- **Phân quyền không nhất quán**: Cùng một nhân viên có thể có vai trò khác nhau giữa các app mà không có sự kiểm soát tập trung.
- **Cấu trúc tổ chức xung đột**: Odoo và PMS/POS có cách quản lý Company và Property khác nhau.
- **Trải nghiệm kém**: Nhân viên phải đăng nhập nhiều lần khi chuyển đổi giữa các ứng dụng.
- **Thiếu tính mở rộng cho bên thứ ba**: Kiến trúc hiện tại chưa hỗ trợ việc đóng gói hệ thống để cung cấp cho các khách hàng doanh nghiệp khác (B2B) như một nền tảng dịch vụ (SaaS).

**Mục tiêu mở rộng**: Hệ thống không chỉ phục vụ nội bộ KiNEX mà còn được thiết kế để có thể thương mại hóa, cho phép các tổ chức bên ngoài đăng ký và sử dụng toàn bộ hệ sinh thái quản trị này (White-label/SaaS ready).

---

## 2. Tầm nhìn: Hệ sinh thái Quản trị Đa Tổ chức (Organization-First)

Chúng ta sẽ xây dựng một **Nền tảng Workspace trung tâm** đóng vai trò điều phối cho toàn bộ hệ sinh thái. Điểm khác biệt cốt lõi là việc đặt **Organization (Tổ chức)** làm trọng tâm của mọi thực thể quản lý.

### 2.1 Mô hình Phân tầng Dữ liệu (Hierarchy)

Hệ thống được thiết kế theo cấu trúc Top-Down, trong đó **Organization là cấp cao nhất** và **mỗi Application thuộc về một Organization** với cấu trúc nội bộ riêng:

#### Cấp 0 — Organization (Root / Tenant)
- Đại diện cho một tập đoàn hoặc pháp nhân lớn nhất.
- Mọi thực thể (User, App, Role) đều phải thuộc về một Organization.
- Cho phép cách ly dữ liệu hoàn toàn giữa các khách hàng/tập đoàn khác nhau.
- Là điểm kích hoạt subscription cho từng App con.

#### Cấp 1 — Application (thuộc Organization)
Mỗi Organization có thể kích hoạt một hoặc nhiều Application: **Odoo (ERP)**, **PMS (Hotel)**, **POS (Sales)**. Mỗi App có một **cấu trúc nội bộ riêng** không đồng nhất với nhau.

**Odoo App — Cấu trúc nội bộ:**

| Thực thể        | Quan hệ                                                                                |
| :-------------- | :------------------------------------------------------------------------------------- |
| **Department**  | Nhóm User theo phòng ban. User được group theo Department.                            |
| **Company**     | Pháp nhân con. User **có thể thuộc** Company hoặc **không thuộc** Company nào.        |
| **Property**    | Một Property có thể thuộc **nhiều Company** (quan hệ M:N qua bảng `CompanyProperty`). |
| **User-Property** | User **có thể thuộc** Property hoặc **không thuộc**. Optional binding.              |
| **Department ↔ Property** | **Không có quan hệ** trực tiếp. Hai trục độc lập.                            |

**PMS & POS App — Cấu trúc nội bộ (giống nhau):**

| Thực thể     | Quan hệ                                                              |
| :----------- | :------------------------------------------------------------------- |
| **Company**  | User khi đăng nhập **bắt buộc thuộc về một Company**.               |
| **Property** | Một Company có nhiều Property. Property thuộc **đúng 1 Company**.   |
| **Outlet**   | Một Property có nhiều Outlet (điểm bán: nhà hàng, quầy bar, spa…). |

#### Cấp 2 — Role & Permission (Cross-cutting)
- Toàn bộ quan hệ giữa User và các thực thể bên trên (Department, Company, Property, Outlet) được **cấu hình thông qua Role**.
- Role được **assign cho User** tại từng App, từng scope (Company / Property / Department / Outlet).
- Không có quan hệ trực tiếp User ↔ Property; mọi quyền truy cập đều đi qua Role assignment.

#### Cấp 3 — User (Identity)
- Một User có **một tài khoản định danh duy nhất** (email) tại Hub.
- User có thể được mời vào **nhiều Organization** khác nhau (qua bảng `OrgMembership`), mỗi nơi với scope role riêng.
- Trong thực tế đa số nhân viên chỉ thuộc **01 Organization chính**. Kiến trúc vẫn hỗ trợ trường hợp ngoại lệ (consultant, quản lý vùng liên tập đoàn).

#### Cơ chế Instance Binding
Mỗi Organization có thể được liên kết với **Instance ứng dụng riêng biệt**. Ví dụ: Org A dùng Odoo Instance #1, Org B dùng Odoo Instance #2. Workspace Hub đóng vai trò "Proxy" điều phối lệnh tới đúng Instance tương ứng.

### 2.2 Mô hình Quan hệ User ↔ Organization (Membership)

Để hỗ trợ linh hoạt việc một User tham gia nhiều Org, hệ thống sử dụng bảng trung gian **OrgMembership**:

| Trường      | Mô tả                                            |
| :---------- | :----------------------------------------------- |
| `userId`    | Khóa ngoại tới bảng User                         |
| `orgId`     | Khóa ngoại tới bảng Organization                 |
| `orgRole`   | Vai trò trong Org: `OWNER`, `ADMIN`, `MEMBER`    |
| `status`    | Trạng thái: `ACTIVE`, `INVITED`, `SUSPENDED`     |
| `isPrimary` | Đánh dấu Org chính của User (mặc định khi login) |

- **Quy tắc**: Khi User đăng nhập, hệ thống kiểm tra tất cả Org mà User thuộc về. Nếu chỉ có 1 Org → tự động vào Org đó. Nếu có nhiều → hiển thị màn hình chọn Organization (ưu tiên Org có `isPrimary = true`).
- **Trường hợp phổ biến**: 1 User — 1 Org — nhiều Properties với các Role khác nhau tại mỗi Property.

### 2.3 Nguyên tắc cốt lõi

- **Đăng nhập một lần (SSO) & Chọn tổ chức**: Sau khi đăng nhập, người dùng được chọn Organization để làm việc. Hệ thống tự động lọc các App và Property thuộc về Organization đó.
- **Quản trị tập trung (Centralized Governance)**: Việc thiết lập cấu trúc tổ chức, thêm bớt chi nhánh (Property) và phân quyền ứng dụng được thực hiện duy nhất tại Workspace Hub.
- **Linh hoạt hóa Instance (On-demand Provisioning)**: Hệ thống hỗ trợ mô hình "Multi-instance". Nếu khách hàng (Organization) mới yêu cầu một môi trường Odoo hay PMS riêng biệt, Workspace Hub có thể kết nối tới Instance đó và thực hiện quản trị nhân sự tập trung mà không làm ảnh hưởng tới các tổ chức khác.
- **Đồng bộ định danh (Identity Sync)**: Keycloak đóng vai trò là "Sổ định danh" chung. Workspace Hub điều phối việc đẩy dữ liệu (Provisioning) xuống các ứng dụng con theo đúng ngữ cảnh của Organization.

---

## 3. Sơ đồ Kiến trúc Trực quan (Visual Diagrams)

### 3.1 Sơ đồ Tổng thể Hệ thống (Hub & Spoke Architecture)

```diagram hub-spoke
+------------------------------------------------------------------+
|                     KINEX ECOSYSTEM                              |
|                                                                  |
|  +------------------+        +----------------------------+      |
|  |   IDENTITY       |        |     WORKSPACE HUB          |      |
|  |   PROVIDER       |        |     (hub-api + hub-web)    |      |
|  |                  |        |                            |      |
|  |  Keycloak        |  JWT   |  [Auth Middleware]         |      |
|  |  (hoặc Clerk)    |<------>|  [Org Guard]               |      |
|  |                  |  SAML  |  [Provisioning Engine]     |      |
|  |  - Users         |        |  [BullMQ Worker]           |      |
|  |  - Sessions      |        |  [Hub Database - Shared]   |      |
|  |  - Realms        |        |                            |      |
|  +------------------+        +---+----+----+----+---------+      |
|                                  |    |    |    |                |
|           +----------------------+    |    |    +----------+     |
|           |               +----------+    |               |     |
|           v               v               v               v     |
|  +---------------+  +----------+  +----------+  +----------+   |
|  | Odoo Instance |  | PMS      |  | POS      |  | Future   |   |
|  | (per Org DB)  |  | Instance |  | Instance |  | App      |   |
|  |               |  |          |  |          |  |          |   |
|  | Org A: DB_A   |  | DB_A     |  | DB_A     |  |          |   |
|  | Org B: DB_B   |  | DB_B     |  | DB_B     |  |          |   |
|  +---------------+  +----------+  +----------+  +----------+   |
+------------------------------------------------------------------+
```

### 3.2 Cấu trúc Dữ liệu — Organization, Apps & Internal Models

Sơ đồ thể hiện rõ: **Organization** ở cấp cao nhất; mỗi **App** thuộc về Org có cấu trúc nội bộ riêng (Odoo: Department + Company-Property M:N + User optional; PMS/POS: Company → Property → Outlet bắt buộc); **Role** là lớp cấu hình cross-cutting để assign quyền cho User vào các thực thể đó.

```diagram hierarchy
ORGANIZATION (Tenant / Root)
  |
  |-- name, slug, tax_code, domain, subscription_plan
  |-- app_instances: { odoo_url, pms_url, pos_url }
  |
  +---> PROPERTY (Branch / Location)              [1 Org --- N Properties]
  |       |
  |       |-- name, address, timezone, branch_code
  |       |
  |       +---> APPLICATION (per Property)         [1 Property --- N Apps]
  |               |
  |               |-- app_type: ODOO | PMS | POS
  |               |-- instance_url
  |               |-- status: ACTIVE | INACTIVE
  |
  +---> ORG_MEMBERSHIP                             [1 Org --- N Members]
  |       |
  |       |-- user_id  (FK -> User)
  |       |-- org_role: OWNER | ADMIN | MEMBER
  |       |-- status:   ACTIVE | INVITED | SUSPENDED
  |       |-- is_primary: boolean
  |
  +---> ROLE_APP_MAPPING                           [Permission Matrix]
          |
          |-- user_id + org_id + property_id + role + app
          |
          |  Example:
          |  nguyen.van.a | KiNEX | Hanoi Hotel | MANAGER | Odoo
          |  nguyen.van.a | KiNEX | Hanoi Hotel | STAFF   | PMS
          |  nguyen.van.a | KiNEX | Danang Hotel| VIEWER  | POS

USER (Global Identity)
  |-- email (unique)          <-- 1 email = 1 identity across all orgs
  |-- keycloak_id / clerk_id
  |-- belongs to N Organizations via OrgMembership
```

### 3.3 Luồng Xác thực - Phương án Keycloak

```diagram auth-keycloak
Browser          Hub Web         Keycloak          Hub API         Odoo/PMS
  |                 |                |                 |               |
  |-- Visit / ----->|                |                 |               |
  |                 |-- Redirect  -->|                 |               |
  |                 |   (OIDC)       |                 |               |
  |<-- Login Page --|                |                 |               |
  |                 |                |                 |               |
  |-- Credentials ->|                |                 |               |
  |                 |-- POST /auth ->|                 |               |
  |                 |<-- ID Token ---|                 |               |
  |                 |                                  |               |
  |                 |---------- GET /me + Token ------>|               |
  |                 |<--------- OrgMembership list -----|               |
  |                 |                                  |               |
  |<-- /select-org -|  (if multiple orgs)              |               |
  |-- Pick Org ---->|                                  |               |
  |                 |---------- POST /session/org ----->|               |
  |                 |<--------- JWT {org_id, roles} ----|               |
  |                 |                                  |               |
  |<-- /launcher ---|  (App Launcher loaded)           |               |
  |                 |                                  |               |
  |-- Click Odoo -->|                                  |               |
  |                 |---------- POST /sso/odoo -------->|               |
  |                 |                                  |-- auth_oauth ->|
  |                 |                                  |<-- one-time ---|
  |                 |                                  |    token       |
  |                 |<--------- redirect_url + token ---|               |
  |-- Redirect ---->|                                  |               |
  |                 |---------------------------------------- GET ----->|
  |<-- Odoo App ----|                                  |               |
```

### 3.4 Luồng Xác thực - Phương án Clerk

```diagram auth-clerk
Browser          Hub Web (Next.js)   Clerk Cloud      Hub API         Odoo
  |                 |                    |               |               |
  |-- Visit / ----->|                    |               |               |
  |                 |-- <SignIn /> ----->|               |               |
  |<-- Clerk Modal -|                    |               |               |
  |-- Credentials ->|                    |               |               |
  |                 |-- Auth ----------->|               |               |
  |                 |<-- Session + JWT --|               |               |
  |                 |    {org_id claim}  |               |               |
  |                 |                                    |               |
  |<-- <OrgSwitcher>|  (built-in UI, no custom code)    |               |
  |-- Pick Org ---->|                                    |               |
  |                 |-- Clerk re-issues JWT {org_id} --->|               |
  |                 |                                    |               |
  |<-- /launcher ---|                                    |               |
  |                 |                                    |               |
  |-- Click Odoo -->|                                    |               |
  |                 |---------- POST /sso/odoo --------->|               |
  |                 |          (Clerk JWT in header)     |               |
  |                 |                           [BROKER] |               |
  |                 |                    Hub generates   |               |
  |                 |                    internal JWT -->|               |
  |                 |                                    |-- POST auth -->|
  |                 |                                    |<-- session ----|
  |                 |<--------- redirect + session -------|               |
  |<-- Odoo App ----|                                                    |
  |
  NOTE: Clerk -> Odoo requires custom Identity Broker at Hub layer
        (No native SAML support from Clerk)
```

### 3.5 Luồng Provisioning / De-provisioning

```diagram provisioning
Admin (Hub Web)       Hub API          BullMQ Queue       Odoo Driver
  |                      |                  |                   |
  |-- Assign Role ------>|                  |                   |
  |                      |-- Enqueue Job -->|                   |
  |<-- 200 OK (async) ---|                  |                   |
  |                       (immediate ack)   |                   |
  |                                         |-- Process Job --->|
  |                                         |                   |-- POST /api/users
  |                                         |                   |-- PUT  /api/roles
  |                                         |                   |
  |                                         |<-- 200 OK --------|
  |                                         |-- Write ProvisioningLog (SUCCESS)
  |
  [FAILURE SCENARIO]
  |                                         |-- POST /api/users
  |                                         |<-- 503 Timeout ---|
  |                                         |-- Retry 1 (30s)   |
  |                                         |-- Retry 2 (2m)    |
  |                                         |-- Retry 3 (10m)   |
  |                                         |-- Move to DLQ     |
  |                                         |-- Write ProvisioningLog (FAILED)
  |                                         |-- Alert Admin (email/Slack)
  |
  Admin sees DLQ on Dashboard --> Re-trigger manually
```

### 3.6 Sơ đồ Giao tiếp Liên ứng dụng (Inter-App Communication)

```diagram inter-app-comm
+-------------------+      HTTPS/REST       +-------------------+
|   HUB API         |<--------------------->|   Odoo Instance   |
|   (NestJS)        |   Service Account     |   (per Org)       |
|                   |   JWT Auth            |                   |
|   Org A --> DB_A  |                       |   DB_A (Pg)       |
+-------------------+                       +-------------------+
         |
         |  HTTPS/REST
         |  Service Account
         v
+-------------------+                       +-------------------+
|   PMS Instance    |                       |   POS Instance    |
|   (per Org)       |                       |   (per Org)       |
|   DB_B (Pg)       |                       |   DB_B (Pg)       |
+-------------------+                       +-------------------+

SECURITY BOUNDARIES:
  - Hub uses per-app Service Account (least privilege)
  - Each app validates org_id in JWT before accepting commands
  - No direct app-to-app communication (all routes through Hub)
  - Network: Apps on private subnet, Hub on DMZ

SCALABILITY:
  - BullMQ handles burst provisioning (e.g. 500 users at org onboard)
  - Hub API stateless -> horizontal scale with load balancer
  - Each Org's app instance isolated -> no noisy-neighbor problem
```

---

## 4. Phân tích và So sánh Giải pháp (Keycloak vs. Clerk)

Trong quá trình thiết kế, chúng tôi đã cân nhắc hai giải pháp hàng đầu là **Keycloak** (Open Source, Self-hosted) và **Clerk** (Managed SaaS). Dưới đây là bảng đánh giá chi tiết đặc biệt tập trung vào bài toán B2B SaaS (Multi-tenant):

### 4.1 Bảng so sánh Chi tiết

| Tiêu chí Đánh giá                    | Keycloak (Open Source / Self-hosted)                                   | Clerk (Managed B2B SaaS)                                                  | Lợi thế                            |
| :----------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------------ | :--------------------------------- |
| **Mô hình vận hành**                 | Tự quản lý (Self-hosted) trên hạ tầng Docker/K8s.                      | Thuê dịch vụ trọn gói (Managed), API-first.                               | **Clerk** (Không tốn DevOps)       |
| **Chủ quyền Dữ liệu**                | **100%**: Thông tin User, Session nằm hoàn toàn trong DB của công ty.  | **Giới hạn**: Dữ liệu định danh lưu tại Cloud của Clerk (Mỹ/Châu Âu).     | **Keycloak** (Bảo mật tuyệt đối)   |
| **Multi-tenancy (Đa tổ chức)**       | Hỗ trợ qua Realm hoặc Group. Phải tự code logic cô lập và quản lý Org. | Có sẵn **Organization API**: Tự động chia tenant, quản lý member, role.   | **Clerk** (Tiết kiệm 60% dev time) |
| **Tích hợp Legacy (Odoo)**           | **Native**: Hỗ trợ chuẩn SAML 2.0, LDAP (rất cần cho Odoo/ERP cũ).     | **Hạn chế**: Chỉ hỗ trợ OIDC/JWT. Cần viết Adapter riêng để nối với Odoo. | **Keycloak** (Chuẩn doanh nghiệp)  |
| **Tùy biến Giao diện (White-label)** | Vô hạn: Có thể tùy chỉnh trang Login riêng biệt cho từng Organization. | Giới hạn: Chỉ đổi được logo, màu sắc cơ bản. Giao diện Login chung.       | **Keycloak** (Branding tốt hơn)    |
| **Trải nghiệm Developer (DX)**       | Khó: Tài liệu phức tạp, cần hiểu sâu về Java và chuẩn OAuth2/SAML.     | Tuyệt vời: SDK cho Next.js/Node.js cực mạnh, copy-paste là chạy.          | **Clerk** (Go-to-market cực nhanh) |
| **Tính năng mở rộng**                | MFA cơ bản, Social Login cần tự setup.                                 | MFA nâng cao, Passkeys, Bot protection, Social login 1-click.             | **Clerk** (Hiện đại hóa)           |

### 4.2 Phân tích Kinh tế và Quy mô (Scale Simulation)

| Quy mô Hệ thống                      | Ước tính Chi phí Clerk                 | Ước tính Chi phí Keycloak (Infra) | Phân tích                                |
| :----------------------------------- | :------------------------------------- | :-------------------------------- | :--------------------------------------- |
| **MVP (1-5 Orgs, < 500 User)**       | **~$0 - $50/tháng**                    | **$50 - $100/tháng** (VPS + DB)   | **Clerk thắng** do miễn phí bậc thấp.    |
| **Scale (50 Orgs, 5.000 User)**      | **~$500 - $800/tháng** (Phí MAU + Org) | **$100 - $150/tháng**             | **Keycloak rẻ hơn**.                     |
| **Enterprise (500+ Orgs, 50k User)** | **$3.000 - $5.000+/tháng**             | **$300 - $500/tháng** (Cluster)   | **Keycloak thắng tuyệt đối** về chi phí. |

### 4.3 Quyết định Kiến trúc (Architecture Decision Record)

**Lựa chọn: Keycloak**

**Lý do:**
1. Odoo yêu cầu SAML 2.0 để SSO — Clerk không hỗ trợ SAML Outbound, bắt buộc phải viết Identity Broker phức tạp.
2. Mục tiêu scale 500+ Organization trong 18 tháng → chi phí Clerk sẽ vượt $3.000-$5.000/tháng, Keycloak chỉ ~$300-$500/tháng.
3. Yêu cầu White-label (custom login page per Org) — Keycloak hỗ trợ native, Clerk giới hạn branding.
4. Chủ quyền dữ liệu: thông tin định danh người dùng nằm hoàn toàn trong hạ tầng công ty.

**Điều kiện xem xét lại (khi nào nên chuyển sang Clerk):**
- Nếu timeline bị ép xuống dưới 3 tuần và Odoo có thể chấp nhận OIDC.
- Nếu quy mô dự kiến không vượt 50 Organization trong 12 tháng đầu.

---

## 5. Đánh giá Tích hợp Clerk với Hệ thống Hiện tại

### 5.1 Mức độ Phù hợp (Compatibility Assessment)

| Thành phần          | Mức độ Tương thích | Ghi chú                                                                           |
| :------------------ | :----------------- | :-------------------------------------------------------------------------------- |
| **Next.js Hub Web** | TUYỆT VỜI          | `@clerk/nextjs` SDK tích hợp native, middleware 1 dòng, component UI có sẵn.     |
| **NestJS Hub API**  | TỐT                | `@clerk/clerk-sdk-node` hỗ trợ JWT verification. Cần viết Guard tùy chỉnh.       |
| **Odoo SSO**        | KHÓ                | Clerk không có SAML Outbound. Cần viết Identity Broker tại Hub (2-3 tuần extra). |
| **PMS/POS**         | TRUNG BÌNH         | Nếu PMS/POS dùng JWT/OIDC → dễ tích hợp. Nếu dùng session cũ → cần adapter.     |
| **Multi-Org**       | TỐT                | Clerk Organizations API đủ mạnh, nhưng Hub vẫn cần bảng OrgMembership riêng.    |
| **White-label**     | HẠN CHẾ            | Chỉ customize logo/màu. Không thể có login page riêng per Org.                   |
| **Data residency**  | RỦI RO             | Dữ liệu user lưu tại US/EU. Có thể vi phạm yêu cầu data sovereignty nội bộ.     |

### 5.2 Rủi ro và Issues Tiềm ẩn khi dùng Clerk

**Rủi ro Kỹ thuật:**
- **Odoo SAML Blocker**: Đây là rủi ro lớn nhất. Odoo enterprise SSO dựa vào SAML 2.0. Clerk không phát hành SAML assertions. Giải pháp workaround (Hub làm Identity Broker) thêm 1 lớp phức tạp, là điểm lỗi đơn (single point of failure) và tốn 2-3 tuần dev.
- **JWT Claim Conflict**: Clerk JWT có cấu trúc claims riêng (`org_id`, `org_role`). Nếu Hub API và Odoo cùng expect cấu trúc khác nhau → cần transform layer, dễ gây bug.
- **Webhook Lag**: Clerk thông báo sự kiện (user created, org changed) qua webhook. Nếu webhook delay → Hub và Odoo có thể out-of-sync trong vài giây.

**Rủi ro Vận hành:**
- **Vendor Lock-in**: Một khi migrate user sang Clerk, việc chuyển sang Keycloak sau này rất tốn kém (export user, reset password, update integrations).
- **Pricing Unpredictability**: Clerk tính phí theo MAU (Monthly Active User). Nếu có chiến dịch onboarding lớn → chi phí tăng đột biến không kiểm soát được.
- **Downtime phụ thuộc Clerk**: Nếu Clerk cloud down → toàn bộ authentication của hệ thống ngừng hoạt động. Không có fallback.

**Rủi ro Tuân thủ:**
- Dữ liệu định danh (tên, email, số điện thoại nhân viên) lưu tại cloud của Clerk (Mỹ hoặc Châu Âu). Có thể không đáp ứng yêu cầu nội bộ về data residency.

### 5.3 Kịch bản Khuyến nghị sử dụng Clerk

Clerk phù hợp nếu thỏa MẤT CẢ ba điều kiện:
1. MVP cần ra mắt trong vòng 4 tuần.
2. Odoo được chấp nhận tích hợp qua OIDC/JWT thay vì SAML (cần xác nhận với team Odoo).
3. Quy mô tối đa 50 Organization trong 12 tháng đầu (kiểm soát chi phí).

Nếu không thỏa, **Keycloak là lựa chọn duy nhất hợp lý**.

---

## 6. Tài liệu Kỹ thuật Chi tiết theo Phương án

### 6.1 Phương án A: Keycloak

#### 6.1.1 Kiến trúc Triển khai

```diagram keycloak-deploy
[Docker Compose / Kubernetes]

  +------------------+     +------------------+     +------------------+
  | keycloak:latest  |     | hub-api (NestJS)  |     | hub-web (Next.js)|
  | port: 8080       |     | port: 3001        |     | port: 3000       |
  | DB: PostgreSQL   |     | DB: PostgreSQL    |     |                  |
  | (keycloak_db)    |     | (hub_db)          |     |                  |
  +------------------+     +------------------+     +------------------+
          |                        |                        |
          |     OIDC Discovery     |                        |
          +<-----------------------+                        |
          |     SAML Metadata      |                        |
          +<-- Odoo Instance ------+                        |
                                   |                        |
                         +---------+----------+             |
                         | Redis (BullMQ)     |             |
                         | port: 6379         |             |
                         +--------------------+             |
```

#### 6.1.2 Luồng Auth Chi tiết (Keycloak OIDC)

```
1. hub-web redirect -> Keycloak /auth/realms/kinex/protocol/openid-connect/auth
   Params: client_id=hub-web, redirect_uri, scope=openid profile email

2. User login tại Keycloak UI (có thể custom theme per realm)

3. Keycloak redirect back -> hub-web/auth/callback?code=AUTH_CODE

4. hub-web server exchange code -> Keycloak token endpoint
   POST /auth/realms/kinex/protocol/openid-connect/token
   Response: { id_token, access_token, refresh_token }

5. hub-web gọi hub-api GET /auth/me (kèm access_token)
   hub-api verify token với Keycloak JWKS endpoint
   hub-api trả về { user, orgs[] }

6. Nếu orgs.length > 1 -> redirect /select-org
   Nếu orgs.length = 1 -> auto-select -> redirect /launcher

7. Sau khi chọn org, hub-api issue custom JWT:
   { sub: userId, org_id: selectedOrgId, roles: [...], exp: ... }
   -> Lưu vào HttpOnly cookie (không localStorage)
```

#### 6.1.3 Cấu hình Keycloak Realm

```
Realm: kinex-workspace
  Client: hub-web
    - Valid Redirect URIs: https://hub.kinex.vn/auth/callback
    - Scopes: openid, profile, email, roles
  Client: odoo-saml-client
    - Protocol: SAML
    - Assertion Consumer Service: https://odoo.kinex.vn/web/dataset/call_kw
    - Name ID Format: email
  User Attributes:
    - org_ids: ["org_1", "org_2"]  (synced from Hub DB)
  Client Scopes:
    - org-scope: mapper reads org_ids attribute -> JWT claim
```

#### 6.1.4 Role & Permission Model (Keycloak)

```
Keycloak Roles (coarse-grained):
  - workspace:admin
  - workspace:member
  - workspace:viewer

Hub DB Roles (fine-grained, per Org/Property/App):
  - RoleAppMapping { userId, orgId, propertyId, appType, role }
  - Role values: OWNER | MANAGER | STAFF | VIEWER

Permission check flow:
  1. Keycloak JWT xác nhận: "user có quyền dùng Hub"
  2. Hub JWT xác nhận: "user có quyền gì trong Org X, Property Y, App Z"
  3. App con (Odoo) xác nhận: "Odoo role tương ứng"
```

#### 6.1.5 Data Isolation (Keycloak)

```
Hub Database (Shared, PostgreSQL):
  - Mọi table đều có cột orgId NOT NULL
  - Prisma Middleware:
    const orgMiddleware = async (params, next) => {
      if (params.action !== 'create') {
        params.args.where = { ...params.args.where, orgId: ctx.orgId }
      }
      return next(params)
    }
  - Query không có orgId -> throw UnauthorizedException

App Databases (Isolated, per Org):
  - Odoo Org A: postgresql://odoo_a_db
  - Odoo Org B: postgresql://odoo_b_db
  - Hub lưu connection config trong bảng AppInstance { orgId, appType, dbUrl, apiUrl }
```

---

### 6.2 Phương án B: Clerk

#### 6.2.1 Kiến trúc Triển khai

```diagram clerk-deploy
[Managed Services]

  +-----------------------+     +------------------+     +------------------+
  | Clerk Cloud           |     | hub-api (NestJS)  |     | hub-web (Next.js)|
  | (US/EU Data Center)   |     | port: 3001        |     | port: 3000       |
  |                       |     | DB: PostgreSQL    |     | @clerk/nextjs    |
  | - User store          |     | (hub_db)          |     |                  |
  | - Organization store  |     |                   |     |                  |
  | - Session management  |     |                   |     |                  |
  +-----------------------+     +------------------+     +------------------+
          |                             |
          | Webhooks (async)            |  Identity Broker
          +-----------------------------+---------> Odoo (custom JWT)
```

#### 6.2.2 Luồng Auth Chi tiết (Clerk)

```
1. User vào hub-web, Clerk middleware detect unauthenticated
   -> Render <SignIn /> component (hosted by Clerk)

2. User login -> Clerk issue session cookie + JWT
   JWT payload: { sub: user_id, org_id: current_org, org_role: admin/member }

3. <OrganizationSwitcher /> hiển thị danh sách Org (từ Clerk Organizations)
   User chọn Org -> Clerk re-issue JWT với org_id mới

4. hub-web gọi hub-api với Clerk JWT (Authorization: Bearer ...)
   hub-api verify với Clerk JWKS (https://api.clerk.com/v1/jwks)

5. hub-api đọc org_id từ JWT -> truy vấn RoleAppMapping -> return permissions

6. [SSO sang Odoo - Identity Broker]
   User click Odoo:
   a. hub-web POST /api/sso/odoo (kèm Clerk JWT)
   b. hub-api verify Clerk JWT, đọc org_id
   c. hub-api generate internal JWT { userId, orgId, odooRole, exp: +5min }
      ký bằng Hub's private key (RS256)
   d. hub-api POST Odoo /web/dataset/call_kw/res.users/authenticate
      với internal JWT
   e. Odoo verify internal JWT (public key pre-configured)
   f. Odoo tạo session, trả session_id
   g. hub-api redirect browser -> Odoo với session cookie
```

#### 6.2.3 Role & Permission Model (Clerk)

```
Clerk Organization Roles (built-in):
  - org:admin
  - org:member

Hub DB Roles (fine-grained, tương tự Keycloak):
  - RoleAppMapping { userId, orgId, propertyId, appType, role }

Difference from Keycloak:
  - Với Keycloak: Hub trust Keycloak JWT trực tiếp
  - Với Clerk: Hub trust Clerk JWT, nhưng phải map sang Hub roles
  - Fine-grained permission vẫn nằm 100% tại Hub DB (không phụ thuộc IdP)
```

#### 6.2.4 Data Isolation (Clerk)

```
Identity layer (Clerk):
  - Clerk Organization = tenant boundary tại identity level
  - Clerk tự đảm bảo user X không thấy data của Org Y trong Clerk Dashboard

Hub layer (giống Keycloak):
  - Prisma Middleware RLS với orgId
  - Hub API validate org_id từ Clerk JWT = org_id trong request

App layer:
  - Giống Keycloak: DB riêng per Org
  - Khác: Không có SAML, chỉ dùng custom JWT từ Hub làm bridge
```

---

## 7. Hướng giải quyết Kỹ thuật (Kiến trúc linh hoạt IdP)

Hệ thống được thiết kế theo mô hình **IdP-Agnostic** (không phụ thuộc cứng vào IdP). Dù chọn Keycloak hay Clerk, kiến trúc lõi của Workspace Hub vẫn giữ nguyên.

### 7.1 Hợp nhất Danh tính và Cơ chế SSO

**Vấn đề**: Người dùng làm việc cho nhiều tổ chức/chi nhánh khác nhau phải quản lý nhiều tài khoản.

**Giải pháp với Keycloak (Tùy chọn A):**

1.  **Luồng Đăng nhập**: User xác thực tại Keycloak → Hub nhận Token → Kiểm tra bảng `OrgMembership` tự build → Mở giao diện chọn Org → Ghi `org_id` vào Custom JWT.
2.  **SSO App con**: Keycloak dùng **SAML** hoặc OIDC đẩy thẳng Token xuống Odoo/PMS.
3.  **Cross-Tenant Guard**: Keycloak sử dụng `Client Scope` để chặn việc lấy Token trái phép.

**Giải pháp với Clerk (Tùy chọn B):**

1.  **Luồng Đăng nhập**: Dùng component `<SignIn />` của Clerk.
2.  **Chọn Tổ chức**: Dùng component `<OrganizationSwitcher />` có sẵn. Clerk tự động cấp JWT Token chứa sẵn `org_id` hiện tại (`org_id` claim).
3.  **SSO App con (Thách thức)**: Vì Clerk không hỗ trợ SAML Outbound tốt, Hub API phải đóng vai trò là "Identity Broker": Hub nhận Clerk Token → Tự generate một JWT nội bộ → Gửi JWT này cho Odoo qua API ngầm để lấy session Odoo → Trả session Odoo về cho trình duyệt.

### 7.2 Chiến lược Cách ly Dữ liệu (Data Isolation)

Đây là quyết định kiến trúc quan trọng nhất cho multi-tenant SaaS:

**Phương án: Shared Database + Row-Level Security (RLS)**

| Thành phần               | Chiến lược                                    | Chi tiết                                                    |
| :----------------------- | :-------------------------------------------- | :---------------------------------------------------------- |
| **Hub Database**         | Shared DB, mọi bảng có cột `orgId` (NOT NULL) | Prisma Middleware tự inject `WHERE orgId = ?` vào mọi query |
| **IdP (Keycloak/Clerk)** | 1 Environment chung                           | Keycloak dùng Attribute / Clerk dùng built-in Organizations |
| **App Instances**        | DB riêng per Org (Instance Binding)           | Mỗi Odoo/PMS instance có DB riêng, đảm bảo cô lập hoàn toàn |

**Lý do chọn Shared DB cho Hub**: Đơn giản hóa việc quản trị, backup và migration. Prisma Middleware đảm bảo không bao giờ có cross-org data leak.
**Lý do chọn DB riêng cho App Instances**: Odoo, PMS đều có schema phức tạp và không được thiết kế cho multi-tenant. Tách instance hoàn toàn là cách an toàn nhất.

### 7.3 Cấu trúc Quản trị Đa tầng chi tiết

1.  **Organization (Tenant)**:
    - Metadata: Tên tập đoàn, slug, mã số thuế, domain riêng.
    - Liên kết: Cấu hình App Instance (Odoo URL, PMS URL).
2.  **Property (Location)**:
    - Metadata: Địa chỉ, mã chi nhánh, múi giờ. Thuộc về 1 Org duy nhất.
3.  **Role & App Mapping**:
    - Quyền hạn được cấp theo công thức: `User + Organization + Property + Role`.

### 7.4 Bảo mật Cross-Tenant (Chống truy cập chéo)

Hệ thống ngăn chặn tuyệt đối việc User thuộc Organization này truy cập dữ liệu của Organization khác:

1.  **Lớp bảo vệ Backend Guard (Tại Hub)**:
    - Mọi API request đều đính kèm JWT (từ Keycloak hoặc Clerk).
    - Middleware giải mã Token, đọc `org_id` và kiểm tra quyền hạn. Nếu phát hiện request cố tình truyền `org_id` lạ → trả về `403 Forbidden`.
2.  **Lớp bảo vệ Client / SSO (Tại App con)**:
    - Odoo/PMS được cấu hình để chỉ chấp nhận Token từ Hub/IdP nếu Token đó chứa đúng `org_id` khớp với Instance đó.

---

## 8. Luồng Nghiệp vụ Chính (Organization-Centric)

### 8.1 Khởi tạo Tổ chức mới (Onboarding)

1. Super Admin tạo Organization trên Hub (hoặc qua Clerk Dashboard).
2. Khai báo các Property trực thuộc.
3. Cấu hình kết nối API tới các App Instances (Odoo URL).
4. Thiết lập ma trận Mapping Role cho tổ chức này.

### 8.2 Quản lý Nhân sự (Provisioning)

1. Admin mời User vào Org.
2. Gán nhân viên vào các Property và Role cụ thể.
3. Hệ thống thực hiện **Provisioning** tự động:
   - Hub API gọi xuống Odoo/PMS Instance của Org đó để tạo User và gán quyền.

### 8.2.1 Tạo Email Công ty qua Google Workspace SDK (Optional per Org)

Nếu Organization có đăng ký **Google Workspace** (Business/Enterprise) và muốn cấp email theo domain công ty (vd `nguyen.van.a@kinex.vn`), Hub có thể tự động tạo tài khoản email qua **Admin SDK — Directory API** trước khi provisioning xuống các App con.

**Điều kiện kích hoạt:**

- Organization đã đăng ký Google Workspace với domain đã **verify** trong Google Admin Console.
- Org-level config: `google_workspace.enabled = true`, lưu `customer_id`, `primary_domain`, và reference tới **Service Account key** (lưu trong Secret Manager, không lưu DB).
- Service Account được bật **Domain-Wide Delegation**, impersonate một Super Admin của domain đó.
- Scope OAuth: `https://www.googleapis.com/auth/admin.directory.user`.

**Luồng tạo nhân viên mở rộng:**

1. Admin nhập thông tin nhân viên tại Hub (họ tên, property, role).
2. Hub API enqueue job `provision_user` vào BullMQ.
3. **GoogleWorkspaceDriver** chạy trước tiên (nếu Org bật tính năng):
   - Gọi `admin.users.insert` với payload: `primaryEmail`, `name`, `password` (tạm), `changePasswordAtNextLogin: true`, `orgUnitPath` (map từ Property).
   - Xử lý xung đột email: nếu 409 Conflict → fallback `a.nguyen2@domain` (append suffix số).
   - Lưu `google_user_id` vào `User.externalIds.google` để tracking idempotent.
4. Sau khi có email Google ổn định → tiếp tục provision xuống **Keycloak** (làm identity chính), sau đó xuống **Odoo / PMS / POS**.
5. Gửi email welcome kèm link set password Keycloak tới chính địa chỉ vừa tạo.

**De-provisioning:**

- Khi xóa/suspend nhân viên: driver gọi `admin.users.update` với `suspended: true` (KHÔNG dùng `delete`) để giữ lại data Gmail/Drive/Calendar — tuân thủ retention policy.
- Sau grace period (mặc định 90 ngày, configurable), admin có thể trigger `delete` thủ công từ Hub Dashboard.

**Xử lý lỗi & Rủi ro:**

| Rủi ro                                    | Giảm thiểu                                                                                               |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| Google API quota (2,400 req/phút/project) | BullMQ rate-limit concurrency 10 jobs/s; batch onboarding chia nhỏ theo cửa sổ.                          |
| Domain chưa verify                        | Validator tại Hub: khi Admin bật `google_workspace.enabled` phải gọi thử `domains.get` để pre-check.     |
| Service Account key rò rỉ                 | Key lưu Secret Manager, rotate 90 ngày; audit log mọi lần Hub đọc key.                                   |
| Email trùng hoàn toàn (người cũ đã nghỉ)  | Driver ưu tiên **re-activate** (un-suspend) tài khoản cũ thay vì tạo mới, dựa trên `externalIds.google`. |
| Org không dùng Google Workspace           | Driver skip hoàn toàn nếu `google_workspace.enabled = false`; Hub fallback cho Admin nhập email thủ công.|

**Mở rộng sau này:** Kiến trúc Driver tương tự áp dụng cho **Microsoft 365** (Microsoft Graph API `/users`) cho các Org dùng Microsoft stack — hai driver tồn tại song song, Org chọn 1 tại thời điểm onboarding.

### 8.3 Thay đổi Vai trò và Thu hồi Quyền (Dynamic De-provisioning)

1. Admin thay đổi Role hoặc xóa User khỏi Org.
2. Hub API tự động đồng bộ (De-provision): Vô hiệu hóa tài khoản hoặc gỡ quyền tại Odoo/PMS.

### 8.4 Chuyển đổi Ứng dụng Không chạm (Silent SSO)

1. **Menu 9-dot**: Tích hợp trên Hub. Chỉ hiển thị App thuộc Org hiện tại.
2. **Luồng nhảy App chi tiết (Odoo):**
   - User click vào Odoo trên Hub.
   - Hub Backend gọi Odoo `/web/session/authenticate` bằng **Service Account** (không phải user) để lấy session admin.
   - Hub dùng session admin để tạo magic-link hoặc one-time token cho đúng user đó.
   - Hub redirect trình duyệt tới Odoo kèm token → Odoo xác thực và tạo session người dùng.
   - **Cơ chế Odoo**: Sử dụng module `auth_oauth` hoặc custom `ir.http` override để chấp nhận JWT từ Hub.
3. **Session TTL & Re-issue:**
   - Session Odoo mặc định 1 tuần (configurable). Hub không cần re-issue thường xuyên.
   - Nếu session Odoo hết hạn, Hub tự động tạo session mới khi user click vào Odoo (transparent với người dùng).
4. **Xử lý lỗi:**
   - Nếu Odoo instance down → Hub hiển thị thông báo "Ứng dụng tạm thời không khả dụng" thay vì redirect và bị lỗi trắng.
   - Hub không block luồng làm việc tại Hub khi App con có sự cố.

---

## 9. Kiến trúc Kỹ thuật Chi tiết (Mô hình Hub & Spoke)

### 9.1 Workspace Hub Backend (hub-api)

- **Identity Middleware**: Xác thực Token từ Keycloak/Clerk.
- **Org-scoped Guard**: Inject `org_id` vào Prisma context.
- **Provisioning Drivers**: Chứa logic gọi API Odoo, PMS, POS và **Google Workspace Admin SDK** (optional per Org — tạo email theo domain công ty trước khi sync xuống App con). Kiến trúc mở cho driver tương lai (Microsoft 365 Graph API).
- **Worker Queue**: Dùng BullMQ đảm bảo lệnh cấp/thu quyền không bị rớt.

#### Chiến lược Xử lý Lỗi BullMQ (Failure Handling)

Provisioning là tác vụ **phải đảm bảo eventually-consistent** — nếu Odoo instance tạm thời down, lệnh không được mất.

| Tình huống                     | Xử lý                                                                                       |
| :----------------------------- | :------------------------------------------------------------------------------------------ |
| **Odoo API timeout/5xx**       | Retry tự động: 3 lần, backoff 30s → 2m → 10m                                               |
| **Retry hết lần, vẫn fail**    | Job chuyển vào Dead Letter Queue (DLQ). Alert gửi tới Admin qua email/Slack.               |
| **Admin confirm resolve**      | Admin xem DLQ trên Hub Dashboard → Re-trigger job thủ công.                                |
| **Conflict (user đã tồn tại)** | Driver kiểm tra idempotent bằng `external_id` → Skip create, chỉ update role nếu cần.     |
| **Audit log**                  | Mọi job đều ghi trạng thái (success/fail/retry) vào bảng `ProvisioningLog` với timestamp. |

### 9.2 Workspace Hub Frontend (hub-web)

- **Organization Selector**: Màn hình chọn/đổi Org.
- **App Launcher**: Giao diện hiển thị App theo Org.
- **Management Dashboard**: Quản lý Role, Property, Mapping.

---

## 10. Nguyên tắc Vận hành

### 10.1 Tính Độc lập của Ứng dụng (Standalone)

Các ứng dụng Odoo, PMS vẫn giữ nguyên cách hoạt động. Nếu Workspace bảo trì, App con vẫn chạy bình thường.

### 10.2 Bảo mật

- Giao tiếp HTTPS toàn bộ.
- `org_id` lấy từ Server (JWT), tuyệt đối không tin client (LocalStorage).
- Hub API sử dụng Service Account có quyền tối thiểu để gọi xuống App con.

---

## 11. Chiến lược Migration (Dữ liệu Hiện tại)

Đây là rủi ro vận hành lớn nhất khi go-live. Người dùng và phân quyền hiện có trên Odoo/PMS cần được đưa vào Hub mà không làm gián đoạn hoạt động.

### 11.1 Nguyên tắc

- **Zero-downtime**: Migration chạy ngầm, song song với hệ thống cũ. Không có cửa sổ bảo trì.
- **Idempotent**: Có thể chạy lại Migration script nhiều lần mà không tạo dữ liệu trùng.
- **Rollback được**: Nếu Hub gặp sự cố, App con (Odoo/PMS) vẫn tiếp tục chạy độc lập như trước.

### 11.2 Các bước Migration

| Bước | Mô tả                                                                                                 |
| :--- | :---------------------------------------------------------------------------------------------------- |
| **1. Inventory** | Xuất toàn bộ danh sách User, Company, Role từ Odoo và PMS ra file CSV.              |
| **2. Mapping**   | Đối chiếu Company (Odoo) ↔ Organization (Hub), Department ↔ Property, Role ↔ Role. |
| **3. Dry-run**   | Chạy migration script với flag `--dry-run`, kiểm tra log conflict và dữ liệu thiếu.  |
| **4. Import**    | Tạo Organization, Property, User trong Hub. Gán `external_id` = ID Odoo để tracking. |
| **5. Keycloak Sync** | Tạo account trên Keycloak cho từng User. Gửi email "set password" (không reset mật khẩu cũ). |
| **6. Verify**    | Admin từng Org xác nhận danh sách user và role đúng trước khi cut-over.              |
| **7. Cut-over**  | Bật SSO cho Odoo/PMS → từ lúc này đăng nhập qua Hub. Hệ thống cũ vẫn fallback được. |

### 11.3 Rủi ro và Giảm thiểu

| Rủi ro | Giảm thiểu |
| :----- | :--------- |
| User Odoo có nhiều Company (cross-org) | Gắn vào Org chính (primary), thêm OrgMembership phụ nếu cần. |
| Role Odoo không có mapping 1-1 sang Hub | Tạo Role custom tạm thời, review sau khi go-live. |
| User không set password Keycloak kịp | Grace period 7 ngày: vẫn cho đăng nhập trực tiếp Odoo, sau đó bắt buộc qua Hub. |

---

## 12. Yêu cầu Phi chức năng (Non-functional Requirements)

| Tiêu chí             | Mục tiêu                                                                     |
| :------------------- | :--------------------------------------------------------------------------- |
| **Availability**     | 99.5% uptime cho Hub. App con hoạt động độc lập nếu Hub down.               |
| **Latency**          | API Hub < 200ms p95. Silent SSO redirect < 2s.                              |
| **Scalability**      | Hỗ trợ 500 Organization, 50.000 User mà không cần refactor kiến trúc.       |
| **Security**         | Không có cross-tenant data leak. Penetration test trước go-live.            |
| **Audit Trail**      | Mọi hành động phân quyền (grant/revoke/invite) phải được ghi log với: actor, timestamp, org_id, chi tiết thay đổi. Lưu tối thiểu 1 năm. |
| **Observability**    | Dashboard monitoring: Provisioning queue depth, job failure rate, SSO success rate. |
| **Recoverability**   | RTO < 1 giờ, RPO < 15 phút (backup PostgreSQL mỗi 15 phút).                |

---

## 13. Công nghệ Đề xuất

| Thành phần               | Công nghệ                | Lý do chọn                                              |
| :----------------------- | :----------------------- | :------------------------------------------------------ |
| **Giao diện Workspace**  | Next.js                  | Tối ưu SEO, SSR, tương thích cực tốt với Clerk/Keycloak |
| **Máy chủ Workspace**    | NestJS + Prisma          | Kiến trúc module hóa, hỗ trợ Middleware mạnh mẽ         |
| **Cơ sở dữ liệu**        | PostgreSQL               | Đồng nhất, hỗ trợ RLS                                   |
| **Xử lý ngầm**           | BullMQ + Redis           | Đảm bảo tính nhất quán dữ liệu                          |
| **Đăng nhập (Tùy chọn)** | **Keycloak** / **Clerk** | Đáp ứng được cả chuẩn doanh nghiệp lẫn tốc độ B2B       |
| **Multi-tenant Guard**   | Prisma Middleware        | Tự động filter dữ liệu theo `orgId`                     |

---

## 14. Lộ trình Triển khai Chi tiết (12 tuần)

_(Lộ trình dưới đây áp dụng cho Keycloak. Nếu dùng Clerk, Phase MVP và Core I rút ngắn 30-40% nhưng Phase Integration tăng thêm 1-2 tuần do Odoo Identity Broker.)_

| Phase           | Tuần      | Nội dung thực hiện chính                                                                                                                                                         | Kết quả đạt được                                         | Effort |
| :-------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- | :----- |
| **MVP**         | **01-02** | - Setup Keycloak (Docker, Realm, Client config, custom theme).<br>- DB Schema: Organization, Property, OrgMembership.<br>- Luồng Auth → Bắt buộc chọn Organization → Launcher.  | User login, chọn Org, xem App Launcher thành công.       | 2 devs |
| **Core I**      | **03-04** | - Module quản trị Org: CRUD Org, Property, invite Member.<br>- Prisma Middleware RLS (`orgId` auto-inject).<br>- Cross-tenant security test (unit + integration).                | Admin quản trị Org hoàn chỉnh, dữ liệu cô lập theo Org.  | 2 devs |
| **Core II**     | **05-07** | - Odoo API Driver: create user, assign role, deactivate, idempotency.<br>- PMS API Driver tương tự.<br>- BullMQ + Dead Letter Queue + ProvisioningLog.<br>- Alert admin on DLQ.  | Provisioning/De-provisioning tự động và fault-tolerant.  | 2 devs |
| **Integration** | **08-09** | - Silent SSO sang Odoo (auth_oauth / JWT bridge).<br>- Silent SSO sang PMS.<br>- Migration tool: import user từ Odoo/PMS vào Hub.<br>- Dry-run migration với dữ liệu thật.      | Nhảy App không cần login lại; dữ liệu cũ migrate xong.  | 2 devs |
| **Polish**      | **10-12** | - Invite User flow (email template, expiry, resend).<br>- Audit log UI Dashboard.<br>- Load testing (500 concurrent users, 50 orgs).<br>- Pen test cross-tenant. Tài liệu vận hành. | Sẵn sàng Go-live. Đạt NFR.                               | 2 devs |

**Ghi chú estimation:**
- Phase Core II tăng từ 2 lên 3 tuần do Odoo Driver là phần phức tạp nhất (schema riêng, idempotency, role mapping).
- Phase Polish tăng từ 2 lên 3 tuần để đảm bảo chất lượng bảo mật và tải trọng trước go-live.
- Tổng: 12 tuần với team 2 developers full-time.

---

_Tài liệu này được soạn thảo để phục vụ mục đích đề xuất giải pháp kiến trúc tổng thể cho hệ sinh thái KiNEX._
