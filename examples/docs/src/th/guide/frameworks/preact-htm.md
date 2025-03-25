---
titleSuffix: Gez Framework Preact+HTM SSR ตัวอย่างแอปพลิเคชัน
description: สร้างแอปพลิเคชัน Preact+HTM SSR ที่ใช้ Gez Framework ตั้งแต่เริ่มต้น โดยแสดงตัวอย่างการใช้งานพื้นฐานของเฟรมเวิร์ก รวมถึงการเริ่มต้นโปรเจกต์ การกำหนดค่า Preact และการตั้งค่าไฟล์เข้า
head:
  - - meta
    - property: keywords
      content: Gez, Preact, HTM, SSR แอปพลิเคชัน, การกำหนดค่า TypeScript, การเริ่มต้นโปรเจกต์, การเรนเดอร์ฝั่งเซิร์ฟเวอร์, การโต้ตอบฝั่งไคลเอนต์
---

# Preact+HTM

บทช่วยสอนนี้จะช่วยให้คุณสร้างแอปพลิเคชัน Preact+HTM SSR ที่ใช้ Gez Framework ตั้งแต่เริ่มต้น เราจะแสดงตัวอย่างการใช้งาน Gez Framework ในการสร้างแอปพลิเคชันที่เรนเดอร์ฝั่งเซิร์ฟเวอร์

## โครงสร้างโปรเจกต์

ก่อนอื่น มาทำความเข้าใจโครงสร้างพื้นฐานของโปรเจกต์:

```bash
.
├── package.json         # ไฟล์กำหนดค่าของโปรเจกต์ กำหนด dependencies และคำสั่งสคริปต์
├── tsconfig.json        # ไฟล์กำหนดค่า TypeScript ตั้งค่าตัวเลือกการคอมไพล์
└── src                  # ไดเรกทอรีซอร์สโค้ด
    ├── app.ts           # คอมโพเนนต์หลักของแอปพลิเคชัน กำหนดโครงสร้างหน้าและลอจิกการโต้ตอบ
    ├── create-app.ts    # โรงงานสร้างอินสแตนซ์แอปพลิเคชัน รับผิดชอบการเริ่มต้นแอปพลิเคชัน
    ├── entry.client.ts  # ไฟล์เข้าไคลเอนต์ จัดการการเรนเดอร์ฝั่งเบราว์เซอร์
    ├── entry.node.ts    # ไฟล์เข้าเซิร์ฟเวอร์ Node.js รับผิดชอบการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์
    └── entry.server.ts  # ไฟล์เข้าเซิร์ฟเวอร์ จัดการลอจิกการเรนเดอร์ SSR
```

## การกำหนดค่าโปรเจกต์

### package.json

สร้างไฟล์ `package.json` เพื่อกำหนดค่า dependencies และสคริปต์ของโปรเจกต์:

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

หลังจากสร้างไฟล์ `package.json` แล้ว ต้องติดตั้ง dependencies ของโปรเจกต์ คุณสามารถใช้คำสั่งใดคำสั่งหนึ่งต่อไปนี้เพื่อติดตั้ง:
```bash
pnpm install
# หรือ
yarn install
# หรือ
npm install
```

คำสั่งนี้จะติดตั้งแพ็กเกจ dependencies ที่จำเป็นทั้งหมด รวมถึง Preact, HTM, TypeScript และ dependencies ที่เกี่ยวข้องกับ SSR

### tsconfig.json

สร้างไฟล์ `tsconfig.json` เพื่อกำหนดค่าตัวเลือกการคอมไพล์ TypeScript:

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

## โครงสร้างซอร์สโค้ด

### app.ts

สร้างคอมโพเนนต์หลักของแอปพลิเคชัน `src/app.ts` โดยใช้คลาสคอมโพเนนต์ของ Preact และ HTM:

```ts title="src/app.ts"
/**
 * @file ตัวอย่างคอมโพเนนต์
 * @description แสดงหัวหน้าหน้าพร้อมเวลาที่อัปเดตอัตโนมัติ เพื่อสาธิตฟังก์ชันพื้นฐานของ Gez Framework
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
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Gez เริ่มต้นอย่างรวดเร็ว</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

สร้างไฟล์ `src/create-app.ts` เพื่อรับผิดชอบการสร้างอินสแตนซ์แอปพลิเคชัน:

```ts title="src/create-app.ts"
/**
 * @file การสร้างอินสแตนซ์แอปพลิเคชัน
 * @description รับผิดชอบการสร้างและกำหนดค่าอินสแตนซ์แอปพลิเคชัน
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

สร้างไฟล์เข้าไคลเอนต์ `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file ไฟล์เข้าไคลเอนต์
 * @description รับผิดชอบลอจิกการโต้ตอบฝั่งไคลเอนต์และการอัปเดตแบบไดนามิก
 */

import { render } from 'preact';
import { createApp } from './create-app';

// สร้างอินสแตนซ์แอปพลิเคชัน
const { app } = createApp();

// ติดตั้งอินสแตนซ์แอปพลิเคชัน
render(app, document.getElementById('app')!);
```

### entry.node.ts

สร้างไฟล์ `entry.node.ts` เพื่อกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์:

```ts title="src/entry.node.ts"
/**
 * @file ไฟล์เข้าเซิร์ฟเวอร์ Node.js
 * @description รับผิดชอบการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์ จัดเตรียม environment รันไทม์สำหรับ SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * กำหนดค่าแอปพลิเคชันสำหรับ environment การพัฒนา
     * @description สร้างและกำหนดค่าอินสแตนซ์ Rspack สำหรับการสร้างและการอัปเดตแบบ real-time ใน environment การพัฒนา
     * @param gez อินสแตนซ์ Gez Framework ที่ให้ฟังก์ชันหลักและอินเทอร์เฟซการกำหนดค่า
     * @returns คืนค่าอินสแตนซ์ Rspack ที่กำหนดค่าแล้ว ซึ่งรองรับ HMR และการแสดงตัวอย่างแบบ real-time
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // กำหนดค่า Rspack ที่กำหนดเองที่นี่
                }
            })
        );
    },

    /**
     * กำหนดค่าและเริ่มต้นเซิร์ฟเวอร์ HTTP
     * @description สร้างอินสแตนซ์เซิร์ฟเวอร์ HTTP รวม middleware ของ Gez เพื่อจัดการคำขอ SSR
     * @param gez อินสแตนซ์ Gez Framework ที่ให้ middleware และฟังก์ชันการเรนเดอร์
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // ใช้ middleware ของ Gez เพื่อจัดการคำขอ
            gez.middleware(req, res, async () => {
                // ดำเนินการเรนเดอร์ฝั่งเซิร์ฟเวอร์
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('เซิร์ฟเวอร์เริ่มทำงาน: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

ไฟล์นี้เป็นไฟล์เข้าสำหรับการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์ ประกอบด้วยสองฟังก์ชันหลัก:

1. `devApp` ฟังก์ชัน: รับผิดชอบการสร้างและกำหนดค่าอินสแตนซ์ Rspack สำหรับ environment การพัฒนา รองรับการอัปเดตแบบ real-time และการแสดงตัวอย่าง ใช้ `createRspackHtmlApp` เพื่อสร้างอินสแตนซ์ Rspack เฉพาะสำหรับ Preact+HTM
2. `server` ฟังก์ชัน: รับผิดชอบการสร้างและกำหนดค่าเซิร์ฟเวอร์ HTTP รวม middleware ของ Gez เพื่อจัดการคำขอ SSR

### entry.server.ts

สร้างไฟล์เข้าเซิร์ฟเวอร์ `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file ไฟล์เข้าเซิร์ฟเวอร์
 * @description รับผิดชอบกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์ การสร้าง HTML และการฉีดทรัพยากร
 */

import type { RenderContext } from '@gez/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // สร้างอินสแตนซ์แอปพลิเคชัน
    const { app } = createApp();

    // ใช้ renderToString ของ Preact เพื่อสร้างเนื้อหาหน้า
    const html = render(app);

    // ยืนยันการรวบรวม dependencies เพื่อให้แน่ใจว่าทรัพยากรที่จำเป็นทั้งหมดถูกโหลด
    await rc.commit();

    // สร้างโครงสร้าง HTML ที่สมบูรณ์
    rc.html = `<!DOCTYPE html>
<html lang="th">
<head>
    ${rc.preload()}
    <title>Gez เริ่มต้นอย่างรวดเร็ว</title>
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

2. สร้างโปรเจกต์:
```bash
npm run build
```

3. รันใน environment การผลิต:
```bash
npm run start
```

ตอนนี้ คุณได้สร้างแอปพลิเคชัน Preact+HTM SSR ที่ใช้ Gez Framework เรียบร้อยแล้ว! เข้าถึง http://localhost:3000 เพื่อดูผลลัพธ์