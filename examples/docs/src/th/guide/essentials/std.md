---
titleSuffix: คู่มือโครงสร้างและมาตรฐานโครงการ Esmx Framework
description: รายละเอียดโครงสร้างโครงการมาตรฐานของ Esmx Framework, มาตรฐานไฟล์เข้า และมาตรฐานไฟล์กำหนดค่า เพื่อช่วยให้นักพัฒนาสร้างแอปพลิเคชัน SSR ที่เป็นมาตรฐานและบำรุงรักษาได้ง่าย
head:
  - - meta
    - property: keywords
      content: Esmx, โครงสร้างโครงการ, ไฟล์เข้า, มาตรฐานกำหนดค่า, SSR framework, TypeScript, มาตรฐานโครงการ, มาตรฐานการพัฒนา
---

# มาตรฐาน

Esmx เป็นเฟรมเวิร์ก SSR ที่ทันสมัย ใช้โครงสร้างโครงการและกลไกการแก้ไขเส้นทางที่เป็นมาตรฐาน เพื่อให้มั่นใจว่าการพัฒนาและการใช้งานในสภาพแวดล้อมการผลิตมีความสม่ำเสมอและบำรุงรักษาได้ง่าย

## มาตรฐานโครงสร้างโครงการ

### โครงสร้างไดเรกทอรีมาตรฐาน

```txt
root
│─ dist                  # ไดเรกทอรีผลลัพธ์การคอมไพล์
│  ├─ package.json       # การกำหนดค่าชุดซอฟต์แวร์หลังการคอมไพล์
│  ├─ server             # ผลลัพธ์การคอมไพล์ฝั่งเซิร์ฟเวอร์
│  │  └─ manifest.json   # ผลลัพธ์ manifest สำหรับสร้าง importmap
│  ├─ node               # ผลลัพธ์การคอมไพล์โปรแกรมเซิร์ฟเวอร์ Node
│  ├─ client             # ผลลัพธ์การคอมไพล์ฝั่งไคลเอนต์
│  │  ├─ versions        # ไดเรกทอรีเก็บรุ่น
│  │  │  └─ latest.tgz   # การเก็บถาวรไดเรกทอรี dist เพื่อการกระจายชุดซอฟต์แวร์
│  │  └─ manifest.json   # ผลลัพธ์ manifest สำหรับสร้าง importmap
│  └─ src                # ไฟล์ที่สร้างโดย tsc
├─ src
│  ├─ entry.server.ts    # จุดเข้าแอปพลิเคชันฝั่งเซิร์ฟเวอร์
│  ├─ entry.client.ts    # จุดเข้าแอปพลิเคชันฝั่งไคลเอนต์
│  └─ entry.node.ts      # จุดเข้าแอปพลิเคชันเซิร์ฟเวอร์ Node
├─ tsconfig.json         # การกำหนดค่า TypeScript
└─ package.json          # การกำหนดค่าชุดซอฟต์แวร์
```

::: tip ความรู้เพิ่มเติม
- `esmx.name` มาจากฟิลด์ `name` ใน `package.json`
- `dist/package.json` มาจาก `package.json` ในไดเรกทอรีราก
- เมื่อตั้งค่า `packs.enable` เป็น `true` จะทำการเก็บถาวรไดเรกทอรี `dist`

:::

## มาตรฐานไฟล์เข้า

### entry.client.ts
ไฟล์เข้าไคลเอนต์มีหน้าที่:
- **เริ่มต้นแอปพลิเคชัน**: กำหนดค่าพื้นฐานของแอปพลิเคชันฝั่งไคลเอนต์
- **จัดการเส้นทาง**: จัดการเส้นทางและการนำทางฝั่งไคลเอนต์
- **จัดการสถานะ**: จัดเก็บและอัปเดตสถานะฝั่งไคลเอนต์
- **จัดการการโต้ตอบ**: จัดการเหตุการณ์ผู้ใช้และการโต้ตอบกับอินเทอร์เฟซ

### entry.server.ts
ไฟล์เข้าเซิร์ฟเวอร์มีหน้าที่:
- **การแสดงผลฝั่งเซิร์ฟเวอร์**: ดำเนินการกระบวนการ SSR
- **สร้าง HTML**: สร้างโครงสร้างหน้าเริ่มต้น
- **การดึงข้อมูลล่วงหน้า**: ดึงข้อมูลฝั่งเซิร์ฟเวอร์
- **การฉีดสถานะ**: ส่งสถานะจากเซิร์ฟเวอร์ไปยังไคลเอนต์
- **การปรับแต่ง SEO**: รับรองการปรับแต่ง SEO ของหน้า

### entry.node.ts
ไฟล์เข้าเซิร์ฟเวอร์ Node.js มีหน้าที่:
- **กำหนดค่าเซิร์ฟเวอร์**: ตั้งค่าพารามิเตอร์เซิร์ฟเวอร์ HTTP
- **จัดการเส้นทาง**: จัดการกฎเส้นทางฝั่งเซิร์ฟเวอร์
- **รวม middleware**: กำหนดค่า middleware ของเซิร์ฟเวอร์
- **จัดการสภาพแวดล้อม**: จัดการตัวแปรสภาพแวดล้อมและการกำหนดค่า
- **การตอบสนองคำขอ**: จัดการคำขอและตอบสนอง HTTP

## มาตรฐานไฟล์กำหนดค่า

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```