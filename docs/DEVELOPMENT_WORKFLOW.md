# Quy trình thay đổi Schema (Database Migration Workflow)

Để đảm bảo tính nhất quán giữa mã nguồn và cơ sở dữ liệu, mọi thay đổi đối với `schema.prisma` phải tuân thủ quy trình dưới đây. Tuyệt đối không sử dụng `db push` làm phương thức chính trong môi trường phát triển có nhiều người tham gia.

## Quy tắc vàng
> [!IMPORTANT]
> **LUÔN LUÔN** chạy `migrate dev` để sinh file migration vật lý **TRƯỚC KHI** thực hiện bất kỳ lệnh push hoặc commit nào.

## Các bước thực hiện

1.  **Chỉnh sửa Schema**: Cập nhật file `packages/database/prisma/schema.prisma`.
2.  **Sinh Migration**: Chạy lệnh sau để tạo file migration mới:
    ```bash
    bun db:migrate --name <ten_migration>
    ```
    *(Lưu ý: Lệnh này sẽ yêu cầu xác nhận nếu có thay đổi gây mất dữ liệu)*.
3.  **Kiểm tra file**: Xác nhận file `migration.sql` đã được tạo trong thư mục `prisma/migrations/`.
4.  **Kiểm tra mã nguồn**: Chạy `db:generate` để cập nhật Prisma Client.
5.  **Commit**: Commit cả file `schema.prisma` và thư mục migration mới vào git.

## Tại sao cần làm vậy?
- **Đồng bộ team**: Các thành viên khác chỉ cần chạy `migrate dev` để có cấu trúc DB giống hệt bạn.
- **Tracking**: Theo dõi được lịch sử thay đổi cấu trúc DB theo thời gian.
- **An toàn**: Tránh tình trạng DB ở server và local bị lệch pha dẫn đến lỗi runtime.

---
*Tài liệu này được tạo tự động để phục vụ quy trình phát triển của KiNEX Workspace.*
