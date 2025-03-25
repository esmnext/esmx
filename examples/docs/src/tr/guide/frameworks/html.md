---
titleSuffix: Gez Framework HTML SSR Uygulama Örneği
description: Gez tabanlı bir HTML SSR uygulamasını sıfırdan oluşturun, proje başlatma, HTML yapılandırması ve giriş dosyası ayarları dahil olmak üzere framework'ün temel kullanımını bir örnekle gösterin.
head:
  - - meta
    - property: keywords
      content: Gez, HTML, SSR uygulaması, TypeScript yapılandırması, proje başlatma, sunucu tarafı render, istemci etkileşimi
---

# HTML

Bu eğitim, Gez tabanlı bir HTML SSR uygulamasını sıfırdan oluşturmanıza yardımcı olacaktır. Gez framework'ünü kullanarak sunucu tarafı render (SSR) uygulaması oluşturmayı tam bir örnekle göstereceğiz.

## Proje Yapısı

Öncelikle, projenin temel yapısını anlayalım:

```bash
.
├── package.json         # Proje yapılandırma dosyası, bağımlılıkları ve komut dosyalarını tanımlar
├── tsconfig.json        # TypeScript yapılandırma dosyası, derleme seçeneklerini ayarlar
└── src                  # Kaynak kod dizini
    ├── app.ts           # Ana uygulama bileşeni, sayfa yapısını ve etkileşim mantığını tanımlar
    ├── create-app.ts    # Uygulama örneği oluşturma fabrikası, uygulamayı başlatmaktan sorumludur
    ├── entry.client.ts  # İstemci giriş dosyası, tarayıcı tarafı render işlemlerini yönetir
    ├── entry.node.ts    # Node.js sunucu giriş dosyası, geliştirme ortamı yapılandırması ve sunucu başlatmadan sorumludur
    └── entry.server.ts  # Sunucu giriş dosyası, SSR render mantığını yönetir
```

## Proje Yapılandırması

### package.json

`package.json` dosyasını oluşturun ve proje bağımlılıklarını ve komut dosyalarını yapılandırın:

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
  }
}
```

`package.json` dosyasını oluşturduktan sonra, proje bağımlılıklarını yüklemelisiniz. Aşağıdaki komutlardan herhangi birini kullanarak yükleyebilirsiniz:
```bash
pnpm install
# veya
yarn install
# veya
npm install
```

Bu, TypeScript ve SSR ile ilgili bağımlılıklar dahil olmak üzere tüm gerekli bağımlılıkları yükleyecektir.

### tsconfig.json

`tsconfig.json` dosyasını oluşturun ve TypeScript derleme seçeneklerini yapılandırın:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Kaynak Kod Yapısı

### app.ts

Ana uygulama bileşeni `src/app.ts` dosyasını oluşturun ve sayfa yapısını ve etkileşim mantığını uygulayın:

```ts title="src/app.ts"
/**
 * @file Örnek bileşen
 * @description Gez framework'ünün temel işlevlerini göstermek için otomatik güncellenen bir sayfa başlığı gösterir
 */

export default class App {
    /**
     * Geçerli zaman, ISO formatında
     * @type {string}
     */
    public time = '';

    /**
     * Uygulama örneği oluştur
     * @param {SsrContext} [ssrContext] - Sunucu tarafı bağlam, içe aktarma meta veri koleksiyonunu içerir
     */
    public constructor(public ssrContext?: SsrContext) {
        // Kurucu fonksiyonda ek başlatma gerekmez
    }

    /**
     * Sayfa içeriğini render et
     * @returns {string} Sayfa HTML yapısını döndürür
     */
    public render(): string {
        // Sunucu tarafı ortamında doğru şekilde içe aktarma meta verilerini topla
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Gez Hızlı Başlangıç</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * İstemci tarafı başlatma
     * @throws {Error} Zaman görüntüleme öğesi bulunamazsa hata fırlatır
     */
    public onClient(): void {
        // Zaman görüntüleme öğesini al
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Zaman görüntüleme öğesi bulunamadı');
        }

        // Zamanlayıcıyı ayarla, her saniye zamanı güncelle
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Sunucu tarafı başlatma
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Sunucu tarafı bağlam arayüzü
 * @interface
 */
export interface SsrContext {
    /**
     * İçe aktarma meta veri koleksiyonu
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

`src/create-app.ts` dosyasını oluşturun ve uygulama örneği oluşturma işlevini uygulayın:

```ts title="src/create-app.ts"
/**
 * @file Uygulama örneği oluşturma
 * @description Uygulama örneği oluşturma ve yapılandırmadan sorumludur
 */

import App from './app';

export function createApp() {
    const app = new App();
    return {
        app
    };
}
```

### entry.client.ts

İstemci giriş dosyası `src/entry.client.ts` dosyasını oluşturun:

```ts title="src/entry.client.ts"
/**
 * @file İstemci giriş dosyası
 * @description İstemci etkileşim mantığı ve dinamik güncellemelerden sorumludur
 */

import { createApp } from './create-app';

// Uygulama örneği oluştur ve başlat
const { app } = createApp();
app.onClient();
```

### entry.node.ts

`entry.node.ts` dosyasını oluşturun ve geliştirme ortamı yapılandırması ve sunucu başlatma işlevlerini uygulayın:

```ts title="src/entry.node.ts"
/**
 * @file Node.js sunucu giriş dosyası
 * @description Geliştirme ortamı yapılandırması ve sunucu başlatmadan sorumludur, SSR çalışma zamanı ortamı sağlar
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Geliştirme ortamı için uygulama oluşturucuyu yapılandır
     * @description Rspack uygulama örneği oluştur ve yapılandır, geliştirme ortamı için derleme ve sıcak yenileme sağlar
     * @param gez Gez framework örneği, temel işlevler ve yapılandırma arayüzü sağlar
     * @returns Yapılandırılmış Rspack uygulama örneğini döndürür, HMR ve gerçek zamanlı önizleme desteği sağlar
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // Burada Rspack derleme yapılandırmasını özelleştirin
                }
            })
        );
    },

    /**
     * HTTP sunucusunu yapılandır ve başlat
     * @description HTTP sunucu örneği oluştur, Gez ara yazılımını entegre et, SSR isteklerini işle
     * @param gez Gez framework örneği, ara yazılım ve render işlevleri sağlar
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Gez ara yazılımını kullanarak isteği işle
            gez.middleware(req, res, async () => {
                // Sunucu tarafı render işlemini gerçekleştir
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Sunucu başlatıldı: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Bu dosya, geliştirme ortamı yapılandırması ve sunucu başlatma işlevlerini içerir ve iki temel işlevi vardır:

1. `devApp` fonksiyonu: Geliştirme ortamı için Rspack uygulama örneği oluşturur ve yapılandırır, sıcak yenileme ve gerçek zamanlı önizleme desteği sağlar.
2. `server` fonksiyonu: HTTP sunucusu oluşturur ve yapılandırır, Gez ara yazılımını entegre ederek SSR isteklerini işler.

### entry.server.ts

Sunucu tarafı render giriş dosyası `src/entry.server.ts` dosyasını oluşturun:

```ts title="src/entry.server.ts"
/**
 * @file Sunucu tarafı render giriş dosyası
 * @description Sunucu tarafı render sürecini, HTML oluşturmayı ve kaynak enjeksiyonunu yönetir
 */

import type { RenderContext } from '@gez/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Sayfa içeriği oluşturma mantığını kapsülle
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Sunucu tarafı render bağlamını uygulama örneğine enjekte et
    app.ssrContext = ssrContext;
    // Sunucu tarafını başlat
    app.onServer();

    // Sayfa içeriğini oluştur
    return app.render();
};

export default async (rc: RenderContext) => {
    // Uygulama örneği oluştur, app örneğini içeren nesneyi döndür
    const { app } = createApp();
    // renderToString kullanarak sayfa içeriğini oluştur
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Bağımlılık toplamayı tamamla, tüm gerekli kaynakların yüklendiğinden emin ol
    await rc.commit();

    // Tam HTML yapısını oluştur
    rc.html = `<!DOCTYPE html>
<html lang="tr">
<head>
    ${rc.preload()}
    <title>Gez Hızlı Başlangıç</title>
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

## Projeyi Çalıştırma

Yukarıdaki dosya yapılandırmalarını tamamladıktan sonra, projeyi çalıştırmak için aşağıdaki komutları kullanabilirsiniz:

1. Geliştirme modu:
```bash
npm run dev
```

2. Projeyi derle:
```bash
npm run build
```

3. Üretim ortamında çalıştır:
```bash
npm run start
```

Artık Gez tabanlı bir HTML SSR uygulamasını başarıyla oluşturdunuz! http://localhost:3000 adresini ziyaret ederek sonucu görebilirsiniz.