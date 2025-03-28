---
titleSuffix: Esmx Çerçevesi Modül İçe Aktarma Yolu Eşleme Kılavuzu
description: Esmx çerçevesinin yol takma adı mekanizmasını detaylı olarak açıklar, içe aktarma yollarını basitleştirme, derin iç içe geçmiş yapıları önleme, tür güvenliği ve modül çözümleme optimizasyonu gibi özellikleri içerir, geliştiricilerin kod bakımını kolaylaştırmasına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, Yol Takma Adı, Path Alias, TypeScript, Modül İçe Aktarma, Yol Eşleme, Kod Bakımı
---

# Yol Takma Adı

Yol takma adı (Path Alias), geliştiricilerin tam modül yolu yerine kısa ve anlamsal tanımlayıcılar kullanmasına olanak tanıyan bir modül içe aktarma yolu eşleme mekanizmasıdır. Esmx'de, yol takma adı mekanizması aşağıdaki avantajlara sahiptir:

- **İçe Aktarma Yollarını Basitleştirme**: Uzun göreli yollar yerine anlamsal takma adlar kullanarak kod okunabilirliğini artırır
- **Derin İç İçe Geçmiş Yapıları Önleme**: Çok seviyeli dizin referanslarını (örneğin `../../../../`) ortadan kaldırarak bakım zorluğunu azaltır
- **Tür Güvenliği**: TypeScript'in tür sistemiyle tam entegrasyon sağlar, kod tamamlama ve tür denetimi sunar
- **Modül Çözümleme Optimizasyonu**: Önceden tanımlanmış yol eşlemeleri sayesinde modül çözümleme performansını artırır

## Varsayılan Takma Ad Mekanizması

Esmx, hizmet adına (Service Name) dayalı otomatik takma ad mekanizmasını kullanır. Bu yapılandırma üzerine tercih edilen tasarım aşağıdaki özelliklere sahiptir:

- **Otomatik Yapılandırma**: `package.json` dosyasındaki `name` alanına dayalı olarak otomatik olarak takma ad oluşturur, manuel yapılandırma gerektirmez
- **Tutarlı Standartlar**: Tüm hizmet modüllerinin tutarlı bir adlandırma ve referans standardını takip etmesini sağlar
- **Tür Desteği**: `npm run build:dts` komutuyla birlikte otomatik olarak tür bildirim dosyaları oluşturur, hizmetler arası tür çıkarımı sağlar
- **Öngörülebilirlik**: Hizmet adı üzerinden modül referans yolunu çıkarabilme imkanı sunar, bakım maliyetini düşürür

## Yapılandırma Açıklaması

### package.json Yapılandırması

`package.json` dosyasında, `name` alanı kullanılarak hizmetin adı tanımlanır. Bu ad, hizmetin varsayılan takma ad öneki olarak kullanılır:

```json title="package.json"
{
    "name": "uygulama-adi"
}
```

### tsconfig.json Yapılandırması

TypeScript'in takma ad yollarını doğru bir şekilde çözümleyebilmesi için `tsconfig.json` dosyasında `paths` eşlemesinin yapılandırılması gerekir:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "uygulama-adi/src/*": [
                "./src/*"
            ],
            "uygulama-adi/*": [
                "./*"
            ]
        }
    }
}
```

## Kullanım Örnekleri

### Hizmet İçi Modülleri İçe Aktarma

```ts
// Takma ad kullanarak içe aktarma
import { MyComponent } from 'uygulama-adi/src/components';

// Eşdeğer göreli yol ile içe aktarma
import { MyComponent } from '../components';
```

### Diğer Hizmet Modüllerini İçe Aktarma

```ts
// Diğer hizmetin bileşenlerini içe aktarma
import { SharedComponent } from 'diger-hizmet/src/components';

// Diğer hizmetin yardımcı fonksiyonlarını içe aktarma
import { utils } from 'diger-hizmet/src/utils';
```

::: ipucu En İyi Uygulamalar
- Göreli yollar yerine takma ad yollarını kullanmayı tercih edin
- Takma ad yollarının anlamsal ve tutarlı olmasını sağlayın
- Takma ad yollarında çok fazla dizin seviyesi kullanmaktan kaçının

:::

``` ts
// Bileşenleri içe aktarma
import { Button } from 'uygulama-adi/src/components';
import { Layout } from 'uygulama-adi/src/components/layout';

// Yardımcı fonksiyonları içe aktarma
import { formatDate } from 'uygulama-adi/src/utils';
import { request } from 'uygulama-adi/src/utils/request';

// Tür tanımlarını içe aktarma
import type { UserInfo } from 'uygulama-adi/src/types';
```

### Hizmetler Arası İçe Aktarma

Modül bağlantısı (Module Link) yapılandırıldıktan sonra, diğer hizmetlerin modüllerini aynı şekilde içe aktarabilirsiniz:

```ts
// Uzak hizmetin bileşenlerini içe aktarma
import { Header } from 'uzak-hizmet/src/components';

// Uzak hizmetin yardımcı fonksiyonlarını içe aktarma
import { logger } from 'uzak-hizmet/src/utils';
```

### Özel Takma Adlar

Üçüncü taraf paketler veya özel senaryolar için Esmx yapılandırma dosyası üzerinden özel takma adlar tanımlanabilir:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Vue için özel bir yapı sürümü yapılandırma
                        'vue$': 'vue/dist/vue.esm.js',
                        // Sık kullanılan dizinler için kısa takma adlar yapılandırma
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: uyarı Dikkat Edilmesi Gerekenler
1. İş modülleri için, proje tutarlılığını korumak adına varsayılan takma ad mekanizmasını kullanmanız önerilir
2. Özel takma adlar, üçüncü taraf paketlerin özel ihtiyaçlarını karşılamak veya geliştirme deneyimini optimize etmek için kullanılır
3. Özel takma adların aşırı kullanımı, kod bakımını ve yapı optimizasyonunu olumsuz etkileyebilir

:::