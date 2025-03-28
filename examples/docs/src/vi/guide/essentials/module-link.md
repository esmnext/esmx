---
titleSuffix: Cơ chế chia sẻ mã giữa các dịch vụ trong framework Esmx
description: Giới thiệu chi tiết cơ chế liên kết module trong framework Esmx, bao gồm chia sẻ mã giữa các dịch vụ, quản lý phụ thuộc và triển khai tiêu chuẩn ESM, giúp nhà phát triển xây dựng ứng dụng micro frontend hiệu quả.
head:
  - - meta
    - property: keywords
      content: Esmx, liên kết module, Module Link, ESM, chia sẻ mã, quản lý phụ thuộc, micro frontend
---

# Liên kết module

Framework Esmx cung cấp một cơ chế liên kết module hoàn chỉnh để quản lý việc chia sẻ mã và các mối quan hệ phụ thuộc giữa các dịch vụ. Cơ chế này được triển khai dựa trên tiêu chuẩn ESM (ECMAScript Module), hỗ trợ xuất và nhập module ở cấp độ mã nguồn, cùng với các chức năng quản lý phụ thuộc đầy đủ.

### Khái niệm cốt lõi

#### Xuất module
Xuất module là quá trình đưa các đơn vị mã cụ thể trong dịch vụ (như component, hàm tiện ích, v.v.) ra ngoài dưới định dạng ESM. Hỗ trợ hai loại xuất:
- **Xuất mã nguồn**: Xuất trực tiếp các file mã nguồn trong dự án
- **Xuất phụ thuộc**: Xuất các gói phụ thuộc bên thứ ba mà dự án sử dụng

#### Liên kết module
Nhập module là quá trình tham chiếu các đơn vị mã được xuất từ các dịch vụ khác. Hỗ trợ nhiều cách cài đặt:
- **Cài đặt mã nguồn**: Phù hợp cho môi trường phát triển, hỗ trợ sửa đổi và cập nhật nóng thời gian thực
- **Cài đặt gói phần mềm**: Phù hợp cho môi trường sản xuất, sử dụng trực tiếp sản phẩm đã build

## Xuất module

### Hướng dẫn cấu hình

Cấu hình các module cần xuất trong `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            // Xuất file mã nguồn
            'root:src/components/button.vue',  // Vue component
            'root:src/utils/format.ts',        // Hàm tiện ích
            // Xuất phụ thuộc bên thứ ba
            'npm:vue',                         // Vue framework
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies EsmxOptions;
```

Cấu hình xuất hỗ trợ hai loại:
- `root:*`: Xuất file mã nguồn, đường dẫn tương đối so với thư mục gốc dự án
- `npm:*`: Xuất phụ thuộc bên thứ ba, chỉ định trực tiếp tên gói

## Nhập module

### Hướng dẫn cấu hình

Cấu hình các module cần nhập trong `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // Cấu hình liên kết
        links: {
            // Cài đặt mã nguồn: trỏ đến thư mục sản phẩm build
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Cài đặt gói phần mềm: trỏ đến thư mục gói
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Cấu hình ánh xạ nhập
        imports: {
            // Sử dụng phụ thuộc từ module từ xa
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies EsmxOptions;
```

Giải thích các mục cấu hình:
1. **imports**: Cấu hình đường dẫn cục bộ cho module từ xa
   - Cài đặt mã nguồn: trỏ đến thư mục sản phẩm build (dist)
   - Cài đặt gói phần mềm: trỏ trực tiếp đến thư mục gói

2. **externals**: Cấu hình phụ thuộc bên ngoài
   - Dùng để chia sẻ phụ thuộc từ module từ xa
   - Tránh đóng gói lặp lại các phụ thuộc giống nhau
   - Hỗ trợ chia sẻ phụ thuộc giữa nhiều module

### Cách cài đặt

#### Cài đặt mã nguồn
Phù hợp cho môi trường phát triển, hỗ trợ sửa đổi và cập nhật nóng thời gian thực.

1. **Cách Workspace**
Khuyến nghị sử dụng trong dự án Monorepo:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Cách Link**
Dùng để debug phát triển cục bộ:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Cài đặt gói phần mềm
Phù hợp cho môi trường sản xuất, sử dụng trực tiếp sản phẩm đã build.

1. **NPM Registry**
Cài đặt qua npm registry:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Máy chủ tĩnh**
Cài đặt qua giao thức HTTP/HTTPS:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Đóng gói phần mềm

### Hướng dẫn cấu hình

Cấu hình các tùy chọn build trong `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    // Cấu hình xuất module
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Cấu hình build
    pack: {
        // Bật build
        enable: true,

        // Cấu hình đầu ra
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Tùy chỉnh package.json
        packageJson: async (esmx, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Xử lý trước khi build
        onBefore: async (esmx, pkg) => {
            // Tạo khai báo kiểu
            // Chạy test case
            // Cập nhật tài liệu, v.v.
        },

        // Xử lý sau khi build
        onAfter: async (esmx, pkg, file) => {
            // Tải lên CDN
            // Phát hành lên npm repository
            // Triển khai lên môi trường test, v.v.
        }
    }
} satisfies EsmxOptions;
```

### Sản phẩm build

```
your-app-name.tgz
├── package.json        # Thông tin gói
├── index.js            # Đầu vào môi trường sản xuất
├── server/             # Tài nguyên phía server
│   └── manifest.json   # Ánh xạ tài nguyên phía server
├── node/               # Thời gian chạy Node.js
└── client/             # Tài nguyên phía client
    └── manifest.json   # Ánh xạ tài nguyên phía client
```

### Quy trình phát hành

```bash
# 1. Build phiên bản sản xuất
esmx build

# 2. Phát hành lên npm
npm publish dist/versions/your-app-name.tgz
```