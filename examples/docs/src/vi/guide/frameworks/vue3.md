---
titleSuffix: Ví dụ ứng dụng Vue3 SSR với Gez Framework
description: Hướng dẫn xây dựng ứng dụng Vue3 SSR từ đầu với Gez, qua ví dụ minh họa cách sử dụng cơ bản của framework, bao gồm khởi tạo dự án, cấu hình Vue3 và thiết lập file entry.
head:
  - - meta
    - property: keywords
      content: Gez, Vue3, Ứng dụng SSR, Cấu hình TypeScript, Khởi tạo dự án, Render phía server, Tương tác phía client, Composition API
---

# Vue3

Hướng dẫn này sẽ giúp bạn xây dựng một ứng dụng Vue3 SSR từ đầu với Gez. Chúng ta sẽ sử dụng một ví dụ hoàn chỉnh để minh họa cách tạo ứng dụng render phía server bằng Gez framework.

## Cấu trúc dự án

Đầu tiên, hãy tìm hiểu cấu trúc cơ bản của dự án:

```bash
.
├── package.json         # File cấu hình dự án, định nghĩa các dependency và script
├── tsconfig.json        # File cấu hình TypeScript, thiết lập các tùy chọn biên dịch
└── src                  # Thư mục mã nguồn
    ├── app.vue          # Component chính của ứng dụng, định nghĩa cấu trúc trang và logic tương tác
    ├── create-app.ts    # Factory tạo instance Vue, chịu trách nhiệm khởi tạo ứng dụng
    ├── entry.client.ts  # File entry phía client, xử lý render phía trình duyệt
    ├── entry.node.ts    # File entry Node.js server, chịu trách nhiệm cấu hình môi trường phát triển và khởi động server
    └── entry.server.ts  # File entry phía server, xử lý logic render SSR
```

## Cấu hình dự án

### package.json

Tạo file `package.json`, cấu hình các dependency và script của dự án:

```json title="package.json"
{
  "name": "ssr-demo-vue3",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack-vue": "*",
    "@types/node": "22.8.6",
    "@vue/server-renderer": "^3.5.13",
    "typescript": "^5.7.3",
    "vue": "^3.5.13",
    "vue-tsc": "^2.1.6"
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

Lệnh này sẽ cài đặt tất cả các gói dependency cần thiết, bao gồm Vue3, TypeScript và các dependency liên quan đến SSR.

### tsconfig.json

Tạo file `tsconfig.json`, cấu hình các tùy chọn biên dịch TypeScript:

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
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Cấu trúc mã nguồn

### app.vue

Tạo component chính của ứng dụng `src/app.vue`, sử dụng Composition API của Vue3:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Hướng dẫn nhanh Gez</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Ví dụ component
 * @description Hiển thị tiêu đề trang với thời gian tự động cập nhật, dùng để minh họa các chức năng cơ bản của Gez framework
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Thời gian hiện tại, cập nhật mỗi giây
const time = ref(new Date().toISOString());
let timer: NodeJS.Timeout;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date().toISOString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>
```

### create-app.ts

Tạo file `src/create-app.ts`, chịu trách nhiệm tạo instance Vue:

```ts title="src/create-app.ts"
/**
 * @file Tạo instance Vue
 * @description Chịu trách nhiệm tạo và cấu hình instance Vue
 */

import { createSSRApp } from 'vue';
import App from './app.vue';

export function createApp() {
    const app = createSSRApp(App);
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

import { createApp } from './create-app';

// Tạo instance Vue
const { app } = createApp();

// Mount instance Vue
app.mount('#app');
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
     * @description Tạo và cấu hình instance Rspack, dùng để build và cập nhật nóng trong môi trường phát triển
     * @param gez Instance Gez framework, cung cấp các chức năng và interface cấu hình
     * @returns Trả về instance Rspack đã được cấu hình, hỗ trợ HMR và xem trước thời gian thực
     */
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue3App(gez, {
                config(context) {
                    // Tùy chỉnh cấu hình biên dịch Rspack tại đây
                }
            })
        );
    },

    /**
     * Cấu hình và khởi động HTTP server
     * @description Tạo instance HTTP server, tích hợp middleware Gez, xử lý yêu cầu SSR
     * @param gez Instance Gez framework, cung cấp middleware và chức năng render
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Sử dụng middleware Gez để xử lý yêu cầu
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

1. Hàm `devApp`: Chịu trách nhiệm tạo và cấu hình instance Rspack cho môi trường phát triển, hỗ trợ cập nhật nóng và xem trước thời gian thực. Ở đây sử dụng `createRspackVue3App` để tạo instance Rspack dành riêng cho Vue3.
2. Hàm `server`: Chịu trách nhiệm tạo và cấu hình HTTP server, tích hợp middleware Gez để xử lý yêu cầu SSR.

### entry.server.ts

Tạo file entry render phía server `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file File entry render phía server
 * @description Chịu trách nhiệm quy trình render phía server, tạo HTML và chèn tài nguyên
 */

import type { RenderContext } from '@gez/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Tạo instance Vue
    const { app } = createApp();

    // Sử dụng renderToString của Vue để tạo nội dung trang
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Commit thu thập dependency, đảm bảo tất cả tài nguyên cần thiết được tải
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

Bây giờ, bạn đã tạo thành công một ứng dụng Vue3 SSR với Gez! Truy cập http://localhost:3000 để xem kết quả.