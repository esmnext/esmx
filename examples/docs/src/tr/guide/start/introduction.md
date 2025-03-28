---
titleSuffix: Esmx Çerçevesine Genel Bakış ve Teknolojik Yenilikler
description: Esmx mikro ön uç çerçevesinin proje arka planını, teknolojik evrimini ve temel avantajlarını derinlemesine inceleyin, ESM tabanlı modern sunucu tarafı render (SSR) çözümlerini keşfedin.
head:
  - - meta
    - property: keywords
      content: Esmx, mikro ön uç, ESM, sunucu tarafı render, SSR, teknolojik yenilik, modül federasyonu
---

# Giriş

## Proje Arka Planı
Esmx, yüksek performanslı ve ölçeklenebilir sunucu tarafı render (SSR) uygulamaları oluşturmaya odaklanan, ECMAScript Modules (ESM) tabanlı modern bir mikro ön uç çerçevesidir. Genesis projesinin üçüncü nesil ürünü olarak Esmx, teknolojik evrim sürecinde sürekli yenilikler getirmektedir:

- **v1.0**: HTTP istekleri üzerinden uzak bileşenlerin isteğe bağlı yüklenmesini sağladı
- **v2.0**: Webpack Module Federation kullanarak uygulama entegrasyonunu gerçekleştirdi
- **v3.0**: Tarayıcı yerel ESM'yi temel alarak [modül bağlantı](/guide/essentials/module-link) sistemini yeniden tasarladı

## Teknolojik Arka Plan
Mikro ön uç mimarisinin gelişim sürecinde, geleneksel çözümler temel olarak aşağıdaki sınırlamalarla karşı karşıya kalmıştır:

### Mevcut Çözümlerin Zorlukları
- **Performans darboğazları**: Çalışma zamanı bağımlılık enjeksiyonu ve JavaScript sandbox proxy'leri önemli performans maliyetleri getiriyor
- **İzolasyon mekanizmaları**: Özel sandbox ortamları, tarayıcı yerel modül izolasyon yeteneklerine ulaşmakta zorlanıyor
- **Yapılandırma karmaşıklığı**: Bağımlılık paylaşımı için yapılan yapılandırma aracı değişiklikleri, proje bakım maliyetlerini artırıyor
- **Standart sapmalar**: Özel dağıtım stratejileri ve çalışma zamanı işleme mekanizmaları, modern web geliştirme standartlarından uzaklaşıyor
- **Ekosistem sınırlamaları**: Çerçeve bağımlılıkları ve özel API'ler, teknoloji yığını seçimini kısıtlıyor

### Teknolojik Yenilikler
Esmx, modern web standartlarını temel alarak yeni bir çözüm sunar:

- **Yerel modül sistemi**: Tarayıcı yerel ESM ve Import Maps kullanarak bağımlılık yönetimi sağlar, daha hızlı çözümleme ve yürütme hızı sunar
- **Standart izolasyon mekanizması**: ECMAScript modül kapsamına dayalı güvenilir uygulama izolasyonu sağlar
- **Açık teknoloji yığını**: Herhangi bir modern ön uç çerçevesinin sorunsuz entegrasyonunu destekler
- **Geliştirme deneyimi optimizasyonu**: Sezgisel geliştirme modelleri ve tam hata ayıklama yetenekleri sunar
- **Aşırı performans optimizasyonu**: Yerel yeteneklerle sıfır çalışma zamanı maliyeti sağlar, akıllı önbellek stratejileriyle desteklenir

:::tip
Esmx, özellikle büyük ölçekli sunucu tarafı render uygulamaları için yüksek performanslı ve kolayca genişletilebilir mikro ön uç altyapısı oluşturmaya odaklanır.
:::

## Teknik Özellikler

### Ortam Bağımlılıkları
Detaylı tarayıcı ve Node.js ortam gereksinimleri için [ortam gereksinimleri](/guide/start/environment) belgesine bakın.

### Temel Teknoloji Yığını
- **Bağımlılık yönetimi**: Modül eşleme için [Import Maps](https://caniuse.com/?search=import%20map) kullanır, uyumluluk desteği için [es-module-shims](https://github.com/guybedford/es-module-shims) sağlar
- **Yapılandırma sistemi**: Rspack tabanlı [module-import](https://rspack.dev/config/externals#externalstypemodule-import) ile harici bağımlılıkları işler
- **Geliştirme araç zinciri**: ESM sıcak güncelleme ve TypeScript yerel yürütme desteği sunar

## Çerçeve Konumu
Esmx, [Next.js](https://nextjs.org) veya [Nuxt.js](https://nuxt.com/) gibi çerçevelerden farklı olarak, mikro ön uç altyapısı sağlamaya odaklanır:

- **Modül bağlantı sistemi**: Verimli ve güvenilir modül içe/dışa aktarma sağlar
- **Sunucu tarafı render**: Esnek SSR uygulama mekanizması sunar
- **Tür sistemi desteği**: Tam TypeScript tür tanımlarını entegre eder
- **Çerçeve tarafsızlığı**: Ana akım ön uç çerçevelerinin entegrasyonunu destekler

## Mimari Tasarım

### Merkezi Bağımlılık Yönetimi
- **Birleşik bağımlılık kaynağı**: Merkezi üçüncü parti bağımlılık yönetimi
- **Otomatik dağıtım**: Bağımlılık güncellemelerinin global otomatik senkronizasyonu
- **Sürüm tutarlılığı**: Kesin bağımlılık sürüm kontrolü

### Modüler Tasarım
- **Sorumluluk ayrımı**: İş mantığı ve altyapının ayrıştırılması
- **Eklenti mekanizması**: Modüllerin esnek kombinasyonu ve değiştirilmesi desteği
- **Standart arayüzler**: Standartlaştırılmış modüller arası iletişim protokolü

### Performans Optimizasyonu
- **Sıfır maliyet prensibi**: Tarayıcı yerel yeteneklerinin maksimum kullanımı
- **Akıllı önbellek**: İçerik hash'ine dayalı kesin önbellek stratejisi
- **İsteğe bağlı yükleme**: İnce ayarlı kod bölme ve bağımlılık yönetimi

## Proje Olgunluğu
Esmx, yaklaşık 5 yıllık yinelemeli evrim (v1.0'dan v3.0'a) sürecinde, kurumsal düzeyde ortamlarda kapsamlı bir şekilde doğrulanmıştır. Şu anda onlarca iş projesini istikrarlı bir şekilde desteklemekte ve teknoloji yığını modernizasyonunu sürekli olarak ilerletmektedir. Çerçevenin istikrarı, güvenilirliği ve performans avantajları pratikte tam olarak test edilmiş olup, büyük ölçekli uygulama geliştirme için güvenilir bir teknik temel sağlamaktadır.