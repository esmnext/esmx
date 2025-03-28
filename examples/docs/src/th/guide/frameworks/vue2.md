---
titleSuffix: ตัวอย่างแอปพลิเคชัน Vue2 SSR ด้วย Esmx Framework
description: สร้างแอปพลิเคชัน Vue2 SSR ด้วย Esmx Framework ตั้งแต่เริ่มต้น พร้อมตัวอย่างการใช้งานพื้นฐาน รวมถึงการตั้งค่าโปรเจกต์ การกำหนดค่า Vue2 และการตั้งค่าไฟล์เข้า
head:
  - - meta
    - property: keywords
      content: Esmx, Vue2, แอปพลิเคชัน SSR, การกำหนดค่า TypeScript, การเริ่มต้นโปรเจกต์, การเรนเดอร์ฝั่งเซิร์ฟเวอร์, การโต้ตอบฝั่งไคลเอนต์
---

# Vue2

บทช่วยสอนนี้จะช่วยให้คุณสร้างแอปพลิเคชัน Vue2 SSR ด้วย Esmx Framework ตั้งแต่เริ่มต้น เราจะใช้ตัวอย่างที่สมบูรณ์เพื่อแสดงวิธีการสร้างแอปพลิเคชันที่ใช้การเรนเดอร์ฝั่งเซิร์ฟเวอร์ด้วย Esmx Framework

## โครงสร้างโปรเจกต์

ก่อนอื่น เรามาทำความเข้าใจโครงสร้างพื้นฐานของโปรเจกต์:

```bash
.
├── package.json         # ไฟล์กำหนดค่าของโปรเจกต์ กำหนด dependencies และคำสั่งสคริปต์
├── tsconfig.json        # ไฟล์กำหนดค่า TypeScript ตั้งค่าตัวเลือกการคอมไพล์
└── src                  # ไดเรกทอรีซอร์สโค้ด
    ├── app.vue          # คอมโพเนนต์หลักของแอปพลิเคชัน กำหนดโครงสร้างหน้าและตรรกะการโต้ตอบ
    ├── create-app.ts    # โรงงานสร้างอินสแตนซ์ Vue รับผิดชอบการเริ่มต้นแอปพลิเคชัน
    ├── entry.client.ts  # ไฟล์เข้าฝั่งไคลเอนต์ จัดการการเรนเดอร์ฝั่งเบราว์เซอร์
    ├── entry.node.ts    # ไฟล์เข้าของเซิร์ฟเวอร์ Node.js รับผิดชอบการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์
    └── entry.server.ts  # ไฟล์เข้าฝั่งเซิร์ฟเวอร์ จัดการตรรกะการเรนเดอร์ SSR
```

## การกำหนดค่าโปรเจกต์

### package.json

สร้างไฟล์ `package.json` เพื่อกำหนดค่า dependencies และสคริปต์ของโปรเจกต์:

```json title="package.json"
{
  "name": "ssr-demo-vue2",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack-vue": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3",
    "vue": "^2.7.16",
    "vue-server-renderer": "^2.7.16",
    "vue-tsc": "^2.1.6"
  }
}
```

หลังจากสร้างไฟล์ `package.json` แล้ว คุณต้องติดตั้ง dependencies ของโปรเจกต์ คุณสามารถใช้คำสั่งใดคำสั่งหนึ่งต่อไปนี้เพื่อติดตั้ง:
```bash
pnpm install
# หรือ
yarn install
# หรือ
npm install
```

คำสั่งนี้จะติดตั้งแพ็กเกจ dependencies ที่จำเป็นทั้งหมด รวมถึง Vue2, TypeScript และ dependencies ที่เกี่ยวข้องกับ SSR

### tsconfig.json

สร้างไฟล์ `tsconfig.json` เพื่อกำหนดค่าตัวเลือกการคอมไพล์ TypeScript:

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
            "ssr-demo-vue2/src/*": ["./src/*"],
            "ssr-demo-vue2/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## โครงสร้างซอร์สโค้ด

### app.vue

สร้างคอมโพเนนต์หลักของแอปพลิเคชัน `src/app.vue` โดยใช้ syntax `<script setup>`:

```html title="src/app.vue"
<template>
    <div id="app">
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue2.html" target="_blank">Esmx เริ่มต้นอย่างรวดเร็ว</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file ตัวอย่างคอมโพเนนต์
 * @description แสดงหัวหน้าหน้าพร้อมเวลาที่อัปเดตอัตโนมัติ เพื่อสาธิตฟังก์ชันพื้นฐานของ Esmx Framework
 */

import { onMounted, onUnmounted, ref } from 'vue';

// เวลาปัจจุบัน อัปเดตทุกวินาที
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

สร้างไฟล์ `src/create-app.ts` เพื่อรับผิดชอบการสร้างอินสแตนซ์ Vue แอปพลิเคชัน:

```ts title="src/create-app.ts"
/**
 * @file การสร้างอินสแตนซ์ Vue
 * @description รับผิดชอบการสร้างและกำหนดค่าอินสแตนซ์ Vue แอปพลิเคชัน
 */

import Vue from 'vue';
import App from './app.vue';

export function createApp() {
    const app = new Vue({
        render: (h) => h(App)
    });
    return {
        app
    };
}
```

### entry.client.ts

สร้างไฟล์เข้าฝั่งไคลเอนต์ `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file ไฟล์เข้าฝั่งไคลเอนต์
 * @description รับผิดชอบตรรกะการโต้ตอบฝั่งไคลเอนต์และการอัปเดตแบบไดนามิก
 */

import { createApp } from './create-app';

// สร้างอินสแตนซ์ Vue
const { app } = createApp();

// ต่ออินสแตนซ์ Vue
app.$mount('#app');
```

### entry.node.ts

สร้างไฟล์ `entry.node.ts` เพื่อกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์:

```ts title="src/entry.node.ts"
/**
 * @file ไฟล์เข้าของเซิร์ฟเวอร์ Node.js
 * @description รับผิดชอบการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์ จัดเตรียม environment การทำงานของ SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * กำหนดค่าตัวสร้างแอปพลิเคชันสำหรับ environment การพัฒนา
     * @description สร้างและกำหนดค่าอินสแตนซ์ Rspack แอปพลิเคชัน สำหรับการสร้างและการอัปเดตแบบร้อนใน environment การพัฒนา
     * @param esmx อินสแตนซ์ Esmx Framework จัดเตรียมฟังก์ชันหลักและอินเทอร์เฟซการกำหนดค่า
     * @returns ส่งคืนอินสแตนซ์ Rspack แอปพลิเคชันที่กำหนดค่าแล้ว รองรับ HMR และการแสดงตัวอย่างแบบเรียลไทม์
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx, {
                config(context) {
                    // กำหนดค่า Rspack compilation ที่นี่
                }
            })
        );
    },

    /**
     * กำหนดค่าและเริ่มต้นเซิร์ฟเวอร์ HTTP
     * @description สร้างอินสแตนซ์เซิร์ฟเวอร์ HTTP รวม middleware ของ Esmx เพื่อจัดการคำขอ SSR
     * @param esmx อินสแตนซ์ Esmx Framework จัดเตรียม middleware และฟังก์ชันการเรนเดอร์
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // ใช้ middleware ของ Esmx เพื่อจัดการคำขอ
            esmx.middleware(req, res, async () => {
                // ดำเนินการเรนเดอร์ฝั่งเซิร์ฟเวอร์
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('เซิร์ฟเวอร์เริ่มทำงาน: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

ไฟล์นี้เป็นไฟล์เข้าสำหรับการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์ ประกอบด้วยสองฟังก์ชันหลัก:

1. ฟังก์ชัน `devApp`: รับผิดชอบการสร้างและกำหนดค่าอินสแตนซ์ Rspack แอปพลิเคชันสำหรับ environment การพัฒนา รองรับการอัปเดตแบบร้อนและการแสดงตัวอย่างแบบเรียลไทม์ ที่นี่ใช้ `createRspackVue2App` เพื่อสร้างอินสแตนซ์ Rspack แอปพลิเคชันที่ออกแบบมาสำหรับ Vue2
2. ฟังก์ชัน `server`: รับผิดชอบการสร้างและกำหนดค่าเซิร์ฟเวอร์ HTTP รวม middleware ของ Esmx เพื่อจัดการคำขอ SSR

### entry.server.ts

สร้างไฟล์เข้าสำหรับการเรนเดอร์ฝั่งเซิร์ฟเวอร์ `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file ไฟล์เข้าสำหรับการเรนเดอร์ฝั่งเซิร์ฟเวอร์
 * @description รับผิดชอบกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์ การสร้าง HTML และการฉีดทรัพยากร
 */

import type { RenderContext } from '@esmx/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

// สร้างตัวเรนเดอร์
const renderer = createRenderer();

export default async (rc: RenderContext) => {
    // สร้างอินสแตนซ์ Vue แอปพลิเคชัน
    const { app } = createApp();

    // ใช้ renderToString ของ Vue เพื่อสร้างเนื้อหาหน้า
    const html = await renderer.renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // ยืนยันการรวบรวม dependencies เพื่อให้แน่ใจว่าทรัพยากรที่จำเป็นทั้งหมดถูกโหลด
    await rc.commit();

    // สร้างโครงสร้าง HTML ที่สมบูรณ์
    rc.html = `<!DOCTYPE html>
<html lang="th">
<head>
    ${rc.preload()}
    <title>Esmx เริ่มต้นอย่างรวดเร็ว</title>
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

## การรันโปรเจกต์

หลังจากกำหนดค่าไฟล์ทั้งหมดแล้ว คุณสามารถใช้คำสั่งต่อไปนี้เพื่อรันโปรเจกต์:

1. โหมดการพัฒนา:
```bash
npm run dev
```

2. สร้างโปรเจกต์:
```bash
npm run build
```

3. รันใน environment การผลิต:
```bash
npm run start
```

ตอนนี้ คุณได้สร้างแอปพลิเคชัน Vue2 SSR ด้วย Esmx Framework เรียบร้อยแล้ว! เข้าถึง http://localhost:3000 เพื่อดูผลลัพธ์