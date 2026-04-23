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

## 2. Tầm nhìn: Hệ sinh thái Quản trị Đa Tổ chức (Organization-First)

Chúng ta sẽ xây dựng một **Nền tảng Workspace trung tâm** đóng vai trò điều phối cho toàn bộ hệ sinh thái. Điểm khác biệt cốt lõi là việc đặt **Organization (Tổ chức)** làm trọng tâm của mọi thực thể quản lý.

### 2.1 Mô hình Phân tầng Dữ liệu (Hierarchy)

Hệ thống được thiết kế theo cấu trúc Top-Down chặt chẽ:

1.  **Organization (Cấp 0 - Root)**: Đại diện cho một tập đoàn hoặc pháp nhân lớn nhất.
    - Mọi thực thể (User, Property, Role, App) đều phải thuộc về một Organization.
    - Cho phép cách ly dữ liệu hoàn toàn giữa các khách hàng/tập đoàn khác nhau.
2.  **Property / Brand (Cấp 1)**: Các đơn vị kinh doanh trực thuộc (Khách sạn, Resort, Chuỗi nhà hàng).
    - Một Organization sở hữu nhiều Properties.
3.  **Application (Cấp 2)**: Các công cụ vận hành (Odoo, PMS, POSv, etc...).
    - Các App được kích hoạt theo nhu cầu của từng Organization.
    - **Cơ chế Độc lập (Instance Binding)**: Khi một Tổ chức đăng ký, hệ thống có khả năng liên kết với các Instance ứng dụng riêng biệt. Ví dụ: Org A sử dụng Odoo Instance #1, Org B sử dụng Odoo Instance #2. Workspace Hub đóng vai trò là lớp "Proxy" điều phối lệnh tới đúng Instance tương ứng.
4.  **Personnel & Roles (Cấp 3)**: Người dùng và quyền hạn.
    - Một User có **một tài khoản định danh duy nhất** (email) nhưng có thể được mời vào **nhiều Organization** khác nhau, mỗi nơi với vai trò riêng.
    - Trong thực tế đa số nhân viên chỉ thuộc **01 Organization chính**. Tuy nhiên, kiến trúc vẫn hỗ trợ trường hợp ngoại lệ (consultant, quản lý vùng liên tập đoàn).

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

## 3. Phân tích và So sánh Giải pháp (Keycloak vs. Clerk)

Trong quá trình thiết kế, chúng tôi đã cân nhắc hai giải pháp hàng đầu là **Keycloak** (Open Source, Self-hosted) và **Clerk** (Managed SaaS). Dưới đây là bảng đánh giá chi tiết đặc biệt tập trung vào bài toán B2B SaaS (Multi-tenant):

### 3.1 Bảng so sánh Chi tiết

| Tiêu chí Đánh giá                    | Keycloak (Open Source / Self-hosted)                                   | Clerk (Managed B2B SaaS)                                                  | Lợi thế                            |
| :----------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------------ | :--------------------------------- |
| **Mô hình vận hành**                 | Tự quản lý (Self-hosted) trên hạ tầng Docker/K8s.                      | Thuê dịch vụ trọn gói (Managed), API-first.                               | **Clerk** (Không tốn DevOps)       |
| **Chủ quyền Dữ liệu**                | **100%**: Thông tin User, Session nằm hoàn toàn trong DB của công ty.  | **Giới hạn**: Dữ liệu định danh lưu tại Cloud của Clerk (Mỹ/Châu Âu).     | **Keycloak** (Bảo mật tuyệt đối)   |
| **Multi-tenancy (Đa tổ chức)**       | Hỗ trợ qua Realm hoặc Group. Phải tự code logic cô lập và quản lý Org. | Có sẵn **Organization API**: Tự động chia tenant, quản lý member, role.   | **Clerk** (Tiết kiệm 60% dev time) |
| **Tích hợp Legacy (Odoo)**           | **Native**: Hỗ trợ chuẩn SAML 2.0, LDAP (rất cần cho Odoo/ERP cũ).     | **Hạn chế**: Chỉ hỗ trợ OIDC/JWT. Cần viết Adapter riêng để nối với Odoo. | **Keycloak** (Chuẩn doanh nghiệp)  |
| **Tùy biến Giao diện (White-label)** | Vô hạn: Có thể tùy chỉnh trang Login riêng biệt cho từng Organization. | Giới hạn: Chỉ đổi được logo, màu sắc cơ bản. Giao diện Login chung.       | **Keycloak** (Branding tốt hơn)    |
| **Trải nghiệm Developer (DX)**       | Khó: Tài liệu phức tạp, cần hiểu sâu về Java và chuẩn OAuth2/SAML.     | Tuyệt vời: SDK cho Next.js/Node.js cực mạnh, copy-paste là chạy.          | **Clerk** (Go-to-market cực nhanh) |
| **Tính năng mở rộng**                | MFA cơ bản, Social Login cần tự setup.                                 | MFA nâng cao, Passkeys, Bot protection, Social login 1-click.             | **Clerk** (Hiện đại hóa)           |

### 3.2 Phân tích Kinh tế và Quy mô (Scale Simulation)

| Quy mô Hệ thống                      | Ước tính Chi phí Clerk                 | Ước tính Chi phí Keycloak (Infra) | Phân tích                                |
| :----------------------------------- | :------------------------------------- | :-------------------------------- | :--------------------------------------- |
| **MVP (1-5 Orgs, < 500 User)**       | **~$0 - $50/tháng**                    | **$50 - $100/tháng** (VPS + DB)   | **Clerk thắng** do miễn phí bậc thấp.    |
| **Scale (50 Orgs, 5.000 User)**      | **~$500 - $800/tháng** (Phí MAU + Org) | **$100 - $150/tháng**             | **Keycloak rẻ hơn**.                     |
| **Enterprise (500+ Orgs, 50k User)** | **$3.000 - $5.000+/tháng**             | **$300 - $500/tháng** (Cluster)   | **Keycloak thắng tuyệt đối** về chi phí. |

**Nhận định Chiến lược:**

- **Chọn Keycloak khi:** Yêu cầu bảo mật dữ liệu khắt khe, bắt buộc dùng SAML cho Odoo, và muốn kiểm soát chi phí khi scale lên hàng trăm Organization.
- **Chọn Clerk khi:** Cần tốc độ ra mắt thị trường (Time-to-market) cực nhanh, ưu tiên trải nghiệm Developer, không muốn nuôi team DevOps, và Odoo có thể cấu hình dùng OIDC thay vì SAML.

---

## 4. Hướng giải quyết Kỹ thuật (Kiến trúc linh hoạt IdP)

Hệ thống được thiết kế theo mô hình **IdP-Agnostic** (không phụ thuộc cứng vào IdP). Dù chọn Keycloak hay Clerk, kiến trúc lõi của Workspace Hub vẫn giữ nguyên.

### 4.1 Hợp nhất Danh tính và Cơ chế SSO

**Vấn đề**: Người dùng làm việc cho nhiều tổ chức/chi nhánh khác nhau phải quản lý nhiều tài khoản.

**Giải pháp với Keycloak (Tùy chọn A):**

1.  **Luồng Đăng nhập**: User xác thực tại Keycloak → Hub nhận Token → Kiểm tra bảng `OrgMembership` tự build → Mở giao diện chọn Org → Ghi `org_id` vào Custom JWT.
2.  **SSO App con**: Keycloak dùng **SAML** hoặc OIDC đẩy thẳng Token xuống Odoo/PMS.
3.  **Cross-Tenant Guard**: Keycloak sử dụng `Client Scope` để chặn việc lấy Token trái phép.

**Giải pháp với Clerk (Tùy chọn B - Khuyến nghị của Sếp):**

1.  **Luồng Đăng nhập**: Dùng component `<SignIn />` của Clerk.
2.  **Chọn Tổ chức**: Dùng component `<OrganizationSwitcher />` có sẵn. Clerk tự động cấp JWT Token chứa sẵn `org_id` hiện tại (`org_id` claim).
3.  **SSO App con (Thách thức)**: Vì Clerk không hỗ trợ SAML Outbound tốt, Hub API phải đóng vai trò là "Identity Broker": Hub nhận Clerk Token → Tự generate một JWT nội bộ → Gửi JWT này cho Odoo qua API ngầm để lấy session Odoo → Trả session Odoo về cho trình duyệt.

_(Phần còn lại của tài liệu giả định áp dụng nguyên tắc chung cho cả 2 giải pháp)_

### 4.2 Chiến lược Cách ly Dữ liệu (Data Isolation)

Đây là quyết định kiến trúc quan trọng nhất cho multi-tenant SaaS:

**Phương án: Shared Database + Row-Level Security (RLS)**

| Thành phần               | Chiến lược                                    | Chi tiết                                                    |
| :----------------------- | :-------------------------------------------- | :---------------------------------------------------------- |
| **Hub Database**         | Shared DB, mọi bảng có cột `orgId` (NOT NULL) | Prisma Middleware tự inject `WHERE orgId = ?` vào mọi query |
| **IdP (Keycloak/Clerk)** | 1 Environment chung                           | Keycloak dùng Attribute / Clerk dùng built-in Organizations |
| **App Instances**        | DB riêng per Org (Instance Binding)           | Mỗi Odoo/PMS instance có DB riêng, đảm bảo cô lập hoàn toàn |

**Lý do chọn Shared DB cho Hub**: Đơn giản hóa việc quản trị, backup và migration. Prisma Middleware đảm bảo không bao giờ có cross-org data leak.
**Lý do chọn DB riêng cho App Instances**: Odoo, PMS đều có schema phức tạp và không được thiết kế cho multi-tenant. Tách instance hoàn toàn là cách an toàn nhất.

### 4.3 Cấu trúc Quản trị Đa tầng chi tiết

1.  **Organization (Tenant)**:
    - Metadata: Tên tập đoàn, slug, mã số thuế, domain riêng.
    - Liên kết: Cấu hình App Instance (Odoo URL, PMS URL).
2.  **Property (Location)**:
    - Metadata: Địa chỉ, mã chi nhánh, múi giờ. Thuộc về 1 Org duy nhất.
3.  **Role & App Mapping**:
    - Quyền hạn được cấp theo công thức: `User + Organization + Property + Role`.

### 4.4 Bảo mật Cross-Tenant (Chống truy cập chéo)

Hệ thống ngăn chặn tuyệt đối việc User thuộc Organization này truy cập dữ liệu của Organization khác:

1.  **Lớp bảo vệ Backend Guard (Tại Hub)**:
    - Mọi API request đều đính kèm JWT (từ Keycloak hoặc Clerk).
    - Middleware giải mã Token, đọc `org_id` và kiểm tra quyền hạn. Nếu phát hiện request cố tình truyền `org_id` lạ → trả về `403 Forbidden`.
2.  **Lớp bảo vệ Client / SSO (Tại App con)**:
    - Odoo/PMS được cấu hình để chỉ chấp nhận Token từ Hub/IdP nếu Token đó chứa đúng `org_id` khớp với Instance đó.

---

## 5. Luồng Nghiệp vụ Chính (Organization-Centric)

### 5.1 Khởi tạo Tổ chức mới (Onboarding)

1. Super Admin tạo Organization trên Hub (hoặc qua Clerk Dashboard).
2. Khai báo các Property trực thuộc.
3. Cấu hình kết nối API tới các App Instances (Odoo URL).
4. Thiết lập ma trận Mapping Role cho tổ chức này.

### 5.2 Quản lý Nhân sự (Provisioning)

1. Admin mời User vào Org.
2. Gán nhân viên vào các Property và Role cụ thể.
3. Hệ thống thực hiện **Provisioning** tự động:
   - Hub API gọi xuống Odoo/PMS Instance của Org đó để tạo User và gán quyền.

### 5.3 Thay đổi Vai trò và Thu hồi Quyền (Dynamic De-provisioning)

1. Admin thay đổi Role hoặc xóa User khỏi Org.
2. Hub API tự động đồng bộ (De-provision): Vô hiệu hóa tài khoản hoặc gỡ quyền tại Odoo/PMS.

### 5.4 Chuyển đổi Ứng dụng Không chạm (Silent SSO)

1. **Menu 9-dot**: Tích hợp trên Hub. Chỉ hiển thị App thuộc Org hiện tại.
2. **Luồng nhảy App**: Khi User click vào Odoo, Hub trao đổi Token hiện tại lấy Session của Odoo và redirect User thẳng vào Odoo (không cần login lại).

---

## 6. Kiến trúc Kỹ thuật Chi tiết (Mô hình Hub & Spoke)

### 6.1 Workspace Hub Backend (hub-api)

- **Identity Middleware**: Xác thực Token từ Keycloak/Clerk.
- **Org-scoped Guard**: Inject `org_id` vào Prisma context.
- **Provisioning Drivers**: Chứa logic gọi API Odoo, PMS.
- **Worker Queue**: Dùng BullMQ đảm bảo lệnh cấp/thu quyền không bị rớt.

### 6.2 Workspace Hub Frontend (hub-web)

- **Organization Selector**: Màn hình chọn/đổi Org.
- **App Launcher**: Giao diện hiển thị App theo Org.
- **Management Dashboard**: Quản lý Role, Property, Mapping.

---

## 7. Nguyên tắc Vận hành

### 7.1 Tính Độc lập của Ứng dụng (Standalone)

Các ứng dụng Odoo, PMS vẫn giữ nguyên cách hoạt động. Nếu Workspace bảo trì, App con vẫn chạy bình thường.

### 7.2 Bảo mật

- Giao tiếp HTTPS toàn bộ.
- `org_id` lấy từ Server (JWT), tuyệt đối không tin client (LocalStorage).
- Hub API sử dụng Service Account có quyền tối thiểu để gọi xuống App con.

---

## 8. Công nghệ Đề xuất

| Thành phần               | Công nghệ                | Lý do chọn                                              |
| :----------------------- | :----------------------- | :------------------------------------------------------ |
| **Giao diện Workspace**  | Next.js                  | Tối ưu SEO, SSR, tương thích cực tốt với Clerk/Keycloak |
| **Máy chủ Workspace**    | NestJS + Prisma          | Kiến trúc module hóa, hỗ trợ Middleware mạnh mẽ         |
| **Cơ sở dữ liệu**        | PostgreSQL               | Đồng nhất, hỗ trợ RLS                                   |
| **Xử lý ngầm**           | BullMQ + Redis           | Đảm bảo tính nhất quán dữ liệu                          |
| **Đăng nhập (Tùy chọn)** | **Keycloak** / **Clerk** | Đáp ứng được cả chuẩn doanh nghiệp lẫn tốc độ B2B       |
| **Multi-tenant Guard**   | Prisma Middleware        | Tự động filter dữ liệu theo `orgId`                     |

---

## 9. Lộ trình Triển khai Chi tiết (06 tuần)

_(Ghi chú: Nếu sử dụng Clerk, Giai đoạn 1 và 2 có thể được rút ngắn 30-40% thời gian)._

| Phase      | Tuần      | Nội dung thực hiện chính                                                                                                                                       | Kết quả đạt được                                   |
| :--------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| **MVP**    | **01-02** | - Setup IdP (Keycloak hoặc Clerk).<br>- Xây dựng DB Schema cho Organization & Property.<br>- Tích hợp luồng Auth → Chọn Organization.<br>- Build App Launcher. | User login, chọn Org, xem dashboard thành công.    |
| **Core**   | **03-04** | - Build module quản trị Org (CRUD, Settings).<br>- Áp dụng Prisma Middleware RLS.<br>- Viết Odoo & PMS API Drivers.<br>- Tích hợp BullMQ chạy Provisioning.    | Admin phân quyền xong, tự động tạo user ở App con. |
| **Polish** | **05-06** | - Cấu hình luồng nhảy App (Silent SSO).<br>- Test bảo mật chéo (Cross-tenant leak).<br>- Tối ưu luồng Invite User.<br>- Load testing toàn hệ thống.            | Sẵn sàng Go-live.                                  |

---

_Tài liệu này được soạn thảo để phục vụ mục đích đề xuất giải pháp kiến trúc tổng thể cho hệ sinh thái KiNEX._
