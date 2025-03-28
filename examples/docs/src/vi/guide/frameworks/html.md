---
titleSuffix: Ví dụ ứng dụng HTML SSR với Esmx Framework
description: Hướng dẫn xây dựng ứng dụng HTML SSR từ đầu dựa trên Esmx, thông qua ví dụ minh họa cách sử dụng cơ bản của framework, bao gồm khởi tạo dự án, cấu hình HTML và thiết lập tệp đầu vào.
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, Ứng dụng SSR, Cấu hình TypeScript, Khởi tạo dự án, Render phía máy chủ, Tương tác phía máy khách
---

# HTML

Hướng dẫn này sẽ giúp bạn xây dựng một ứng dụng HTML SSR từ đầu dựa trên Esmx. Chúng ta sẽ sử dụng một ví dụ hoàn chỉnh để minh họa cách tạo ứng dụng render phía máy chủ bằng Esmx framework.

## Cấu trúc dự án

Đầu tiên, hãy tìm hiểu cấu trúc cơ bản của dự án:

```bash
.
├── package.json         # Tệp cấu hình dự án, định nghĩa các phụ thuộc và lệnh script
├── tsconfig.json        # Tệp cấu hình TypeScript, thiết lập các tùy chọn biên dịch
└── src                  # Thư mục mã nguồn
    ├── app.ts           # Thành phần chính của ứng dụng, định nghĩa cấu trúc trang và logic tương tác
    ├── create-app.ts    # Nhà máy tạo thể hiện ứng dụng, chịu trách nhiệm khởi tạo ứng dụng
    ├── entry.client.ts  # Tệp đầu vào phía máy khách, xử lý render phía trình duyệt
    ├── entry.node.ts    # Tệp đầu vào Node.js server, chịu trách nhiệm cấu hình môi trường phát triển và khởi động server
    └── entry.server.ts  # Tệp đầu vào phía máy chủ, xử lý logic render SSR
```

## Cấu hình dự án

### package.json

Tạo tệp `package.json`, cấu hình các phụ thuộc và script của dự án:

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
  }
}
```

Sau khi tạo tệp `package.json`, bạn cần cài đặt các phụ thuộc của dự án. Bạn có thể sử dụng một trong các lệnh sau để cài đặt:
```bash
pnpm install
# hoặc
yarn install
# hoặc
npm install
```

Lệnh này sẽ cài đặt tất cả các gói phụ thuộc cần thiết, bao gồm TypeScript và các phụ thuộc liên quan đến SSR.

### tsconfig.json

Tạo tệp `tsconfig.json`, cấu hình các tùy chọn biên dịch TypeScript:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Cấu trúc mã nguồn

### app.ts

Tạo thành phần chính của ứng dụng `src/app.ts`, triển khai cấu trúc trang và logic tương tác:

```ts title="src/app.ts"
/**
 * @file Ví dụ thành phần
 * @description Hiển thị tiêu đề trang với thời gian cập nhật tự động, dùng để minh họa các chức năng cơ bản của Esmx framework
 */

export default class App {
    /**
     * Thời gian hiện tại, sử dụng định dạng ISO
     * @type {string}
     */
    public time = '';

    /**
     * Tạo thể hiện ứng dụng
     * @param {SsrContext} [ssrContext] - Ngữ cảnh phía máy chủ, chứa tập hợp siêu dữ liệu nhập
     */
    public constructor(public ssrContext?: SsrContext) {
        // Không cần khởi tạo thêm trong constructor
    }

    /**
     * Render nội dung trang
     * @returns {string} Trả về cấu trúc HTML của trang
     */
    public render(): string {
        // Đảm bảo thu thập siêu dữ liệu nhập chính xác trong môi trường máy chủ
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Bắt đầu nhanh với Esmx</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Khởi tạo phía máy khách
     * @throws {Error} Ném lỗi khi không tìm thấy phần tử hiển thị thời gian
     */
    public onClient(): void {
        // Lấy phần tử hiển thị thời gian
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Không tìm thấy phần tử hiển thị thời gian');
        }

        // Thiết lập bộ đếm thời gian, cập nhật thời gian mỗi giây
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Khởi tạo phía máy chủ
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Giao diện ngữ cảnh phía máy chủ
 * @interface
 */
export interface SsrContext {
    /**
     * Tập hợp siêu dữ liệu nhập
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Tạo tệp `src/create-app.ts`, chịu trách nhiệm tạo thể hiện ứng dụng:

```ts title="src/create-app.ts"
/**
 * @file Tạo thể hiện ứng dụng
 * @description Chịu trách nhiệm tạo và cấu hình thể hiện ứng dụng
 */

import App from './app';

export function createApp() {
    const app = new App();
    return {
        app
    };
}
```

### entry.client.ts

Tạo tệp đầu vào phía máy khách `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Tệp đầu vào phía máy khách
 * @description Chịu trách nhiệm logic tương tác phía máy khách và cập nhật động
 */

import { createApp } from './create-app';

// Tạo thể hiện ứng dụng và khởi tạo
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Tạo tệp `entry.node.ts`, cấu hình môi trường phát triển và khởi động server:

```ts title="src/entry.node.ts"
/**
 * @file Tệp đầu vào Node.js server
 * @description Chịu trách nhiệm cấu hình môi trường phát triển và khởi động server, cung cấp môi trường thực thi SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Cấu hình trình tạo ứng dụng cho môi trường phát triển
     * @description Tạo và cấu hình thể hiện ứng dụng Rspack, dùng để xây dựng và cập nhật nóng trong môi trường phát triển
     * @param esmx Thể hiện Esmx framework, cung cấp các chức năng và giao diện cấu hình cốt lõi
     * @returns Trả về thể hiện ứng dụng Rspack đã được cấu hình, hỗ trợ HMR và xem trước thời gian thực
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Tùy chỉnh cấu hình biên dịch Rspack tại đây
                }
            })
        );
    },

    /**
     * Cấu hình và khởi động HTTP server
     * @description Tạo thể hiện HTTP server, tích hợp middleware Esmx, xử lý yêu cầu SSR
     * @param esmx Thể hiện Esmx framework, cung cấp middleware và chức năng render
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Sử dụng middleware Esmx để xử lý yêu cầu
            esmx.middleware(req, res, async () => {
                // Thực hiện render phía máy chủ
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Dịch vụ đã khởi động: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

Tệp này là tệp đầu vào cấu hình môi trường phát triển và khởi động server, chứa hai chức năng chính:

1. Hàm `devApp`: Chịu trách nhiệm tạo và cấu hình thể hiện ứng dụng Rspack cho môi trường phát triển, hỗ trợ cập nhật nóng và xem trước thời gian thực.
2. Hàm `server`: Chịu trách nhiệm tạo và cấu hình HTTP server, tích hợp middleware Esmx để xử lý yêu cầu SSR.

### entry.server.ts

Tạo tệp đầu vào render phía máy chủ `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Tệp đầu vào render phía máy chủ
 * @description Chịu trách nhiệm quy trình render phía máy chủ, tạo HTML và chèn tài nguyên
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Đóng gói logic tạo nội dung trang
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Chèn ngữ cảnh render phía máy chủ vào thể hiện ứng dụng
    app.ssrContext = ssrContext;
    // Khởi tạo phía máy chủ
    app.onServer();

    // Tạo nội dung trang
    return app.render();
};

export default async (rc: RenderContext) => {
    // Tạo thể hiện ứng dụng, trả về đối tượng chứa thể hiện app
    const { app } = createApp();
    // Sử dụng renderToString để tạo nội dung trang
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Cam kết thu thập phụ thuộc, đảm bảo tất cả tài nguyên cần thiết được tải
    await rc.commit();

    // Tạo cấu trúc HTML hoàn chỉnh
    rc.html = `<!DOCTYPE html>
<html lang="vi">
<head>
    ${rc.preload()}
    <title>Bắt đầu nhanh với Esmx</title>
    ${rc.css()}
</head>
<body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

## Chạy dự án

Sau khi hoàn thành cấu hình các tệp trên, bạn có thể sử dụng các lệnh sau để chạy dự án:

1. Chế độ phát triển:
```bash
npm run dev
```

2. Xây dựng dự án:
```bash
npm run build
```

3. Chạy trong môi trường sản xuất:
```bash
npm run start
```

Bây giờ, bạn đã tạo thành công một ứng dụng HTML SSR dựa trên Esmx! Truy cập http://localhost:3000 để xem kết quả.