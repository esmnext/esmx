---
titleSuffix: Tổng quan về khung Esmx và đổi mới công nghệ
description: Tìm hiểu sâu về bối cảnh dự án, tiến hóa công nghệ và lợi thế cốt lõi của khung vi frontend Esmx, khám phá giải pháp render phía máy chủ hiện đại dựa trên ESM.
head:
  - - meta
    - property: keywords
      content: Esmx, vi frontend, ESM, render phía máy chủ, SSR, đổi mới công nghệ, liên bang module
---

# Giới thiệu

## Bối cảnh dự án
Esmx là một khung vi frontend hiện đại dựa trên ECMAScript Modules (ESM), tập trung vào việc xây dựng các ứng dụng render phía máy chủ (SSR) hiệu suất cao và có thể mở rộng. Là sản phẩm thế hệ thứ ba của dự án Genesis, Esmx không ngừng đổi mới trong quá trình tiến hóa công nghệ:

- **v1.0**: Thực hiện tải các thành phần từ xa theo yêu cầu dựa trên yêu cầu HTTP
- **v2.0**: Thực hiện tích hợp ứng dụng dựa trên Webpack Module Federation
- **v3.0**: Thiết kế lại hệ thống [liên kết module](/guide/essentials/module-link) dựa trên ESM gốc của trình duyệt

## Bối cảnh công nghệ
Trong quá trình phát triển kiến trúc vi frontend, các giải pháp truyền thống chủ yếu có các hạn chế sau:

### Thách thức của các giải pháp hiện có
- **Nút cổ chai hiệu suất**: Tiêm phụ thuộc thời gian chạy và proxy sandbox JavaScript mang lại chi phí hiệu suất đáng kể
- **Cơ chế cách ly**: Môi trường sandbox tự phát triển khó đạt được khả năng cách ly module gốc của trình duyệt
- **Độ phức tạp xây dựng**: Cải tiến công cụ xây dựng để chia sẻ phụ thuộc làm tăng chi phí bảo trì dự án
- **Lệch chuẩn**: Chiến lược triển khai đặc biệt và cơ chế xử lý thời gian chạy đi ngược lại tiêu chuẩn phát triển Web hiện đại
- **Giới hạn hệ sinh thái**: Khung kết hợp và API tùy chỉnh hạn chế lựa chọn công nghệ

### Đổi mới công nghệ
Esmx dựa trên tiêu chuẩn Web hiện đại, cung cấp giải pháp mới:

- **Hệ thống module gốc**: Sử dụng ESM gốc của trình duyệt và Import Maps để quản lý phụ thuộc, có tốc độ phân tích và thực thi nhanh hơn
- **Cơ chế cách ly chuẩn**: Thực hiện cách ly ứng dụng đáng tin cậy dựa trên phạm vi module ECMAScript
- **Công nghệ mở**: Hỗ trợ tích hợp liền mạch với bất kỳ khung frontend hiện đại nào
- **Tối ưu trải nghiệm phát triển**: Cung cấp chế độ phát triển trực quan và khả năng gỡ lỗi đầy đủ
- **Tối ưu hiệu suất tối đa**: Đạt được chi phí thời gian chạy bằng không thông qua khả năng gốc, kết hợp với chiến lược bộ nhớ đệm thông minh

:::tip
Esmx tập trung vào việc xây dựng cơ sở hạ tầng vi frontend hiệu suất cao, dễ mở rộng, đặc biệt phù hợp với các ứng dụng render phía máy chủ quy mô lớn.
:::

## Quy chuẩn công nghệ

### Phụ thuộc môi trường
Vui lòng tham khảo tài liệu [yêu cầu môi trường](/guide/start/environment) để biết chi tiết về yêu cầu trình duyệt và môi trường Node.js.

### Công nghệ cốt lõi
- **Quản lý phụ thuộc**: Sử dụng [Import Maps](https://caniuse.com/?search=import%20map) để ánh xạ module, sử dụng [es-module-shims](https://github.com/guybedford/es-module-shims) để cung cấp hỗ trợ tương thích
- **Hệ thống xây dựng**: Dựa trên [module-import](https://rspack.dev/config/externals#externalstypemodule-import) của Rspack để xử lý phụ thuộc bên ngoài
- **Công cụ phát triển**: Hỗ trợ cập nhật nóng ESM và thực thi TypeScript gốc

## Định vị khung
Esmx khác với [Next.js](https://nextjs.org) hoặc [Nuxt.js](https://nuxt.com/), tập trung vào việc cung cấp cơ sở hạ tầng vi frontend:

- **Hệ thống liên kết module**: Thực hiện nhập xuất module hiệu quả, đáng tin cậy
- **Render phía máy chủ**: Cung cấp cơ chế thực hiện SSR linh hoạt
- **Hỗ trợ hệ thống kiểu**: Tích hợp định nghĩa kiểu TypeScript đầy đủ
- **Tính trung lập khung**: Hỗ trợ tích hợp với các khung frontend chính

## Thiết kế kiến trúc

### Quản lý phụ thuộc tập trung
- **Nguồn phụ thuộc thống nhất**: Quản lý phụ thuộc bên thứ ba tập trung
- **Phân phối tự động**: Đồng bộ hóa tự động toàn cầu khi cập nhật phụ thuộc
- **Nhất quán phiên bản**: Kiểm soát phiên bản phụ thuộc chính xác

### Thiết kế module hóa
- **Tách biệt trách nhiệm**: Tách biệt logic nghiệp vụ và cơ sở hạ tầng
- **Cơ chế plugin**: Hỗ trợ kết hợp và thay thế module linh hoạt
- **Giao diện chuẩn**: Giao thức giao tiếp chuẩn hóa giữa các module

### Tối ưu hiệu suất
- **Nguyên tắc chi phí bằng không**: Tận dụng tối đa khả năng gốc của trình duyệt
- **Bộ nhớ đệm thông minh**: Chiến lược bộ nhớ đệm chính xác dựa trên băm nội dung
- **Tải theo yêu cầu**: Quản lý phụ thuộc và phân chia mã tinh vi

## Độ trưởng thành dự án
Esmx đã trải qua gần 5 năm lặp lại và tiến hóa (từ v1.0 đến v3.0), đã được kiểm chứng toàn diện trong môi trường doanh nghiệp. Hiện tại hỗ trợ hàng chục dự án nghiệp vụ hoạt động ổn định và tiếp tục thúc đẩy nâng cấp công nghệ hiện đại. Tính ổn định, độ tin cậy và lợi thế hiệu suất của khung đã được kiểm chứng đầy đủ trong thực tế, cung cấp nền tảng công nghệ đáng tin cậy cho phát triển ứng dụng quy mô lớn.