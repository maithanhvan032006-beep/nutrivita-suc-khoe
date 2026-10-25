# Nutrivita – AI Health & Nutrition Tracker

**Nutrivita** là ứng dụng web toàn diện giúp người dùng quản lý chế độ ăn uống, tính toán khoa học BMR & TDEE theo công thức Mifflin–St Jeor, theo dõi lượng nước uống hằng ngày, xây dựng lịch tập luyện thể chất và nhận tư vấn dinh dưỡng cá nhân hóa bằng mô hình trí tuệ nhân tạo Gemini.

---

## 🌟 Điểm nổi bật & Tính năng chính

1. **Tự đăng ký & Đăng nhập linh hoạt (Hỗ trợ trải nghiệm ngay - Đăng nhập sau)**:
   - Tự tạo tài khoản với Họ tên, Email và Mật khẩu riêng.
   - Nút **"Trải nghiệm ngay (Đăng nhập sau)"** cho phép người dùng vào thẳng ứng dụng và Onboarding ngay lập tức mà không bị chặn bởi bất kỳ bước đăng nhập nào.
   - Dữ liệu duy trì liên tục và có thể đồng bộ lưu trữ an toàn.

2. **Quy trình Onboarding 5 bước**:
   - Thu thập thông số cơ thể: ngày sinh, chiều cao, cân nặng hiện tại, cân nặng mục tiêu, giới tính sinh học.
   - Lựa chọn mục tiêu: Giảm cân, Duy trì, Tăng cân, Cải thiện sức bền, Tăng cơ.
   - Xác định mức độ vận động (từ ít vận động đến rất nhiều).
   - Khai báo thói quen, dị ứng và hạn chế sức khỏe.
   - Xem trước bảng tính BMR, TDEE, Calo mục tiêu và lượng nước đề xuất trước khi lưu.

3. **Bảng điều khiển Tổng quan (Dashboard)**:
   - Thống kê năng lượng trong ngày: Calo đã nạp, Calo mục tiêu, Calo còn lại, Calo vận động.
   - Vòng tròn tiến độ trực quan và phân tách đa lượng Carbs / Protein / Chất béo / Chất xơ.
   - Ly nước tương tác với các nút bấm thêm nhanh (+100ml, +200ml, +250ml, +500ml).
   - Tóm tắt bài tập và các bữa ăn gần nhất.

4. **Nhật ký ăn uống & Món ăn Việt Nam**:
   - Phân chia 4 bữa: Sáng, Trưa, Tối, Phụ.
   - Cơ sở dữ liệu phong phú các món ăn Việt Nam truyền thống (Phở, Bún chả, Cơm tấm, Gỏi cuốn, Canh chua...).
   - Tự động tính toán lại dinh dưỡng theo khẩu phần tùy chỉnh (gam, bát, đĩa, phần).
   - Nhập thủ công nhãn dinh dưỡng.
   - **AI Food Scanner**: Nhập mô tả món ăn hoặc tải ảnh để Gemini AI phân tích, cho phép người dùng kiểm tra và chỉnh sửa trước khi lưu.
   - Sao chép bữa ăn sang ngày khác tiện lợi.

5. **Thư viện bài tập & Lịch tập tuần**:
   - Thư viện bài tập với hệ số MET chuẩn hóa: Đi bộ nhanh, Chạy bộ, Đạp xe, Yoga Vinyasa, Pilates thảm siết eo, Tập mông đùi tại nhà, HIIT Cardio, Giãn cơ, Tạ đơn.
   - Tính toán calo tiêu hao dựa trên công thức MET x 3.5 x cân nặng / 200 x số phút.
   - Ghi nhận cảm nhận sau buổi tập (Tuyệt vời, Khỏe, Mỏi nhẹ, Kiệt sức).
   - Lập kế hoạch tập luyện và cài đặt ngày nghỉ theo tuần.

6. **Kế hoạch ăn uống AI (AI Meal Planner)**:
   - Tự động thiết kế thực đơn 1 ngày chuẩn món Việt Nam dựa trên mục tiêu calo, loại bỏ dị ứng đã khai báo.
   - Hiển thị thành phần dinh dưỡng, nguyên liệu và hướng dẫn chế biến.
   - Lưu trữ vào danh mục thực đơn cá nhân.

7. **Trợ lý sức khỏe Nutrivita AI**:
   - Trò chuyện thông minh bằng tiếng Việt với Gemini 3.8.
   - Tùy chọn bật/tắt gửi thông số sức khỏe hôm nay vào ngữ cảnh câu hỏi (bảo đảm quyền riêng tư).
   - Cung cấp gợi ý nhanh: giải thích BMR/TDEE, gợi ý bữa tối, bài tập đốt mỡ.
   - Tuyên bố từ chối trách nhiệm y tế minh bạch: không thay thế bác sĩ.

8. **Theo dõi tiến trình & Biểu đồ thật**:
   - Biểu đồ đường biến thiên cân nặng theo thời gian (7 ngày, 30 ngày, tất cả).
   - Theo dõi số đo vòng eo và tỷ lệ mỡ cơ thể.
   - Xuất toàn bộ dữ liệu ra tệp JSON để lưu trữ cá nhân.

9. **Hồ sơ, Cài đặt & Quyền riêng tư**:
   - Cập nhật mục tiêu và thông số cơ thể bất kỳ lúc nào.
   - Cài đặt nhắc nhở uống nước, ghi nhận bữa ăn.
   - Quản lý đồng ý dữ liệu AI.
   - Chế độ Dark mode / Light mode.
   - Xóa tài khoản vĩnh viễn với xác nhận kép an toàn.

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion.
- **Backend / API**: Express, Node.js, `@google/genai` SDK.
- **Cơ sở dữ liệu & Xác thực**: Firebase Authentication (Google OAuth), Cloud Firestore.
- **Trí tuệ nhân tạo**: Google Gemini (`gemini-3.8-flash`).

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Cài đặt phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"
```

### 3. Chạy trong môi trường phát triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:3000`

### 4. Build sản phẩm (Production)
```bash
npm run build
npm start
```

---

## 🔐 Cấu hình Firebase & Firestore Security Rules

1. **Kích hoạt Google Sign-In**:
   - Truy cập **Firebase Console** > **Authentication** > **Sign-in method**.
   - Bật nhà cung cấp **Google** và lưu cấu hình.

2. **Triển khai Firestore Rules**:
   - Tệp `firestore.rules` đã được cấu hình theo nguyên tắc Zero-Trust:
     - Mặc định từ chối toàn bộ (`allow read, write: if false;`).
     - Chỉ người dùng có UID khớp với `request.auth.uid` mới được đọc/ghi dữ liệu của chính mình trong `users/{userId}` và các subcollection.
   - Triển khai rules bằng Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```

---

## 🌐 Hướng dẫn triển khai lên Vercel

1. Đẩy mã nguồn lên kho lưu trữ GitHub/GitLab.
2. Đăng nhập vào [Vercel](https://vercel.com) và tạo New Project từ repo.
3. Thiết lập **Build Command**: `npm run build`
4. Thiết lập **Output Directory**: `dist`
5. Thêm các biến môi trường trong phần **Environment Variables**:
   - `GEMINI_API_KEY`
   - Các biến Firebase tương ứng nếu không dùng `firebase-applet-config.json`.
6. Nhấn **Deploy**.

---

## 📋 Kiểm thử bảo mật & Tính toàn vẹn

- Người chưa đăng nhập chỉ nhìn thấy trang giới thiệu và đăng nhập Google.
- Không thể đọc hoặc sửa đổi dữ liệu của tài khoản khác nhờ cấu trúc phân vùng subcollection và rules nghiêm ngặt.
- Không hardcode API key bí mật trong bundle client; mọi cuộc gọi AI đều đi qua server proxy.
- Có xử lý ngắt kết nối mạng và lỗi quyền hạn Firestore rõ ràng qua `handleFirestoreError`.
