---
titleSuffix: กรอบ API คลาสหลัก
description: รายละเอียด API คลาสหลักของเฟรมเวิร์ก Esmx รวมถึงการจัดการวงจรชีวิตแอปพลิเคชัน การจัดการทรัพยากรคงที่ และความสามารถในการเรนเดอร์ฝั่งเซิร์ฟเวอร์ ช่วยให้นักพัฒนาทำความเข้าใจฟังก์ชันหลักของเฟรมเวิร์กได้อย่างลึกซึ้ง
head:
  - - meta
    - property: keywords
      content: Esmx, API, การจัดการวงจรชีวิต, ทรัพยากรคงที่, การเรนเดอร์ฝั่งเซิร์ฟเวอร์, Rspack, เว็บเฟรมเวิร์ก
---

# Esmx

## บทนำ

Esmx เป็นเว็บเฟรมเวิร์กประสิทธิภาพสูงที่สร้างบน Rspack ให้ความสามารถในการจัดการวงจรชีวิตแอปพลิเคชัน การจัดการทรัพยากรคงที่ และการเรนเดอร์ฝั่งเซิร์ฟเวอร์อย่างครบถ้วน

## นิยามประเภท

### RuntimeTarget

- **นิยามประเภท**:
```ts
type RuntimeTarget = 'client' | 'server'
```

ประเภทสภาพแวดล้อมรันไทม์ของแอปพลิเคชัน:
- `client`: ทำงานในสภาพแวดล้อมเบราว์เซอร์ รองรับการทำงานกับ DOM และ API ของเบราว์เซอร์
- `server`: ทำงานในสภาพแวดล้อม Node.js รองรับระบบไฟล์และฟังก์ชันการทำงานฝั่งเซิร์ฟเวอร์

### ImportMap

- **นิยามประเภท**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ประเภทการแมปการนำเข้าโมดูล ES

#### SpecifierMap

- **นิยามประเภท**:
```ts
type SpecifierMap = Record<string, string>
```

ประเภทการแมปตัวระบุโมดูล ใช้กำหนดความสัมพันธ์การแมปเส้นทางการนำเข้าโมดูล

#### ScopesMap

- **นิยามประเภท**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

ประเภทการแมปขอบเขต ใช้กำหนดความสัมพันธ์การแมปการนำเข้าโมดูลภายในขอบเขตเฉพาะ

### COMMAND

- **นิยามประเภท**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

ประเภท enum คำสั่ง:
- `dev`: คำสั่งสภาพแวดล้อมการพัฒนา เริ่มเซิร์ฟเวอร์พัฒนาพร้อมการอัปเดตร้อน
- `build`: คำสั่งการสร้าง สร้างผลลัพธ์สำหรับสภาพแวดล้อมการผลิต
- `preview`: คำสั่งการแสดงตัวอย่าง เริ่มเซิร์ฟเวอร์แสดงตัวอย่างในเครื่อง
- `start`: คำสั่งเริ่มต้น เรียกใช้เซิร์ฟเวอร์สภาพแวดล้อมการผลิต

## ตัวเลือกอินสแตนซ์

กำหนดตัวเลือกการกำหนดค่าหลักของเฟรมเวิร์ก Esmx

```ts
interface EsmxOptions {
  root?: string
  isProd?: boolean
  basePathPlaceholder?: string | false
  modules?: ModuleConfig
  packs?: PackConfig
  devApp?: (esmx: Esmx) => Promise<App>
  server?: (esmx: Esmx) => Promise<void>
  postBuild?: (esmx: Esmx) => Promise<void>
}
```

#### root

- **ประเภท**: `string`
- **ค่าเริ่มต้น**: `process.cwd()`

เส้นทางไดเรกทอรีรากของโปรเจกต์ สามารถเป็นเส้นทางสัมบูรณ์หรือเส้นทางสัมพัทธ์ โดยเส้นทางสัมพัทธ์จะถูกแก้ไขตามไดเรกทอรีการทำงานปัจจุบัน

#### isProd

- **ประเภท**: `boolean`
- **ค่าเริ่มต้น**: `process.env.NODE_ENV === 'production'`

ตัวบ่งชี้สภาพแวดล้อม
- `true`: สภาพแวดล้อมการผลิต
- `false`: สภาพแวดล้อมการพัฒนา

#### basePathPlaceholder

- **ประเภท**: `string | false`
- **ค่าเริ่มต้น**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

การกำหนดค่าตัวยึดตำแหน่งเส้นทางฐาน ใช้สำหรับการแทนที่เส้นทางฐานของทรัพยากรในรันไทม์ ตั้งค่าเป็น `false` เพื่อปิดใช้งานฟังก์ชันนี้

#### modules

- **ประเภท**: `ModuleConfig`

ตัวเลือกการกำหนดค่าโมดูล ใช้กำหนดกฎการแก้ไขโมดูลของโปรเจกต์ รวมถึงการกำหนดค่า alias ของโมดูลและ dependency ภายนอก

#### packs

- **ประเภท**: `PackConfig`

ตัวเลือกการกำหนดค่าการแพ็คเกจ ใช้สำหรับการแพ็คผลลัพธ์การสร้างเป็นแพ็คเกจ .tgz มาตรฐานของ npm

#### devApp

- **ประเภท**: `(esmx: Esmx) => Promise<App>`

ฟังก์ชันการสร้างแอปพลิเคชันสำหรับสภาพแวดล้อมการพัฒนา ใช้เฉพาะในสภาพแวดล้อมการพัฒนา เพื่อสร้างอินสแตนซ์แอปพลิเคชันสำหรับเซิร์ฟเวอร์พัฒนา

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // กำหนดค่า Rspack แบบกำหนดเอง
        }
      })
    )
  }
}
```

#### server

- **ประเภท**: `(esmx: Esmx) => Promise<void>`

ฟังก์ชันการกำหนดค่าและเริ่มต้นเซิร์ฟเวอร์ HTTP ใช้ได้ทั้งในสภาพแวดล้อมการพัฒนาและการผลิต

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000);
  }
}
```

#### postBuild

- **ประเภท**: `(esmx: Esmx) => Promise<void>`

ฟังก์ชันการประมวลผลหลังการสร้าง ทำงานหลังจากสร้างโปรเจกต์เสร็จสิ้น ใช้สำหรับ:
- การประมวลผลทรัพยากรเพิ่มเติม
- การดำเนินการ deploy
- การสร้างไฟล์คงที่
- การส่งการแจ้งเตือนการสร้าง

## คุณสมบัติอินสแตนซ์

### name

- **ประเภท**: `string`
- **อ่านได้อย่างเดียว**: `true`

ชื่อของโมดูลปัจจุบัน มาจากการกำหนดค่าโมดูล

### varName

- **ประเภท**: `string`
- **อ่านได้อย่างเดียว**: `true`

ชื่อตัวแปร JavaScript ที่ถูกต้องซึ่งสร้างจากชื่อโมดูล

### root

- **ประเภท**: `string`
- **อ่านได้อย่างเดียว**: `true`

เส้นทางสัมบูรณ์ของไดเรกทอรีรากโปรเจกต์ หากกำหนดค่า `root` เป็นเส้นทางสัมพัทธ์ จะถูกแก้ไขตามไดเรกทอรีการทำงานปัจจุบัน

### isProd

- **ประเภท**: `boolean`
- **อ่านได้อย่างเดียว**: `true`

ตรวจสอบว่าปัจจุบันอยู่ในสภาพแวดล้อมการผลิตหรือไม่ ให้ความสำคัญกับตัวเลือก `isProd` ในค่ากำหนด หากไม่มีการกำหนดค่า จะตรวจสอบจาก `process.env.NODE_ENV`

### basePath

- **ประเภท**: `string`
- **อ่านได้อย่างเดียว**: `true`
- **throw**: `NotReadyError` - เมื่อเฟรมเวิร์กยังไม่ถูกเตรียมใช้งาน

รับเส้นทางฐานของโมดูลที่ขึ้นต้นและลงท้ายด้วยเครื่องหมายทับ รูปแบบการส่งคืนคือ `/${name}/` โดยที่ name มาจากการกำหนดค่าโมดูล

### basePathPlaceholder

- **ประเภท**: `string`
- **อ่านได้อย่างเดียว**: `true`

รับตัวยึดตำแหน่งเส้นทางฐานสำหรับการแทนที่ในรันไทม์ สามารถปิดใช้งานได้ผ่านการกำหนดค่า

### middleware

- **ประเภท**: `Middleware`
- **อ่านได้อย่างเดียว**: `true`

รับ middleware การจัดการทรัพยากรคงที่ ให้การใช้งานที่แตกต่างกันตามสภาพแวดล้อม:
- สภาพแวดล้อมการพัฒนา: รองรับการคอมไพล์ซอร์สโค้ดแบบเรียลไทม์และการอัปเดตร้อน
- สภาพแวดล้อมการผลิต: รองรับการแคชทรัพยากรคงที่ระยะยาว

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **ประเภท**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **อ่านได้อย่างเดียว**: `true`

รับฟังก์ชันการเรนเดอร์ฝั่งเซิร์ฟเวอร์ ให้การใช้งานที่แตกต่างกันตามสภาพแวดล้อม:
- สภาพแวดล้อมการพัฒนา: รองรับการอัปเดตร้อนและการแสดงตัวอย่างแบบเรียลไทม์
- สภาพแวดล้อมการผลิต: ให้ประสิทธิภาพการเรนเดอร์ที่ได้รับการปรับปรุง

```ts
// การใช้งานพื้นฐาน
const rc = await esmx.render({
  params: { url: req.url }
});

// การกำหนดค่าขั้นสูง
const rc = await esmx.render({
  base: '',                    // เส้นทางฐาน
  importmapMode: 'inline',     // โหมดการแมปการนำเข้า
  entryName: 'default',        // จุดเข้าเรนเดอร์
  params: {
    url: req.url,
    state: { user: 'admin' }   // ข้อมูลสถานะ
  }
});
```

### COMMAND

- **ประเภท**: `typeof COMMAND`
- **อ่านได้อย่างเดียว**: `true`

รับนิยามประเภท enum ของคำสั่ง

### moduleConfig

- **ประเภท**: `ParsedModuleConfig`
- **อ่านได้อย่างเดียว**: `true`
- **throw**: `NotReadyError` - เมื่อเฟรมเวิร์กยังไม่ถูกเตรียมใช้งาน

รับข้อมูลการกำหนดค่าโมดูลปัจจุบันทั้งหมด รวมถึงกฎการแก้ไขโมดูลและการกำหนดค่า alias

### packConfig

- **ประเภท**: `ParsedPackConfig`
- **อ่านได้อย่างเดียว**: `true`
- **throw**: `NotReadyError` - เมื่อเฟรมเวิร์กยังไม่ถูกเตรียมใช้งาน

รับการกำหนดค่าที่เกี่ยวข้องกับการแพ็คเกจของโมดูลปัจจุบัน รวมถึงเส้นทางผลลัพธ์และการประมวลผล package.json

## เมธอดอินสแตนซ์

### constructor()

- **พารามิเตอร์**: 
  - `options?: EsmxOptions` - ตัวเลือกการกำหนดค่าเฟรมเวิร์ก
- **ส่งคืนค่า**: `Esmx`

สร้างอินสแตนซ์เฟรมเวิร์ก Esmx

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **พารามิเตอร์**: `command: COMMAND`
- **ส่งคืนค่า**: `Promise<boolean>`
- **throw**:
  - `Error`: เมื่อพยายามเตรียมใช้งานซ้ำ
  - `NotReadyError`: เมื่อเข้าถึงอินสแตนซ์ที่ยังไม่ถูกเตรียมใช้งาน

เตรียมใช้งานอินสแตนซ์เฟรมเวิร์ก Esmx ดำเนินการกระบวนการเตรียมใช้งานหลักดังนี้:

1. แก้ไขการกำหนดค่าโปรเจกต์ (package.json, การกำหนดค่าโมดูล, การกำหนดค่าการแพ็คเกจ ฯลฯ)
2. สร้างอินสแตนซ์แอปพลิเคชัน (สภาพแวดล้อมการพัฒนาหรือการผลิต)
3. ดำเนินการเมธอดวงจรชีวิตที่สอดคล้องกับคำสั่ง

::: warning ข้อควรระวัง
- การเตรียมใช้งานซ้ำจะทำให้เกิดข้อผิดพลาด
- การเข้าถึงอินสแตนซ์ที่ยังไม่ถูกเตรียมใช้งานจะทำให้เกิด `NotReadyError`

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **ส่งคืนค่า**: `Promise<boolean>`

ทำลายอินสแตนซ์เฟรมเวิร์ก Esmx ดำเนินการล้างทรัพยากรและปิดการเชื่อมต่อ ใช้สำหรับ:
- ปิดเซิร์ฟเวอร์พัฒนา
- ล้างไฟล์ชั่วคราวและแคช
- ปลดปล่อยทรัพยากรระบบ

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **ส่งคืนค่า**: `Promise<boolean>`

ดำเนินการกระบวนการสร้างแอปพลิเคชัน รวมถึง:
- คอมไพล์ซอร์สโค้ด
- สร้างผลลัพธ์สำหรับสภาพแวดล้อมการผลิต
- ปรับปรุงและบีบอัดโค้ด
- สร้างรายการทรัพยากร

::: warning ข้อควรระวัง
การเรียกใช้เมื่ออินสแตนซ์เฟรมเวิร์กยังไม่ถูกเตรียมใช้งานจะทำให้เกิด `NotReadyError`
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // สร้าง HTML คงที่หลังการสร้าง
    const render = await esmx.render({
      params: { url: '/' }
    });
    esmx.writeSync(
      esmx.resolvePath('dist/client', 'index.html'),
      render.html
    );
  }
}
```

### server()

- **ส่งคืนค่า**: `Promise<void>`
- **throw**: `NotReadyError` - เมื่อเฟรมเวิร์กยังไม่ถูกเตรียมใช้งาน

เริ่มต้นเซิร์ฟเวอร์ HTTP และกำหนดค่าอินสแตนซ์เซิร์ฟเวอร์ ถูกเรียกใช้ในวงจรชีวิตต่อไปนี้:
- สภาพแวดล้อมการพัฒนา (dev): เริ่มต้นเซิร์ฟเวอร์พัฒนา ให้การอัปเดตร้อน
- สภาพแวดล้อมการผลิต (start): เริ่มต้นเซิร์ฟเวอร์การผลิต ให้ประสิทธิภาพระดับการผลิต

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // จัดการทรัพยากรคงที่
      esmx.middleware(req, res, async () => {
        // การเรนเดอร์ฝั่งเซิร์ฟเวอร์
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  }
}
```

### postBuild()

- **ส่งคืนค่า**: `Promise<boolean>`

ดำเนินการตรรกะการประมวลผลหลังการสร้าง ใช้สำหรับ:
- สร้างไฟล์ HTML คงที่
- ประมวลผลผลลัพธ์การสร้าง
- ดำเนินการ deploy
- ส่งการแจ้งเตือนการสร้าง

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // สร้าง HTML คงที่สำหรับหลายหน้า
    const pages = ['/', '/about', '/404'];

    for (const url of pages) {
      const render = await esmx.render({
        params: { url }
      });

      await esmx.write(
        esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
        render.html
      );
    }
  }
}
```

### resolvePath

แก้ไขเส้นทางโปรเจกต์ แปลงเส้นทางสัมพัทธ์เป็นเส้นทางสัมบูรณ์

- **พารามิเตอร์**:
  - `projectPath: ProjectPath` - ประเภทเส้นทางโปรเจกต์
  - `...args: string[]` - ส่วนของเส้นทาง
- **ส่งคืนค่า**: `string` - เส้นทางสัมบูรณ์ที่แก้ไขแล้ว

- **ตัวอย่าง**:
```ts
// แก้ไขเส้นทางทรัพยากรคงที่
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

เขียนเนื้อหาไฟล์แบบซิงโครนัส

- **พารามิเตอร์**:
  - `filepath`: `string` - เส้นทางสัมบูรณ์ของไฟล์
  - `data`: `any` - ข้อมูลที่จะเขียน สามารถเป็นสตริง, Buffer หรือออบเจ็กต์
- **ส่งคืนค่า**: `boolean` - การเขียนสำเร็จหรือไม่

- **ตัวอย่าง**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

อ่านและแยกวิเคราะห์ไฟล์ JSON แบบซิงโครนัส

- **พารามิเตอร์**:
  - `filename`: `string` - เส้นทางสัมบูรณ์ของไฟล์ JSON

- **ส่งคืนค่า**: `any` - ออบเจ็กต์ JSON ที่แยกวิเคราะห์แล้ว
- **throw**: เมื่อไฟล์ไม่มีอยู่หรือรูปแบบ JSON ผิดพลาด

- **ตัวอย่าง**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // ใช้ออบเจ็กต์ manifest
}
```

### readJson()

อ่านและแยกวิเคราะห์ไฟล์ JSON แบบอะซิงโครนัส

- **พารามิเตอร์**:
  - `filename`: `string` - เส้นทางสัมบูรณ์ของไฟล์ JSON

- **ส่งคืนค่า**: `Promise<any>` - อ