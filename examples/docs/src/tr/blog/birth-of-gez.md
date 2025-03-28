---
titleSuffix: "Mikro Frontend Zorluklarından ESM Yeniliğine: Esmx Çerçevesinin Evrim Yolculuğu"
description: Esmx çerçevesinin geleneksel mikro frontend mimarisinin zorluklarından ESM tabanlı yenilikçi atılımlara kadar olan yolculuğunu derinlemesine inceleyin. Performans optimizasyonu, bağımlılık yönetimi ve yapı araçları seçimi gibi konulardaki teknik deneyimleri paylaşın.
head:
  - - meta
    - property: keywords
      content: Esmx, Mikro Frontend Çerçevesi, ESM, Import Maps, Rspack, Modül Federasyonu, Bağımlılık Yönetimi, Performans Optimizasyonu, Teknik Evrim, Sunucu Taraflı Render
sidebar: false
---

# Bileşen Paylaşımından Yerel Modülerliğe: Esmx Mikro Frontend Çerçevesinin Evrim Yolculuğu

## Proje Arka Planı

Son birkaç yıldır, mikro frontend mimarisi doğru bir yol bulmaya çalışıyor. Ancak, gördüğümüz şey, ideal bir mikro frontend dünyasını taklit etmek için katman katman paketlenmiş ve yapay olarak izole edilmiş çeşitli karmaşık teknik çözümler. Bu çözümler, değerli performansı tüketen, basit geliştirmeyi karmaşık hale getiren ve standart süreçleri anlaşılmaz kılan bir yük getiriyor.

### Geleneksel Çözümlerin Sınırlamaları

Mikro frontend mimarisini uygulama sürecinde, geleneksel çözümlerin birçok sınırlamasını derinden hissettik:

- **Performans Kaybı**: Çalışma zamanında bağımlılık enjeksiyonu, JS sanal kutu proxy'si, her işlem değerli performansı tüketiyor
- **Kırılgan İzolasyon**: Elle oluşturulan sanal kutu ortamı, tarayıcının yerel izolasyon yeteneklerine asla ulaşamıyor
- **Yapı Karmaşıklığı**: Bağımlılık ilişkilerini ele almak için yapı araçlarını değiştirmek zorunda kalmak, basit projeleri bakımı zor hale getiriyor
- **Özelleştirilmiş Kurallar**: Özel dağıtım stratejileri, çalışma zamanı işlemleri, her adımı modern geliştirme standartlarından uzaklaştırıyor
- **Ekosistem Sınırlamaları**: Çerçeve bağımlılığı, özel API'ler, teknoloji seçimini belirli bir ekosisteme bağlıyor

Bu sorunlar, 2019 yılındaki bir kurumsal projemizde özellikle belirgindi. O zamanlar, büyük bir ürün ondan fazla bağımsız iş alt sistemine ayrılmıştı ve bu alt sistemler bir dizi temel bileşen ve iş bileşenini paylaşmak zorundaydı. Başlangıçta kullanılan npm paketlerine dayalı bileşen paylaşımı çözümü, uygulamada ciddi bakım verimliliği sorunları ortaya çıkardı: Paylaşılan bileşenler güncellendiğinde, bu bileşene bağımlı olan tüm alt sistemler tam bir yapı ve dağıtım sürecinden geçmek zorundaydı.

## Teknik Evrim

### v1.0: Uzak Bileşenleri Keşfetmek

Bileşen paylaşımının verimlilik sorununu çözmek için Esmx v1.0, HTTP protokolüne dayalı RemoteView bileşen mekanizmasını tanıttı. Bu çözüm, çalışma zamanında dinamik istek yoluyla hizmetler arasında kodun talep üzerine birleştirilmesini sağlayarak, yapı bağımlılık zincirinin çok uzun olma sorununu başarıyla çözdü. Ancak, standartlaştırılmış bir çalışma zamanı iletişim mekanizmasının eksikliği nedeniyle, hizmetler arası durum senkronizasyonu ve olay iletimi hala verimlilik sorunları yaşıyordu.

### v2.0: Modül Federasyonu Denemesi

v2.0 sürümünde, [Webpack 5.0](https://webpack.js.org/)'ın [Modül Federasyonu (Module Federation)](https://webpack.js.org/concepts/module-federation/) teknolojisini kullandık. Bu teknoloji, birleşik bir modül yükleme mekanizması ve çalışma zamanı konteyneri ile hizmetler arası işbirliği verimliliğini önemli ölçüde artırdı. Ancak büyük ölçekli uygulamalarda, modül federasyonunun kapalı uygulama mekanizması yeni zorluklar getirdi: Özellikle birden fazla hizmetin paylaşılan bağımlılıklarını birleştirirken, sürüm çakışmaları ve çalışma zamanı istisnalarıyla sık sık karşılaşıldı.

## ESM Yeni Çağına Adım Atmak

v3.0 sürümünü planlarken, ön uç ekosistemindeki gelişmeleri derinlemesine inceledik ve tarayıcıların yerel yeteneklerindeki ilerlemelerin mikro frontend mimarisi için yeni olanaklar sunduğunu gördük:

### Standartlaştırılmış Modül Sistemi

Ana akım tarayıcıların [ES Modülleri (ES Modules)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) için tam destek sağlaması ve [Import Maps](https://github.com/WICG/import-maps) spesifikasyonunun olgunlaşmasıyla, ön uç geliştirme gerçek bir modülerlik çağına girdi. [Can I Use](https://caniuse.com/?search=importmap) istatistiklerine göre, ana akım tarayıcıların (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) ESM için yerel destek oranı %93.5'e ulaştı ve bu bize aşağıdaki avantajları sağladı:

- **Bağımlılık Yönetimi Standartlaşması**: Import Maps, tarayıcı düzeyinde modül bağımlılıklarını çözme yeteneği sağlar, karmaşık çalışma zamanı enjeksiyonuna gerek yoktur
- **Kaynak Yükleme Optimizasyonu**: Tarayıcının yerel modül önbellekleme mekanizması, kaynak yükleme verimliliğini önemli ölçüde artırır
- **Yapı Süreci Basitleştirme**: ESM tabanlı geliştirme modu, geliştirme ortamı ve üretim ortamı yapı süreçlerini daha tutarlı hale getirir

Aynı zamanda, uyumluluk modu desteği (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14) ile tarayıcı kapsama oranını %96.81'e çıkarabiliriz, bu da yüksek performansı korurken eski tarayıcı desteğinden ödün vermememizi sağlar.

### Performans ve İzolasyonda Atılım

Yerel modül sistemi, yalnızca standartlaşma değil, aynı zamanda performans ve izolasyonda niteliksel bir artış sağlar:

- **Sıfır Çalışma Zamanı Maliyeti**: Geleneksel mikro frontend çözümlerindeki JavaScript sanal kutu proxy'si ve çalışma zamanı enjeksiyonuna veda edin
- **Güvenilir İzolasyon Mekanizması**: ESM'in katı modül kapsamı, en güvenilir izolasyon yeteneğini doğal olarak sağlar
- **Kesin Bağımlılık Yönetimi**: Statik içe aktarma analizi, bağımlılık ilişkilerini daha net hale getirir ve sürüm kontrolünü daha kesin yapar

### Yapı Araçları Seçimi

Teknik çözümlerin uygulanmasında, yapı araçlarının seçimi kritik bir karar noktasıdır. Yaklaşık bir yıllık teknik araştırma ve uygulama sonucunda, seçimimiz aşağıdaki evrimi yaşadı:

1. **Vite Keşfi**
   - Avantaj: ESM tabanlı geliştirme sunucusu, en üst düzey geliştirme deneyimi sunar
   - Zorluk: Geliştirme ortamı ve üretim ortamı yapı farklılıkları, belirli bir belirsizlik getirir

2. **[Rspack](https://www.rspack.dev/) Belirleme**
   - Performans Avantajı: [Rust](https://www.rust-lang.org/) tabanlı yüksek performanslı derleme, yapı hızını önemli ölçüde artırır
   - Ekosistem Desteği: Webpack ekosistemiyle yüksek uyumluluk, geçiş maliyetini düşürür
   - ESM Desteği: Rslib projesi uygulamalarıyla, ESM yapısındaki güvenilirliği doğruladı

Bu karar, geliştirme deneyimini korurken daha istikrarlı bir üretim ortamı desteği sağladı. ESM ve Rspack kombinasyonuyla, yüksek performanslı ve düşük müdahale gerektiren bir mikro frontend çözümü oluşturduk.

## Gelecek Vizyonu

Gelecekteki gelişim planlarında, Esmx çerçevesi aşağıdaki üç yöne odaklanacaktır:

### Import Maps Derinlemesine Optimizasyon

- **Dinamik Bağımlılık Yönetimi**: Çalışma zamanı bağımlılık sürümlerinin akıllı planlamasını uygulayarak, çoklu uygulamalar arası bağımlılık çakışmalarını çözün
- **Ön Yükleme Stratejisi**: Rota analizine dayalı akıllı ön yükleme, kaynak yükleme verimliliğini artırır
- **Yapı Optimizasyonu**: En uygun Import Maps yapılandırmasını otomatik olarak oluşturarak, geliştiricilerin manuel yapılandırma maliyetini azaltır

### Çerçeveden Bağımsız Rota Çözümü

- **Birleşik Rota Soyutlaması**: Vue, React gibi ana akım çerçeveleri destekleyen çerçeveden bağımsız rota arayüzü tasarlayın
- **Mikro Uygulama Rotası**: Uygulamalar arası rota bağlantısını uygulayarak, URL ile uygulama durumunun tutarlılığını koruyun
- **Rota Middleware**: İzin kontrolü, sayfa geçişleri gibi işlevleri destekleyen genişletilebilir middleware mekanizması sağlayın

### Çerçeveler Arası İletişim En İyi Uygulamaları

- **Örnek Uygulama**: Vue, React, Preact gibi ana akım çerçeveleri kapsayan tam bir çerçeveler arası iletişim örneği sağlayın
- **Durum Senkronizasyonu**: ESM tabanlı hafif durum paylaşımı çözümü
- **Olay Veri Yolu**: Uygulamalar arası bağlantısız iletişimi destekleyen standartlaştırılmış olay iletişim mekanizması

Bu optimizasyonlar ve genişletmelerle, Esmx'i daha kapsamlı ve kullanımı kolay bir mikro frontend çözümü haline getirmeyi ve geliştiricilere daha iyi bir geliştirme deneyimi ve daha yüksek geliştirme verimliliği sunmayı hedefliyoruz.