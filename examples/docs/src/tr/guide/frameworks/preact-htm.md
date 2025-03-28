---
titleSuffix: Esmx Framework Preact+HTM SSR Uygulama Örneği
description: Esmx tabanlı Preact+HTM SSR uygulamasını sıfırdan oluşturun, proje başlatma, Preact yapılandırması ve giriş dosyası ayarları dahil olmak üzere temel çerçeve kullanımını örneklerle gösterin.
head:
  - - meta
    - property: keywords
      content: Esmx, Preact, HTM, SSR uygulaması, TypeScript yapılandırması, proje başlatma, sunucu tarafı render, istemci etkileşimi
---

# Preact+HTM

Bu eğitim, Esmx tabanlı bir Preact+HTM SSR uygulamasını sıfırdan oluşturmanıza yardımcı olacaktır. Esmx çerçevesini kullanarak sunucu tarafı render (SSR) uygulaması oluşturmayı tam bir örnekle göstereceğiz.

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
    ├── entry.node.ts    # Node.js sunucu giriş dosyası, geliştirme ortamı yapılandırması ve sunucu başlatma işlemlerini yönetir
    └── entry.server.ts  # Sunucu giriş dosyası, SSR render mantığını yönetir
```

## Proje Yapılandırması

### package.json

`package.json` dosyasını oluşturun ve proje bağımlılıklarını ve komut dosyalarını yapılandırın:

```json title="package.json"
{
  "name": "ssr-demo-preact-htm",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "22.8.6",
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
  }
}
```

`package.json` dosyasını oluşturduktan sonra, proje bağımlılıklarını yüklemeniz gerekiyor. Yükleme işlemi için aşağıdaki komutlardan herhangi birini kullanabilirsiniz:
```bash
pnpm install
# veya
yarn install
# veya
npm install
```

Bu, Preact, HTM, TypeScript ve SSR ile ilgili bağımlılıklar dahil olmak üzere tüm gerekli paketleri yükleyecektir.

### tsconfig.json

`tsconfig.json` dosyasını oluşturun ve TypeScript derleme seçeneklerini yapılandırın:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "node",
        "strict": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "paths": {
            "ssr-demo-preact-htm/src/*": [
                "./src/*"
            ],
            "ssr-demo-preact-htm/*": [
                "./*"
            ]
        }
    },
    "include": [
        "src"
    ],
    "exclude": [
        "dist"
    ]
}
```

## Kaynak Kod Yapısı

### app.ts

Ana uygulama bileşeni `src/app.ts` dosyasını oluşturun, Preact'in sınıf bileşenlerini ve HTM'yi kullanın:

```ts title="src/app.ts"
/**
 * @file Örnek bileşen
 * @description Esmx çerçevesinin temel işlevlerini göstermek için otomatik güncellenen bir sayfa başlığı gösterir
 */

import { Component } from 'preact';
import { html } from 'htm/preact';

export default class App extends Component {
    state = {
        time: new Date().toISOString()
    };

    timer: NodeJS.Timeout | null = null;

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                time: new Date().toISOString()
            });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        const { time } = this.state;
        return html`
            <div>
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Esmx Hızlı Başlangıç</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

`src/create-app.ts` dosyasını oluşturun, uygulama örneği oluşturmaktan sorumludur:

```ts title="src/create-app.ts"
/**
 * @file Uygulama örneği oluşturma
 * @description Uygulama örneği oluşturma ve yapılandırmadan sorumludur
 */

import type { VNode } from 'preact';
import { html } from 'htm/preact';
import App from './app';

export function createApp(): { app: VNode } {
    const app = html`<${App} />`;
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

import { render } from 'preact';
import { createApp } from './create-app';

// Uygulama örneği oluştur
const { app } = createApp();

// Uygulama örneğini bağla
render(app, document.getElementById('app')!);
```

### entry.node.ts

`entry.node.ts` dosyasını oluşturun, geliştirme ortamını yapılandırın ve sunucuyu başlatın:

```ts title="src/entry.node.ts"
/**
 * @file Node.js sunucu giriş dosyası
 * @description Geliştirme ortamı yapılandırması ve sunucu başlatma işlemlerinden sorumludur, SSR çalışma zamanı ortamı sağlar
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Geliştirme ortamı uygulama oluşturucuyu yapılandır
     * @description Rspack uygulama örneği oluştur ve yapılandır, geliştirme ortamı için derleme ve sıcak yenileme sağlar
     * @param esmx Esmx çerçeve örneği, temel işlevler ve yapılandırma arayüzü sağlar
     * @returns Yapılandırılmış Rspack uygulama örneği, HMR ve gerçek zamanlı önizleme desteği
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Rspack derleme yapılandırmasını özelleştir
                }
            })
        );
    },

    /**
     * HTTP sunucusunu yapılandır ve başlat
     * @description HTTP sunucu örneği oluştur, Esmx ara yazılımını entegre et, SSR isteklerini işle
     * @param esmx Esmx çerçeve örneği, ara yazılım ve render işlevleri sağlar
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Esmx ara yazılımı ile istekleri işle
            esmx.middleware(req, res, async () => {
                // Sunucu tarafı render işlemini gerçekleştir
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Sunucu başlatıldı: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

Bu dosya, geliştirme ortamı yapılandırması ve sunucu başlatma işlemlerinin giriş dosyasıdır ve iki temel işlev içerir:

1. `devApp` fonksiyonu: Geliştirme ortamı için Rspack uygulama örneği oluşturma ve yapılandırmadan sorumludur, sıcak yenileme ve gerçek zamanlı önizleme işlevlerini destekler. Burada, Preact+HTM için özel olarak Rspack uygulama örneği oluşturmak üzere `createRspackHtmlApp` kullanılır.
2. `server` fonksiyonu: HTTP sunucusu oluşturma ve yapılandırmadan sorumludur, Esmx ara yazılımını entegre ederek SSR isteklerini işler.

### entry.server.ts

Sunucu tarafı render giriş dosyası `src/entry.server.ts` dosyasını oluşturun:

```ts title="src/entry.server.ts"
/**
 * @file Sunucu tarafı render giriş dosyası
 * @description Sunucu tarafı render sürecini, HTML oluşturmayı ve kaynak enjeksiyonunu yönetir
 */

import type { RenderContext } from '@esmx/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Uygulama örneği oluştur
    const { app } = createApp();

    // Preact'in renderToString'i ile sayfa içeriği oluştur
    const html = render(app);

    // Gerekli tüm kaynakların yüklendiğinden emin olmak için bağımlılık toplamayı tamamla
    await rc.commit();

    // Tam HTML yapısını oluştur
    rc.html = `<!DOCTYPE html>
<html lang="tr-TR">
<head>
    ${rc.preload()}
    <title>Esmx Hızlı Başlangıç</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
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

Artık Esmx tabanlı bir Preact+HTM SSR uygulamasını başarıyla oluşturdunuz! http://localhost:3000 adresini ziyaret ederek sonucu görebilirsiniz.