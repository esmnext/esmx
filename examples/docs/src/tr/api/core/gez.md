---
titleSuffix: Çerçeve Çekirdek Sınıfı API Referansı
description: Esmx çerçevesinin çekirdek sınıf API'lerini detaylı olarak açıklar, uygulama yaşam döngüsü yönetimi, statik kaynak işleme ve sunucu tarafı render özelliklerini içerir, geliştiricilerin çerçevenin temel işlevlerini derinlemesine anlamasına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, API, yaşam döngüsü yönetimi, statik kaynak, sunucu tarafı render, Rspack, Web uygulama çerçevesi
---

# Esmx

## Giriş

Esmx, Rspack tabanlı yüksek performanslı bir Web uygulama çerçevesidir ve eksiksiz bir uygulama yaşam döngüsü yönetimi, statik kaynak işleme ve sunucu tarafı render özellikleri sunar.

## Tür Tanımları

### RuntimeTarget

- **Tür Tanımı**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Uygulama çalışma zamanı ortamı türü:
- `client`: Tarayıcı ortamında çalışır, DOM işlemleri ve tarayıcı API'larını destekler
- `server`: Node.js ortamında çalışır, dosya sistemi ve sunucu tarafı işlevleri destekler

### ImportMap

- **Tür Tanımı**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES modülü import haritalama türü.

#### SpecifierMap

- **Tür Tanımı**:
```ts
type SpecifierMap = Record<string, string>
```

Modül tanımlayıcı haritalama türü, modül import yollarının haritalanmasını tanımlamak için kullanılır.

#### ScopesMap

- **Tür Tanımı**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Kapsam haritalama türü, belirli bir kapsam altındaki modül import haritalamalarını tanımlamak için kullanılır.

### COMMAND

- **Tür Tanımı**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Komut türü numaralandırması:
- `dev`: Geliştirme ortamı komutu, geliştirme sunucusunu başlatır ve sıcak yenilemeyi destekler
- `build`: Derleme komutu, üretim ortamı için derleme çıktıları oluşturur
- `preview`: Önizleme komutu, yerel önizleme sunucusunu başlatır
- `start`: Başlatma komutu, üretim ortamı sunucusunu çalıştırır

## Örnek Seçenekleri

Esmx çerçevesinin temel yapılandırma seçeneklerini tanımlar.

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

- **Tür**: `string`
- **Varsayılan**: `process.cwd()`

Proje kök dizini yolu. Mutlak yol veya göreli yol olabilir, göreli yollar mevcut çalışma dizinine göre çözümlenir.

#### isProd

- **Tür**: `boolean`
- **Varsayılan**: `process.env.NODE_ENV === 'production'`

Ortam belirteci.
- `true`: Üretim ortamı
- `false`: Geliştirme ortamı

#### basePathPlaceholder

- **Tür**: `string | false`
- **Varsayılan**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Temel yol yer tutucusu yapılandırması. Çalışma zamanında kaynakların temel yolunu dinamik olarak değiştirmek için kullanılır. `false` olarak ayarlanırsa bu özellik devre dışı bırakılır.

#### modules

- **Tür**: `ModuleConfig`

Modül yapılandırma seçenekleri. Projenin modül çözümleme kurallarını yapılandırmak için kullanılır, modül takma adları, harici bağımlılıklar gibi yapılandırmaları içerir.

#### packs

- **Tür**: `PackConfig`

Paketleme yapılandırma seçenekleri. Derleme çıktılarını standart npm .tgz formatında yazılım paketleri halinde paketlemek için kullanılır.

#### devApp

- **Tür**: `(esmx: Esmx) => Promise<App>`

Geliştirme ortamı uygulama oluşturma işlevi. Yalnızca geliştirme ortamında kullanılır, geliştirme sunucusu için uygulama örneği oluşturmak için kullanılır.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Özel Rspack yapılandırması
        }
      })
    )
  }
}
```

#### server

- **Tür**: `(esmx: Esmx) => Promise<void>`

Sunucu başlatma yapılandırma işlevi. HTTP sunucusunu yapılandırmak ve başlatmak için kullanılır, geliştirme ve üretim ortamlarında kullanılabilir.

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

- **Tür**: `(esmx: Esmx) => Promise<void>`

Derleme sonrası işlem işlevi. Proje derlendikten sonra çalıştırılır, şunlar için kullanılabilir:
- Ek kaynak işleme
- Dağıtım işlemleri
- Statik dosyalar oluşturma
- Derleme bildirimi gönderme

## Örnek Özellikleri

### name

- **Tür**: `string`
- **Salt Okunur**: `true`

Mevcut modülün adı, modül yapılandırmasından alınır.

### varName

- **Tür**: `string`
- **Salt Okunur**: `true`

Modül adına dayalı geçerli bir JavaScript değişken adı.

### root

- **Tür**: `string`
- **Salt Okunur**: `true`

Proje kök dizininin mutlak yolu. `root` göreli yol olarak yapılandırılmışsa, mevcut çalışma dizinine göre çözümlenir.

### isProd

- **Tür**: `boolean`
- **Salt Okunur**: `true`

Mevcut ortamın üretim ortamı olup olmadığını belirler. Öncelikle yapılandırma seçeneklerindeki `isProd` kullanılır, yapılandırılmamışsa `process.env.NODE_ENV` değerine göre belirlenir.

### basePath

- **Tür**: `string`
- **Salt Okunur**: `true`
- **Fırlatır**: `NotReadyError` - Çerçeve başlatılmamışsa

Eğik çizgi ile başlayan ve biten modül temel yolunu alır. Döndürülen format `/${name}/` şeklindedir, burada name modül yapılandırmasından alınır.

### basePathPlaceholder

- **Tür**: `string`
- **Salt Okunur**: `true`

Çalışma zamanında dinamik olarak değiştirilecek temel yol yer tutucusunu alır. Yapılandırma ile devre dışı bırakılabilir.

### middleware

- **Tür**: `Middleware`
- **Salt Okunur**: `true`

Statik kaynak işleme ara katmanını alır. Ortama göre farklı uygulamalar sağlar:
- Geliştirme ortamı: Kaynak kodun gerçek zamanlı derlenmesini ve sıcak yenilemeyi destekler
- Üretim ortamı: Statik kaynakların uzun süreli önbelleğe alınmasını destekler

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **Tür**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **Salt Okunur**: `true`

Sunucu tarafı render işlevini alır. Ortama göre farklı uygulamalar sağlar:
- Geliştirme ortamı: Sıcak yenileme ve gerçek zamanlı önizlemeyi destekler
- Üretim ortamı: Optimize edilmiş render performansı sağlar

```ts
// Temel kullanım
const rc = await esmx.render({
  params: { url: req.url }
});

// Gelişmiş yapılandırma
const rc = await esmx.render({
  base: '',                    // Temel yol
  importmapMode: 'inline',     // Import haritalama modu
  entryName: 'default',        // Render girişi
  params: {
    url: req.url,
    state: { user: 'admin' }   // Durum verileri
  }
});
```

### COMMAND

- **Tür**: `typeof COMMAND`
- **Salt Okunur**: `true`

Komut numaralandırma tür tanımını alır.

### moduleConfig

- **Tür**: `ParsedModuleConfig`
- **Salt Okunur**: `true`
- **Fırlatır**: `NotReadyError` - Çerçeve başlatılmamışsa

Mevcut modülün tam yapılandırma bilgilerini alır, modül çözümleme kuralları, takma ad yapılandırmaları gibi bilgileri içerir.

### packConfig

- **Tür**: `ParsedPackConfig`
- **Salt Okunur**: `true`
- **Fırlatır**: `NotReadyError` - Çerçeve başlatılmamışsa

Mevcut modülün paketleme ile ilgili yapılandırmalarını alır, çıktı yolu, package.json işleme gibi bilgileri içerir.

## Örnek Metodları

### constructor()

- **Parametreler**: 
  - `options?: EsmxOptions` - Çerçeve yapılandırma seçenekleri
- **Dönüş Değeri**: `Esmx`

Esmx çerçevesi örneği oluşturur.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Parametreler**: `command: COMMAND`
- **Dönüş Değeri**: `Promise<boolean>`
- **Fırlatır**:
  - `Error`: Tekrar başlatma sırasında
  - `NotReadyError`: Başlatılmamış örneğe erişim sırasında

Esmx çerçevesi örneğini başlatır. Aşağıdaki temel başlatma işlemlerini gerçekleştirir:

1. Proje yapılandırmasını çözümleme (package.json, modül yapılandırması, paketleme yapılandırması vb.)
2. Uygulama örneği oluşturma (geliştirme ortamı veya üretim ortamı)
3. Komuta göre ilgili yaşam döngüsü metodlarını çalıştırma

::: uyarı Dikkat
- Tekrar başlatma sırasında hata fırlatır
- Başlatılmamış örneğe erişim sırasında `NotReadyError` fırlatır

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Dönüş Değeri**: `Promise<boolean>`

Esmx çerçevesi örneğini yok eder, kaynak temizleme ve bağlantı kapatma gibi işlemleri gerçekleştirir. Temel olarak şunlar için kullanılır:
- Geliştirme sunucusunu kapatma
- Geçici dosyaları ve önbelleği temizleme
- Sistem kaynaklarını serbest bırakma

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Dönüş Değeri**: `Promise<boolean>`

Uygulamanın derleme sürecini gerçekleştirir, şunları içerir:
- Kaynak kodun derlenmesi
- Üretim ortamı için derleme çıktılarının oluşturulması
- Kodun optimize edilmesi ve sıkıştırılması
- Kaynak envanterinin oluşturulması

::: uyarı Dikkat
Çerçeve örneği başlatılmadan çağrılırsa `NotReadyError` fırlatır
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Derleme tamamlandıktan sonra statik HTML oluşturma
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

- **Dönüş Değeri**: `Promise<void>`
- **Fırlatır**: `NotReadyError` - Çerçeve başlatılmamışsa

HTTP sunucusunu ve yapılandırma sunucusu örneğini başlatır. Aşağıdaki yaşam döngülerinde çağrılır:
- Geliştirme ortamı (dev): Geliştirme sunucusunu başlatır, sıcak yenileme sağlar
- Üretim ortamı (start): Üretim sunucusunu başlatır, üretim düzeyinde performans sağlar

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Statik kaynakları işleme
      esmx.middleware(req, res, async () => {
        // Sunucu tarafı render
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

- **Dönüş Değeri**: `Promise<boolean>`

Derleme sonrası işlem mantığını gerçekleştirir, şunlar için kullanılır:
- Statik HTML dosyaları oluşturma
- Derleme çıktılarını işleme
- Dağıtım görevlerini gerçekleştirme
- Derleme bildirimi gönderme

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Birden fazla sayfa için statik HTML oluşturma
    const pages = ['/', '/about', '/404'];

    for (const url of pages) {
      const render