# Roadmap Nâng cấp Hệ thống & Admin KPI Dashboard

Dự án: Ứng dụng Quản trị (Đồ án môn học)
Mục tiêu: Nâng cấp dự án React Native (Expo) từ Local Data sang Full-stack với Supabase (Email/Password Auth) và Admin Dashboard.

## Giai đoạn 1: Nâng cấp SDK & Khởi tạo Backend Supabase
- [x] Nâng cấp Expo SDK từ 54 lên 56.
- [x] Cài đặt các thư viện lõi (Supabase JS).
- [x] Khởi tạo Project Supabase (Tạo trên web).
- [x] Lưu API URL và Anon Key vào file `.env`.

## Giai đoạn 2: Database & Security
- [x] Tạo bảng `users` (id, email, role).
- [x] Tạo bảng `subjects`, `tasks`.
- [x] Tạo bảng `focus_sessions` để lưu log KPIs.
- [x] Thiết lập Policy (RLS) để bảo mật data: User thường chỉ thấy data của mình, Admin thấy toàn bộ.

## Giai đoạn 3: Xác thực Email/Password & Đồng bộ
- [x] Tạo màn hình Login (Email/Password).
- [x] Tạo màn hình Register (Email/Password).
- [x] Tích hợp API gọi Supabase để Đăng nhập/Đăng ký.
- [x] Cập nhật Zustand Store để đồng bộ data từ Cloud (đọc/ghi trực tiếp lên Supabase thay vì AsyncStorage).

## Giai đoạn 4: Tracking Dữ liệu KPI
- [x] Viết hàm tracking ghi nhận event (Bắt đầu, Hoàn thành, Hủy Focus).
- [x] Gắn hàm tracking vào các nút chức năng tương ứng trong ứng dụng.

## Giai đoạn 5: Admin Dashboard
- [x] Thêm Role Guard ẩn/hiện tab Admin dựa vào role `admin`.
- [x] Xây dựng UI tổng quan (Tổng User, Tỷ lệ Focus).
- [x] Gọi API query thống kê từ Supabase và hiển thị lên giao diện Admin.
- [x] Fix bug, tạo tài khoản mẫu và chuẩn bị kịch bản Demo báo cáo đồ án.
