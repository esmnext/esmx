---
titleSuffix: Esmx Framework Application Abstract Interface
description: Chi tiết về giao diện App của framework Esmx, bao gồm quản lý vòng đời ứng dụng, xử lý tài nguyên tĩnh và chức năng render phía máy chủ, giúp nhà phát triển hiểu và sử dụng các chức năng cốt lõi của ứng dụng.
head:
  - - meta
    - property: keywords
      content: Esmx, App, Application Abstract, Lifecycle, Static Resources, Server-side Rendering, API
---

# App

`App` là một abstraction (trừu tượng hóa) ứng dụng của framework Esmx, cung cấp một giao diện thống nhất để quản lý vòng đời ứng dụng, tài nguyên tĩnh và render phía máy chủ.

```ts title="entry.node.ts"
export default {
  // Cấu hình môi trường phát triển
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // Tùy chỉnh cấu hình Rspack
        }
      })
    );
  }
}
```

## Định nghĩa kiểu
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **Kiểu**: `Middleware`

Middleware xử lý tài nguyên tĩnh.

Môi trường phát triển:
- Xử lý yêu cầu tài nguyên tĩnh từ mã nguồn
- Hỗ trợ biên dịch thời gian thực và cập nhật nóng
- Sử dụng chính sách cache no-cache

Môi trường sản xuất:
- Xử lý tài nguyên tĩnh đã được build
- Hỗ trợ cache dài hạn cho các file không thay đổi (.final.xxx)
- Chiến lược tải tài nguyên tối ưu

```ts
server.use(esmx.middleware);
```

#### render

- **Kiểu**: `(options?: RenderContextOptions) => Promise<RenderContext>`

Hàm render phía máy chủ. Cung cấp các triển khai khác nhau tùy theo môi trường chạy:
- Môi trường sản xuất (start): Tải file entry phía máy chủ đã được build (entry.server) để thực hiện render
- Môi trường phát triển (dev): Tải file entry phía máy chủ từ mã nguồn để thực hiện render

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **Kiểu**: `() => Promise<boolean>`

Hàm build cho môi trường sản xuất. Được sử dụng để đóng gói và tối ưu hóa tài nguyên. Trả về true nếu build thành công, false nếu thất bại.

#### destroy

- **Kiểu**: `() => Promise<boolean>`

Hàm dọn dẹp tài nguyên. Được sử dụng để đóng server, ngắt kết nối, v.v. Trả về true nếu dọn dẹp thành công, false nếu thất bại.