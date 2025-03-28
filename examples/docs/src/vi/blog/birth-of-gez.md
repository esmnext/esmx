---
titleSuffix: "Từ khó khăn của micro frontend đến đổi mới ESM: Hành trình phát triển của framework Esmx"
description: Khám phá sâu về hành trình phát triển của framework Esmx từ những khó khăn của kiến trúc micro frontend truyền thống đến đột phá đổi mới dựa trên ESM, chia sẻ kinh nghiệm thực tiễn về tối ưu hiệu suất, quản lý phụ thuộc và lựa chọn công cụ xây dựng.
head:
  - - meta
    - property: keywords
      content: Esmx, framework micro frontend, ESM, Import Maps, Rspack, Module Federation, quản lý phụ thuộc, tối ưu hiệu suất, tiến hóa công nghệ, server-side rendering
sidebar: false
---

# Từ chia sẻ component đến module hóa nguyên bản: Hành trình phát triển của framework micro frontend Esmx

## Bối cảnh dự án

Trong những năm qua, kiến trúc micro frontend luôn tìm kiếm một con đường đúng đắn. Tuy nhiên, chúng ta thấy rằng các giải pháp kỹ thuật phức tạp đã sử dụng nhiều lớp bao bọc và cách ly thủ công để mô phỏng một thế giới micro frontend lý tưởng. Những giải pháp này mang lại gánh nặng hiệu suất lớn, khiến việc phát triển đơn giản trở nên phức tạp và làm cho quy trình tiêu chuẩn trở nên khó hiểu.

### Hạn chế của các giải pháp truyền thống

Trong quá trình thực hiện kiến trúc micro frontend, chúng tôi nhận thấy nhiều hạn chế của các giải pháp truyền thống:

- **Tổn thất hiệu suất**: Tiêm phụ thuộc tại thời điểm chạy, proxy sandbox JS, mỗi thao tác đều tiêu tốn hiệu suất quý giá
- **Cách ly mong manh**: Môi trường sandbox được tạo thủ công không bao giờ đạt được khả năng cách ly nguyên bản của trình duyệt
- **Độ phức tạp của quá trình xây dựng**: Để xử lý các mối quan hệ phụ thuộc, buộc phải sửa đổi công cụ xây dựng, khiến các dự án đơn giản trở nên khó bảo trì
- **Quy tắc tùy chỉnh**: Chiến lược triển khai đặc biệt, xử lý tại thời điểm chạy, khiến mỗi bước đều lệch khỏi quy trình phát triển hiện đại tiêu chuẩn
- **Hạn chế hệ sinh thái**: Liên kết framework, API tùy chỉnh, khiến việc lựa chọn công nghệ bị ràng buộc vào một hệ sinh thái cụ thể

Những vấn đề này đặc biệt nổi bật trong một dự án cấp doanh nghiệp của chúng tôi vào năm 2019. Khi đó, một sản phẩm lớn được chia thành hơn mười hệ thống con nghiệp vụ độc lập, các hệ thống con này cần chia sẻ một bộ component cơ sở và component nghiệp vụ. Giải pháp chia sẻ component dựa trên npm ban đầu đã bộc lộ vấn đề nghiêm trọng về hiệu quả bảo trì: khi component chia sẻ được cập nhật, tất cả các hệ thống con phụ thuộc vào component đó đều phải trải qua quy trình xây dựng và triển khai đầy đủ.

## Tiến hóa công nghệ

### v1.0: Khám phá component từ xa

Để giải quyết vấn đề hiệu quả chia sẻ component, Esmx v1.0 đã giới thiệu cơ chế RemoteView component dựa trên giao thức HTTP. Giải pháp này thực hiện lắp ráp mã theo yêu cầu giữa các dịch vụ thông qua yêu cầu động tại thời điểm chạy, giải quyết thành công vấn đề chuỗi phụ thuộc xây dựng quá dài. Tuy nhiên, do thiếu cơ chế giao tiếp tiêu chuẩn tại thời điểm chạy, việc đồng bộ trạng thái và truyền sự kiện giữa các dịch vụ vẫn gặp phải vấn đề về hiệu suất.

### v2.0: Thử nghiệm Module Federation

Trong phiên bản v2.0, chúng tôi đã sử dụng công nghệ [Module Federation](https://webpack.js.org/concepts/module-federation/) của [Webpack 5.0](https://webpack.js.org/). Công nghệ này thông qua cơ chế tải module thống nhất và container tại thời điểm chạy, đã cải thiện đáng kể hiệu quả phối hợp giữa các dịch vụ. Tuy nhiên, trong thực tiễn quy mô lớn, cơ chế triển khai đóng của Module Federation đã mang lại thách thức mới: khó thực hiện quản lý phiên bản phụ thuộc chính xác, đặc biệt khi thống nhất các phụ thuộc chia sẻ của nhiều dịch vụ, thường gặp phải xung đột phiên bản và ngoại lệ tại thời điểm chạy.

## Đón nhận kỷ nguyên mới của ESM

Khi lên kế hoạch cho phiên bản v3.0, chúng tôi đã quan sát sâu sắc xu hướng phát triển của hệ sinh thái frontend và nhận thấy rằng sự tiến bộ của khả năng nguyên bản trình duyệt đã mang lại khả năng mới cho kiến trúc micro frontend:

### Hệ thống module tiêu chuẩn

Với sự hỗ trợ toàn diện của các trình duyệt chính cho [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) và sự trưởng thành của tiêu chuẩn [Import Maps](https://github.com/WICG/import-maps), phát triển frontend đã bước vào kỷ nguyên module hóa thực sự. Theo thống kê của [Can I Use](https://caniuse.com/?search=importmap), hiện tại tỷ lệ hỗ trợ nguyên bản ESM của các trình duyệt chính (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) đã đạt 93.5%, mang lại cho chúng tôi những lợi thế sau:

- **Quản lý phụ thuộc tiêu chuẩn**: Import Maps cung cấp khả năng phân giải phụ thuộc module ở cấp trình duyệt, không cần tiêm phức tạp tại thời điểm chạy
- **Tối ưu hóa tải tài nguyên**: Cơ chế cache module nguyên bản của trình duyệt cải thiện đáng kể hiệu quả tải tài nguyên
- **Đơn giản hóa quy trình xây dựng**: Mô hình phát triển dựa trên ESM giúp quy trình xây dựng môi trường phát triển và sản xuất trở nên nhất quán hơn

Đồng thời, thông qua hỗ trợ chế độ tương thích (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14), chúng tôi có thể nâng cao tỷ lệ phủ sóng trình duyệt lên 96.81%, cho phép chúng tôi duy trì hiệu suất cao mà không hy sinh hỗ trợ cho các trình duyệt cũ.

### Đột phá về hiệu suất và cách ly

Hệ thống module nguyên bản mang lại không chỉ sự tiêu chuẩn hóa mà còn là sự cải thiện đáng kể về hiệu suất và khả năng cách ly:

- **Không chi phí tại thời điểm chạy**: Loại bỏ proxy sandbox JavaScript và tiêm tại thời điểm chạy trong các giải pháp micro frontend truyền thống
- **Cơ chế cách ly đáng tin cậy**: Phạm vi module nghiêm ngặt của ESM cung cấp khả năng cách ly đáng tin cậy nhất
- **Quản lý phụ thuộc chính xác**: Phân tích nhập tĩnh giúp mối quan hệ phụ thuộc rõ ràng hơn, kiểm soát phiên bản chính xác hơn

### Lựa chọn công cụ xây dựng

Trong quá trình triển khai giải pháp kỹ thuật, việc lựa chọn công cụ xây dựng là một quyết định quan trọng. Sau gần một năm nghiên cứu và thực tiễn kỹ thuật, lựa chọn của chúng tôi đã trải qua các giai đoạn phát triển sau:

1. **Khám phá Vite**
   - Ưu điểm: Máy chủ phát triển dựa trên ESM, mang lại trải nghiệm phát triển tối ưu
   - Thách thức: Sự khác biệt giữa môi trường phát triển và xây dựng sản xuất mang lại một số bất ổn

2. **Xác lập [Rspack](https://www.rspack.dev/)**
   - Ưu điểm hiệu suất: Biên dịch hiệu suất cao dựa trên [Rust](https://www.rust-lang.org/), cải thiện đáng kể tốc độ xây dựng
   - Hỗ trợ hệ sinh thái: Tương thích cao với hệ sinh thái Webpack, giảm chi phí di chuyển
   - Hỗ trợ ESM: Thông qua thực tiễn dự án Rslib, xác nhận độ tin cậy trong xây dựng ESM

Quyết định này giúp chúng tôi duy trì trải nghiệm phát triển đồng thời đạt được hỗ trợ môi trường sản xuất ổn định hơn. Dựa trên sự kết hợp ESM và Rspack, chúng tôi cuối cùng đã xây dựng một giải pháp micro frontend hiệu suất cao, ít xâm nhập.

## Triển vọng tương lai

Trong kế hoạch phát triển tương lai, framework Esmx sẽ tập trung vào ba hướng chính:

### Tối ưu hóa sâu Import Maps

- **Quản lý phụ thuộc động**: Thực hiện điều phối phiên bản phụ thuộc thông minh tại thời điểm chạy, giải quyết xung đột phụ thuộc giữa nhiều ứng dụng
- **Chiến lược tải trước**: Tải trước thông minh dựa trên phân tích tuyến đường, cải thiện hiệu quả tải tài nguyên
- **Tối ưu hóa xây dựng**: Tự động tạo cấu hình Import Maps tối ưu, giảm chi phí cấu hình thủ công của nhà phát triển

### Giải pháp định tuyến độc lập framework

- **Trừu tượng hóa định tuyến thống nhất**: Thiết kế giao diện định tuyến độc lập framework, hỗ trợ các framework chính như Vue, React
- **Định tuyến micro app**: Thực hiện liên kết định tuyến giữa các ứng dụng, duy trì sự nhất quán giữa URL và trạng thái ứng dụng
- **Middleware định tuyến**: Cung cấp cơ chế middleware mở rộng, hỗ trợ kiểm soát quyền, chuyển trang, v.v.

### Thực tiễn tốt nhất về giao tiếp đa framework

- **Ứng dụng mẫu**: Cung cấp ví dụ đầy đủ về giao tiếp đa framework, bao gồm các framework chính như Vue, React, Preact
- **Đồng bộ trạng thái**: Giải pháp chia sẻ trạng thái nhẹ dựa trên ESM
- **Bus sự kiện**: Cơ chế giao tiếp sự kiện tiêu chuẩn, hỗ trợ giao tiếp tách rời giữa các ứng dụng

Thông qua các tối ưu hóa và mở rộng này, chúng tôi mong muốn biến Esmx thành một giải pháp micro frontend hoàn thiện hơn, dễ sử dụng hơn, mang lại trải nghiệm phát triển tốt hơn và hiệu quả phát triển cao hơn cho các nhà phát triển.