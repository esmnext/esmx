---
titleSuffix: Tham chiếu API cấu hình đóng gói của khung Esmx
description: Tài liệu chi tiết về giao diện cấu hình PackConfig của khung Esmx, bao gồm quy tắc đóng gói gói phần mềm, cấu hình đầu ra và các hook vòng đời, giúp nhà phát triển thực hiện quy trình xây dựng tiêu chuẩn.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, đóng gói gói phần mềm, cấu hình xây dựng, hook vòng đời, cấu hình đóng gói, khung ứng dụng Web
---

# PackConfig

`PackConfig` là giao diện cấu hình đóng gói gói phần mềm, được sử dụng để đóng gói các sản phẩm xây dựng của dịch vụ thành gói phần mềm định dạng .tgz tiêu chuẩn của npm.

- **Tiêu chuẩn hóa**: Sử dụng định dạng đóng gói .tgz tiêu chuẩn của npm
- **Tính toàn vẹn**: Bao gồm mã nguồn, khai báo kiểu và các tệp cấu hình cần thiết khác của mô-đun
- **Tính tương thích**: Hoàn toàn tương thích với hệ sinh thái npm, hỗ trợ quy trình làm việc quản lý gói tiêu chuẩn

## Định nghĩa kiểu

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

Có kích hoạt chức năng đóng gói hay không. Khi được kích hoạt, các sản phẩm xây dựng sẽ được đóng gói thành gói phần mềm định dạng .tgz tiêu chuẩn của npm.

- Kiểu: `boolean`
- Giá trị mặc định: `false`

#### outputs

Chỉ định đường dẫn tệp gói phần mềm đầu ra. Hỗ trợ các cách cấu hình sau:
- `string`: Một đường dẫn đầu ra duy nhất, ví dụ: 'dist/versions/my-app.tgz'
- `string[]`: Nhiều đường dẫn đầu ra, dùng để tạo nhiều phiên bản cùng lúc
- `boolean`: Khi là true, sử dụng đường dẫn mặc định 'dist/client/versions/latest.tgz'

#### packageJson

Hàm callback tùy chỉnh nội dung package.json. Được gọi trước khi đóng gói, dùng để tùy chỉnh nội dung của package.json.

- Tham số:
  - `esmx: Esmx` - Thể hiện Esmx
  - `pkg: any` - Nội dung package.json gốc
- Giá trị trả về: `Promise<any>` - Nội dung package.json đã được sửa đổi

Công dụng phổ biến:
- Sửa đổi tên gói và số phiên bản
- Thêm hoặc cập nhật các phụ thuộc
- Thêm các trường tùy chỉnh
- Cấu hình thông tin phát hành

Ví dụ:
```ts
packageJson: async (esmx, pkg) => {
  // Thiết lập thông tin gói
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Ứng dụng của tôi';

  // Thêm phụ thuộc
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Thêm cấu hình phát hành
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Hàm callback chuẩn bị trước khi đóng gói.

- Tham số:
  - `esmx: Esmx` - Thể hiện Esmx
  - `pkg: Record<string, any>` - Nội dung package.json
- Giá trị trả về: `Promise<void>`

Công dụng phổ biến:
- Thêm các tệp bổ sung (README, LICENSE, v.v.)
- Thực hiện kiểm tra hoặc xác minh xây dựng
- Tạo tài liệu hoặc siêu dữ liệu
- Dọn dẹp các tệp tạm thời

Ví dụ:
```ts
onBefore: async (esmx, pkg) => {
  // Thêm tài liệu
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // Thực hiện kiểm tra
  await runTests();

  // Tạo tài liệu
  await generateDocs();

  // Dọn dẹp các tệp tạm thời
  await cleanupTempFiles();
}
```

#### onAfter

Hàm callback xử lý sau khi đóng gói hoàn tất. Được gọi sau khi tệp .tgz được tạo, dùng để xử lý sản phẩm đóng gói.

- Tham số:
  - `esmx: Esmx` - Thể hiện Esmx
  - `pkg: Record<string, any>` - Nội dung package.json
  - `file: Buffer` - Nội dung tệp đã đóng gói
- Giá trị trả về: `Promise<void>`

Công dụng phổ biến:
- Phát hành lên kho lưu trữ npm (công khai hoặc riêng tư)
- Tải lên máy chủ tài nguyên tĩnh
- Quản lý phiên bản
- Kích hoạt quy trình CI/CD

Ví dụ:
```ts
onAfter: async (esmx, pkg, file) => {
  // Phát hành lên kho lưu trữ npm riêng tư
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Tải lên máy chủ tài nguyên tĩnh
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Tạo nhãn phiên bản
  await createGitTag(pkg.version);

  // Kích hoạt quy trình triển khai
  await triggerDeploy(pkg.version);
}
```

## Ví dụ sử dụng

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Cấu hình các mô-đun cần xuất
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Cấu hình đóng gói
  pack: {
    // Kích hoạt chức năng đóng gói
    enable: true,

    // Xuất nhiều phiên bản cùng lúc
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Tùy chỉnh package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Chuẩn bị trước khi đóng gói
    onBefore: async (esmx, pkg) => {
      // Thêm các tệp cần thiết
      await fs.writeFile('dist/README.md', '# Your App\n\nHướng dẫn xuất mô-đun...');
      // Thực hiện kiểm tra kiểu
      await runTypeCheck();
    },

    // Xử lý sau khi đóng gói
    onAfter: async (esmx, pkg, file) => {
      // Phát hành lên nguồn npm riêng tư
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Hoặc triển khai lên máy chủ tĩnh
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```