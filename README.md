# StudyCommit Lite - Ứng dụng Quản lý Học tập & Tập trung

**StudyCommit Lite** là một ứng dụng di động được xây dựng trên nền tảng **React Native (Expo)** giúp học sinh, sinh viên quản lý thời gian học tập hiệu quả, theo dõi thời khóa biểu, công việc cần làm và rèn luyện sự tập trung thông qua phương pháp Pomodoro kết hợp cơ chế Gamification (Tích điểm thưởng/phạt).

---

## 🚀 Tính Năng Nổi Bật

Ứng dụng bao gồm 5 phân hệ chính tương ứng với thanh điều hướng dưới (Bottom Tab Navigation):

1. **🏠 Hôm Nay (Today Screen)**
   - Dashboard tổng hợp các thông tin quan trọng trong ngày: điểm tích lũy học tập, tiến độ hoàn thành công việc và thời gian đã tập trung.
   - Hiển thị nhanh các môn học tiếp theo trong ngày.

2. **✅ Công Việc (Tasks Screen)**
   - Quản lý danh sách việc cần làm (To-Do List) thông minh.
   - Cho phép thêm mới, chỉnh sửa, đánh dấu hoàn thành và lọc công việc theo mức độ ưu tiên hoặc môn học.

3. **📅 Lịch Học (Timetable Screen)**
   - Thời khóa biểu trực quan theo các ngày trong tuần.
   - Dễ dàng thêm lịch học mới, cài đặt thời gian bắt đầu/kết thúc và phòng học.

4. **⏱️ Tập Trung (Focus Screen)**
   - Bộ đếm thời gian tập trung (Pomodoro / Đồng hồ bấm giờ).
   - **Cơ chế chống xao nhãng đặc biệt:**
     - *Chuyển tab:* Nếu bạn chuyển sang tab khác khi đang trong phiên tập trung, phiên sẽ bị hủy và bạn sẽ bị **trừ 5 điểm**.
     - *Thoát ứng dụng / Chạy ngầm:* Nếu bạn thoát ứng dụng ra màn hình chính hoặc mở ứng dụng khác, hệ thống sẽ tự động ghi nhận phiên bị hủy do chạy nền và **trừ 5 điểm** phạt tích lũy.

5. **📊 Thống Kê (Stats Screen)**
   - Biểu đồ thống kê chi tiết về thời gian tập trung theo tuần/tháng.
   - Bảng phân tích phân bổ thời gian học tập cho từng môn học để điều chỉnh lộ trình hiệu quả.

6. **👤 Hồ Sơ (Profile Screen)**
   - Quản lý thông tin cá nhân, theo dõi cấp độ (Level) dựa trên điểm tích lũy.
   - Xem bảng xếp hạng và các thành tích (Achievements) đạt được.

---

## 🛠️ Công Nghệ Sử Dụng

- **Core:** [React Native](https://reactnative.dev/) & [Expo SDK 54](https://docs.expo.dev/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Quản lý trạng thái (State Management):** [Zustand](https://github.com/pmndrs/zustand)
- **Điều hướng (Navigation):** [@react-navigation/native](https://reactnavigation.org/) & `@react-navigation/bottom-tabs`
- **Giao diện & Tiện ích:**
  - `react-native-safe-area-context` (Tối ưu hiển thị tai thỏ/nút home vuốt)
  - `@expo/vector-icons` (Hệ thống icon sinh động)
  - `expo-linear-gradient` (Hiệu ứng màu gradient hiện đại)
  - `expo-av` & `expo-audio` (Âm thanh thông báo khi hoàn thành/hủy phiên tập trung)

---

## 📥 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

Hãy thực hiện theo các bước sau để thiết lập dự án trên máy tính của bạn:

### 1. Yêu Cầu Hệ Thống
- Đã cài đặt [Node.js](https://nodejs.org/) (Khuyến nghị phiên bản LTS v18 trở lên).
- Đã cài đặt [Git](https://git-scm.com/).

### 2. Tải Mã Nguồn Về Máy
Mở Terminal/Command Prompt và chạy lệnh:
```bash
git clone https://github.com/LocNguyen832004/qtda.git
cd qtda
```

### 3. Cài Đặt Thư Viện (Dependencies)
Cài đặt tất cả các gói thư viện cần thiết bằng npm:
```bash
npm install
```

### 4. Khởi Chạy Dự Án
Chạy máy chủ phát triển của Expo:
```bash
npm start
# Hoặc
npx expo start
```

Sau khi chạy lệnh, màn hình giao diện Expo Developer Tools sẽ hiển thị trong terminal kèm theo một mã QR.

### 5. Xem Ứng Dụng Trên Điện Thoại / Trình Giả Lập
- **Trên Điện thoại thật (iOS & Android):**
  1. Tải ứng dụng **Expo Go** từ Google Play Store hoặc Apple App Store.
  2. *Android:* Mở ứng dụng Expo Go và quét mã QR hiển thị ở terminal.
  3. *iOS:* Mở ứng dụng Camera mặc định để quét mã QR và nhấn mở liên kết trong Expo Go.
  *(Lưu ý: Điện thoại và máy tính chạy dev server cần kết nối chung một mạng Wi-Fi).*
- **Trên Trình giả lập:**
  - Nhấn phím `a` trong terminal để mở trên trình giả lập Android (yêu cầu Android Studio).
  - Nhấn phím `i` trong terminal để mở trên trình giả lập iOS (yêu cầu Xcode - chỉ dành cho macOS).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
qtda/
├── .expo/                # Thư mục cache và cấu hình Expo
├── assets/               # Chứa hình ảnh, âm thanh, icon của ứng dụng
├── screens/              # Chứa các màn hình giao diện chính (Today, Tasks, Focus, v.v.)
├── src/
│   ├── components/       # Các component UI dùng chung và riêng cho từng chức năng
│   ├── data/             # Dữ liệu tĩnh hoặc mẫu dùng trong ứng dụng
│   ├── hooks/            # Các custom React hooks
│   ├── store/            # Quản lý global state (Zustand store)
│   ├── types/            # Định nghĩa các TypeScript interfaces / types
│   └── utils/            # Các hàm tiện ích, cấu hình màu sắc/theme
├── App.tsx               # Điểm khởi đầu ứng dụng (App entry component & Navigation)
├── app.json              # Cấu hình dự án Expo (Tên, icon, splash screen, permissions)
├── package.json          # Danh sách thư viện phụ thuộc và scripts chạy dự án
└── tsconfig.json         # Cấu hình compiler cho TypeScript
```
