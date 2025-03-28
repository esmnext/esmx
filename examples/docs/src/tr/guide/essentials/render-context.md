---
titleSuffix: Esmx Çerçevesi Sunucu Taraflı Render Mekanizması
description: Esmx çerçevesinin RenderContext (Render Bağlamı) mekanizmasını detaylı olarak açıklar, kaynak yönetimi, HTML oluşturma ve ESM modül sistemi dahil olmak üzere geliştiricilerin sunucu tarafı render (SSR) özelliğini anlamasına ve kullanmasına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, Render Bağlamı, RenderContext, SSR, Sunucu Taraflı Render, ESM, Kaynak Yönetimi
---

# Render Bağlamı

RenderContext, Esmx çerçevesindeki temel bir sınıftır ve sunucu tarafı render (SSR) sürecinde kaynak yönetimi ve HTML oluşturma işlemlerinden sorumludur. Aşağıdaki temel özelliklere sahiptir:

1. **ESM Tabanlı Modül Sistemi**
   - Modern ECMAScript Modules (ESM) standardını kullanır
   - Yerel modül içe ve dışa aktarma işlemlerini destekler
   - Daha iyi kod bölme ve isteğe bağlı yükleme sağlar

2. **Akıllı Bağımlılık Toplama**
   - Gerçek render yoluna dayalı olarak dinamik bağımlılık toplar
   - Gereksiz kaynak yüklemelerinden kaçınır
   - Asenkron bileşenleri ve dinamik içe aktarmaları destekler

3. **Hassas Kaynak Enjeksiyonu**
   - Kaynak yükleme sırasını sıkı bir şekilde kontrol eder
   - İlk ekran yükleme performansını optimize eder
   - İstemci tarafında aktivasyonun (Hydration) güvenilirliğini sağlar

4. **Esnek Yapılandırma Mekanizması**
   - Dinamik temel yol yapılandırmasını destekler
   - Birden fazla içe aktarma haritalama modu sunar
   - Farklı dağıtım senaryolarına uyum sağlar

## Kullanım Şekli

Esmx çerçevesinde, geliştiriciler genellikle doğrudan RenderContext örneği oluşturmaz, bunun yerine `esmx.render()` yöntemi ile örnek alır:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Statik dosya işleme
        esmx.middleware(req, res, async () => {
            // esmx.render() ile RenderContext örneği alınır
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // HTML içeriği yanıt olarak gönderilir
            res.end(rc.html);
        });
    });
}
```

## Temel İşlevler

### Bağımlılık Toplama

RenderContext, gerçek render edilen bileşenlere dayalı olarak dinamik bağımlılık toplayan akıllı bir mekanizma sunar:

#### İsteğe Bağlı Toplama
- Bileşenlerin gerçek render sürecinde modül bağımlılıklarını otomatik olarak izler ve kaydeder
- Yalnızca mevcut sayfa render edilirken kullanılan CSS, JavaScript gibi kaynakları toplar
- `importMetaSet` ile her bileşenin modül bağımlılıklarını hassas bir şekilde kaydeder
- Asenkron bileşenleri ve dinamik içe aktarmaları destekler

#### Otomatik İşleme
- Geliştiriciler bağımlılık toplama sürecini manuel olarak yönetmek zorunda değildir
- Çerçeve, bileşen render edilirken bağımlılık bilgilerini otomatik olarak toplar
- `commit()` yöntemi ile toplanan tüm kaynakları birleştirir
- Döngüsel bağımlılıkları ve tekrarlanan bağımlılıkları otomatik olarak işler

#### Performans Optimizasyonu
- Kullanılmayan modüllerin yüklenmesini önleyerek ilk ekran yükleme süresini önemli ölçüde azaltır
- Kaynak yükleme sırasını hassas bir şekilde kontrol ederek sayfa render performansını optimize eder
- En uygun içe aktarma haritasını (Import Map) otomatik olarak oluşturur
- Kaynak ön yükleme ve isteğe bağlı yükleme stratejilerini destekler

### Kaynak Enjeksiyonu

RenderContext, farklı türdeki kaynakları enjekte etmek için birden fazla yöntem sunar ve her yöntem kaynak yükleme performansını optimize etmek için özenle tasarlanmıştır:

- `preload()`: CSS ve JS kaynaklarını ön yükler, öncelik yapılandırmasını destekler
- `css()`: İlk ekran stil sayfalarını enjekte eder, kritik CSS çıkarma işlemini destekler
- `importmap()`: Modül içe aktarma haritasını enjekte eder, dinamik yol çözümlemesini destekler
- `moduleEntry()`: İstemci tarafı giriş modülünü enjekte eder, çoklu giriş yapılandırmasını destekler
- `modulePreload()`: Modül bağımlılıklarını ön yükler, isteğe bağlı yükleme stratejisini destekler

### Kaynak Enjeksiyon Sırası

RenderContext, kaynak enjeksiyon sırasını sıkı bir şekilde kontrol eder ve bu sıralama tarayıcı çalışma prensipleri ve performans optimizasyonu düşünülerek tasarlanmıştır:

1. head kısmı:
   - `preload()`: CSS ve JS kaynaklarını ön yükler, tarayıcının bu kaynakları erken keşfetmesini ve yüklemeye başlamasını sağlar
   - `css()`: İlk ekran stil sayfalarını enjekte eder, sayfa içeriği render edilirken stil sayfalarının hazır olmasını sağlar

2. body kısmı:
   - `importmap()`: Modül içe aktarma haritasını enjekte eder, ESM modüllerinin yol çözümleme kurallarını tanımlar
   - `moduleEntry()`: İstemci tarafı giriş modülünü enjekte eder, importmap'ten sonra çalıştırılmalıdır
   - `modulePreload()`: Modül bağımlılıklarını ön yükler, importmap'ten sonra çalıştırılmalıdır

## Tam Render Süreci

Tipik bir RenderContext kullanım süreci aşağıdaki gibidir:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Sayfa içeriğini render et ve bağımlılıkları topla
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Bağımlılık toplamayı tamamla
    await rc.commit();
    
    // 3. Tam HTML oluştur
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

## Gelişmiş Özellikler

### Temel Yol Yapılandırması

RenderContext, çalışma zamanında statik kaynakların temel yolunu dinamik olarak ayarlamak için esnek bir mekanizma sunar:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Temel yolu ayarla
    params: {
        url: req.url
    }
});
```

Bu mekanizma özellikle aşağıdaki senaryolar için uygundur:

1. **Çok Dilli Site Dağıtımı**
   ```
   ana-alanadi.com      → Varsayılan dil
   ana-alanadi.com/cn/  → Çince site
   ana-alanadi.com/en/  → İngilizce site
   ```

2. **Mikro Frontend Uygulamaları**
   - Alt uygulamaların farklı yollarda esnek bir şekilde dağıtılmasını destekler
   - Farklı ana uygulamalara entegre edilmesini kolaylaştırır

### İçe Aktarma Haritası Modları

RenderContext, iki tür içe aktarma haritası (Import Map) modu sunar:

1. **Inline Modu** (Varsayılan)
   - İçe aktarma haritasını doğrudan HTML içine yerleştirir
   - Küçük uygulamalar için uygundur, ek ağ isteklerini azaltır
   - Sayfa yüklendiğinde hemen kullanılabilir

2. **JS Modu**
   - Haritayı harici bir JavaScript dosyası ile yükler
   - Büyük uygulamalar için uygundur, tarayıcı önbellek mekanizmasından yararlanır
   - Harita içeriğinin dinamik olarak güncellenmesini destekler

Uygun modu seçmek için yapılandırma yapılabilir:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Giriş Fonksiyonu Yapılandırması

RenderContext, `entryName` yapılandırması ile sunucu tarafı render için kullanılacak giriş fonksiyonunu belirlemeyi destekler:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Mobil giriş fonksiyonunu kullan
    params: {
        url: req.url
    }
});
```

Bu mekanizma özellikle aşağıdaki senaryolar için uygundur:

1. **Çoklu Şablon Render**
   ```ts title="src/entry.server.ts"
   // Mobil giriş fonksiyonu
   export const mobile = async (rc: RenderContext) => {
       // Mobil için özel render mantığı
   };

   // Masaüstü giriş fonksiyonu
   export const desktop = async (rc: RenderContext) => {
       // Masaüstü için özel render mantığı
   };
   ```

2. **A/B Testi**
   - Aynı sayfa için farklı render mantıkları kullanmayı destekler
   - Kullanıcı deneyimi deneyleri yapmayı kolaylaştırır
   - Farklı render stratejileri arasında esnek geçiş sağlar

3. **Özel Render İhtiyaçları**
   - Bazı sayfalar için özel render süreçleri kullanmayı destekler
   - Farklı senaryolara uygun performans optimizasyonları sağlar
   - Daha hassas render kontrolü sağlar

## En İyi Uygulamalar

1. **RenderContext Örneği Alma**
   - Her zaman `esmx.render()` yöntemi ile örnek alın
   - Gerektiğinde uygun parametreleri geçirin
   - Manuel örnek oluşturmaktan kaçının

2. **Bağımlılık Toplama**
   - Tüm modüllerin `importMetaSet.add(import.meta)` çağrısını doğru şekilde yaptığından emin olun
   - Render tamamlandıktan hemen sonra `commit()` yöntemini çağırın
   - İlk ekran yüklemesini optimize etmek için asenkron bileşenleri ve dinamik içe aktarmaları akıllıca kullanın

3. **Kaynak Enjeksiyonu**
   - Kaynak enjeksiyon sırasını sıkı bir şekilde takip edin
   - body içinde CSS enjekte etmeyin
   - importmap'in moduleEntry'den önce enjekte edildiğinden emin olun

4. **Performans Optimizasyonu**
   - Kritik kaynakları ön yüklemek için preload kullanın
   - Modül yüklemesini optimize etmek için modulePreload'u akıllıca kullanın
   - Gereksiz kaynak yüklemelerinden kaçının
   - Tarayıcı önbellek mekanizmasından yararlanarak yükleme performansını optimize edin