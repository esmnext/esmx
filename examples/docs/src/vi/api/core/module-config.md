---
titleSuffix: Tham chiếu API cấu hình module của khung Esmx
description: Tài liệu chi tiết về giao diện cấu hình ModuleConfig của khung Esmx, bao gồm các quy tắc nhập/xuất module, cấu hình bí danh và quản lý phụ thuộc bên ngoài, giúp nhà phát triển hiểu sâu về hệ thống module hóa của khung.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, cấu hình module, nhập/xuất module, phụ thuộc bên ngoài, cấu hình bí danh, quản lý phụ thuộc, khung ứng dụng web
---

# ModuleConfig

ModuleConfig cung cấp chức năng cấu hình module cho khung Esmx, dùng để định nghĩa các quy tắc nhập/xuất module, cấu hình bí danh và phụ thuộc bên ngoài.

## Định nghĩa kiểu

### PathType

- **Định nghĩa kiểu**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Enum loại đường dẫn module:
- `npm`: Đại diện cho các phụ thuộc trong node_modules
- `root`: Đại diện cho các file trong thư mục gốc của dự án

### ModuleConfig

- **Định nghĩa kiểu**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Giao diện cấu hình module, dùng để định nghĩa cấu hình xuất, nhập và phụ thuộc bên ngoài của dịch vụ.

#### exports

Danh sách cấu hình xuất, dùng để xuất các đơn vị mã cụ thể trong dịch vụ (như component, hàm tiện ích, v.v.) ra ngoài dưới dạng ESM.

Hỗ trợ hai loại:
- `root:*`: Xuất file mã nguồn, ví dụ: `root:src/components/button.vue`
- `npm:*`: Xuất phụ thuộc bên thứ ba, ví dụ: `npm:vue`

Mỗi mục xuất bao gồm các thuộc tính sau:
- `name`: Đường dẫn xuất gốc, ví dụ: `npm:vue` hoặc `root:src/components`
- `type`: Loại đường dẫn (`npm` hoặc `root`)
- `importName`: Tên nhập, định dạng: `${serviceName}/${type}/${path}`
- `exportName`: Đường dẫn xuất, tương đối với thư mục gốc của dịch vụ
- `exportPath`: Đường dẫn file thực tế
- `externalName`: Tên phụ thuộc bên ngoài, dùng để định danh khi các dịch vụ khác nhập module này

#### links

Ánh xạ cấu hình phụ thuộc dịch vụ, dùng để cấu hình các dịch vụ khác (cục bộ hoặc từ xa) mà dịch vụ hiện tại phụ thuộc vào và đường dẫn cục bộ của chúng. Mỗi mục cấu hình có key là tên dịch vụ và value là đường dẫn cục bộ của dịch vụ đó.

Cách cài đặt khác nhau sẽ có cấu hình khác nhau:
- Cài đặt mã nguồn (Workspace, Git): Cần trỏ đến thư mục dist, vì cần sử dụng file đã được build
- Cài đặt gói (Link, máy chủ tĩnh, nguồn gói riêng, File): Trực tiếp trỏ đến thư mục gói, vì gói đã chứa file đã được build

#### imports

Ánh xạ phụ thuộc bên ngoài, cấu hình các phụ thuộc bên ngoài cần sử dụng, thường là các phụ thuộc từ module từ xa.

Mỗi phụ thuộc bao gồm các thuộc tính sau:
- `match`: Biểu thức chính quy dùng để khớp câu lệnh nhập
- `import`: Đường dẫn module thực tế

**Ví dụ**:
```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Cấu hình xuất
    exports: [
      'root:src/components/button.vue',  // Xuất file mã nguồn
      'root:src/utils/format.ts',
      'npm:vue',  // Xuất phụ thuộc bên thứ ba
      'npm:vue-router'
    ],

    // Cấu hình nhập
    links: {
      // Cách cài đặt mã nguồn: cần trỏ đến thư mục dist
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Cách cài đặt gói: trực tiếp trỏ đến thư mục gói
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Cấu hình phụ thuộc bên ngoài
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies EsmxOptions;
```

### ParsedModuleConfig

- **Định nghĩa kiểu**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Tên gói
     */
    name: string
    /**
     * Thư mục gốc của gói
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Cấu hình module đã được phân tích, chuyển đổi cấu hình module gốc sang định dạng chuẩn hóa nội bộ:

#### name
Tên dịch vụ hiện tại
- Dùng để định danh module và tạo đường dẫn nhập

#### root
Đường dẫn thư mục gốc của dịch vụ hiện tại
- Dùng để phân giải đường dẫn tương đối và lưu trữ sản phẩm build

#### exports
Danh sách cấu hình xuất
- `name`: Đường dẫn xuất gốc, ví dụ: 'npm:vue' hoặc 'root:src/components'
- `type`: Loại đường dẫn (npm hoặc root)
- `importName`: Tên nhập, định dạng: '${serviceName}/${type}/${path}'
- `exportName`: Đường dẫn xuất, tương đối với thư mục gốc của dịch vụ
- `exportPath`: Đường dẫn file thực tế
- `externalName`: Tên phụ thuộc bên ngoài, dùng để định danh khi các dịch vụ khác nhập module này

#### links
Danh sách cấu hình nhập
- `name`: Tên gói
- `root`: Thư mục gốc của gói

#### imports
Ánh xạ phụ thuộc bên ngoài
- Ánh xạ đường dẫn nhập module đến vị trí module thực tế
- `match`: Biểu thức chính quy dùng để khớp câu lệnh nhập
- `import`: Đường dẫn module thực tế