---
titleSuffix: ตัวอย่างแอปพลิเคชัน HTML SSR ด้วย Esmx Framework
description: สร้างแอปพลิเคชัน HTML SSR ด้วย Esmx Framework ตั้งแต่เริ่มต้น พร้อมตัวอย่างการใช้งานพื้นฐาน ตั้งแต่การเริ่มต้นโปรเจกต์ การตั้งค่า HTML และการกำหนดค่าไฟล์เข้า
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, แอปพลิเคชัน SSR, การตั้งค่า TypeScript, การเริ่มต้นโปรเจกต์, การเรนเดอร์ฝั่งเซิร์ฟเวอร์, การโต้ตอบฝั่งไคลเอนต์
---

# HTML

บทช่วยสอนนี้จะช่วยให้คุณสร้างแอปพลิเคชัน HTML SSR ด้วย Esmx Framework ตั้งแต่เริ่มต้น เราจะแสดงตัวอย่างการใช้งาน Esmx Framework ในการสร้างแอปพลิเคชันที่เรนเดอร์ฝั่งเซิร์ฟเวอร์

## โครงสร้างโปรเจกต์

ก่อนอื่น มาทำความเข้าใจโครงสร้างพื้นฐานของโปรเจกต์:

```bash
.
├── package.json         # ไฟล์กำหนดค่าของโปรเจกต์ กำหนด dependencies และคำสั่งสคริปต์
├── tsconfig.json        # ไฟล์กำหนดค่า TypeScript ตั้งค่าตัวเลือกการคอมไพล์
└── src                  # ไดเรกทอรีซอร์สโค้ด
    ├── app.ts           # คอมโพเนนต์หลักของแอปพลิเคชัน กำหนดโครงสร้างหน้าและตรรกะการโต้ตอบ
    ├── create-app.ts    # โรงงานสร้างอินสแตนซ์แอปพลิเคชัน รับผิดชอบการเริ่มต้นแอปพลิเคชัน
    ├── entry.client.ts  # ไฟล์เข้าไคลเอนต์ จัดการการเรนเดอร์ฝั่งเบราว์เซอร์
    ├── entry.node.ts    # ไฟล์เข้าเซิร์ฟเวอร์ Node.js รับผิดชอบการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์
    └── entry.server.ts  # ไฟล์เข้าเซิร์ฟเวอร์ จัดการตรรกะการเรนเดอร์ SSR
```

## การกำหนดค่าโปรเจกต์

### package.json

สร้างไฟล์ `package.json` เพื่อกำหนดค่า dependencies และสคริปต์ของโปรเจกต์:

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

หลังจากสร้างไฟล์ `package.json` แล้ว ต้องติดตั้ง dependencies ของโปรเจกต์ คุณสามารถใช้คำสั่งใดคำสั่งหนึ่งต่อไปนี้เพื่อติดตั้ง:
```bash
pnpm install
# หรือ
yarn install
# หรือ
npm install
```

คำสั่งนี้จะติดตั้งแพ็คเกจ dependencies ที่จำเป็นทั้งหมด รวมถึง TypeScript และ dependencies ที่เกี่ยวข้องกับ SSR

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
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## โครงสร้างซอร์สโค้ด

### app.ts

สร้างคอมโพเนนต์หลักของแอปพลิเคชัน `src/app.ts` เพื่อกำหนดโครงสร้างหน้าและตรรกะการโต้ตอบ:

```ts title="src/app.ts"
/**
 * @file ตัวอย่างคอมโพเนนต์
 * @description แสดงหัวหน้าหน้าพร้อมเวลาที่อัปเดตอัตโนมัติ เพื่อสาธิตฟังก์ชันพื้นฐานของ Esmx Framework
 */

export default class App {
    /**
     * เวลาปัจจุบัน ในรูปแบบ ISO
     * @type {string}
     */
    public time = '';

    /**
     * สร้างอินสแตนซ์แอปพลิเคชัน
     * @param {SsrContext} [ssrContext] - context ฝั่งเซิร์ฟเวอร์ ประกอบด้วยชุด metadata ที่ import
     */
    public constructor(public ssrContext?: SsrContext) {
        // ไม่จำเป็นต้องกำหนดค่าเพิ่มเติมใน constructor
    }

    /**
     * เรนเดอร์เนื้อหาหน้า
     * @returns {string} ส่งกลับโครงสร้าง HTML ของหน้า
     */
    public render(): string {
        // ตรวจสอบให้แน่ใจว่า metadata ที่ import ถูกเก็บรวบรวมอย่างถูกต้องใน environment ฝั่งเซิร์ฟเวอร์
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx เริ่มต้นอย่างรวดเร็ว</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * การเริ่มต้นฝั่งไคลเอนต์
     * @throws {Error} เกิดข้อผิดพลาดเมื่อไม่พบ element ที่แสดงเวลา
     */
    public onClient(): void {
        // ดึง element ที่แสดงเวลา
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('ไม่พบ element ที่แสดงเวลา');
        }

        // ตั้งค่า interval เพื่ออัปเดตเวลาทุกวินาที
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * การเริ่มต้นฝั่งเซิร์ฟเวอร์
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * อินเทอร์เฟซ context ฝั่งเซิร์ฟเวอร์
 * @interface
 */
export interface SsrContext {
    /**
     * ชุด metadata ที่ import
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

สร้างไฟล์ `src/create-app.ts` เพื่อสร้างอินสแตนซ์แอปพลิเคชัน:

```ts title="src/create-app.ts"
/**
 * @file การสร้างอินสแตนซ์แอปพลิเคชัน
 * @description รับผิดชอบการสร้างและกำหนดค่าอินสแตนซ์แอปพลิเคชัน
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

สร้างไฟล์เข้าไคลเอนต์ `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file ไฟล์เข้าไคลเอนต์
 * @description รับผิดชอบตรรกะการโต้ตอบฝั่งไคลเอนต์และการอัปเดตแบบไดนามิก
 */

import { createApp } from './create-app';

// สร้างอินสแตนซ์แอปพลิเคชันและเริ่มต้น
const { app } = createApp();
app.onClient();
```

### entry.node.ts

สร้างไฟล์ `entry.node.ts` เพื่อกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์:

```ts title="src/entry.node.ts"
/**
 * @file ไฟล์เข้าเซิร์ฟเวอร์ Node.js
 * @description รับผิดชอบการกำหนดค่า environment การพัฒนาและการเริ่มต้นเซิร์ฟเวอร์ จัดเตรียม environment การทำงานของ SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * กำหนดค่า app creator สำหรับ environment การพัฒนา
     * @description สร้างและกำหนดค่าอินสแตนซ์ Rspack app สำหรับ environment การพัฒนา เพื่อการ build และ hot module replacement
     * @param esmx อินสแตนซ์ Esmx Framework จัดเตรียมฟังก์ชันหลักและอินเทอร์เฟซการกำหนดค่า
     * @returns ส่งกลับอินสแตนซ์ Rspack app ที่กำหนดค่าแล้ว รองรับ HMR และการแสดงตัวอย่างแบบ real-time
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // กำหนดค่า Rspack compilation ที่นี่
                }
            })
        );
    },

    /**
     * กำหนดค่าและเริ่มต้น HTTP server
     * @description สร้างอินสแตนซ์ HTTP server รวม Esmx middleware เพื่อจัดการคำขอ SSR
     * @param esmx อินสแตนซ์ Esmx Framework จัดเตรียม middleware และฟังก์ชันการเรนเดอร์
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // ใช้ Esmx middleware เพื่อจัดการคำขอ
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

1. ฟังก์ชัน `devApp`: รับผิดชอบการสร้างและกำหนดค่าอินสแตนซ์ Rspack app สำหรับ environment การพัฒนา รองรับ hot module replacement และการแสดงตัวอย่างแบบ real-time
2. ฟังก์ชัน `server`: รับผิดชอบการสร้างและกำหนดค่า HTTP server รวม Esmx middleware เพื่อจัดการคำขอ SSR

### entry.server.ts

สร้างไฟล์เข้าเซิร์ฟเวอร์ `src/entry.server.ts` เพื่อจัดการกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์:

```ts title="src/entry.server.ts"
/**
 * @file ไฟล์เข้าเซิร์ฟเวอร์
 * @description รับผิดชอบกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์ การสร้าง HTML และการ inject ทรัพยากร
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// ห่อหุ้มตรรกะการสร้างเนื้อหาหน้า
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // inject context ฝั่งเซิร์ฟเวอร์ลงในอินสแตนซ์แอปพลิเคชัน
    app.ssrContext = ssrContext;
    // เริ่มต้นฝั่งเซิร์ฟเวอร์
    app.onServer();

    // สร้างเนื้อหาหน้า
    return app.render();
};

export default async (rc: RenderContext) => {
    // สร้างอินสแตนซ์แอปพลิเคชัน ส่งกลับออบเจ็กต์ที่มีอินสแตนซ์ app
    const { app } = createApp();
    // ใช้ renderToString เพื่อสร้างเนื้อหาหน้า
    const html = renderToString(app, {
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

2. build โปรเจกต์:
```bash
npm run build
```

3. รันใน environment production:
```bash
npm run start
```

ตอนนี้ คุณได้สร้างแอปพลิเคชัน HTML SSR ด้วย Esmx Framework เรียบร้อยแล้ว! เข้าถึง http://localhost:3000 เพื่อดูผลลัพธ์