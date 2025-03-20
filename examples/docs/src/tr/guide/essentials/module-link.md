---
titleSuffix: Gez Çerçevesi Hizmetler Arası Kod Paylaşım Mekanizması
description: Gez çerçevesinin modül bağlantı mekanizmasını detaylı olarak açıklar, hizmetler arası kod paylaşımı, bağımlılık yönetimi ve ESM spesifikasyonu uygulamasını içerir, geliştiricilere verimli mikro ön uç uygulamaları oluşturmalarına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Gez, Modül Bağlantısı, Module Link, ESM, Kod Paylaşımı, Bağımlılık Yönetimi, Mikro Ön Uç
---

# Modül Bağlantısı

Gez çerçevesi, hizmetler arası kod paylaşımını ve bağımlılık ilişkilerini yönetmek için kapsamlı bir modül bağlantı mekanizması sunar. Bu mekanizma ESM (ECMAScript Module) spesifikasyonu temelinde uygulanır ve kaynak kodu seviyesinde modül dışa aktarma ve içe aktarma ile tam bağımlılık yönetimi işlevlerini destekler.

### Temel Kavramlar

#### Modül Dışa Aktarma
Modül dışa aktarma, bir hizmetteki belirli kod birimlerini (bileşenler, yardımcı fonksiyonlar vb.) ESM formatında dışarıya açma sürecidir. İki tür dışa aktarma desteklenir:
- **Kaynak Kodu Dışa Aktarma**: Projedeki kaynak kod dosyalarını doğrudan dışa aktarır
- **Bağımlılık Dışa Aktarma**: Projenin kullandığı üçüncü taraf bağımlılık paketlerini dışa aktarır

#### Modül Bağlantısı
Modül içe aktarma, bir hizmette diğer hizmetler tarafından dışa aktarılan kod birimlerini referans alma sürecidir. Birden fazla kurulum yöntemi desteklenir:
- **Kaynak Kodu Kurulumu**: Geliştirme ortamları için uygundur, gerçek zamanlı değişiklik ve sıcak güncelleme desteği sunar
- **Yazılım Paketi Kurulumu**: Üretim ortamları için uygundur, doğrudan yapı ürünlerini kullanır

## Modül Dışa Aktarma

### Yapılandırma Açıklaması

`entry.node.ts` dosyasında dışa aktarılacak modülleri yapılandırın:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        exports: [
            // Kaynak kod dosyalarını dışa aktar
            'root:src/components/button.vue',  // Vue bileşeni
            'root:src/utils/format.ts',        // Yardımcı fonksiyon
            // Üçüncü taraf bağımlılıkları dışa aktar
            'npm:vue',                         // Vue çerçevesi
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies GezOptions;
```

Dışa aktarma yapılandırması iki türü destekler:
- `root:*`: Kaynak kod dosyalarını dışa aktarır, yol proje kök dizinine göredir
- `npm:*`: Üçüncü taraf bağımlılıkları dışa aktarır, doğrudan paket adı belirtilir

## Modül İçe Aktarma

### Yapılandırma Açıklaması

`entry.node.ts` dosyasında içe aktarılacak modülleri yapılandırın:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        // Bağlantı yapılandırması
        links: {
            // Kaynak kodu kurulumu: yapı ürünleri dizinine işaret eder
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Yazılım paketi kurulumu: paket dizinine işaret eder
            'other-remote': 'root:./node_modules/other-remote'
        },
        // İçe aktarma eşleme ayarları
        imports: {
            // Uzak modüllerdeki bağımlılıkları kullan
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies GezOptions;
```

Yapılandırma seçenekleri açıklaması:
1. **imports**: Uzak modüllerin yerel yollarını yapılandırır
   - Kaynak kodu kurulumu: yapı ürünleri dizinine (dist) işaret eder
   - Yazılım paketi kurulumu: doğrudan paket dizinine işaret eder

2. **externals**: Harici bağımlılıkları yapılandırır
   - Uzak modüllerdeki bağımlılıkları paylaşmak için kullanılır
   - Aynı bağımlılıkların tekrar paketlenmesini önler
   - Birden fazla modülün bağımlılıkları paylaşmasını destekler

### Kurulum Yöntemleri

#### Kaynak Kodu Kurulumu
Geliştirme ortamları için uygundur, gerçek zamanlı değişiklik ve sıcak güncelleme desteği sunar.

1. **Workspace Yöntemi**
Monorepo projelerinde kullanım için önerilir:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Link Yöntemi**
Yerel geliştirme ve hata ayıklama için kullanılır:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Yazılım Paketi Kurulumu
Üretim ortamları için uygundur, doğrudan yapı ürünlerini kullanır.

1. **NPM Registry**
npm registry üzerinden kurulum:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Statik Sunucu**
HTTP/HTTPS protokolü üzerinden kurulum:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Yazılım Paketi Oluşturma

### Yapılandırma Açıklaması

`entry.node.ts` dosyasında yapı seçeneklerini yapılandırın:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    // Modül dışa aktarma yapılandırması
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Yapı yapılandırması
    pack: {
        // Yapıyı etkinleştir
        enable: true,

        // Çıktı yapılandırması
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Özel package.json
        packageJson: async (gez, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Yapı öncesi işlemler
        onBefore: async (gez, pkg) => {
            // Tür bildirimleri oluştur
            // Test senaryolarını çalıştır
            // Dokümantasyonu güncelle vb.
        },

        // Yapı sonrası işlemler
        onAfter: async (gez, pkg, file) => {
            // CDN'e yükle
            // npm deposuna yayınla
            // Test ortamına dağıt vb.
        }
    }
} satisfies GezOptions;
```

### Yapı Ürünleri

```
your-app-name.tgz
├── package.json        # Paket bilgisi
├── index.js            # Üretim ortamı girişi
├── server/             # Sunucu tarafı kaynakları
│   └── manifest.json   # Sunucu tarafı kaynak eşlemesi
├── node/               # Node.js çalışma zamanı
└── client/             # İstemci tarafı kaynakları
    └── manifest.json   # İstemci tarafı kaynak eşlemesi
```

### Yayınlama Süreci

```bash
# 1. Üretim sürümünü oluştur
gez build

# 2. npm'e yayınla
npm publish dist/versions/your-app-name.tgz
```