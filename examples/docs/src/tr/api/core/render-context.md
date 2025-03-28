---
titleSuffix: Esmx Çerçevesi RenderContext API Referansı
description: Esmx çerçevesinin RenderContext temel sınıfını detaylı olarak açıklar, sunucu tarafı render (SSR) için render kontrolü, kaynak yönetimi, durum senkronizasyonu ve rota kontrolü gibi işlevleri kapsar, geliştiricilere verimli sunucu tarafı render uygulamaları oluşturmalarında yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, sunucu tarafı render, render context, durum senkronizasyonu, kaynak yönetimi, Web uygulama çerçevesi
---

# RenderContext

RenderContext, Esmx çerçevesinin temel sınıfıdır ve sunucu tarafı render (SSR) işleminin tüm yaşam döngüsünü yönetir. Render context, kaynak yönetimi, durum senkronizasyonu gibi kritik görevleri gerçekleştirmek için kapsamlı bir API sağlar:

- **Render Kontrolü**: Sunucu tarafı render sürecini yönetir, çoklu giriş renderı, koşullu render gibi senaryoları destekler
- **Kaynak Yönetimi**: JS, CSS gibi statik kaynakları akıllıca toplar ve enjekte eder, yükleme performansını optimize eder
- **Durum Senkronizasyonu**: Sunucu tarafı durum serileştirmesini işler, istemci tarafında doğru aktivasyonu (hydration) sağlar
- **Rota Kontrolü**: Sunucu tarafı yönlendirme, durum kodu ayarlama gibi gelişmiş işlevleri destekler

## Tür Tanımları

### ServerRenderHandle

Sunucu tarafı render işlemi fonksiyonunun tür tanımı.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

Sunucu tarafı render işlemi fonksiyonu, RenderContext örneğini parametre olarak alan asenkron veya senkron bir fonksiyondur ve sunucu tarafı render mantığını işler.

```ts title="entry.node.ts"
// 1. Asenkron işlem fonksiyonu
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Senkron işlem fonksiyonu
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Merhaba Dünya</h1>';
};
```

### RenderFiles

Render sürecinde toplanan kaynak dosyalarının listesi için tür tanımı.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: JavaScript dosyaları listesi
- **css**: Stil dosyaları listesi
- **modulepreload**: Önceden yüklenmesi gereken ESM modülleri listesi
- **resources**: Diğer kaynak dosyaları listesi (resimler, yazı tipleri vb.)

```ts
// Kaynak dosya listesi örneği
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

Importmap oluşturma modunu tanımlar.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Importmap içeriğini doğrudan HTML'e gömülü olarak ekler, aşağıdaki senaryolar için uygundur:
  - HTTP istek sayısını azaltmak gerektiğinde
  - Importmap içeriği küçük olduğunda
  - İlk ekran yükleme performansı yüksek öncelikli olduğunda
- `js`: Importmap içeriğini bağımsız bir JS dosyası olarak oluşturur, aşağıdaki senaryolar için uygundur:
  - Importmap içeriği büyük olduğunda
  - Tarayıcı önbellek mekanizmasından yararlanmak gerektiğinde
  - Birden fazla sayfa aynı importmap'i paylaştığında

Render context sınıfı, sunucu tarafı render (SSR) sürecinde kaynak yönetimi ve HTML oluşturma işlemlerinden sorumludur.
## Örnek Seçenekleri

Render context'in yapılandırma seçeneklerini tanımlar.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Tür**: `string`
- **Varsayılan**: `''`

Statik kaynakların temel yolu.
- Tüm statik kaynaklar (JS, CSS, resimler vb.) bu yol üzerinden yüklenecektir
- Çalışma zamanında dinamik olarak yapılandırılabilir, yeniden derlemeye gerek yoktur
- Çok dilli siteler, mikro ön uç uygulamaları gibi senaryolarda sıklıkla kullanılır

#### entryName

- **Tür**: `string`
- **Varsayılan**: `'default'`

Sunucu tarafı render giriş fonksiyonu adı. Bir modül birden fazla render fonksiyonu dışa aktardığında kullanılacak giriş fonksiyonunu belirtmek için kullanılır.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Mobil cihazlar için render mantığı
};

export const desktop = async (rc: RenderContext) => {
  // Masaüstü cihazlar için render mantığı
};
```

#### params

- **Tür**: `Record<string, any>`
- **Varsayılan**: `{}`

Render parametreleri. Render fonksiyonuna herhangi bir türde parametre geçirmek için kullanılır, genellikle istek bilgilerini (URL, sorgu parametreleri vb.) iletmek için kullanılır.

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'tr-TR',
    theme: 'koyu'
  }
});
```

#### importmapMode

- **Tür**: `'inline' | 'js'`
- **Varsayılan**: `'inline'`

Import map oluşturma modu:
- `inline`: Importmap içeriğini doğrudan HTML'e gömülü olarak ekler
- `js`: Importmap içeriğini bağımsız bir JS dosyası olarak oluşturur


## Örnek Özellikleri

### esmx

- **Tür**: `Esmx`
- **Salt Okunur**: `true`

Esmx örneği referansı. Çerçevenin temel işlevlerine ve yapılandırma bilgilerine erişmek için kullanılır.

### redirect

- **Tür**: `string | null`
- **Varsayılan**: `null`

Yönlendirme adresi. Ayarlandığında, sunucu bu değere göre HTTP yönlendirmesi yapabilir, genellikle giriş doğrulama, izin kontrolü gibi senaryolarda kullanılır.

```ts title="entry.node.ts"
// Giriş doğrulama örneği
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/giris';
    rc.status = 302;
    return;
  }
  // Sayfayı render etmeye devam et...
};

// İzin kontrolü örneği
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Sayfayı render etmeye devam et...
};
```

### status

- **Tür**: `number | null`
- **Varsayılan**: `null`

HTTP yanıt durum kodu. Herhangi bir geçerli HTTP durum kodu ayarlanabilir, genellikle hata işleme, yönlendirme gibi senaryolarda kullanılır.

```ts title="entry.node.ts"
// 404 hata işleme örneği
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // 404 sayfasını render et...
    return;
  }
  // Sayfayı render etmeye devam et...
};

// Geçici yönlendirme örneği
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/bakim';
    rc.status = 307; // Geçici yönlendirme, istek yöntemini korur
    return;
  }
  // Sayfayı render etmeye devam et...
};
```

### html

- **Tür**: `string`
- **Varsayılan**: `''`

HTML içeriği. Oluşturulan nihai HTML içeriğini ayarlamak ve almak için kullanılır, ayarlama sırasında temel yol yer tutucuları otomatik olarak işlenir.

```ts title="entry.node.ts"
// Temel kullanım
export default async (rc: RenderContext) => {
  // HTML içeriğini ayarla
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Merhaba Dünya</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// Dinamik temel yol
const rc = await esmx.render({
  base: '/uygulama',  // Temel yolu ayarla
  params: { url: req.url }
});

// HTML'deki yer tutucular otomatik olarak değiştirilir:
// [[[___GEZ_DYNAMIC_BASE___]]]/uygulama-adi/css/stil.css
// şu şekilde değiştirilir:
// /uygulama/uygulama-adi/css/stil.css
```

### base

- **Tür**: `string`
- **Salt Okunur**: `true`
- **Varsayılan**: `''`

Statik kaynakların temel yolu. Tüm statik kaynaklar (JS, CSS, resimler vb.) bu yol üzerinden yüklenecektir, çalışma zamanında dinamik olarak yapılandırılabilir.

```ts
// Temel kullanım
const rc = await esmx.render({
  base: '/esmx',  // Temel yolu ayarla
  params: { url: req.url }
});

// Çok dilli site örneği
const rc = await esmx.render({
  base: '/tr',  // Türkçe site
  params: { lang: 'tr-TR' }
});

// Mikro ön uç uygulama örneği
const rc = await esmx.render({
  base: '/uygulama1',  // Alt uygulama 1
  params: { appId: 1 }
});
```

### entryName

- **Tür**: `string`
- **Salt Okunur**: `true`
- **Varsayılan**: `'default'`

Sunucu tarafı render giriş fonksiyonu adı. entry.server.ts dosyasından kullanılacak render fonksiyonunu seçmek için kullanılır.

```ts title="entry.node.ts"
// Varsayılan giriş fonksiyonu
export default async (rc: RenderContext) => {
  // Varsayılan render mantığı
};

// Birden fazla giriş fonksiyonu
export const mobile = async (rc: RenderContext) => {
  // Mobil cihazlar için render mantığı
};

export const desktop = async (rc: RenderContext) => {
  // Masaüstü cihazlar için render mantığı
};

// Cihaz türüne göre giriş fonksiyonu seçimi
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Tür**: `Record<string, any>`
- **Salt Okunur**: `true`
- **Varsayılan**: `{}`

Render parametreleri. Sunucu tarafı render sürecinde parametreleri iletmek ve erişmek için kullanılır, genellikle istek bilgileri, sayfa yapılandırması gibi bilgileri iletmek için kullanılır.

```ts
// Temel kullanım - URL ve dil ayarlarını iletme
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'tr-TR'
  }
});

// Sayfa yapılandırması - Tema ve düzen ayarlama
const rc = await esmx.render({
  params: {
    theme: 'koyu',
    layout: 'yan-menu'
  }
});

// Ortam yapılandırması - API adresini enjekte etme
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Tür**: `Set<ImportMeta>`

Modül bağımlılık toplama kümesi. Bileşen render sürecinde otomatik olarak modül bağımlılıklarını izler ve kaydeder, yalnızca mevcut sayfa render edilirken gerçekten kullanılan kaynakları toplar.

```ts
// Temel kullanım
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Render sürecinde modül bağımlılıklarını otomatik olarak toplar
  // Çerçeve, bileşen render edilirken otomatik olarak context.importMetaSet.add(import.meta) çağırır
  // Geliştiricilerin bağımlılık toplama işlemini manuel olarak yapması gerekmez
  return '<div id="app">Merhaba Dünya</div>';
};

// Kullanım örneği
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Tür**: `RenderFiles`

Kaynak dosya listesi:
- js: JavaScript dosyaları listesi
- css: Stil dosyaları listesi
- modulepreload: Önceden yüklenmesi gereken ESM modülleri listesi
- resources: Diğer kaynak dosyaları listesi (resimler, yazı tipleri vb.)

```ts
// Kaynak toplama
await rc.commit();

// Kaynak enjeksiyonu
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Kaynakları önceden yükle -->
    ${rc.preload()}
    <!-- Stil dosyalarını enjekte et -->
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

- **Tür**: `'inline' | 'js'`
- **Varsayılan**: `'inline'`

Import map oluşturma modu:
- `inline`: Importmap içeriğini doğrudan HTML'e gömülü olarak ekler
- `js`: Importmap içeriğini bağımsız bir JS dosyası olarak oluşturur


## Örnek Metodları

### serialize()

- **Parametreler**: 
  - `input: any` - Serileştirilecek veri
  - `options?: serialize.SerializeJSOptions` - Serileştirme seçenekleri
- **Dönüş Değeri**: `string`

JavaScript nesnesini string'e serileştirir. Sunucu tarafı render sürec