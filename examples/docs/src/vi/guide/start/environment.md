---
titleSuffix: Hướng dẫn tương thích khung Esmx
description: Chi tiết các yêu cầu môi trường của khung Esmx, bao gồm yêu cầu phiên bản Node.js và hướng dẫn tương thích trình duyệt, giúp nhà phát triển cấu hình đúng môi trường phát triển.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, tương thích trình duyệt, TypeScript, es-module-shims, cấu hình môi trường
---

# Yêu cầu môi trường

Tài liệu này mô tả các yêu cầu môi trường cần thiết để sử dụng khung này, bao gồm môi trường Node.js và tương thích trình duyệt.

## Môi trường Node.js

Khung yêu cầu Node.js phiên bản >= 22.6, chủ yếu để hỗ trợ nhập kiểu TypeScript (thông qua cờ `--experimental-strip-types`), không cần bước biên dịch bổ sung.

## Tương thích trình duyệt

Khung mặc định được xây dựng ở chế độ tương thích để hỗ trợ nhiều trình duyệt hơn. Tuy nhiên, cần lưu ý rằng để đạt được hỗ trợ tương thích trình duyệt đầy đủ, cần thêm thủ công phụ thuộc [es-module-shims](https://github.com/guybedford/es-module-shims).

### Chế độ tương thích (mặc định)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

Theo thống kê từ [Can I Use](https://caniuse.com/?search=dynamic%20import), tỷ lệ phủ sóng trình duyệt ở chế độ tương thích đạt 96.81%.

### Chế độ hỗ trợ gốc
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

Chế độ hỗ trợ gốc có các ưu điểm sau:
- Không có chi phí thời gian chạy, không cần bộ tải mô-đun bổ sung
- Trình duyệt phân tích gốc, tốc độ thực thi nhanh hơn
- Khả năng phân chia mã và tải theo yêu cầu tốt hơn

Theo thống kê từ [Can I Use](https://caniuse.com/?search=importmap), tỷ lệ phủ sóng trình duyệt ở chế độ tương thích đạt 93.5%.

### Kích hoạt hỗ trợ tương thích

::: warning Lưu ý quan trọng
Mặc dù khung mặc định được xây dựng ở chế độ tương thích, nhưng để đạt được hỗ trợ đầy đủ cho các trình duyệt cũ, bạn cần thêm phụ thuộc [es-module-shims](https://github.com/guybedford/es-module-shims) vào dự án.

:::

Thêm các tập lệnh sau vào tệp HTML:

```html
<!-- Môi trường phát triển -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Môi trường sản xuất -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Thực hành tốt nhất

1. Đề xuất cho môi trường sản xuất:
   - Triển khai es-module-shims lên máy chủ riêng
   - Đảm bảo tính ổn định và tốc độ truy cập của tài nguyên
   - Tránh các rủi ro bảo mật tiềm ẩn
2. Xem xét hiệu suất:
   - Chế độ tương thích sẽ mang lại một chút chi phí hiệu suất
   - Có thể quyết định có kích hoạt hay không dựa trên phân bố trình duyệt của nhóm người dùng mục tiêu

:::