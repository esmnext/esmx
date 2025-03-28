---
titleSuffix: Esmx Framework - Công cụ xây dựng hiệu suất cao
description: Phân tích sâu về hệ thống xây dựng Rspack trong Esmx Framework, bao gồm các tính năng cốt lõi như biên dịch hiệu suất cao, xây dựng đa môi trường, tối ưu hóa tài nguyên, giúp nhà phát triển xây dựng các ứng dụng Web hiện đại hiệu quả và đáng tin cậy.
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, hệ thống xây dựng, biên dịch hiệu suất cao, cập nhật nóng, xây dựng đa môi trường, Tree Shaking, phân chia mã, SSR, tối ưu hóa tài nguyên, hiệu quả phát triển, công cụ xây dựng
---

# Rspack

Esmx được xây dựng dựa trên hệ thống xây dựng [Rspack](https://rspack.dev/), tận dụng tối đa khả năng xây dựng hiệu suất cao của Rspack. Tài liệu này sẽ giới thiệu vị trí và các chức năng cốt lõi của Rspack trong Esmx Framework.

## Tính năng

Rspack là hệ thống xây dựng cốt lõi của Esmx Framework, cung cấp các tính năng chính sau:

- **Xây dựng hiệu suất cao**: Động cơ xây dựng được triển khai bằng Rust, cung cấp tốc độ biên dịch cực nhanh, cải thiện đáng kể tốc độ xây dựng cho các dự án lớn
- **Tối ưu hóa trải nghiệm phát triển**: Hỗ trợ các tính năng phát triển hiện đại như cập nhật nóng (HMR), biên dịch tăng dần, mang lại trải nghiệm phát triển mượt mà
- **Xây dựng đa môi trường**: Cấu hình xây dựng thống nhất hỗ trợ môi trường client, server và Node.js, đơn giản hóa quy trình phát triển đa nền tảng
- **Tối ưu hóa tài nguyên**: Khả năng xử lý và tối ưu hóa tài nguyên tích hợp, hỗ trợ các tính năng như phân chia mã, Tree Shaking, nén tài nguyên

## Xây dựng ứng dụng

Hệ thống xây dựng Rspack của Esmx được thiết kế theo mô-đun, bao gồm các mô-đun cốt lõi sau:

### @esmx/rspack

Mô-đun xây dựng cơ bản, cung cấp các khả năng cốt lõi sau:

- **Quản lý cấu hình xây dựng thống nhất**: Cung cấp quản lý cấu hình xây dựng tiêu chuẩn, hỗ trợ cấu hình đa môi trường
- **Xử lý tài nguyên**: Hỗ trợ tích hợp xử lý các tài nguyên như TypeScript, CSS, hình ảnh
- **Tối ưu hóa xây dựng**: Cung cấp các tính năng tối ưu hóa hiệu suất như phân chia mã, Tree Shaking
- **Máy chủ phát triển**: Tích hợp máy chủ phát triển hiệu suất cao, hỗ trợ HMR

### @esmx/rspack-vue

Mô-đun xây dựng chuyên dụng cho Vue Framework, cung cấp:

- **Biên dịch component Vue**: Hỗ trợ biên dịch hiệu quả các component Vue 2/3
- **Tối ưu hóa SSR**: Tối ưu hóa cụ thể cho các tình huống render phía server
- **Tăng cường phát triển**: Các chức năng tăng cường cụ thể cho môi trường phát triển Vue

## Quy trình xây dựng

Quy trình xây dựng của Esmx chủ yếu bao gồm các giai đoạn sau:

1. **Khởi tạo cấu hình**
   - Tải cấu hình dự án
   - Kết hợp cấu hình mặc định và cấu hình người dùng
   - Điều chỉnh cấu hình dựa trên biến môi trường

2. **Biên dịch tài nguyên**
   - Phân tích các phụ thuộc mã nguồn
   - Chuyển đổi các loại tài nguyên (TypeScript, CSS, v.v.)
   - Xử lý nhập/xuất mô-đun

3. **Xử lý tối ưu hóa**
   - Thực hiện phân chia mã
   - Áp dụng Tree Shaking
   - Nén mã và tài nguyên

4. **Tạo đầu ra**
   - Tạo các tệp đích
   - Xuất bản đồ tài nguyên
   - Tạo báo cáo xây dựng

## Thực tiễn tốt nhất

### Tối ưu hóa môi trường phát triển

- **Cấu hình biên dịch tăng dần**: Cấu hình hợp lý tùy chọn `cache`, sử dụng bộ nhớ đệm để tăng tốc độ xây dựng
- **Tối ưu hóa HMR**: Cấu hình phạm vi cập nhật nóng một cách có chọn lọc, tránh cập nhật các mô-đun không cần thiết
- **Tối ưu hóa xử lý tài nguyên**: Sử dụng cấu hình loader phù hợp, tránh xử lý trùng lặp

### Tối ưu hóa môi trường sản xuất

- **Chiến lược phân chia mã**: Cấu hình hợp lý `splitChunks`, tối ưu hóa tải tài nguyên
- **Nén tài nguyên**: Kích hoạt cấu hình nén phù hợp, cân bằng thời gian xây dựng và kích thước sản phẩm
- **Tối ưu hóa bộ nhớ đệm**: Sử dụng băm nội dung và chiến lược bộ nhớ đệm dài hạn, cải thiện hiệu suất tải

## Ví dụ cấu hình

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Cấu hình xây dựng tùy chỉnh
                config({ config }) {
                    // Thêm cấu hình Rspack tùy chỉnh tại đây
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
Để biết thêm chi tiết về API và các tùy chọn cấu hình, vui lòng tham khảo [Tài liệu API Rspack](/api/app/rspack.html).
:::