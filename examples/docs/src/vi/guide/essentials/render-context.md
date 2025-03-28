---
titleSuffix: Cơ chế lõi render phía máy chủ của framework Esmx
description: Giới thiệu chi tiết cơ chế RenderContext (Ngữ cảnh Render) trong framework Esmx, bao gồm quản lý tài nguyên, tạo HTML và hệ thống module ESM, giúp nhà phát triển hiểu và sử dụng tính năng render phía máy chủ.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, Render phía máy chủ, ESM, Quản lý tài nguyên
---

# Ngữ cảnh Render (RenderContext)

RenderContext là một lớp lõi trong framework Esmx, chịu trách nhiệm chính trong việc quản lý tài nguyên và tạo HTML trong quá trình render phía máy chủ (SSR). Nó có các đặc điểm chính sau:

1. **Hệ thống module dựa trên ESM**
   - Sử dụng tiêu chuẩn ECMAScript Modules hiện đại
   - Hỗ trợ import/export module nguyên bản
   - Thực hiện phân tách mã và tải theo yêu cầu tốt hơn

2. **Thu thập phụ thuộc thông minh**
   - Thu thập phụ thuộc dựa trên đường dẫn render thực tế
   - Tránh tải các tài nguyên không cần thiết
   - Hỗ trợ component bất đồng bộ và import động

3. **Chèn tài nguyên chính xác**
   - Kiểm soát chặt chẽ thứ tự tải tài nguyên
   - Tối ưu hiệu suất tải trang đầu tiên
   - Đảm bảo độ tin cậy của quá trình kích hoạt phía máy khách (Hydration)

4. **Cơ chế cấu hình linh hoạt**
   - Hỗ trợ cấu hình đường dẫn cơ sở động
   - Cung cấp nhiều chế độ ánh xạ import
   - Phù hợp với các kịch bản triển khai khác nhau

## Cách sử dụng

Trong framework Esmx, nhà phát triển thường không cần tạo trực tiếp instance của RenderContext mà thông qua phương thức `esmx.render()` để lấy instance:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Xử lý tệp tĩnh
        esmx.middleware(req, res, async () => {
            // Lấy instance RenderContext thông qua esmx.render()
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // Phản hồi nội dung HTML
            res.end(rc.html);
        });
    });
}
```

## Chức năng chính

### Thu thập phụ thuộc

RenderContext triển khai một cơ chế thu thập phụ thuộc thông minh, dựa trên component được render thực tế để thu thập phụ thuộc động thay vì tải trước tất cả các tài nguyên có thể sử dụng:

#### Thu thập theo yêu cầu
- Tự động theo dõi và ghi lại phụ thuộc module trong quá trình render component
- Chỉ thu thập các tài nguyên CSS, JavaScript thực sự được sử dụng khi render trang hiện tại
- Ghi lại chính xác mối quan hệ phụ thuộc module của từng component thông qua `importMetaSet`
- Hỗ trợ thu thập phụ thuộc cho component bất đồng bộ và import động

#### Xử lý tự động
- Nhà phát triển không cần quản lý thủ công quá trình thu thập phụ thuộc
- Framework tự động thu thập thông tin phụ thuộc khi render component
- Xử lý tất cả tài nguyên đã thu thập thông qua phương thức `commit()`
- Tự động xử lý các vấn đề phụ thuộc vòng và phụ thuộc trùng lặp

#### Tối ưu hiệu suất
- Tránh tải các module không sử dụng, giảm đáng kể thời gian tải trang đầu tiên
- Kiểm soát chính xác thứ tự tải tài nguyên, tối ưu hiệu suất render trang
- Tự động tạo ánh xạ import (Import Map) tối ưu
- Hỗ trợ chiến lược tải trước và tải theo yêu cầu tài nguyên

### Chèn tài nguyên

RenderContext cung cấp nhiều phương thức để chèn các loại tài nguyên khác nhau, mỗi phương thức đều được thiết kế cẩn thận để tối ưu hiệu suất tải tài nguyên:

- `preload()`: Tải trước tài nguyên CSS và JS, hỗ trợ cấu hình ưu tiên
- `css()`: Chèn stylesheet cho trang đầu tiên, hỗ trợ trích xuất CSS quan trọng
- `importmap()`: Chèn ánh xạ import module, hỗ trợ phân giải đường dẫn động
- `moduleEntry()`: Chèn module entry phía máy khách, hỗ trợ cấu hình nhiều entry
- `modulePreload()`: Tải trước phụ thuộc module, hỗ trợ chiến lược tải theo yêu cầu

### Thứ tự chèn tài nguyên

RenderContext kiểm soát chặt chẽ thứ tự chèn tài nguyên, thứ tự này được thiết kế dựa trên nguyên lý hoạt động của trình duyệt và cân nhắc tối ưu hiệu suất:

1. Phần head:
   - `preload()`: Tải trước tài nguyên CSS và JS, giúp trình duyệt phát hiện và bắt đầu tải các tài nguyên này sớm nhất
   - `css()`: Chèn stylesheet cho trang đầu tiên, đảm bảo style trang được áp dụng ngay khi nội dung được render

2. Phần body:
   - `importmap()`: Chèn ánh xạ import module, định nghĩa quy tắc phân giải đường dẫn cho module ESM
   - `moduleEntry()`: Chèn module entry phía máy khách, phải được thực thi sau importmap
   - `modulePreload()`: Tải trước phụ thuộc module, phải được thực thi sau importmap

## Quy trình render hoàn chỉnh

Một quy trình sử dụng RenderContext điển hình như sau:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Render nội dung trang và thu thập phụ thuộc
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Commit thu thập phụ thuộc
    await rc.commit();
    
    // 3. Tạo HTML hoàn chỉnh
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
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
};
```

## Tính năng nâng cao

### Cấu hình đường dẫn cơ sở

RenderContext cung cấp một cơ chế cấu hình đường dẫn cơ sở động linh hoạt, hỗ trợ thiết lập đường dẫn cơ sở cho tài nguyên tĩnh trong thời gian chạy:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Thiết lập đường dẫn cơ sở
    params: {
        url: req.url
    }
});
```

Cơ chế này đặc biệt phù hợp với các kịch bản sau:

1. **Triển khai trang web đa ngôn ngữ**
   ```
   domain.com      → Ngôn ngữ mặc định
   domain.com/cn/  → Trang tiếng Trung
   domain.com/en/  → Trang tiếng Anh
   ```

2. **Ứng dụng micro frontend**
   - Hỗ trợ triển khai ứng dụng con ở các đường dẫn khác nhau
   - Dễ dàng tích hợp vào các ứng dụng chính khác nhau

### Chế độ ánh xạ import

RenderContext cung cấp hai chế độ ánh xạ import (Import Map):

1. **Chế độ Inline** (Mặc định)
   - Chèn ánh xạ import trực tiếp vào HTML
   - Phù hợp với ứng dụng nhỏ, giảm yêu cầu mạng bổ sung
   - Có thể sử dụng ngay khi trang tải

2. **Chế độ JS**
   - Tải ánh xạ import thông qua tệp JavaScript bên ngoài
   - Phù hợp với ứng dụng lớn, có thể tận dụng cơ chế cache của trình duyệt
   - Hỗ trợ cập nhật nội dung ánh xạ động

Có thể chọn chế độ phù hợp thông qua cấu hình:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Cấu hình hàm entry

RenderContext hỗ trợ cấu hình `entryName` để chỉ định hàm entry cho render phía máy chủ:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Chỉ định sử dụng hàm entry cho thiết bị di động
    params: {
        url: req.url
    }
});
```

Cơ chế này đặc biệt phù hợp với các kịch bản sau:

1. **Render đa template**
   ```ts title="src/entry.server.ts"
   // Hàm entry cho thiết bị di động
   export const mobile = async (rc: RenderContext) => {
       // Logic render cụ thể cho thiết bị di động
   };

   // Hàm entry cho máy tính để bàn
   export const desktop = async (rc: RenderContext) => {
       // Logic render cụ thể cho máy tính để bàn
   };
   ```

2. **A/B testing**
   - Hỗ trợ sử dụng logic render khác nhau cho cùng một trang
   - Thuận tiện cho việc thử nghiệm trải nghiệm người dùng
   - Linh hoạt chuyển đổi các chiến lược render khác nhau

3. **Yêu cầu render đặc biệt**
   - Hỗ trợ một số trang sử dụng quy trình render tùy chỉnh
   - Phù hợp với nhu cầu tối ưu hiệu suất trong các kịch bản khác nhau
   - Thực hiện kiểm soát render chi tiết hơn

## Thực hành tốt nhất

1. **Lấy instance RenderContext**
   - Luôn sử dụng phương thức `esmx.render()` để lấy instance
   - Truyền các tham số phù hợp khi cần
   - Tránh tạo instance thủ công

2. **Thu thập phụ thuộc**
   - Đảm bảo tất cả các module đều gọi `importMetaSet.add(import.meta)` chính xác
   - Gọi phương thức `commit()` ngay sau khi render hoàn tất
   - Sử dụng hợp lý component bất đồng bộ và import động để tối ưu tải trang đầu tiên

3. **Chèn tài nguyên**
   - Tuân thủ nghiêm ngặt thứ tự chèn tài nguyên
   - Không chèn CSS vào body
   - Đảm bảo importmap được thực thi trước moduleEntry

4. **Tối ưu hiệu suất**
   - Sử dụng preload để tải trước các tài nguyên quan trọng
   - Sử dụng hợp lý modulePreload để tối ưu tải module
   - Tránh tải các tài nguyên không cần thiết
   - Tận dụng cơ chế cache của trình duyệt để tối ưu hiệu suất tải