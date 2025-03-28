---
titleSuffix: Hướng dẫn Cấu trúc và Quy chuẩn Dự án Esmx Framework
description: Hướng dẫn chi tiết về cấu trúc dự án tiêu chuẩn, quy chuẩn tệp tin đầu vào và cấu hình của Esmx framework, giúp nhà phát triển xây dựng ứng dụng SSR chuẩn hóa và dễ bảo trì.
head:
  - - meta
    - property: keywords
      content: Esmx, Cấu trúc dự án, Tệp tin đầu vào, Quy chuẩn cấu hình, SSR framework, TypeScript, Quy chuẩn dự án, Tiêu chuẩn phát triển
---

# Quy chuẩn Tiêu chuẩn

Esmx là một framework SSR hiện đại, sử dụng cấu trúc dự án tiêu chuẩn và cơ chế phân giải đường dẫn để đảm bảo tính nhất quán và khả năng bảo trì của dự án trong cả môi trường phát triển và sản xuất.

## Quy chuẩn Cấu trúc Dự án

### Cấu trúc Thư mục Tiêu chuẩn

```txt
root
│─ dist                  # Thư mục đầu ra sau biên dịch
│  ├─ package.json       # Cấu hình gói phần mềm sau biên dịch
│  ├─ server             # Đầu ra biên dịch phía máy chủ
│  │  └─ manifest.json   # Đầu ra danh sách biên dịch, dùng để tạo importmap
│  ├─ node               # Đầu ra biên dịch chương trình máy chủ Node
│  ├─ client             # Đầu ra biên dịch phía máy khách
│  │  ├─ versions        # Thư mục lưu trữ phiên bản
│  │  │  └─ latest.tgz   # Lưu trữ thư mục dist, cung cấp gói phần mềm để phân phối
│  │  └─ manifest.json   # Đầu ra danh sách biên dịch, dùng để tạo importmap
│  └─ src                # Các tệp tin được tạo bởi tsc
├─ src
│  ├─ entry.server.ts    # Điểm đầu vào ứng dụng phía máy chủ
│  ├─ entry.client.ts    # Điểm đầu vào ứng dụng phía máy khách
│  └─ entry.node.ts      # Điểm đầu vào chương trình máy chủ Node
├─ tsconfig.json         # Cấu hình TypeScript
└─ package.json          # Cấu hình gói phần mềm
```

::: tip Kiến thức Mở rộng
- `esmx.name` được lấy từ trường `name` trong `package.json`
- `dist/package.json` được lấy từ `package.json` ở thư mục gốc
- Chỉ khi đặt `packs.enable` thành `true`, thư mục `dist` mới được lưu trữ

:::

## Quy chuẩn Tệp tin Đầu vào

### entry.client.ts
Tệp tin đầu vào phía máy khách chịu trách nhiệm:
- **Khởi tạo ứng dụng**: Cấu hình các thiết lập cơ bản cho ứng dụng máy khách
- **Quản lý định tuyến**: Xử lý định tuyến và điều hướng phía máy khách
- **Quản lý trạng thái**: Thực hiện lưu trữ và cập nhật trạng thái máy khách
- **Xử lý tương tác**: Quản lý sự kiện người dùng và tương tác giao diện

### entry.server.ts
Tệp tin đầu vào phía máy chủ chịu trách nhiệm:
- **Kết xuất phía máy chủ**: Thực hiện quy trình kết xuất SSR
- **Tạo HTML**: Xây dựng cấu trúc trang ban đầu
- **Lấy dữ liệu trước**: Xử lý việc lấy dữ liệu phía máy chủ
- **Tiêm trạng thái**: Truyền trạng thái từ máy chủ sang máy khách
- **Tối ưu SEO**: Đảm bảo tối ưu hóa công cụ tìm kiếm cho trang

### entry.node.ts
Tệp tin đầu vào máy chủ Node.js chịu trách nhiệm:
- **Cấu hình máy chủ**: Thiết lập các tham số máy chủ HTTP
- **Xử lý định tuyến**: Quản lý các quy tắc định tuyến phía máy chủ
- **Tích hợp middleware**: Cấu hình các middleware của máy chủ
- **Quản lý môi trường**: Xử lý biến môi trường và cấu hình
- **Xử lý yêu cầu và phản hồi**: Xử lý các yêu cầu và phản hồi HTTP

## Quy chuẩn Cấu hình

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