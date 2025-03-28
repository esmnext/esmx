---
titleSuffix: Esmx Framework Packaging Configuration API Reference
description: รายละเอียดเกี่ยวกับอินเทอร์เฟซการกำหนดค่า PackConfig ของเฟรมเวิร์ก Esmx รวมถึงกฎการแพ็คเกจซอฟต์แวร์ การกำหนดค่าผลลัพธ์ และฮุควงจรชีวิต ช่วยให้นักพัฒนาสามารถดำเนินกระบวนการสร้างมาตรฐานได้
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, การแพ็คเกจซอฟต์แวร์, การกำหนดค่าการสร้าง, ฮุควงจรชีวิต, การกำหนดค่าแพ็คเกจ, เว็บแอปพลิเคชันเฟรมเวิร์ก
---

# PackConfig

`PackConfig` เป็นอินเทอร์เฟซการกำหนดค่าการแพ็คเกจซอฟต์แวร์ ใช้สำหรับแพ็คผลลัพธ์การสร้างบริการเป็นแพ็คเกจซอฟต์แวร์รูปแบบมาตรฐาน .tgz ของ npm

- **มาตรฐาน**: ใช้รูปแบบการแพ็ค .tgz มาตรฐานของ npm
- **ความสมบูรณ์**: รวมไฟล์ที่จำเป็นทั้งหมด เช่น ซอร์สโค้ดโมดูล ไฟล์ประกาศประเภท และไฟล์กำหนดค่า
- **ความเข้ากันได้**: เข้ากันได้อย่างสมบูรณ์กับระบบนิเวศ npm และรองรับเวิร์กโฟลว์การจัดการแพ็คเกจมาตรฐาน

## นิยามประเภท

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

เปิดใช้งานฟังก์ชันการแพ็คเกจหรือไม่ เมื่อเปิดใช้งานจะแพ็คผลลัพธ์การสร้างเป็นแพ็คเกจซอฟต์แวร์รูปแบบมาตรฐาน .tgz ของ npm

- ประเภท: `boolean`
- ค่าเริ่มต้น: `false`

#### outputs

ระบุเส้นทางไฟล์แพ็คเกจซอฟต์แวร์ที่ต้องการส่งออก รองรับการกำหนดค่าดังต่อไปนี้:
- `string`: เส้นทางส่งออกเดียว เช่น 'dist/versions/my-app.tgz'
- `string[]`: เส้นทางส่งออกหลายเส้นทาง ใช้สำหรับสร้างหลายเวอร์ชันพร้อมกัน
- `boolean`: เมื่อเป็น true จะใช้เส้นทางเริ่มต้น 'dist/client/versions/latest.tgz'

#### packageJson

ฟังก์ชันคอลแบ็กสำหรับกำหนดค่าเนื้อหา package.json โดยกำหนดเอง จะถูกเรียกใช้ก่อนการแพ็คเกจ เพื่อกำหนดค่าเนื้อหา package.json เอง

- พารามิเตอร์:
  - `esmx: Esmx` - อินสแตนซ์ Esmx
  - `pkg: any` - เนื้อหา package.json ดั้งเดิม
- ค่าส่งกลับ: `Promise<any>` - เนื้อหา package.json ที่แก้ไขแล้ว

การใช้งานทั่วไป:
- แก้ไขชื่อและหมายเลขเวอร์ชันแพ็คเกจ
- เพิ่มหรืออัปเดต dependencies
- เพิ่มฟิลด์ที่กำหนดเอง
- กำหนดค่าข้อมูลการเผยแพร่

ตัวอย่าง:
```ts
packageJson: async (esmx, pkg) => {
  // กำหนดข้อมูลแพ็คเกจ
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'แอปพลิเคชันของฉัน';

  // เพิ่ม dependencies
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // เพิ่มการกำหนดค่าการเผยแพร่
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

ฟังก์ชันคอลแบ็กสำหรับการเตรียมการก่อนการแพ็คเกจ

- พารามิเตอร์:
  - `esmx: Esmx` - อินสแตนซ์ Esmx
  - `pkg: Record<string, any>` - เนื้อหา package.json
- ค่าส่งกลับ: `Promise<void>`

การใช้งานทั่วไป:
- เพิ่มไฟล์เพิ่มเติม (README, LICENSE เป็นต้น)
- ดำเนินการทดสอบหรือตรวจสอบการสร้าง
- สร้างเอกสารหรือเมตาดาต้า
- ล้างไฟล์ชั่วคราว

ตัวอย่าง:
```ts
onBefore: async (esmx, pkg) => {
  // เพิ่มเอกสาร
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // ดำเนินการทดสอบ
  await runTests();

  // สร้างเอกสาร
  await generateDocs();

  // ล้างไฟล์ชั่วคราว
  await cleanupTempFiles();
}
```

#### onAfter

ฟังก์ชันคอลแบ็กสำหรับการประมวลผลหลังการแพ็คเกจเสร็จสิ้น จะถูกเรียกใช้หลังจากสร้างไฟล์ .tgz แล้ว ใช้สำหรับประมวลผลผลลัพธ์การแพ็คเกจ

- พารามิเตอร์:
  - `esmx: Esmx` - อินสแตนซ์ Esmx
  - `pkg: Record<string, any>` - เนื้อหา package.json
  - `file: Buffer` - เนื้อหาไฟล์ที่แพ็คแล้ว
- ค่าส่งกลับ: `Promise<void>`

การใช้งานทั่วไป:
- เผยแพร่ไปยัง npm registry (สาธารณะหรือส่วนตัว)
- อัปโหลดไปยังเซิร์ฟเวอร์ทรัพยากรสถิต
- ดำเนินการจัดการเวอร์ชัน
- เรียกใช้งานกระบวนการ CI/CD

ตัวอย่าง:
```ts
onAfter: async (esmx, pkg, file) => {
  // เผยแพร่ไปยัง npm registry ส่วนตัว
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // อัปโหลดไปยังเซิร์ฟเวอร์ทรัพยากรสถิต
  await uploadToServer(file, 'https://assets.example.com/packages');

  // สร้างแท็กเวอร์ชันใน Git
  await createGitTag(pkg.version);

  // เรียกใช้งานกระบวนการ deploy
  await triggerDeploy(pkg.version);
}
```

## ตัวอย่างการใช้งาน

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // กำหนดค่าโมดูลที่ต้องการส่งออก
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // การกำหนดค่าแพ็คเกจ
  pack: {
    // เปิดใช้งานฟังก์ชันการแพ็คเกจ
    enable: true,

    // ส่งออกหลายเวอร์ชันพร้อมกัน
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // กำหนดค่า package.json เอง
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // การเตรียมการก่อนการแพ็คเกจ
    onBefore: async (esmx, pkg) => {
      // เพิ่มไฟล์ที่จำเป็น
      await fs.writeFile('dist/README.md', '# Your App\n\nคำอธิบายการส่งออกโมดูล...');
      // ดำเนินการตรวจสอบประเภท
      await runTypeCheck();
    },

    // การประมวลผลหลังการแพ็คเกจ
    onAfter: async (esmx, pkg, file) => {
      // เผยแพร่ไปยัง npm registry ส่วนตัว
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // หรือ deploy ไปยังเซิร์ฟเวอร์สถิต
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```