# Đề xuất Kiến trúc: Hệ sinh thái Workspace Hợp nhất (KiNEX Ecosystem)

Tài liệu này trình bày chiến lược hợp nhất các ứng dụng đang vận hành độc lập (Odoo, PMS, POS) thành một hệ sinh thái duy nhất, được quản trị từ một nền tảng Workspace trung tâm.

---

## 1. Bối cảnh và Vấn đề

Hiện tại, hệ thống đang vận hành với nhiều ứng dụng riêng biệt, mỗi ứng dụng có cách quản lý người dùng, phân quyền và cấu trúc tổ chức khác nhau. Điều này dẫn đến:

- **Người dùng bị phân mảnh**: Một nhân viên phải tạo tài khoản riêng ở từng app, với mật khẩu khác nhau.
- **Phân quyền không nhất quán**: Cùng một nhân viên có thể có vai trò khác nhau giữa các app mà không có sự kiểm soát tập trung.
- **Cấu trúc tổ chức xung đột**: Odoo và PMS/POS có cách quản lý Company và Property khác nhau.
- **Trải nghiệm kém**: Nhân viên phải đăng nhập nhiều lần khi chuyển đổi giữa các ứng dụng.

---

## 2. Tầm nhìn: Một Workspace Duy nhất

Chúng ta sẽ xây dựng một **Nền tảng Workspace trung tâm** đóng vai trò là cổng vào duy nhất cho toàn bộ hệ sinh thái. Từ đây, người quản trị có thể quản lý nhân sự, phân quyền và giám sát mọi hoạt động trên một giao diện duy nhất.

### 2.1 Nguyên tắc cốt lõi

- **Đăng nhập một lần, truy cập mọi nơi**: Nhân viên chỉ cần đăng nhập một lần duy nhất tại Workspace. Khi chuyển sang Odoo, PMS hay POS, họ được vào thẳng mà không thấy bất kỳ màn hình đăng nhập nào.
- **Quản lý tập trung, vận hành độc lập**: Việc tạo tài khoản, gán quyền, quản lý sơ đồ tổ chức đều thực hiện tại Workspace. Tuy nhiên, các ứng dụng con vẫn hoạt động bình thường nếu Workspace tạm thời bảo trì.
- **Phân quyền rõ ràng theo Vai trò**: Mỗi vai trò (Kế toán, Lễ tân...) quy định rõ nhân viên được truy cập ứng dụng nào, với quyền hạn gì.

### 2.2 Trải nghiệm người dùng mục tiêu

1. Nhân viên truy cập `workspace.kinex.vn` → Đăng nhập (lần duy nhất).
2. Nhân viên thấy các icon ứng dụng mà mình có quyền truy cập.
3. Click vào icon Odoo → Vào thẳng giao diện Odoo, không cần đăng nhập lại.
4. Chuyển sang PMS → Vào thẳng, không cần đăng nhập lại.

---

## 3. Hướng giải quyết

### 3.1 Hợp nhất Danh tính và Cơ chế SSO (Keycloak)

**Vấn đề**: Mỗi app có bảng User và hệ thống xác thực riêng, dẫn đến việc người dùng phải nhớ nhiều mật khẩu và đăng nhập nhiều lần.

**Giải pháp**: Sử dụng **Keycloak** làm Identity Provider (IdP) trung tâm - đóng vai trò là "Sổ hộ khẩu" duy nhất cho toàn bộ hệ sinh thái.

#### Cách Keycloak giải quyết vấn đề SSO:

1.  **Quản lý Session Tập trung (Centralized Session)**:
    - Khi đăng nhập thành công tại Workspace, Keycloak duy trì một phiên làm việc duy nhất cho người dùng và lưu trữ **SSO Cookie** trên trình duyệt.
    - Mọi ứng dụng con (Odoo, PMS, POS) đều "tin tưởng" vào phiên làm việc này của Keycloak.
2.  **Sử dụng Giao thức OIDC (OpenID Connect)**:
    - Keycloak cung cấp các **ID Token** và **Access Token (JWT)** được ký số.
    - Các ứng dụng con không còn tự quản lý mật khẩu mà chỉ xác thực tính hợp lệ của Token từ Keycloak gửi tới.
3.  **Cơ chế Silent Authentication (Xác thực ngầm)**:
    - Sử dụng tham số `prompt=none` trong luồng OIDC. Khi người dùng chuyển app, trình duyệt tự động gửi SSO Cookie tới Keycloak.
    - Keycloak nhận diện phiên đăng nhập hiện tại và trả về Token ngay lập tức, giúp người dùng vào thẳng ứng dụng mà không thấy màn hình login (Zero-Interaction SSO).
4.  **Đăng xuất tập trung (Single Sign-Out)**:
    - Khi người dùng đăng xuất tại Workspace, Keycloak sẽ thông báo và hủy phiên làm việc trên tất cả các app liên kết đồng thời, đảm bảo an toàn tuyệt đối.

#### 3.1.1 So sánh và Lựa chọn Giải pháp (Keycloak vs. Clerk)

Trong quá trình thiết kế, chúng tôi đã cân nhắc giữa hai giải pháp hàng đầu là **Keycloak** (Open Source, Self-hosted) và **Clerk** (SaaS). Dưới đây là bảng so sánh chi tiết:

| Tiêu chí | Keycloak | Clerk |
| :--- | :--- | :--- |
| **Mô hình** | **Self-hosted** (Tự triển khai trên hạ tầng riêng) | **SaaS** (Dịch vụ đám mây quản lý bởi bên thứ 3) |
| **Quyền sở hữu dữ liệu** | **Toàn quyền**: Dữ liệu người dùng nằm trong database của doanh nghiệp. | **Phụ thuộc**: Dữ liệu lưu trữ trên server của Clerk. |
| **Chi phí** | **Tối ưu**: Miễn phí bản quyền, chỉ tốn chi phí vận hành server. | **Tăng dần theo quy mô**: Trả phí theo số lượng người dùng (MAU). |
| **Tùy biến** | **Vô hạn**: Có thể tùy biến theme, luồng xác thực (Authentication Flow) và plugin. | **Hạn chế**: Chỉ tùy biến được giao diện trong phạm vi cho phép. |
| **Khả năng tích hợp** | **Enterprise Ready**: Hỗ trợ LDAP, Active Directory, SAML 2.0, OIDC. | **Modern Web**: Tối ưu cho Next.js/React, hạn chế với hệ thống cũ. |

**Lý do quyết định chọn Keycloak cho KiNEX:**

1.  **Chủ quyền dữ liệu & Bảo mật**: Với một hệ thống lõi quản trị toàn bộ nhân sự tập đoàn, việc tự nắm giữ cơ sở dữ liệu định danh là yêu cầu tiên quyết.
2.  **Khả năng mở rộng không giới hạn**: Keycloak cho phép chúng ta can thiệp sâu vào code để xử lý các logic phức tạp như "Silent SSO" giữa các domain khác nhau hoặc tích hợp với các App Legacy (Odoo, PMS) dễ dàng hơn.
3.  **Hiệu quả kinh tế**: Khi hệ sinh thái mở rộng lên hàng nghìn nhân viên, mô hình trả phí theo user của Clerk sẽ trở nên rất đắt đỏ. Keycloak giúp kiểm soát chi phí cố định.
4.  **Hệ sinh thái Enterprise**: Keycloak là tiêu chuẩn vàng trong các hệ thống Identity Management mã nguồn mở, được tin dùng bởi các doanh nghiệp lớn trên thế giới.

### 3.2 Hợp nhất Phân quyền (Role-App Mapping)

**Vấn đề**: Quyền hạn ở mỗi app được quản lý riêng lẻ, Admin phải vào từng app để cấp quyền. Cấu trúc quyền ở mỗi hệ thống lại khác nhau (Odoo dùng Group, PMS/POS dùng Role nội bộ).

**Giải pháp**: Xây dựng hệ thống **Mapping Vai trò đa tầng** tại Workspace. Mỗi **Vai trò Workspace** (Workspace Role) sẽ là một định nghĩa chuẩn, chứa thông tin mapping tương ứng cho từng ứng dụng con. Khi một nhân viên được gán Vai trò Workspace, họ sẽ tự động nhận được các quyền tương ứng tại các App đã cấu hình.

#### Cấu trúc Mapping cho từng Ứng dụng:

1.  **Đối với Odoo**:
    - **Mapping Groups**: Ánh xạ với các nhóm quyền chức năng trong Odoo (ví dụ: `account.group_account_invoice`).
    - **Mapping Companies**: Danh sách ID các công ty mà vai trò này được phép truy cập.
    - **Mapping Properties**: Các thuộc tính/tài sản cụ thể gắn liền với vai trò.
2.  **Đối với PMS & POS**:
    - **Mapping Roles**: Ánh xạ với các vai trò định nghĩa sẵn bên trong hệ thống PMS/POS (ví dụ: `Receptionist`, `Manager`).
    - **Mapping Companies**: Danh sách ID các đơn vị (Hotel/Branch) được phép truy cập.

**Nguyên tắc vận hành**: Admin thực hiện Mapping các ID này thủ công một lần tại màn hình quản lý Vai trò của Workspace. Hệ thống chỉ lưu trữ các "Mỏ neo" ID này mà không cần đồng bộ toàn bộ danh sách metadata từ app con.

## 4. Luồng Nghiệp vụ Chính

### 4.1 Tạo Nhân viên Mới

1. Admin tạo hồ sơ nhân viên "An" trên Workspace.
2. Hệ thống tạo tài khoản đăng nhập cho An (SSO).
3. Lúc này, An **chưa có tài khoản ở bất kỳ ứng dụng nào**.

### 4.2 Phân quyền cho Nhân viên

1. Admin vào màn hình phân quyền, gán vai trò "Kế toán" cho An.
2. Hệ thống tự động truy xuất cấu trúc mapping đã được thiết lập sẵn cho vai trò "Kế toán":
   - **Odoo**: Gán vào Group `Accountant`, Company `ID_01`, Property `ID_PROP_02`.
   - **PMS/POS**: (Nếu có cấu hình) Gán Role `Staff`, Company `ID_01`.
3. Admin nhấn **Lưu**.
4. Hệ thống tự động thực hiện lệnh Provisioning:
   - Gửi yêu cầu API kèm theo các **Mapping ID** đã cấu hình tới Odoo/PMS/POS.
   - Tạo tài khoản và gán đúng các Group/Role/Company/Property như đã định nghĩa.
   - **Lưu Mapping User ID**: Sau khi App con phản hồi thành công, hệ thống lưu lại liên kết ID giữa Workspace và App con.
5. An giờ đây có thể click vào icon ứng dụng trên Workspace và vào thẳng với đầy đủ quyền hạn và phạm vi dữ liệu đã định.

### 4.3 Thay đổi Vai trò và Thu hồi Quyền (Dynamic De-provisioning)

Hệ thống tự động đồng bộ hóa quyền truy cập dựa trên sự thay đổi Vai trò Workspace.

1.  **Kịch bản**: Admin đổi vai trò của An từ "Kế toán" (chỉ vào Odoo) sang "Nhân viên Lễ tân" (chỉ vào PMS và POS).
2.  **So sánh Mapping**: Hệ thống so sánh danh sách ứng dụng của Vai trò cũ và Vai trò mới.
3.  **Thực thi Tự động**:
    *   **Cấp quyền mới (Provisioning)**: Tạo tài khoản hoặc cập nhật quyền cho An tại PMS và POS.
    *   **Thu hồi quyền cũ (De-provisioning)**: Gửi lệnh API tới Odoo để **Vô hiệu hóa (Disable/Lock)** tài khoản của An hoặc gỡ bỏ toàn bộ Group quyền. An sẽ không còn thấy icon Odoo trên Workspace và không thể truy cập trực tiếp vào Odoo.
4.  **Trạng thái**: Admin nhận được báo cáo xác nhận: "Đã cấp quyền PMS/POS và đã thu hồi quyền Odoo thành công".

### 4.4 Vô hiệu hóa Nhân viên

1. Admin vô hiệu hóa tài khoản An trên Workspace.
2. Hệ thống tự động khóa tài khoản của An ở **tất cả** các ứng dụng cùng lúc.
3. An không thể đăng nhập vào bất kỳ app nào nữa.

### 4.5 Quản lý Metadata và Mapping ID thủ công

Để đảm bảo tính đơn giản và độc lập giữa các hệ thống:

1. **Không đồng bộ Metadata tự động**: Workspace sẽ không thực hiện quét định kỳ danh sách Role hay Company từ các app con để tránh gây tải hoặc xung đột dữ liệu.
2. **Cấu hình bằng ID**: Khi thiết lập Mapping cho một Vai trò, Admin sẽ nhập trực tiếp các ID (được lấy từ giao diện quản trị của Odoo/PMS/POS) vào các trường tương ứng trên Workspace.
3. **Lưu trữ tập trung**: Các ID này được lưu trữ tại Workspace và dùng làm tham số đầu vào cho mọi lệnh API gửi đến các ứng dụng con trong tương lai.

### 5.4 Chuyển đổi Ứng dụng Không chạm (Silent SSO)

Hệ thống cung cấp trải nghiệm điều hướng liền mạch giữa các ứng dụng standalone:

1. **Menu chuyển App (9-dot menu)**: Một thanh điều hướng chung được tích hợp vào tất cả các ứng dụng, cho phép chuyển đổi tức thì.
2. **Xác thực ngầm (Silent Auth)**: Khi người dùng chuyển sang một ứng dụng mới, ứng dụng đó sẽ tự động gửi yêu cầu xác thực "không làm phiền" (`prompt=none`) tới Keycloak. Nếu phiên đăng nhập hiện tại còn hiệu lực, người dùng sẽ được vào thẳng giao diện mà không hề thấy màn hình login hay phải nhấn bất kỳ nút bấm nào.

---

## 5. Nguyên tắc Vận hành

### 5.1 Tính Độc lập của Ứng dụng (Standalone)

Các ứng dụng Odoo, PMS, POS vẫn giữ nguyên cách hoạt động hiện tại. Nếu Workspace tạm thời bảo trì:

- Các app con vẫn hoạt động bình thường cho nghiệp vụ hàng ngày (bán hàng, đặt phòng, kế toán).
- Tài khoản quản trị kỹ thuật vẫn có thể đăng nhập trực tiếp vào từng app trong trường hợp khẩn cấp.

### 5.2 Xử lý Sự cố

- Nếu một ứng dụng con đang tạm thời không hoạt động khi Admin nhấn Lưu, hệ thống sẽ tự động thử lại sau vài phút.
- Admin luôn thấy rõ trạng thái đồng bộ của từng app để có quyết định phù hợp.

### 5.3 Bảo mật

- Mọi giao tiếp giữa Workspace và các ứng dụng đều được **mã hóa (HTTPS)**.
- Workspace truy cập các ứng dụng con với **tài khoản dịch vụ** có quyền giới hạn tối thiểu.
- Chỉ IP của Workspace mới được phép gọi API đến các ứng dụng con.

---

## 6. Công nghệ Đề xuất

| Thành phần              | Công nghệ               | Lý do chọn                                        |
| :---------------------- | :---------------------- | :------------------------------------------------ |
| **Giao diện Workspace** | Next.js                 | Đã sử dụng trong dự án hiện tại                   |
| **Máy chủ Workspace**   | NestJS + Prisma         | Hệ sinh thái phong phú, hỗ trợ xử lý Job ngầm     |
| **Cơ sở dữ liệu**       | PostgreSQL              | Đồng nhất trên toàn hệ thống                      |
| **Xử lý ngầm**          | BullMQ + Redis          | Đảm bảo lệnh không mất, tự động thử lại           |
| **Đăng nhập tập trung** | Keycloak + Custom Theme | Self-hosted, sở hữu dữ liệu, hỗ trợ SSO phức tạp, tối ưu chi phí so với Clerk |
| **Phân quyền**          | CASL                    | Đã sử dụng trong dự án hiện tại                   |

---

## 7. Lộ trình Triển khai Đề xuất (03 tuần)

| Giai đoạn       | Nội dung                                                                                 | Thời gian |
| :-------------- | :--------------------------------------------------------------------------------------- | :-------- |
| **Giai đoạn 1** | Thiết lập Keycloak SSO, Workspace Backend & Core Identity                                | Tuần 1    |
| **Giai đoạn 2** | Triển khai Provisioning (Tạo user tự động), Mapping Role & Property ID giữa các hệ thống | Tuần 2    |
| **Giai đoạn 3** | Cấu hình Zero-Login (Silent Auth), tích hợp App Launcher & Kiểm thử toàn hệ thống        | Tuần 3    |

---

_Tài liệu này được soạn thảo để phục vụ mục đích đề xuất giải pháp kiến trúc tổng thể cho hệ sinh thái KiNEX._
