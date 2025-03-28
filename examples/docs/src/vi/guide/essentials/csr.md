---
titleSuffix: Hướng dẫn triển khai Client-Side Rendering với Esmx Framework
description: Hướng dẫn chi tiết cơ chế Client-Side Rendering của Esmx Framework, bao gồm xây dựng tĩnh, chiến lược triển khai và các thực hành tốt nhất, giúp nhà phát triển thực hiện render phía client hiệu quả trong môi trường không có server.
head:
  - - meta
    - property: keywords
      content: Esmx, Client-Side Rendering, CSR, Xây dựng tĩnh, Render phía client, Triển khai không server, Tối ưu hiệu suất
---

# Client-Side Rendering

Client-Side Rendering (CSR) là một kỹ thuật render trang được thực hiện ở phía trình duyệt. Trong Esmx, khi ứng dụng của bạn không thể triển khai instance Node.js server, bạn có thể chọn tạo file `index.html` tĩnh trong giai đoạn build để thực hiện render hoàn toàn ở phía client.

## Các trường hợp sử dụng

Các trường hợp sau đây được khuyến nghị sử dụng Client-Side Rendering:

- **Môi trường hosting tĩnh**: Như GitHub Pages, CDN và các dịch vụ hosting không hỗ trợ server-side rendering
- **Ứng dụng đơn giản**: Các ứng dụng nhỏ không yêu cầu cao về tốc độ tải trang đầu tiên và SEO
- **Môi trường phát triển**: Để xem trước và debug ứng dụng nhanh chóng trong giai đoạn phát triển

## Hướng dẫn cấu hình

### Cấu hình template HTML

Trong chế độ Client-Side Rendering, bạn cần cấu hình một template HTML chung. Template này sẽ đóng vai trò là container cho ứng dụng, bao gồm các tham chiếu tài nguyên cần thiết và điểm mount.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // Commit thu thập dependencies
    await rc.commit();
    
    // Cấu hình template HTML
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // Tải trước tài nguyên
    <title>Esmx</title>
    ${rc.css()}               // Inject CSS
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // Import map
    ${rc.moduleEntry()}       // Module entry
    ${rc.modulePreload()}     // Preload module
</body>
</html>
`;
};
```

### Tạo HTML tĩnh

Để sử dụng Client-Side Rendering trong môi trường production, bạn cần tạo file HTML tĩnh trong giai đoạn build. Esmx cung cấp hàm hook `postBuild` để thực hiện chức năng này:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // Tạo file HTML tĩnh
        const rc = await esmx.render();
        // Ghi file HTML
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```