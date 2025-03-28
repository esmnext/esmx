---
titleSuffix: Tài liệu tham khảo API lớp lõi framework
description: Tài liệu chi tiết về API lớp lõi của framework Esmx, bao gồm quản lý vòng đời ứng dụng, xử lý tài nguyên tĩnh và khả năng render phía máy chủ, giúp nhà phát triển hiểu sâu về các chức năng cốt lõi của framework.
head:
  - - meta
    - property: keywords
      content: Esmx, API, quản lý vòng đời, tài nguyên tĩnh, render phía máy chủ, Rspack, Web application framework
---

# Esmx

## Giới thiệu

Esmx là một framework ứng dụng web hiệu suất cao dựa trên Rspack, cung cấp đầy đủ các khả năng quản lý vòng đời ứng dụng, xử lý tài nguyên tĩnh và render phía máy chủ.

## Định nghĩa kiểu

### RuntimeTarget

- **Định nghĩa kiểu**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Loại môi trường thời gian chạy ứng dụng:
- `client`: Chạy trong môi trường trình duyệt, hỗ trợ thao tác DOM và API trình duyệt
- `server`: Chạy trong môi trường Node.js, hỗ trợ hệ thống tệp và các chức năng phía máy chủ

### ImportMap

- **Định nghĩa kiểu**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

Loại ánh xạ nhập khẩu module ES.

#### SpecifierMap

- **Định nghĩa kiểu**:
```ts
type SpecifierMap = Record<string, string>
```

Loại ánh xạ định danh module, dùng để định nghĩa mối quan hệ ánh xạ đường dẫn nhập khẩu module.

#### ScopesMap

- **Định nghĩa kiểu**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Loại ánh xạ phạm vi, dùng để định nghĩa mối quan hệ ánh xạ nhập khẩu module trong phạm vi cụ thể.

### COMMAND

- **Định nghĩa kiểu**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Loại enum lệnh:
- `dev`: Lệnh môi trường phát triển, khởi động máy chủ phát triển và hỗ trợ cập nhật nóng
- `build`: Lệnh build, tạo ra các sản phẩm build cho môi trường sản xuất
- `preview`: Lệnh xem trước, khởi động máy chủ xem trước cục bộ
- `start`: Lệnh khởi động, chạy máy chủ môi trường sản xuất

## Tùy chọn instance

Định nghĩa các tùy chọn cấu hình cốt lõi của framework Esmx.

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

- **Loại**: `string`
- **Mặc định**: `process.cwd()`

Đường dẫn thư mục gốc của dự án. Có thể là đường dẫn tuyệt đối hoặc tương đối, đường dẫn tương đối được phân giải dựa trên thư mục làm việc hiện tại.

#### isProd

- **Loại**: `boolean`
- **Mặc định**: `process.env.NODE_ENV === 'production'`

Định danh môi trường.
- `true`: Môi trường sản xuất
- `false`: Môi trường phát triển

#### basePathPlaceholder

- **Loại**: `string | false`
- **Mặc định**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Cấu hình trình giữ chỗ đường dẫn cơ sở. Dùng để thay thế động đường dẫn cơ sở của tài nguyên trong thời gian chạy. Đặt thành `false` để vô hiệu hóa tính năng này.

#### modules

- **Loại**: `ModuleConfig`

Tùy chọn cấu hình module. Dùng để cấu hình các quy tắc phân giải module của dự án, bao gồm bí danh module, các phụ thuộc bên ngoài, v.v.

#### packs

- **Loại**: `PackConfig`

Tùy chọn cấu hình đóng gói. Dùng để đóng gói các sản phẩm build thành các gói phần mềm .tgz npm tiêu chuẩn.

#### devApp

- **Loại**: `(esmx: Esmx) => Promise<App>`

Hàm tạo ứng dụng môi trường phát triển. Chỉ được sử dụng trong môi trường phát triển, dùng để tạo instance ứng dụng cho máy chủ phát triển.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Tùy chỉnh cấu hình Rspack
        }
      })
    )
  }
}
```

#### server

- **Loại**: `(esmx: Esmx) => Promise<void>`

Hàm cấu hình khởi động máy chủ. Dùng để cấu hình và khởi động máy chủ HTTP, có thể sử dụng trong cả môi trường phát triển và sản xuất.

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

- **Loại**: `(esmx: Esmx) => Promise<void>`

Hàm xử lý hậu build. Được thực thi sau khi dự án build xong, có thể dùng để:
- Thực hiện xử lý tài nguyên bổ sung
- Thực hiện các thao tác triển khai
- Tạo các tệp tĩnh
- Gửi thông báo build

## Thuộc tính instance

### name

- **Loại**: `string`
- **Chỉ đọc**: `true`

Tên module hiện tại, được lấy từ cấu hình module.

### varName

- **Loại**: `string`
- **Chỉ đọc**: `true`

Tên biến JavaScript hợp lệ được tạo dựa trên tên module.

### root

- **Loại**: `string`
- **Chỉ đọc**: `true`

Đường dẫn tuyệt đối của thư mục gốc dự án. Nếu `root` được cấu hình là đường dẫn tương đối, nó sẽ được phân giải dựa trên thư mục làm việc hiện tại.

### isProd

- **Loại**: `boolean`
- **Chỉ đọc**: `true`

Xác định xem hiện tại có phải là môi trường sản xuất hay không. Ưu tiên sử dụng `isProd` trong cấu hình, nếu không được cấu hình thì sẽ xác định dựa trên `process.env.NODE_ENV`.

### basePath

- **Loại**: `string`
- **Chỉ đọc**: `true`
- **Ném ra**: `NotReadyError` - Khi framework chưa được khởi tạo

Lấy đường dẫn cơ sở của module bắt đầu và kết thúc bằng dấu gạch chéo. Định dạng trả về là `/${name}/`, trong đó name được lấy từ cấu hình module.

### basePathPlaceholder

- **Loại**: `string`
- **Chỉ đọc**: `true`

Lấy trình giữ chỗ đường dẫn cơ sở dùng để thay thế động trong thời gian chạy. Có thể vô hiệu hóa thông qua cấu hình.

### middleware

- **Loại**: `Middleware`
- **Chỉ đọc**: `true`

Lấy middleware xử lý tài nguyên tĩnh. Cung cấp các triển khai khác nhau tùy theo môi trường:
- Môi trường phát triển: Hỗ trợ biên dịch mã nguồn thời gian thực, cập nhật nóng
- Môi trường sản xuất: Hỗ trợ bộ nhớ đệm dài hạn cho tài nguyên tĩnh

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **Loại**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **Chỉ đọc**: `true`

Lấy hàm render phía máy chủ. Cung cấp các triển khai khác nhau tùy theo môi trường:
- Môi trường phát triển: Hỗ trợ cập nhật nóng và xem trước thời gian thực
- Môi trường sản xuất: Cung cấp hiệu suất render tối ưu

```ts
// Cách sử dụng cơ bản
const rc = await esmx.render({
  params: { url: req.url }
});

// Cấu hình nâng cao
const rc = await esmx.render({
  base: '',                    // Đường dẫn cơ sở
  importmapMode: 'inline',     // Chế độ ánh xạ nhập khẩu
  entryName: 'default',        // Điểm vào render
  params: {
    url: req.url,
    state: { user: 'admin' }   // Dữ liệu trạng thái
  }
});
```

### COMMAND

- **Loại**: `typeof COMMAND`
- **Chỉ đọc**: `true`

Lấy định nghĩa loại enum lệnh.

### moduleConfig

- **Loại**: `ParsedModuleConfig`
- **Chỉ đọc**: `true`
- **Ném ra**: `NotReadyError` - Khi framework chưa được khởi tạo

Lấy thông tin cấu hình đầy đủ của module hiện tại, bao gồm các quy tắc phân giải module, cấu hình bí danh, v.v.

### packConfig

- **Loại**: `ParsedPackConfig`
- **Chỉ đọc**: `true`
- **Ném ra**: `NotReadyError` - Khi framework chưa được khởi tạo

Lấy cấu hình liên quan đến đóng gói của module hiện tại, bao gồm đường dẫn đầu ra, xử lý package.json, v.v.

## Phương thức instance

### constructor()

- **Tham số**: 
  - `options?: EsmxOptions` - Tùy chọn cấu hình framework
- **Giá trị trả về**: `Esmx`

Tạo instance framework Esmx.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Tham số**: `command: COMMAND`
- **Giá trị trả về**: `Promise<boolean>`
- **Ném ra**:
  - `Error`: Khi khởi tạo lại
  - `NotReadyError`: Khi truy cập instance chưa được khởi tạo

Khởi tạo instance framework Esmx. Thực hiện các quy trình khởi tạo cốt lõi sau:

1. Phân giải cấu hình dự án (package.json, cấu hình module, cấu hình đóng gói, v.v.)
2. Tạo instance ứng dụng (môi trường phát triển hoặc sản xuất)
3. Thực thi các phương thức vòng đời tương ứng dựa trên lệnh

::: warning Lưu ý
- Ném lỗi khi khởi tạo lại
- Ném `NotReadyError` khi truy cập instance chưa được khởi tạo

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Giá trị trả về**: `Promise<boolean>`

Hủy instance framework Esmx, thực hiện các thao tác dọn dẹp tài nguyên và đóng kết nối. Chủ yếu dùng để:
- Đóng máy chủ phát triển
- Dọn dẹp các tệp tạm thời và bộ nhớ đệm
- Giải phóng tài nguyên hệ thống

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Giá trị trả về**: `Promise<boolean>`

Thực thi quy trình build ứng dụng, bao gồm:
- Biên dịch mã nguồn
- Tạo ra các sản phẩm build cho môi trường sản xuất
- Tối ưu hóa và nén mã
- Tạo danh sách tài nguyên

::: warning Lưu ý
Ném `NotReadyError` khi gọi mà instance framework chưa được khởi tạo
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Tạo HTML tĩnh sau khi build
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

- **Giá trị trả về**: `Promise<void>`
- **Ném ra**: `NotReadyError` - Khi framework chưa được khởi tạo

Khởi động máy chủ HTTP và cấu hình instance máy chủ. Được gọi trong các vòng đời sau:
- Môi trường phát triển (dev): Khởi động máy chủ phát triển, cung cấp cập nhật nóng
- Môi trường sản xuất (start): Khởi động máy chủ sản xuất, cung cấp hiệu suất cấp sản xuất

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Xử lý tài nguyên tĩnh
      esmx.middleware(req, res, async () => {
        // Render phía máy chủ
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

- **Giá trị trả về**: `Promise<boolean>`

Thực thi logic xử lý hậu build, dùng để:
- Tạo các tệp HTML tĩnh
- Xử lý các sản phẩm build
- Thực hiện các tác vụ triển khai
- Gửi thông báo build

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Tạo HTML tĩnh cho nhiều trang
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

Phân giải đường dẫn dự án, chuyển đổi đường dẫn tương đối thành đường dẫn tuyệt đối.

- **Tham số**:
  - `projectPath: ProjectPath` - Loại đường dẫn dự án
  - `...args: string[]` - Các đoạn đường dẫn
- **Giá trị trả về**: `string` - Đường dẫn tuyệt đối đã phân giải

- **Ví dụ**:
```ts
// Phân giải đường dẫn tài nguyên tĩnh
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Ghi đồng bộ nội dung tệp.

- **Tham số**