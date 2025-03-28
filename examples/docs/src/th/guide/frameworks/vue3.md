---
titleSuffix: ตัวอย่างแอปพลิเคชัน Vue3 SSR ด้วยเฟรมเวิร์ก Esmx
description: สร้างแอปพลิเคชัน Vue3 SSR ด้วยเฟรมเวิร์ก Esmx ตั้งแต่เริ่มต้น พร้อมตัวอย่างการใช้งานพื้นฐาน ตั้งแต่การเริ่มต้นโปรเจกต์ การตั้งค่า Vue3 และการกำหนดค่าไฟล์เข้า
head:
  - - meta
    - property: keywords
      content: Esmx, Vue3, แอปพลิเคชัน SSR, การตั้งค่า TypeScript, การเริ่มต้นโปรเจกต์, การเรนเดอร์ฝั่งเซิร์ฟเวอร์, การโต้ตอบฝั่งไคลเอนต์, Composition API
---

# Vue3

บทช่วยสอนนี้จะช่วยให้คุณสร้างแอปพลิเคชัน Vue3 SSR ด้วยเฟรมเวิร์ก Esmx ตั้งแต่เริ่มต้น เราจะใช้ตัวอย่างที่สมบูรณ์เพื่อแสดงวิธีการสร้างแอปพลิเคชันที่ใช้การเรนเดอร์ฝั่งเซิร์ฟเวอร์ด้วยเฟรมเวิร์ก Esmx

## โครงสร้างโปรเจกต์

ก่อนอื่น เรามาทำความเข้าใจโครงสร้างพื้นฐานของโปรเจกต์:

```bash
.
├── package.json         # ไฟล์กำหนดค่าของโปรเจกต์ กำหนด dependencies และคำสั่งสคริปต์
├── tsconfig.json        # ไฟล์กำหนดค่า TypeScript ตั้งค่าตัวเลือกการคอมไพล์
└── src                  # ไดเรกทอรีซอร์สโค้ด
    ├── app.vue          # คอมโพเนนต์หลักของแอปพลิเคชัน กำหนดโครงสร้างหน้าและตรรกะการโต้ตอบ
    ├── create-app.ts    # โรงงานสร้างอินสแตนซ์ Vue รับผิดชอบการเริ่มต้นแอปพลิเคชัน
    ├── entry.client.ts  # ไฟล์เข้าไคลเอนต์ จัดการการเรนเดอร์ฝั่งเบราว์เซอร์
    ├── entry.node.ts    # ไฟล์เข้าเซิร์ฟเวอร์ Node.js รับผิดชอบการตั้งค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์
    └── entry.server.ts  # ไฟล์เข้าเซิร์ฟเวอร์ จัดการตรรกะการเรนเดอร์ SSR
```

## การกำหนดค่าโปรเจกต์

### package.json

สร้างไฟล์ `package.json` เพื่อกำหนดค่า dependencies และสคริปต์ของโปรเจกต์:

```json title="package.json"
{
  "name": "ssr-demo-vue3",
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
    "@vue/server-renderer": "^3.5.13",
    "typescript": "^5.7.3",
    "vue": "^3.5.13",
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

คำสั่งนี้จะติดตั้งแพ็กเกจ dependencies ที่จำเป็นทั้งหมด รวมถึง Vue3, TypeScript และ dependencies ที่เกี่ยวข้องกับ SSR

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
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## โครงสร้างซอร์สโค้ด

### app.vue

สร้างคอมโพเนนต์หลักของแอปพลิเคชัน `src/app.vue` โดยใช้ Composition API ของ Vue3:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">เริ่มต้นอย่างรวดเร็วด้วย Esmx</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file ตัวอย่างคอมโพเนนต์
 * @description แสดงหัวข้อหน้าที่มีการอัปเดตเวลาอัตโนมัติ เพื่อสาธิตฟังก์ชันพื้นฐานของเฟรมเวิร์ก Esmx
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

สร้างไฟล์ `src/create-app.ts` เพื่อรับผิดชอบการสร้างอินสแตนซ์แอปพลิเคชัน Vue:

```ts title="src/create-app.ts"
/**
 * @file การสร้างอินสแตนซ์ Vue
 * @description รับผิดชอบการสร้างและกำหนดค่าอินสแตนซ์แอปพลิเคชัน Vue
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

สร้างไฟล์เข้าไคลเอนต์ `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file ไฟล์เข้าไคลเอนต์
 * @description รับผิดชอบตรรกะการโต้ตอบไคลเอนต์และการอัปเดตแบบไดนามิก
 */

import { createApp } from './create-app';

// สร้างอินสแตนซ์ Vue
const { app } = createApp();

// ติดตั้งอินสแตนซ์ Vue
app.mount('#app');
```

### entry.node.ts

สร้างไฟล์ `entry.node.ts` เพื่อกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์:

```ts title="src/entry.node.ts"
/**
 * @file ไฟล์เข้าเซิร์ฟเวอร์ Node.js
 * @description รับผิดชอบการตั้งค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์ จัดเตรียม environment การทำงานของ SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * กำหนดค่าตัวสร้างแอปพลิเคชันสำหรับ environment การพัฒนา
     * @description สร้างและกำหนดค่าอินสแตนซ์แอปพลิเคชัน Rspack สำหรับการ build และ hot update ใน environment การพัฒนา
     * @param esmx อินสแตนซ์เฟรมเวิร์ก Esmx จัดเตรียมฟังก์ชันหลักและอินเทอร์เฟซการกำหนดค่า
     * @returns ส่งคืนอินสแตนซ์แอปพลิเคชัน Rspack ที่กำหนดค่าแล้ว รองรับ HMR และการแสดงตัวอย่างแบบเรียลไทม์
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx, {
                config(context) {
                    // กำหนดค่า Rspack compilation ที่นี่
                }
            })
        );
    },

    /**
     * กำหนดค่าและเริ่มต้นเซิร์ฟเวอร์ HTTP
     * @description สร้างอินสแตนซ์เซิร์ฟเวอร์ HTTP รวม middleware ของ Esmx เพื่อจัดการคำขอ SSR
     * @param esmx อินสแตนซ์เฟรมเวิร์ก Esmx จัดเตรียม middleware และฟังก์ชันการเรนเดอร์
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

ไฟล์นี้เป็นไฟล์เข้าการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์ ประกอบด้วยสองฟังก์ชันหลัก:

1. `devApp` ฟังก์ชัน: รับผิดชอบการสร้างและกำหนดค่าอินสแตนซ์แอปพลิเคชัน Rspack สำหรับ environment การพัฒนา รองรับ hot update และการแสดงตัวอย่างแบบเรียลไทม์ ที่นี่ใช้ `createRspackVue3App` เพื่อสร้างอินสแตนซ์แอปพลิเคชัน Rspack ที่ออกแบบมาสำหรับ Vue3
2. `server` ฟังก์ชัน: รับผิดชอบการสร้างและกำหนดค่าเซิร์ฟเวอร์ HTTP รวม middleware ของ Esmx เพื่อจัดการคำขอ SSR

### entry.server.ts

สร้างไฟล์เข้าเซิร์ฟเวอร์ `src/entry.server.ts` เพื่อจัดการกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์:

```ts title="src/entry.server.ts"
/**
 * @file ไฟล์เข้าเซิร์ฟเวอร์
 * @description รับผิดชอบกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์ การสร้าง HTML และการฉีดทรัพยากร
 */

import type { RenderContext } from '@esmx/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // สร้างอินสแตนซ์แอปพลิเคชัน Vue
    const { app } = createApp();

    // ใช้ renderToString ของ Vue เพื่อสร้างเนื้อหาหน้า
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // ยืนยันการรวบรวม dependencies เพื่อให้แน่ใจว่าทรัพยากรที่จำเป็นทั้งหมดถูกโหลด
    await rc.commit();

    // สร้างโครงสร้าง HTML ที่สมบูรณ์
    rc.html = `<!DOCTYPE html>
<html lang="th">
<head>
    ${rc.preload()}
    <title>เริ่มต้นอย่างรวดเร็วด้วย Esmx</title>
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

## การรันโปรเจกต์

หลังจากกำหนดค่าไฟล์ทั้งหมดแล้ว คุณสามารถใช้คำสั่งต่อไปนี้เพื่อรันโปรเจกต์:

1. โหมดการพัฒนา:
```bash
npm run dev
```

2. การ build โปรเจกต์:
```bash
npm run build
```

3. การรันใน environment การผลิต:
```bash
npm run start
```

ตอนนี้ คุณได้สร้างแอปพลิเคชัน Vue3 SSR ด้วยเฟรมเวิร์ก Esmx เรียบร้อยแล้ว! เข้าถึง http://localhost:3000 เพื่อดูผลลัพธ์