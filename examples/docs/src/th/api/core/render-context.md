---
titleSuffix: Esmx Framework Render Context API Reference
description: Detailed explanation of the RenderContext core class in the Esmx framework, including rendering control, resource management, state synchronization, and routing control, helping developers achieve efficient server-side rendering.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, Server-Side Rendering, Rendering Context, State Synchronization, Resource Management, Web Application Framework
---

# RenderContext

RenderContext เป็นคลาสหลักในเฟรมเวิร์ก Esmx ที่รับผิดชอบในการจัดการวงจรชีวิตทั้งหมดของการเรนเดอร์ฝั่งเซิร์ฟเวอร์ (SSR) มันให้ชุด API ที่สมบูรณ์สำหรับการจัดการบริบทการเรนเดอร์ การจัดการทรัพยากร การซิงโครไนซ์สถานะ และงานสำคัญอื่นๆ:

- **การควบคุมการเรนเดอร์**: จัดการกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์ รองรับการเรนเดอร์หลายทางเข้า การเรนเดอร์ตามเงื่อนไข และสถานการณ์อื่นๆ
- **การจัดการทรัพยากร**: รวบรวมและฉีดทรัพยากรสแตติกเช่น JS, CSS อย่างชาญฉลาด เพื่อเพิ่มประสิทธิภาพการโหลด
- **การซิงโครไนซ์สถานะ**: จัดการการซีเรียไลซ์สถานะฝั่งเซิร์ฟเวอร์ เพื่อให้แน่ใจว่าฝั่งไคลเอนต์สามารถเปิดใช้งานได้อย่างถูกต้อง (hydration)
- **การควบคุมเส้นทาง**: รองรับการเปลี่ยนเส้นทางฝั่งเซิร์ฟเวอร์ การตั้งค่ารหัสสถานะ และฟังก์ชันขั้นสูงอื่นๆ

## นิยามประเภท

### ServerRenderHandle

นิยามประเภทของฟังก์ชันการจัดการการเรนเดอร์ฝั่งเซิร์ฟเวอร์

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

ฟังก์ชันการจัดการการเรนเดอร์ฝั่งเซิร์ฟเวอร์เป็นฟังก์ชันแบบอะซิงโครนัสหรือซิงโครนัสที่รับอินสแตนซ์ของ RenderContext เป็นพารามิเตอร์ ใช้สำหรับการจัดการลอจิกการเรนเดอร์ฝั่งเซิร์ฟเวอร์

```ts title="entry.node.ts"
// 1. ฟังก์ชันอะซิงโครนัส
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. ฟังก์ชันซิงโครนัส
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

นิยามประเภทของรายการไฟล์ทรัพยากรที่รวบรวมระหว่างกระบวนการเรนเดอร์

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: รายการไฟล์ JavaScript
- **css**: รายการไฟล์สไตล์ชีต
- **modulepreload**: รายการโมดูล ESM ที่ต้องการโหลดล่วงหน้า
- **resources**: รายการไฟล์ทรัพยากรอื่นๆ (รูปภาพ, ฟอนต์, ฯลฯ)

```ts
// ตัวอย่างรายการไฟล์ทรัพยากร
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

นิยามโหมดการสร้าง importmap

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: ฝังเนื้อหา importmap ลงใน HTML โดยตรง เหมาะสำหรับสถานการณ์ต่อไปนี้:
  - ต้องการลดจำนวนคำขอ HTTP
  - เนื้อหา importmap มีขนาดเล็ก
  - ต้องการประสิทธิภาพการโหลดหน้าจอแรกสูง
- `js`: สร้างเนื้อหา importmap เป็นไฟล์ JS แยกต่างหาก เหมาะสำหรับสถานการณ์ต่อไปนี้:
  - เนื้อหา importmap มีขนาดใหญ่
  - ต้องการใช้กลไกแคชของเบราว์เซอร์
  - หลายหน้าเว็บใช้ importmap เดียวกัน

คลาส RenderContext รับผิดชอบในการจัดการทรัพยากรและการสร้าง HTML ในกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์ (SSR)
## ตัวเลือกอินสแตนซ์

นิยามตัวเลือกการกำหนดค่าสำหรับ RenderContext

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **ประเภท**: `string`
- **ค่าเริ่มต้น**: `''`

เส้นทางพื้นฐานสำหรับทรัพยากรสแตติก
- ทรัพยากรสแตติกทั้งหมด (JS, CSS, รูปภาพ, ฯลฯ) จะโหลดตามเส้นทางนี้
- รองรับการกำหนดค่าแบบไดนามิกขณะรันไทม์ ไม่จำเป็นต้องสร้างใหม่
- มักใช้ในเว็บไซต์หลายภาษา แอปพลิเคชันไมโครฟรอนต์เอนด์ และสถานการณ์อื่นๆ

#### entryName

- **ประเภท**: `string`
- **ค่าเริ่มต้น**: `'default'`

ชื่อฟังก์ชันทางเข้าสำหรับการเรนเดอร์ฝั่งเซิร์ฟเวอร์ ใช้เพื่อระบุฟังก์ชันทางเข้าที่จะใช้เมื่อโมดูลส่งออกฟังก์ชันการเรนเดอร์หลายฟังก์ชัน

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // ลอจิกการเรนเดอร์สำหรับอุปกรณ์เคลื่อนที่
};

export const desktop = async (rc: RenderContext) => {
  // ลอจิกการเรนเดอร์สำหรับเดสก์ท็อป
};
```

#### params

- **ประเภท**: `Record<string, any>`
- **ค่าเริ่มต้น**: `{}`

พารามิเตอร์การเรนเดอร์ สามารถส่งพารามิเตอร์ประเภทใดก็ได้ไปยังฟังก์ชันการเรนเดอร์ มักใช้สำหรับส่งข้อมูลคำขอ (URL, พารามิเตอร์ query, ฯลฯ)

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **ประเภท**: `'inline' | 'js'`
- **ค่าเริ่มต้น**: `'inline'`

โหมดการสร้าง Import Map:
- `inline`: ฝังเนื้อหา importmap ลงใน HTML โดยตรง
- `js`: สร้างเนื้อหา importmap เป็นไฟล์ JS แยกต่างหาก


## คุณสมบัติอินสแตนซ์

### esmx

- **ประเภท**: `Esmx`
- **อ่านได้อย่างเดียว**: `true`

การอ้างอิงอินสแตนซ์ Esmx ใช้สำหรับเข้าถึงฟังก์ชันหลักและการกำหนดค่าของเฟรมเวิร์ก

### redirect

- **ประเภท**: `string | null`
- **ค่าเริ่มต้น**: `null`

ที่อยู่สำหรับเปลี่ยนเส้นทาง เมื่อตั้งค่าแล้ว เซิร์ฟเวอร์สามารถทำการเปลี่ยนเส้นทาง HTTP ตามค่านี้ มักใช้ในสถานการณ์เช่นการตรวจสอบการเข้าสู่ระบบ การควบคุมสิทธิ์ ฯลฯ

```ts title="entry.node.ts"
// ตัวอย่างการตรวจสอบการเข้าสู่ระบบ
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // ดำเนินการเรนเดอร์หน้าต่อไป...
};

// ตัวอย่างการควบคุมสิทธิ์
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // ดำเนินการเรนเดอร์หน้าต่อไป...
};
```

### status

- **ประเภท**: `number | null`
- **ค่าเริ่มต้น**: `null`

รหัสสถานะ HTTP สามารถตั้งค่ารหัสสถานะ HTTP ที่ถูกต้องใดก็ได้ มักใช้ในสถานการณ์เช่นการจัดการข้อผิดพลาด การเปลี่ยนเส้นทาง ฯลฯ

```ts title="entry.node.ts"
// ตัวอย่างการจัดการข้อผิดพลาด 404
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // เรนเดอร์หน้า 404...
    return;
  }
  // ดำเนินการเรนเดอร์หน้าต่อไป...
};

// ตัวอย่างการเปลี่ยนเส้นทางชั่วคราว
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // เปลี่ยนเส้นทางชั่วคราว รักษาวิธีการคำขอเดิม
    return;
  }
  // ดำเนินการเรนเดอร์หน้าต่อไป...
};
```

### html

- **ประเภท**: `string`
- **ค่าเริ่มต้น**: `''`

เนื้อหา HTML ใช้สำหรับตั้งค่าและรับเนื้อหา HTML สุดท้ายที่สร้างขึ้น เมื่อตั้งค่าจะจัดการตัวยึดตำแหน่งเส้นทางพื้นฐานโดยอัตโนมัติ

```ts title="entry.node.ts"
// การใช้งานพื้นฐาน
export default async (rc: RenderContext) => {
  // ตั้งค่าเนื้อหา HTML
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// เส้นทางพื้นฐานแบบไดนามิก
const rc = await esmx.render({
  base: '/app',  // ตั้งค่าเส้นทางพื้นฐาน
  params: { url: req.url }
});

// ตัวยึดตำแหน่งใน HTML จะถูกแทนที่โดยอัตโนมัติ:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// ถูกแทนที่ด้วย:
// /app/your-app-name/css/style.css
```

### base

- **ประเภท**: `string`
- **อ่านได้อย่างเดียว**: `true`
- **ค่าเริ่มต้น**: `''`

เส้นทางพื้นฐานสำหรับทรัพยากรสแตติก ทรัพยากรสแตติกทั้งหมด (JS, CSS, รูปภาพ, ฯลฯ) จะโหลดตามเส้นทางนี้ รองรับการกำหนดค่าแบบไดนามิกขณะรันไทม์

```ts
// การใช้งานพื้นฐาน
const rc = await esmx.render({
  base: '/esmx',  // ตั้งค่าเส้นทางพื้นฐาน
  params: { url: req.url }
});

// ตัวอย่างเว็บไซต์หลายภาษา
const rc = await esmx.render({
  base: '/cn',  // เว็บไซต์ภาษาจีน
  params: { lang: 'zh-CN' }
});

// ตัวอย่างแอปพลิเคชันไมโครฟรอนต์เอนด์
const rc = await esmx.render({
  base: '/app1',  // แอปพลิเคชันย่อย 1
  params: { appId: 1 }
});
```

### entryName

- **ประเภท**: `string`
- **อ่านได้อย่างเดียว**: `true`
- **ค่าเริ่มต้น**: `'default'`

ชื่อฟังก์ชันทางเข้าสำหรับการเรนเดอร์ฝั่งเซิร์ฟเวอร์ ใช้เพื่อเลือกฟังก์ชันการเรนเดอร์จาก entry.server.ts

```ts title="entry.node.ts"
// ฟังก์ชันทางเข้าเริ่มต้น
export default async (rc: RenderContext) => {
  // ลอจิกการเรนเดอร์เริ่มต้น
};

// หลายฟังก์ชันทางเข้า
export const mobile = async (rc: RenderContext) => {
  // ลอจิกการเรนเดอร์สำหรับอุปกรณ์เคลื่อนที่
};

export const desktop = async (rc: RenderContext) => {
  // ลอจิกการเรนเดอร์สำหรับเดสก์ท็อป
};

// เลือกฟังก์ชันทางเข้าตามประเภทอุปกรณ์
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **ประเภท**: `Record<string, any>`
- **อ่านได้อย่างเดียว**: `true`
- **ค่าเริ่มต้น**: `{}`

พารามิเตอร์การเรนเดอร์ สามารถส่งและเข้าถึงพารามิเตอร์ระหว่างกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์ มักใช้สำหรับส่งข้อมูลคำขอ การกำหนดค่าหน้า ฯลฯ

```ts
// การใช้งานพื้นฐาน - ส่ง URL และการตั้งค่าภาษา
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// การกำหนดค่าหน้า - ตั้งค่าธีมและเลย์เอาต์
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// การกำหนดค่าสภาพแวดล้อม - ฉีดที่อยู่ API
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **ประเภท**: `Set<ImportMeta>`

ชุดการรวบรวมการพึ่งพาโมดูล ในการเรนเดอร์คอมโพเนนต์จะติดตามและบันทึกการพึ่งพาโมดูลโดยอัตโนมัติ รวบรวมเฉพาะทรัพยากรที่ใช้จริงในการเรนเดอร์หน้าปัจจุบัน

```ts
// การใช้งานพื้นฐาน
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // รวบรวมการพึ่งพาโมดูลโดยอัตโนมัติระหว่างกระบวนการเรนเดอร์
  // เฟรมเวิร์กจะเรียก context.importMetaSet.add(import.meta) โดยอัตโนมัติเมื่อเรนเดอร์คอมโพเนนต์
  // นักพัฒนาไม่จำเป็นต้องจัดการการรวบรวมการพึ่งพาด้วยตนเอง
  return '<div id="app">Hello World</div>';
};

// ตัวอย่างการใช้งาน
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **ประเภท**: `RenderFiles`

รายการไฟล์ทรัพยากร:
- js: รายการไฟล์ JavaScript
- css: รายการไฟล์สไตล์ชีต
- modulepreload: รายการโมดูล ESM ที่ต้องการโหลดล่วงหน้า
- resources: รายการไฟล์ทรัพยากรอื่นๆ (รูปภาพ, ฟอนต์, ฯลฯ)

```ts
// การรวบรวมทรัพยากร
await rc.commit();

// การฉีดทรัพยากร
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- โหลดทรัพยากรล่วงหน้า -->
    ${rc.preload()}
    <!-- ฉีดสไตล์ชีต -->
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
```

### importmapMode

- **ประเภท**: `'inline' | 'js'`
- **ค่าเริ่มต้น**: `'inline'`

โหมดการสร้าง Import Map:
- `inline`: ฝังเนื้อหา importmap ลงใน HTML โดยตรง
- `js`: สร้างเนื้อหา importmap เป็นไฟล์ JS แยกต่างหาก


## เมธอดอินสแตนซ์

### serialize()

- **พารามิเตอร์**: 
  - `input: any` - ข้อมูลที่ต้องการซีเรียไลซ์
  - `options?: serialize.SerializeJSOptions` - ตัวเลือกการซีเรียไลซ์
- **ค่าที่ส่งกลับ**: `string`

ซีเรียไลซ์ออบเจ็กต์ JavaScript เป็นสตริง ใช้สำหรับซีเรียไลซ์ข้อมูลสถานะระหว่างกระบวนการเรนเดอร์ฝั่งเซิร์ฟเวอร์ เพื่อให้แน่ใจว่าข้อมูลสามารถฝังลงใน HTML ได้อย่างปลอดภัย

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **พารามิเตอร์**: 
  - `varName: string` - ชื่อตัวแปร
  - `data: Record<string, any>` - ข้อมูลสถานะ
- **ค่าที่ส่งกลับ**: `string`

ซีเรียไลซ์ข้อมูลสถานะและฉีดลงใน HTML ใช้วิธีการซีเรียไลซ์ที่ปลอดภัยสำหรับการประมวลผลข้อมูล รองรับโครงสร้างข้อมูลที่ซับซ้อน

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **ค่าที่ส่งกลับ**: `Promise<void>`

ส่งการรวบรวมการพึ่งพาและอัปเดตรายการทรัพยากร รวบรวมโมดูลทั้งหมดที่ใช้จาก importMetaSet และวิเคราะห์ทรัพยากรเฉพาะของแต่ละโมดูลตามไฟล์