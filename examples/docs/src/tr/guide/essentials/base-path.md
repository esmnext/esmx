---
titleSuffix: Esmx Çerçevesi Statik Kaynak Yolu Yapılandırma Kılavuzu
description: Esmx çerçevesinin temel yol yapılandırmasını detaylı olarak açıklar, çoklu ortam dağıtımı, CDN dağıtımı ve kaynak erişim yolu ayarlarını içerir, geliştiricilere esnek statik kaynak yönetimi sağlar.
head:
  - - meta
    - property: keywords
      content: Esmx, Temel Yol, Base Path, CDN, Statik Kaynaklar, Çoklu Ortam Dağıtımı, Kaynak Yönetimi
---

# Temel Yol

Temel yol (Base Path), uygulamanızdaki statik kaynakların (JavaScript, CSS, resimler vb.) erişim yolu önekidir. Esmx'de, temel yolun doğru yapılandırılması aşağıdaki senaryolar için kritik öneme sahiptir:

- **Çoklu Ortam Dağıtımı**: Geliştirme, test ve üretim gibi farklı ortamlarda kaynak erişimini destekler
- **Çoklu Bölge Dağıtımı**: Farklı bölge veya ülkelerdeki küme dağıtım ihtiyaçlarını karşılar
- **CDN Dağıtımı**: Statik kaynakların küresel dağıtımını ve hızlandırılmasını sağlar

## Varsayılan Yol Mekanizması

Esmx, hizmet adına dayalı otomatik yol oluşturma mekanizmasını kullanır. Varsayılan olarak, çerçeve projenin `package.json` dosyasındaki `name` alanını okuyarak statik kaynakların temel yolunu oluşturur: `/uygulama-adiniz/`.

```json title="package.json"
{
    "name": "uygulama-adiniz"
}
```

Bu yapılandırma üzerine tasarım aşağıdaki avantajlara sahiptir:

- **Tutarlılık**: Tüm statik kaynakların tek tip erişim yolu kullanmasını sağlar
- **Öngörülebilirlik**: `package.json` dosyasındaki `name` alanı ile kaynak erişim yolunu tahmin edebilirsiniz
- **Bakım Kolaylığı**: Ek yapılandırma gerektirmez, bakım maliyetini düşürür

## Dinamik Yol Yapılandırması

Gerçek projelerde, aynı kodu farklı ortamlara veya bölgelere dağıtmamız gerekebilir. Esmx, dinamik temel yol desteği sunarak uygulamanın farklı dağıtım senaryolarına uyum sağlamasını mümkün kılar.

### Kullanım Senaryoları

#### İkinci Seviye Dizin Dağıtımı
```
- example.com      -> Varsayılan ana site
- example.com/cn/  -> Çince site
- example.com/en/  -> İngilizce site
```

#### Bağımsız Alan Adı Dağıtımı
```
- example.com    -> Varsayılan ana site
- cn.example.com -> Çince site
- en.example.com -> İngilizce site
```

### Yapılandırma Yöntemi

`esmx.render()` yönteminin `base` parametresi ile istek bağlamına göre dinamik olarak temel yol ayarlayabilirsiniz:

```ts
const render = await esmx.render({
    base: '/cn',  // Temel yol ayarı
    params: {
        url: req.url
    }
});
```