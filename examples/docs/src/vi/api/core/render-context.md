---
titleSuffix: Tài liệu tham khảo API RenderContext của framework Esmx
description: Tài liệu chi tiết về lớp RenderContext cốt lõi của framework Esmx, bao gồm các chức năng như điều khiển render, quản lý tài nguyên, đồng bộ trạng thái và điều khiển định tuyến, giúp nhà phát triển thực hiện render phía máy chủ hiệu quả.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, render phía máy chủ, render context, đồng bộ trạng thái, quản lý tài nguyên, framework ứng dụng web
---

# RenderContext

RenderContext là lớp cốt lõi trong framework Esmx, chịu trách nhiệm quản lý vòng đời hoàn chỉnh của render phía máy chủ (SSR). Nó cung cấp một bộ API hoàn chỉnh để xử lý các tác vụ chính như render context, quản lý tài nguyên, đồng bộ trạng thái:

- **Điều khiển render**: Quản lý quy trình render phía máy chủ, hỗ trợ các tình huống như render nhiều entry, render có điều kiện
- **Quản lý tài nguyên**: Thu thập và chèn thông minh các tài nguyên tĩnh như JS, CSS để tối ưu hiệu suất tải
- **Đồng bộ trạng thái**: Xử lý tuần tự hóa trạng thái phía máy chủ, đảm bảo client kích hoạt chính xác (hydration)
- **Điều khiển định tuyến**: Hỗ trợ các tính năng nâng cao như chuyển hướng phía máy chủ, thiết lập mã trạng thái

## Định nghĩa kiểu

### ServerRenderHandle

Định nghĩa kiểu cho hàm xử lý render phía máy chủ.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

Hàm xử lý render phía máy chủ là một hàm đồng bộ hoặc bất đồng bộ, nhận một thể hiện của RenderContext làm tham số, dùng để xử lý logic render phía máy chủ.

```ts title="entry.node.ts"
// 1. Hàm xử lý bất đồng bộ
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Hàm xử lý đồng bộ
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Định nghĩa kiểu cho danh sách các tệp tài nguyên được thu thập trong quá trình render.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: Danh sách các tệp JavaScript
- **css**: Danh sách các tệp stylesheet
- **modulepreload**: Danh sách các module ESM cần preload
- **resources**: Danh sách các tệp tài nguyên khác (hình ảnh, font, v.v.)

```ts
// Ví dụ danh sách tệp tài nguyên
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

Định nghĩa chế độ tạo importmap.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Nội dung importmap được nhúng trực tiếp vào HTML, phù hợp với các tình huống:
  - Cần giảm số lượng yêu cầu HTTP
  - Nội dung importmap nhỏ
  - Yêu cầu hiệu suất tải trang đầu tiên cao
- `js`: Nội dung importmap được tạo thành một tệp JS độc lập, phù hợp với các tình huống:
  - Nội dung importmap lớn
  - Cần tận dụng cơ chế cache của trình duyệt
  - Nhiều trang chia sẻ cùng một importmap

Lớp render context, chịu trách nhiệm quản lý tài nguyên và tạo HTML trong quá trình render phía máy chủ (SSR).
## Tùy chọn thể hiện

Định nghĩa các tùy chọn cấu hình cho render context.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Kiểu**: `string`
- **Mặc định**: `''`

Đường dẫn cơ sở cho các tài nguyên tĩnh.
- Tất cả các tài nguyên tĩnh (JS, CSS, hình ảnh, v.v.) sẽ được tải dựa trên đường dẫn này
- Hỗ trợ cấu hình động trong thời gian chạy, không cần build lại
- Thường được sử dụng trong các tình huống như trang web đa ngôn ngữ, ứng dụng micro frontend

#### entryName

- **Kiểu**: `string`
- **Mặc định**: `'default'`

Tên hàm entry render phía máy chủ. Dùng để chỉ định hàm entry được sử dụng khi render phía máy chủ, khi một module xuất ra nhiều hàm render.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Logic render cho thiết bị di động
};

export const desktop = async (rc: RenderContext) => {
  // Logic render cho máy tính để bàn
};
```

#### params

- **Kiểu**: `Record<string, any>`
- **Mặc định**: `{}`

Các tham số render. Có thể truyền bất kỳ loại tham số nào cho hàm render, thường được sử dụng để truyền thông tin yêu cầu (URL, tham số query, v.v.).

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

- **Kiểu**: `'inline' | 'js'`
- **Mặc định**: `'inline'`

Chế độ tạo import map:
- `inline`: Nội dung importmap được nhúng trực tiếp vào HTML
- `js`: Nội dung importmap được tạo thành một tệp JS độc lập


## Thuộc tính thể hiện

### esmx

- **Kiểu**: `Esmx`
- **Chỉ đọc**: `true`

Tham chiếu đến thể hiện Esmx. Dùng để truy cập các chức năng và thông tin cấu hình cốt lõi của framework.

### redirect

- **Kiểu**: `string | null`
- **Mặc định**: `null`

Địa chỉ chuyển hướng. Khi được thiết lập, máy chủ có thể thực hiện chuyển hướng HTTP dựa trên giá trị này, thường được sử dụng trong các tình huống như xác thực đăng nhập, kiểm soát quyền truy cập.

```ts title="entry.node.ts"
// Ví dụ xác thực đăng nhập
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Tiếp tục render trang...
};

// Ví dụ kiểm soát quyền truy cập
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Tiếp tục render trang...
};
```

### status

- **Kiểu**: `number | null`
- **Mặc định**: `null`

Mã trạng thái HTTP phản hồi. Có thể thiết lập bất kỳ mã trạng thái HTTP hợp lệ nào, thường được sử dụng trong các tình huống xử lý lỗi, chuyển hướng.

```ts title="entry.node.ts"
// Ví dụ xử lý lỗi 404
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Render trang 404...
    return;
  }
  // Tiếp tục render trang...
};

// Ví dụ chuyển hướng tạm thời
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Chuyển hướng tạm thời, giữ nguyên phương thức yêu cầu
    return;
  }
  // Tiếp tục render trang...
};
```

### html

- **Kiểu**: `string`
- **Mặc định**: `''`

Nội dung HTML. Dùng để thiết lập và lấy nội dung HTML cuối cùng được tạo ra, khi thiết lập sẽ tự động xử lý các placeholder đường dẫn cơ sở.

```ts title="entry.node.ts"
// Cách sử dụng cơ bản
export default async (rc: RenderContext) => {
  // Thiết lập nội dung HTML
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

// Đường dẫn cơ sở động
const rc = await esmx.render({
  base: '/app',  // Thiết lập đường dẫn cơ sở
  params: { url: req.url }
});

// Các placeholder trong HTML sẽ được thay thế tự động:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Thay thế thành:
// /app/your-app-name/css/style.css
```

### base

- **Kiểu**: `string`
- **Chỉ đọc**: `true`
- **Mặc định**: `''`

Đường dẫn cơ sở cho các tài nguyên tĩnh. Tất cả các tài nguyên tĩnh (JS, CSS, hình ảnh, v.v.) sẽ được tải dựa trên đường dẫn này, hỗ trợ cấu hình động trong thời gian chạy.

```ts
// Cách sử dụng cơ bản
const rc = await esmx.render({
  base: '/esmx',  // Thiết lập đường dẫn cơ sở
  params: { url: req.url }
});

// Ví dụ trang web đa ngôn ngữ
const rc = await esmx.render({
  base: '/cn',  // Trang web tiếng Trung
  params: { lang: 'zh-CN' }
});

// Ví dụ ứng dụng micro frontend
const rc = await esmx.render({
  base: '/app1',  // Ứng dụng con 1
  params: { appId: 1 }
});
```

### entryName

- **Kiểu**: `string`
- **Chỉ đọc**: `true`
- **Mặc định**: `'default'`

Tên hàm entry render phía máy chủ. Dùng để chọn hàm render từ entry.server.ts.

```ts title="entry.node.ts"
// Hàm entry mặc định
export default async (rc: RenderContext) => {
  // Logic render mặc định
};

// Nhiều hàm entry
export const mobile = async (rc: RenderContext) => {
  // Logic render cho thiết bị di động
};

export const desktop = async (rc: RenderContext) => {
  // Logic render cho máy tính để bàn
};

// Chọn hàm entry dựa trên loại thiết bị
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Kiểu**: `Record<string, any>`
- **Chỉ đọc**: `true`
- **Mặc định**: `{}`

Các tham số render. Có thể truyền và truy cập các tham số trong quá trình render phía máy chủ, thường được sử dụng để truyền thông tin yêu cầu, cấu hình trang.

```ts
// Cách sử dụng cơ bản - Truyền URL và cài đặt ngôn ngữ
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// Cấu hình trang - Thiết lập chủ đề và bố cục
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Cấu hình môi trường - Chèn địa chỉ API
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Kiểu**: `Set<ImportMeta>`

Tập hợp thu thập phụ thuộc module. Tự động theo dõi và ghi lại các phụ thuộc module trong quá trình render component, chỉ thu thập các tài nguyên thực sự được sử dụng khi render trang hiện tại.

```ts
// Cách sử dụng cơ bản
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Tự động thu thập phụ thuộc module trong quá trình render
  // Framework sẽ tự động gọi context.importMetaSet.add(import.meta) khi render component
  // Nhà phát triển không cần xử lý thu thập phụ thuộc thủ công
  return '<div id="app">Hello World</div>';
};

// Ví dụ sử dụng
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Kiểu**: `RenderFiles`

Danh sách các tệp tài nguyên:
- js: Danh sách các tệp JavaScript
- css: Danh sách các tệp stylesheet
- modulepreload: Danh sách các module ESM cần preload
- resources: Danh sách các tệp tài nguyên khác (hình ảnh, font, v.v.)

```ts
// Thu thập tài nguyên
await rc.commit();

// Chèn tài nguyên
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Preload tài nguyên -->
    ${rc.preload()}
    <!-- Chèn stylesheet -->
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

- **Kiểu**: `'inline' | 'js'`
- **Mặc định**: `'inline'`

Chế độ tạo import map:
- `inline`: Nội dung importmap được nhúng trực tiếp vào HTML
- `js`: Nội dung importmap được tạo thành một tệp JS độc lập


## Phương thức thể hiện

### serialize()

- **Tham số**: 
  - `input: any` - Dữ liệu cần tuần tự hóa
  - `options?: serialize.SerializeJSOptions` - Tùy chọn tuần tự hóa
- **Trả về**: `string`

Tuần tự hóa đối tượng JavaScript thành chuỗi. Dùng để tuần tự hóa dữ liệu trạng thái trong quá trình render phía máy chủ, đảm bảo dữ liệu có thể được nhúng an toàn vào HTML.

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

- **Tham số**: 
  - `varName: string` - Tên biến
  - `data: Record<string, any>` - Dữ liệu trạng thái
- **Trả về**: `string`

Tuần tự hóa và chèn dữ liệu trạng thái vào HTML. Sử dụng phương pháp tuần tự hóa an toàn để xử lý dữ liệu, hỗ trợ các cấu trúc dữ liệu phức tạp.

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <