---
titleSuffix: Esmx Çerçevesi Proje Yapısı ve Standartları Kılavuzu
description: Esmx çerçevesinin standart proje yapısını, giriş dosyası standartlarını ve yapılandırma dosyası standartlarını detaylı bir şekilde açıklar, geliştiricilerin standartlaştırılmış ve bakımı kolay SSR uygulamaları oluşturmasına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, Proje Yapısı, Giriş Dosyası, Yapılandırma Standartları, SSR Çerçevesi, TypeScript, Proje Standartları, Geliştirme Standartları
---

# Standartlar

Esmx, modern bir SSR çerçevesidir ve projelerin geliştirme ve üretim ortamlarında tutarlılığını ve bakımını sağlamak için standartlaştırılmış proje yapısı ve yol çözümleme mekanizması kullanır.

## Proje Yapısı Standartları

### Standart Dizin Yapısı

```txt
root
│─ dist                  # Derleme çıktı dizini
│  ├─ package.json       # Derleme sonrası yazılım paketi yapılandırması
│  ├─ server             # Sunucu tarafı derleme çıktısı
│  │  └─ manifest.json   # Derleme manifest çıktısı, importmap oluşturmak için kullanılır
│  ├─ node               # Node sunucu programı derleme çıktısı
│  ├─ client             # İstemci tarafı derleme çıktısı
│  │  ├─ versions        # Sürüm depolama dizini
│  │  │  └─ latest.tgz   # dist dizinini arşivler, yazılım paketi dağıtımı için kullanılır
│  │  └─ manifest.json   # Derleme manifest çıktısı, importmap oluşturmak için kullanılır
│  └─ src                # tsc ile oluşturulan dosya türleri
├─ src
│  ├─ entry.server.ts    # Sunucu tarafı uygulama girişi
│  ├─ entry.client.ts    # İstemci tarafı uygulama girişi
│  └─ entry.node.ts      # Node sunucu uygulaması girişi
├─ tsconfig.json         # TypeScript yapılandırması
└─ package.json          # Yazılım paketi yapılandırması
```

::: tip Ek Bilgi
- `esmx.name`, `package.json` dosyasındaki `name` alanından alınır
- `dist/package.json`, kök dizindeki `package.json` dosyasından alınır
- `packs.enable` değeri `true` olarak ayarlandığında, `dist` dizini arşivlenir

:::

## Giriş Dosyası Standartları

### entry.client.ts
İstemci tarafı giriş dosyası şunlardan sorumludur:
- **Uygulama Başlatma**: İstemci tarafı uygulamanın temel ayarlarını yapılandırır
- **Rota Yönetimi**: İstemci tarafı rotaları ve esmxinmeyi işler
- **Durum Yönetimi**: İstemci tarafı durumlarının saklanmasını ve güncellenmesini sağlar
- **Etkileşim Yönetimi**: Kullanıcı olaylarını ve arayüz etkileşimlerini yönetir

### entry.server.ts
Sunucu tarafı giriş dosyası şunlardan sorumludur:
- **Sunucu Tarafı Render**: SSR render sürecini yürütür
- **HTML Oluşturma**: Başlangıç sayfa yapısını oluşturur
- **Veri Ön Alma**: Sunucu tarafı veri alımını işler
- **Durum Enjeksiyonu**: Sunucu tarafı durumunu istemci tarafına aktarır
- **SEO Optimizasyonu**: Sayfanın arama motoru optimizasyonunu sağlar

### entry.node.ts
Node.js sunucu giriş dosyası şunlardan sorumludur:
- **Sunucu Yapılandırması**: HTTP sunucu parametrelerini ayarlar
- **Rota İşleme**: Sunucu tarafı rota kurallarını yönetir
- **Middleware Entegrasyonu**: Sunucu middleware'lerini yapılandırır
- **Ortam Yönetimi**: Ortam değişkenlerini ve yapılandırmaları işler
- **İstek Yanıt**: HTTP isteklerini ve yanıtlarını işler

## Yapılandırma Dosyası Standartları

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```