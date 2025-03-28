---
titleSuffix: ภาพรวมของเฟรมเวิร์ก Esmx และนวัตกรรมทางเทคโนโลยี
description: เรียนรู้เพิ่มเติมเกี่ยวกับภูมิหลังของโครงการ เทคโนโลยีที่พัฒนา และข้อได้เปรียบหลักของเฟรมเวิร์ก Esmx สำหรับไมโครฟรอนต์เอนด์ พร้อมสำรวจโซลูชันการเรนเดอร์ฝั่งเซิร์ฟเวอร์ที่ทันสมัยโดยใช้ ESM
head:
  - - meta
    - property: keywords
      content: Esmx, ไมโครฟรอนต์เอนด์, ESM, การเรนเดอร์ฝั่งเซิร์ฟเวอร์, SSR, นวัตกรรมทางเทคโนโลยี, Module Federation
---

# บทนำ

## ภูมิหลังของโครงการ
Esmx เป็นเฟรมเวิร์กไมโครฟรอนต์เอนด์ที่ทันสมัย โดยใช้ ECMAScript Modules (ESM) เป็นพื้นฐาน มุ่งเน้นการสร้างแอปพลิเคชันที่ให้ประสิทธิภาพสูงและขยายได้ง่ายสำหรับการเรนเดอร์ฝั่งเซิร์ฟเวอร์ (SSR) ในฐานะที่เป็นผลิตภัณฑ์รุ่นที่สามของโครงการ Genesis Esmx ได้มีการพัฒนาทางเทคโนโลยีอย่างต่อเนื่อง:

- **v1.0**: ใช้การร้องขอ HTTP เพื่อโหลดคอมโพเนนต์จากระยะไกลตามต้องการ
- **v2.0**: ใช้ Webpack Module Federation เพื่อการรวมแอปพลิเคชัน
- **v3.0**: ออกแบบระบบ[การเชื่อมโยงโมดูล](/guide/essentials/module-link)ใหม่โดยใช้ ESM ดั้งเดิมของเบราว์เซอร์

## ภูมิหลังทางเทคโนโลยี
ในกระบวนการพัฒนาสถาปัตยกรรมไมโครฟรอนต์เอนด์ โซลูชันแบบดั้งเดิมมีข้อจำกัดหลักดังต่อไปนี้:

### ความท้าทายของโซลูชันที่มีอยู่
- **ปัญหาด้านประสิทธิภาพ**: การฉีดการพึ่งพาในเวลารันและการใช้พร็อกซีแซนด์บ็อกซ์ของ JavaScript ส่งผลให้เกิดค่าใช้จ่ายด้านประสิทธิภาพที่สำคัญ
- **กลไกการแยกส่วน**: สภาพแวดล้อมแซนด์บ็อกซ์ที่พัฒนาขึ้นเองยากที่จะเทียบเคียงกับความสามารถในการแยกโมดูลดั้งเดิมของเบราว์เซอร์
- **ความซับซ้อนในการสร้าง**: การปรับเปลี่ยนเครื่องมือสร้างเพื่อให้สามารถแบ่งปันการพึ่งพาได้ ทำให้ต้นทุนการบำรุงรักษาโครงการเพิ่มขึ้น
- **การเบี่ยงเบนจากมาตรฐาน**: กลยุทธ์การปรับใช้และการจัดการในเวลารันที่พิเศษ ทำให้ไม่สอดคล้องกับมาตรฐานการพัฒนาเว็บสมัยใหม่
- **ข้อจำกัดของระบบนิเวศ**: การผูกติดกับเฟรมเวิร์กและ API ที่กำหนดเอง ทำให้การเลือกสแต็กเทคโนโลยีถูกจำกัด

### นวัตกรรมทางเทคโนโลยี
Esmx ได้นำเสนอโซลูชันใหม่โดยใช้มาตรฐานเว็บสมัยใหม่:

- **ระบบโมดูลดั้งเดิม**: ใช้ ESM ดั้งเดิมของเบราว์เซอร์และ Import Maps เพื่อจัดการการพึ่งพา ทำให้การแยกวิเคราะห์และการทำงานเร็วขึ้น
- **กลไกการแยกส่วนมาตรฐาน**: ใช้ขอบเขตโมดูลของ ECMAScript เพื่อสร้างการแยกแอปพลิเคชันที่เชื่อถือได้
- **สแต็กเทคโนโลยีที่เปิดกว้าง**: รองรับการเชื่อมต่อกับเฟรมเวิร์กฟรอนต์เอนด์สมัยใหม่ใดๆ ได้อย่างราบรื่น
- **การปรับปรุงประสบการณ์การพัฒนา**: ให้รูปแบบการพัฒนาที่เป็นไปตามสัญชาตญาณและความสามารถในการดีบักที่สมบูรณ์
- **การปรับปรุงประสิทธิภาพสูงสุด**: ใช้ความสามารถดั้งเดิมเพื่อให้ไม่มีค่าใช้จ่ายในเวลารัน พร้อมกับกลยุทธ์การแคชที่ชาญฉลาด

:::tip
Esmx มุ่งเน้นการสร้างโครงสร้างพื้นฐานไมโครฟรอนต์เอนด์ที่ให้ประสิทธิภาพสูงและขยายได้ง่าย โดยเฉพาะอย่างยิ่งเหมาะสำหรับแอปพลิเคชันการเรนเดอร์ฝั่งเซิร์ฟเวอร์ขนาดใหญ่
:::

## มาตรฐานทางเทคโนโลยี

### การพึ่งพาสภาพแวดล้อม
โปรดดูเอกสาร[ข้อกำหนดสภาพแวดล้อม](/guide/start/environment)เพื่อทราบข้อกำหนดเบราว์เซอร์และ Node.js ที่ละเอียด

### สแต็กเทคโนโลยีหลัก
- **การจัดการการพึ่งพา**: ใช้ [Import Maps](https://caniuse.com/?search=import%20map) เพื่อทำการแมปโมดูล และใช้ [es-module-shims](https://github.com/guybedford/es-module-shims) เพื่อให้การรองรับที่เข้ากันได้
- **ระบบการสร้าง**: ใช้ [module-import](https://rspack.dev/config/externals#externalstypemodule-import) ของ Rspack เพื่อจัดการการพึ่งพาภายนอก
- **เครื่องมือการพัฒนา**: รองรับการอัปเดตแบบร้อนของ ESM และการทำงานดั้งเดิมของ TypeScript

## ตำแหน่งของเฟรมเวิร์ก
Esmx แตกต่างจาก [Next.js](https://nextjs.org) หรือ [Nuxt.js](https://nuxt.com/) โดยมุ่งเน้นการให้โครงสร้างพื้นฐานไมโครฟรอนต์เอนด์:

- **ระบบการเชื่อมโยงโมดูล**: ทำให้การนำเข้าและส่งออกโมดูลมีประสิทธิภาพและเชื่อถือได้
- **การเรนเดอร์ฝั่งเซิร์ฟเวอร์**: ให้กลไกการเรนเดอร์ SSR ที่ยืดหยุ่น
- **การรองรับระบบประเภท**: รวมการกำหนดประเภท TypeScript ที่สมบูรณ์
- **ความเป็นกลางของเฟรมเวิร์ก**: รองรับการรวมกับเฟรมเวิร์กฟรอนต์เอนด์หลัก

## การออกแบบสถาปัตยกรรม

### การจัดการการพึ่งพาแบบรวมศูนย์
- **แหล่งการพึ่งพาแบบรวมศูนย์**: การจัดการการพึ่งพาบุคคลที่สามแบบรวมศูนย์
- **การกระจายอัตโนมัติ**: การอัปเดตการพึ่งพาจะถูกซิงค์ทั่วโลกโดยอัตโนมัติ
- **ความสอดคล้องของเวอร์ชัน**: การควบคุมเวอร์ชันการพึ่งพาที่แม่นยำ

### การออกแบบโมดูลาร์
- **การแยกหน้าที่**: แยกตรรกะทางธุรกิจออกจากโครงสร้างพื้นฐาน
- **กลไกปลั๊กอิน**: รองรับการรวมและการแทนที่โมดูลที่ยืดหยุ่น
- **อินเทอร์เฟซมาตรฐาน**: โปรโตคอลการสื่อสารระหว่างโมดูลที่เป็นมาตรฐาน

### การปรับปรุงประสิทธิภาพ
- **หลักการไม่มีค่าใช้จ่าย**: ใช้ความสามารถดั้งเดิมของเบราว์เซอร์ให้เกิดประโยชน์สูงสุด
- **การแคชที่ชาญฉลาด**: กลยุทธ์การแคชที่แม่นยำโดยใช้แฮชเนื้อหา
- **การโหลดตามต้องการ**: การแบ่งโค้ดและการจัดการการพึ่งพาที่ละเอียด

## ความสมบูรณ์ของโครงการ
Esmx ได้ผ่านการพัฒนามาเกือบ 5 ปี (ตั้งแต่ v1.0 ถึง v3.0) และได้รับการทดสอบอย่างเต็มที่ในสภาพแวดล้อมระดับองค์กร ปัจจุบันรองรับการทำงานที่มั่นคงของโครงการธุรกิจหลายสิบโครงการ และยังคงผลักดันให้มีการอัปเกรดสแต็กเทคโนโลยีให้ทันสมัย ความเสถียร ความน่าเชื่อถือ และข้อได้เปรียบด้านประสิทธิภาพของเฟรมเวิร์กได้รับการพิสูจน์แล้วในทางปฏิบัติ ทำให้เป็นพื้นฐานทางเทคโนโลยีที่เชื่อถือได้สำหรับการพัฒนาแอปพลิเคชันขนาดใหญ่