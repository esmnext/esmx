---
titleSuffix: Hướng dẫn ánh xạ đường dẫn nhập module trong Esmx
description: Hướng dẫn chi tiết về cơ chế bí danh đường dẫn trong Esmx, bao gồm các tính năng như đơn giản hóa đường dẫn nhập, tránh lồng ghép sâu, an toàn kiểu và tối ưu hóa phân giải module, giúp nhà phát triển nâng cao khả năng bảo trì mã.
head:
  - - meta
    - property: keywords
      content: Esmx, Bí danh đường dẫn, Path Alias, TypeScript, Nhập module, Ánh xạ đường dẫn, Bảo trì mã
---

# Bí danh đường dẫn

Bí danh đường dẫn (Path Alias) là một cơ chế ánh xạ đường dẫn nhập module, cho phép nhà phát triển sử dụng các định danh ngắn gọn và có ý nghĩa để thay thế cho đường dẫn module đầy đủ. Trong Esmx, cơ chế bí danh đường dẫn có các ưu điểm sau:

- **Đơn giản hóa đường dẫn nhập**: Sử dụng bí danh có ý nghĩa thay thế cho đường dẫn tương đối dài, cải thiện khả năng đọc mã
- **Tránh lồng ghép sâu**: Loại bỏ khó khăn bảo trì do tham chiếu thư mục nhiều cấp (ví dụ: `../../../../`)
- **An toàn kiểu**: Tích hợp hoàn toàn với hệ thống kiểu của TypeScript, cung cấp bổ sung mã và kiểm tra kiểu
- **Tối ưu hóa phân giải module**: Cải thiện hiệu suất phân giải module thông qua ánh xạ đường dẫn được định nghĩa trước

## Cơ chế bí danh mặc định

Esmx sử dụng cơ chế bí danh tự động dựa trên tên dịch vụ (Service Name), thiết kế theo quy ước ưu tiên hơn cấu hình này có các đặc điểm sau:

- **Cấu hình tự động**: Tự động tạo bí danh dựa trên trường `name` trong `package.json`, không cần cấu hình thủ công
- **Quy chuẩn thống nhất**: Đảm bảo tất cả các module dịch vụ tuân theo quy tắc đặt tên và tham chiếu nhất quán
- **Hỗ trợ kiểu**: Kết hợp với lệnh `npm run build:dts`, tự động tạo tệp khai báo kiểu, thực hiện suy luận kiểu giữa các dịch vụ
- **Khả năng dự đoán**: Có thể suy ra đường dẫn tham chiếu module thông qua tên dịch vụ, giảm chi phí bảo trì

## Hướng dẫn cấu hình

### Cấu hình package.json

Trong `package.json`, sử dụng trường `name` để định nghĩa tên dịch vụ, tên này sẽ được sử dụng làm tiền tố bí danh mặc định của dịch vụ:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### Cấu hình tsconfig.json

Để TypeScript có thể phân giải chính xác đường dẫn bí danh, cần cấu hình ánh xạ `paths` trong `tsconfig.json`:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## Ví dụ sử dụng

### Nhập module nội bộ dịch vụ

```ts
// Sử dụng bí danh để nhập
import { MyComponent } from 'your-app-name/src/components';

// Nhập tương đương bằng đường dẫn tương đối
import { MyComponent } from '../components';
```

### Nhập module từ dịch vụ khác

```ts
// Nhập component từ dịch vụ khác
import { SharedComponent } from 'other-service/src/components';

// Nhập hàm tiện ích từ dịch vụ khác
import { utils } from 'other-service/src/utils';
```

::: tip Thực hành tốt nhất
- Ưu tiên sử dụng đường dẫn bí danh thay vì đường dẫn tương đối
- Duy trì tính ngữ nghĩa và nhất quán của đường dẫn bí danh
- Tránh sử dụng quá nhiều cấp thư mục trong đường dẫn bí danh

:::

``` ts
// Nhập component
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// Nhập hàm tiện ích
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// Nhập định nghĩa kiểu
import type { UserInfo } from 'your-app-name/src/types';
```

### Nhập liên dịch vụ

Khi đã cấu hình liên kết module (Module Link), có thể sử dụng cách tương tự để nhập module từ dịch vụ khác:

```ts
// Nhập component từ dịch vụ từ xa
import { Header } from 'remote-service/src/components';

// Nhập hàm tiện ích từ dịch vụ từ xa
import { logger } from 'remote-service/src/utils';
```

### Bí danh tùy chỉnh

Đối với các gói bên thứ ba hoặc các tình huống đặc biệt, có thể tùy chỉnh bí danh thông qua tệp cấu hình Esmx:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Cấu hình phiên bản build cụ thể cho Vue
                        'vue$': 'vue/dist/vue.esm.js',
                        // Cấu hình bí danh ngắn cho các thư mục thường dùng
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning Lưu ý
1. Đối với các module nghiệp vụ, nên luôn sử dụng cơ chế bí danh mặc định để duy trì tính nhất quán của dự án
2. Bí danh tùy chỉnh chủ yếu được sử dụng để xử lý các yêu cầu đặc biệt của gói bên thứ ba hoặc tối ưu hóa trải nghiệm phát triển
3. Sử dụng quá nhiều bí danh tùy chỉnh có thể ảnh hưởng đến khả năng bảo trì mã và tối ưu hóa build

:::