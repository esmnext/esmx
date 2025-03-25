---
titleSuffix: Ví dụ ứng dụng Preact+HTM SSR với Gez Framework
description: Hướng dẫn xây dựng ứng dụng Preact+HTM SSR từ đầu với Gez, qua ví dụ minh họa cách sử dụng cơ bản của framework, bao gồm khởi tạo dự án, cấu hình Preact và thiết lập file entry.
head:
  - - meta
    - property: keywords
      content: Gez, Preact, HTM, Ứng dụng SSR, Cấu hình TypeScript, Khởi tạo dự án, Render phía server, Tương tác phía client
---

# Preact+HTM

Hướng dẫn này sẽ giúp bạn xây dựng một ứng dụng Preact+HTM SSR từ đầu với Gez. Chúng ta sẽ sử dụng một ví dụ hoàn chỉnh để minh họa cách tạo ứng dụng render phía server với Gez framework.

## Cấu trúc dự án

Đầu tiên, hãy tìm hiểu cấu trúc cơ bản của dự án:

```bash
.
├── package.json         # File cấu hình dự án, định nghĩa các dependency và script
├── tsconfig.json        # File cấu hình TypeScript, thiết lập các tùy chọn biên dịch
└── src                  # Thư mục mã nguồn
    ├── app.ts           # Component chính của ứng dụng, định nghĩa cấu trúc trang và logic tương tác
    ├── create-app.ts    # Factory tạo instance ứng dụng, chịu trách nhiệm khởi tạo ứng dụng
    ├── entry.client.ts  # File entry phía client, xử lý render phía trình duyệt
    ├── entry.node.ts    # File entry Node.js server, chịu trách nhiệm cấu hình môi trường phát triển và khởi động server
    └── entry.server.ts  # File entry phía server, xử lý logic render SSR
```

## Cấu hình dự án

### package.json

Tạo file `package.json`, cấu hình các dependency và script của dự án:

```json title="package.json"
{
  "name": "ssr-demo-preact-htm",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
  }
}
```

Sau khi tạo file `package.json`, bạn cần cài đặt các dependency của dự án. Bạn có thể sử dụng một trong các lệnh sau để cài đặt:
```bash
pnpm install
# hoặc
yarn install
# hoặc
npm install
```

Lệnh này sẽ cài đặt tất cả các gói dependency cần thiết, bao gồm Preact, HTM, TypeScript và các dependency liên quan đến SSR.

### tsconfig.json

Tạo file `tsconfig.json`, cấu hình các tùy chọn biên dịch TypeScript:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "node",
        "strict": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "paths": {
            "ssr-demo-preact-htm/src/*": [
                "./src/*"
            ],
            "ssr-demo-preact-htm/*": [
                "./*"
            ]
        }
    },
    "include": [
        "src"
    ],
    "exclude": [
        "dist"
    ]
}
```

## Cấu trúc mã nguồn

### app.ts

Tạo component chính `src/app.ts`, sử dụng class component của Preact và HTM:

```ts title="src/app.ts"
/**
 * @file Ví dụ component
 * @description Hiển thị tiêu đề trang với thời gian tự động cập nhật, dùng để minh họa các chức năng cơ bản của Gez framework
 */

import { Component } from 'preact';
import { html } from 'htm/preact';

export default class App extends Component {
    state = {
        time: new Date().toISOString()
    };

    timer: NodeJS.Timeout | null = null;

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                time: new Date().toISOString()
            });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        const { time } = this.state;
        return html`
            <div>
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Hướng dẫn nhanh Gez</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Tạo file `src/create-app.ts`, chịu trách nhiệm tạo instance ứng dụng:

```ts title="src/create-app.ts"
/**
 * @file Tạo instance ứng dụng
 * @description Chịu trách nhiệm tạo và cấu hình instance ứng dụng
 */

import type { VNode } from 'preact';
import { html } from 'htm/preact';
import App from './app';

export function createApp(): { app: VNode } {
    const app = html`<${App} />`;
    return {
        app
    };
}
```

### entry.client.ts

Tạo file entry phía client `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file File entry phía client
 * @description Chịu trách nhiệm xử lý logic tương tác phía client và cập nhật động
 */

import { render } from 'preact';
import { createApp } from './create-app';

// Tạo instance ứng dụng
const { app } = createApp();

// Mount instance ứng dụng
render(app, document.getElementById('app')!);
```

### entry.node.ts

Tạo file `entry.node.ts`, cấu hình môi trường phát triển và khởi động server:

```ts title="src/entry.node.ts"
/**
 * @file File entry Node.js server
 * @description Chịu trách nhiệm cấu hình môi trường phát triển và khởi động server, cung cấp môi trường runtime SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Cấu hình app creator cho môi trường phát triển
     * @description Tạo và cấu hình instance Rspack app, dùng cho việc build và hot update trong môi trường phát triển
     * @param gez Instance Gez framework, cung cấp các chức năng và interface cấu hình
     * @returns Trả về instance Rspack app đã được cấu hình, hỗ trợ HMR và preview trực tiếp
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // Tùy chỉnh cấu hình biên dịch Rspack tại đây
                }
            })
        );
    },

    /**
     * Cấu hình và khởi động HTTP server
     * @description Tạo instance HTTP server, tích hợp Gez middleware, xử lý các request SSR
     * @param gez Instance Gez framework, cung cấp middleware và chức năng render
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Sử dụng Gez middleware để xử lý request
            gez.middleware(req, res, async () => {
                // Thực hiện render phía server
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server đã khởi động: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

File này là file entry cấu hình môi trường phát triển và khởi động server, bao gồm hai chức năng chính:

1. Hàm `devApp`: Chịu trách nhiệm tạo và cấu hình instance Rspack app cho môi trường phát triển, hỗ trợ hot update và preview trực tiếp. Ở đây sử dụng `createRspackHtmlApp` để tạo instance Rspack app dành riêng cho Preact+HTM.
2. Hàm `server`: Chịu trách nhiệm tạo và cấu hình HTTP server, tích hợp Gez middleware để xử lý các request SSR.

### entry.server.ts

Tạo file entry render phía server `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file File entry render phía server
 * @description Chịu trách nhiệm quy trình render phía server, tạo HTML và inject tài nguyên
 */

import type { RenderContext } from '@gez/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Tạo instance ứng dụng
    const { app } = createApp();

    // Sử dụng renderToString của Preact để tạo nội dung trang
    const html = render(app);

    // Commit dependency collection, đảm bảo tất cả các tài nguyên cần thiết được tải
    await rc.commit();

    // Tạo cấu trúc HTML hoàn chỉnh
    rc.html = `<!DOCTYPE html>
<html lang="vi">
<head>
    ${rc.preload()}
    <title>Hướng dẫn nhanh Gez</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

## Chạy dự án

Sau khi hoàn thành các cấu hình file trên, bạn có thể sử dụng các lệnh sau để chạy dự án:

1. Chế độ phát triển:
```bash
npm run dev
```

2. Build dự án:
```bash
npm run build
```

3. Chạy môi trường production:
```bash
npm run start
```

Bây giờ, bạn đã tạo thành công một ứng dụng Preact+HTM SSR với Gez! Truy cập http://localhost:3000 để xem kết quả.