---
titleSuffix: Esmx Framework - กลไกการแชร์โค้ดระหว่างเซอร์วิส
description: รายละเอียดเกี่ยวกับกลไกการเชื่อมโยงโมดูลของ Esmx Framework รวมถึงการแชร์โค้ดระหว่างเซอร์วิส การจัดการ dependencies และการใช้งาน ESM specification เพื่อช่วยให้นักพัฒนาสามารถสร้างแอปพลิเคชันไมโครฟรอนต์เอนด์ได้อย่างมีประสิทธิภาพ
head:
  - - meta
    - property: keywords
      content: Esmx, Module Link, ESM, Code Sharing, Dependency Management, Micro Frontend
---

# การเชื่อมโยงโมดูล

Esmx Framework มีกลไกการเชื่อมโยงโมดูลที่สมบูรณ์สำหรับการจัดการการแชร์โค้ดและ dependencies ระหว่างเซอร์วิส กลไกนี้ถูกพัฒนาบนพื้นฐานของ ESM (ECMAScript Module) specification ซึ่งรองรับการ export และ import โมดูลในระดับ source code พร้อมทั้งมีฟังก์ชันการจัดการ dependencies ที่ครบถ้วน

### แนวคิดหลัก

#### การส่งออกโมดูล (Module Export)
การส่งออกโมดูลคือกระบวนการที่โค้ดบางส่วนในเซอร์วิส (เช่น components, utility functions) ถูกเปิดเผยออกมาในรูปแบบ ESM รองรับการส่งออก 2 ประเภท:
- **การส่งออก source code**: ส่งออกไฟล์ source code โดยตรงจากโปรเจค
- **การส่งออก dependencies**: ส่งออกแพคเกจ dependencies ของโปรเจค

#### การเชื่อมโยงโมดูล (Module Link)
การนำเข้าโมดูลคือกระบวนการที่เซอร์วิสหนึ่งสามารถนำเข้าโค้ดที่ถูกส่งออกจากเซอร์วิสอื่นได้ รองรับวิธีการติดตั้งหลายแบบ:
- **การติดตั้ง source code**: เหมาะสำหรับสภาพแวดล้อมการพัฒนา รองรับการแก้ไขและ hot update แบบ real-time
- **การติดตั้งแพคเกจ**: เหมาะสำหรับสภาพแวดล้อม production โดยใช้ build artifacts โดยตรง

## การส่งออกโมดูล

### คำอธิบายการตั้งค่า

ตั้งค่าโมดูลที่ต้องการส่งออกใน `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            // ส่งออกไฟล์ source code
            'root:src/components/button.vue',  // Vue component
            'root:src/utils/format.ts',        // Utility function
            // ส่งออก dependencies
            'npm:vue',                         // Vue framework
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies EsmxOptions;
```

การตั้งค่าการส่งออกรองรับ 2 ประเภท:
- `root:*`: ส่งออกไฟล์ source code โดยระบุ path จาก root directory ของโปรเจค
- `npm:*`: ส่งออก dependencies โดยระบุชื่อแพคเกจ

## การนำเข้าโมดูล

### คำอธิบายการตั้งค่า

ตั้งค่าโมดูลที่ต้องการนำเข้าใน `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // ตั้งค่าการเชื่อมโยง
        links: {
            // การติดตั้ง source code: ชี้ไปที่ build artifacts directory
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // การติดตั้งแพคเกจ: ชี้ไปที่แพคเกจ directory
            'other-remote': 'root:./node_modules/other-remote'
        },
        // ตั้งค่าการแมปการนำเข้า
        imports: {
            // ใช้ dependencies จาก remote module
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies EsmxOptions;
```

คำอธิบายการตั้งค่า:
1. **imports**: ตั้งค่า local path ของ remote module
   - การติดตั้ง source code: ชี้ไปที่ build artifacts directory (dist)
   - การติดตั้งแพคเกจ: ชี้ไปที่แพคเกจ directory โดยตรง

2. **externals**: ตั้งค่า external dependencies
   - ใช้สำหรับแชร์ dependencies จาก remote module
   - ป้องกันการ bundle dependencies ซ้ำ
   - รองรับการแชร์ dependencies ระหว่างหลายโมดูล

### วิธีการติดตั้ง

#### การติดตั้ง source code
เหมาะสำหรับสภาพแวดล้อมการพัฒนา รองรับการแก้ไขและ hot update แบบ real-time

1. **Workspace 方式**
แนะนำสำหรับโปรเจค Monorepo:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Link 方式**
ใช้สำหรับการ debug ใน local environment:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### การติดตั้งแพคเกจ
เหมาะสำหรับสภาพแวดล้อม production โดยใช้ build artifacts โดยตรง

1. **NPM Registry**
ติดตั้งผ่าน npm registry:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Static Server**
ติดตั้งผ่าน HTTP/HTTPS protocol:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## การ build แพคเกจ

### คำอธิบายการตั้งค่า

ตั้งค่าตัวเลือกการ build ใน `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    // ตั้งค่าการส่งออกโมดูล
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // ตั้งค่าการ build
    pack: {
        // เปิดใช้งานการ build
        enable: true,

        // ตั้งค่า output
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // ปรับแต่ง package.json
        packageJson: async (esmx, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // การประมวลผลก่อน build
        onBefore: async (esmx, pkg) => {
            // สร้าง type declarations
            // รัน test cases
            // อัปเดตเอกสาร ฯลฯ
        },

        // การประมวลผลหลัง build
        onAfter: async (esmx, pkg, file) => {
            // อัปโหลดไปยัง CDN
            // เผยแพร่ไปยัง npm registry
            // deploy ไปยัง test environment ฯลฯ
        }
    }
} satisfies EsmxOptions;
```

### ผลลัพธ์การ build

```
your-app-name.tgz
├── package.json        # ข้อมูลแพคเกจ
├── index.js            # production entry point
├── server/             # server-side resources
│   └── manifest.json   # server-side resource mapping
├── node/               # Node.js runtime
└── client/             # client-side resources
    └── manifest.json   # client-side resource mapping
```

### กระบวนการเผยแพร่

```bash
# 1. build production version
esmx build

# 2. เผยแพร่ไปยัง npm
npm publish dist/versions/your-app-name.tgz
```