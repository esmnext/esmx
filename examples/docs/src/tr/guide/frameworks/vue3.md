---
titleSuffix: Esmx Framework Vue3 SSR Uygulama Örneği
description: Esmx tabanlı Vue3 SSR uygulamasını sıfırdan oluşturun, proje başlatma, Vue3 yapılandırması ve giriş dosyası ayarları dahil olmak üzere temel kullanımı örneklerle gösterin.
head:
  - - meta
    - property: keywords
      content: Esmx, Vue3, SSR uygulaması, TypeScript yapılandırması, proje başlatma, sunucu tarafı render, istemci etkileşimi, Composition API
---

# Vue3

Bu eğitim, Esmx tabanlı bir Vue3 SSR uygulamasını sıfırdan oluşturmanıza yardımcı olacaktır. Esmx framework'ünü kullanarak sunucu tarafı render (SSR) uygulaması oluşturmayı tam bir örnekle göstereceğiz.

## Proje Yapısı

Öncelikle, projenin temel yapısını anlayalım:

```bash
.
├── package.json         # Proje yapılandırma dosyası, bağımlılıkları ve komut dosyalarını tanımlar
├── tsconfig.json        # TypeScript yapılandırma dosyası, derleme seçeneklerini ayarlar
└── src                  # Kaynak kod dizini
    ├── app.vue          # Ana uygulama bileşeni, sayfa yapısını ve etkileşim mantığını tanımlar
    ├── create-app.ts    # Vue örneği oluşturma fabrikası, uygulamayı başlatmaktan sorumludur
    ├── entry.client.ts  # İstemci giriş dosyası, tarayıcı tarafı render işlemlerini yönetir
    ├── entry.node.ts    # Node.js sunucu giriş dosyası, geliştirme ortamı yapılandırması ve sunucu başlatmadan sorumludur
    └── entry.server.ts  # Sunucu giriş dosyası, SSR render mantığını yönetir
```

## Proje Yapılandırması

### package.json

`package.json` dosyasını oluşturun ve proje bağımlılıklarını ve komut dosyalarını yapılandırın:

```json title="package.json"
{
  "name": "ssr-demo-vue3",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack-vue": "*",
    "@types/node": "22.8.6",
    "@vue/server-renderer": "^3.5.13",
    "typescript": "^5.7.3",
    "vue": "^3.5.13",
    "vue-tsc": "^2.1.6"
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

Bu, Vue3, TypeScript ve SSR ile ilgili bağımlılıklar dahil olmak üzere tüm gerekli paketleri yükleyecektir.

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
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Kaynak Kod Yapısı

### app.vue

Ana uygulama bileşeni `src/app.vue`'yi oluşturun, Vue3 Composition API'sini kullanın:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Esmx Hızlı Başlangıç</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Örnek bileşen
 * @description Esmx framework'ünün temel işlevlerini göstermek için otomatik güncellenen bir zaman damgası içeren bir sayfa başlığı gösterir
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Mevcut zaman, her saniye güncellenir
const time = ref(new Date().toISOString());
let timer: NodeJS.Timeout;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date().toISOString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>
```

### create-app.ts

`src/create-app.ts` dosyasını oluşturun, Vue uygulama örneğini oluşturmaktan sorumludur:

```ts title="src/create-app.ts"
/**
 * @file Vue örneği oluşturma
 * @description Vue uygulama örneğini oluşturma ve yapılandırmadan sorumludur
 */

import { createSSRApp } from 'vue';
import App from './app.vue';

export function createApp() {
    const app = createSSRApp(App);
    return {
        app
    };
}
```

### entry.client.ts

İstemci giriş dosyası `src/entry.client.ts`'yi oluşturun:

```ts title="src/entry.client.ts"
/**
 * @file İstemci giriş dosyası
 * @description İstemci etkileşim mantığını ve dinamik güncellemeleri yönetir
 */

import { createApp } from './create-app';

// Vue örneği oluştur
const { app } = createApp();

// Vue örneğini bağla
app.mount('#app');
```

### entry.node.ts

`entry.node.ts` dosyasını oluşturun, geliştirme ortamını ve sunucu başlatmayı yapılandırın:

```ts title="src/entry.node.ts"
/**
 * @file Node.js sunucu giriş dosyası
 * @description Geliştirme ortamı yapılandırması ve sunucu başlatmadan sorumludur, SSR çalışma zamanı ortamı sağlar
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Geliştirme ortamı uygulama oluşturucuyu yapılandır
     * @description Geliştirme ortamı için Rspack uygulama örneği oluşturur ve yapılandırır, HMR ve gerçek zamanlı önizleme desteği sağlar
     * @param esmx Esmx framework örneği, temel işlevler ve yapılandırma arayüzleri sağlar
     * @returns Yapılandırılmış Rspack uygulama örneği, HMR ve gerçek zamanlı önizleme desteği ile döndürür
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx, {
                config(context) {
                    // Rspack derleme yapılandırmasını özelleştirin
                }
            })
        );
    },

    /**
     * HTTP sunucusunu yapılandır ve başlat
     * @description HTTP sunucu örneği oluşturur, Esmx middleware'ini entegre eder ve SSR isteklerini işler
     * @param esmx Esmx framework örneği, middleware ve render işlevleri sağlar
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Esmx middleware'ini kullanarak isteği işle
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

Bu dosya, geliştirme ortamı yapılandırması ve sunucu başlatma için giriş dosyasıdır ve iki temel işlev içerir:

1. `devApp` fonksiyonu: Geliştirme ortamı için Rspack uygulama örneği oluşturur ve yapılandırır, sıcak modül değiştirme (HMR) ve gerçek zamanlı önizleme desteği sağlar. Burada, Vue3 için özel olarak `createRspackVue3App` kullanılarak Rspack uygulama örneği oluşturulur.
2. `server` fonksiyonu: HTTP sunucusu oluşturur ve yapılandırır, Esmx middleware'ini entegre eder ve SSR isteklerini işler.

### entry.server.ts

Sunucu tarafı render giriş dosyası `src/entry.server.ts`'yi oluşturun:

```ts title="src/entry.server.ts"
/**
 * @file Sunucu tarafı render giriş dosyası
 * @description Sunucu tarafı render sürecini, HTML oluşturmayı ve kaynak enjeksiyonunu yönetir
 */

import type { RenderContext } from '@esmx/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Vue uygulama örneği oluştur
    const { app } = createApp();

    // Vue'un renderToString'i ile sayfa içeriği oluştur
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Bağımlılık toplamayı tamamla, tüm gerekli kaynakların yüklendiğinden emin ol
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

Artık Esmx tabanlı bir Vue3 SSR uygulaması başarıyla oluşturdunuz! http://localhost:3000 adresini ziyaret ederek sonucu görebilirsiniz.