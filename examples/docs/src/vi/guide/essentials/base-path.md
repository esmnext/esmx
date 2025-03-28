---
titleSuffix: Hướng dẫn cấu hình đường dẫn tài nguyên tĩnh trong Esmx Framework
description: Hướng dẫn chi tiết về cấu hình đường dẫn cơ bản trong Esmx Framework, bao gồm triển khai đa môi trường, phân phối CDN và thiết lập đường dẫn truy cập tài nguyên, giúp nhà phát triển quản lý tài nguyên tĩnh một cách linh hoạt.
head:
  - - meta
    - property: keywords
      content: Esmx, Đường dẫn cơ bản, Base Path, CDN, Tài nguyên tĩnh, Triển khai đa môi trường, Quản lý tài nguyên
---

# Đường dẫn cơ bản

Đường dẫn cơ bản (Base Path) là tiền tố đường dẫn truy cập cho các tài nguyên tĩnh (như JavaScript, CSS, hình ảnh, v.v.) trong ứng dụng. Trong Esmx, việc cấu hình đường dẫn cơ bản một cách hợp lý là rất quan trọng cho các tình huống sau:

- **Triển khai đa môi trường**: Hỗ trợ truy cập tài nguyên trong các môi trường khác nhau như môi trường phát triển, môi trường kiểm thử, môi trường sản xuất
- **Triển khai đa khu vực**: Đáp ứng nhu cầu triển khai cụm ở các khu vực hoặc quốc gia khác nhau
- **Phân phối CDN**: Thực hiện phân phối và tăng tốc tài nguyên tĩnh trên toàn cầu

## Cơ chế đường dẫn mặc định

Esmx sử dụng cơ chế tự động tạo đường dẫn dựa trên tên dịch vụ. Theo mặc định, framework sẽ đọc trường `name` trong `package.json` của dự án để tạo đường dẫn cơ bản cho tài nguyên tĩnh: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Thiết kế này ưu tiên quy ước hơn cấu hình có các ưu điểm sau:

- **Tính nhất quán**: Đảm bảo tất cả các tài nguyên tĩnh sử dụng cùng một đường dẫn truy cập
- **Tính dự đoán được**: Có thể suy ra đường dẫn truy cập tài nguyên thông qua trường `name` trong `package.json`
- **Tính bảo trì**: Không cần cấu hình thêm, giảm chi phí bảo trì

## Cấu hình đường dẫn động

Trong các dự án thực tế, chúng ta thường cần triển khai cùng một bộ mã lên các môi trường hoặc khu vực khác nhau. Esmx cung cấp hỗ trợ cho đường dẫn cơ bản động, giúp ứng dụng có thể thích ứng với các tình huống triển khai khác nhau.

### Các tình huống sử dụng

#### Triển khai thư mục cấp hai
```
- example.com      -> Trang chủ mặc định
- example.com/cn/  -> Trang tiếng Trung
- example.com/en/  -> Trang tiếng Anh
```

#### Triển khai tên miền độc lập
```
- example.com    -> Trang chủ mặc định
- cn.example.com -> Trang tiếng Trung
- en.example.com -> Trang tiếng Anh
```

### Phương pháp cấu hình

Thông qua tham số `base` của phương thức `esmx.render()`, bạn có thể thiết lập đường dẫn cơ bản một cách động dựa trên ngữ cảnh yêu cầu:

```ts
const render = await esmx.render({
    base: '/cn',  // Thiết lập đường dẫn cơ bản
    params: {
        url: req.url
    }
});
```