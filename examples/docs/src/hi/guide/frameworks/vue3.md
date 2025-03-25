---
titleSuffix: Gez फ्रेमवर्क Vue3 SSR एप्लिकेशन उदाहरण
description: Gez पर आधारित Vue3 SSR एप्लिकेशन को शुरू से बनाने का तरीका, प्रोजेक्ट इनिशियलाइज़ेशन, Vue3 कॉन्फ़िगरेशन और एंट्री फ़ाइल सेटअप सहित फ्रेमवर्क के बेसिक उपयोग को उदाहरण के माध्यम से दिखाया गया है।
head:
  - - meta
    - property: keywords
      content: Gez, Vue3, SSR एप्लिकेशन, TypeScript कॉन्फ़िगरेशन, प्रोजेक्ट इनिशियलाइज़ेशन, सर्वर-साइड रेंडरिंग, क्लाइंट-साइड इंटरैक्शन, कंपोज़ेबल API
---

# Vue3

यह ट्यूटोरियल आपको Gez पर आधारित Vue3 SSR एप्लिकेशन को शुरू से बनाने में मदद करेगा। हम एक पूर्ण उदाहरण के माध्यम से Gez फ्रेमवर्क का उपयोग करके सर्वर-साइड रेंडरिंग एप्लिकेशन बनाने का तरीका दिखाएंगे।

## प्रोजेक्ट संरचना

सबसे पहले, प्रोजेक्ट की बेसिक संरचना को समझते हैं:

```bash
.
├── package.json         # प्रोजेक्ट कॉन्फ़िगरेशन फ़ाइल, डिपेंडेंसी और स्क्रिप्ट कमांड को परिभाषित करती है
├── tsconfig.json        # TypeScript कॉन्फ़िगरेशन फ़ाइल, कंपाइल विकल्प सेट करती है
└── src                  # सोर्स कोड डायरेक्टरी
    ├── app.vue          # मुख्य एप्लिकेशन कंपोनेंट, पेज संरचना और इंटरैक्शन लॉजिक को परिभाषित करता है
    ├── create-app.ts    # Vue इंस्टेंस क्रिएशन फैक्टरी, एप्लिकेशन इनिशियलाइज़ेशन के लिए जिम्मेदार
    ├── entry.client.ts  # क्लाइंट-साइड एंट्री फ़ाइल, ब्राउज़र-साइड रेंडरिंग को हैंडल करती है
    ├── entry.node.ts    # Node.js सर्वर एंट्री फ़ाइल, डेवलपमेंट एनवायरनमेंट कॉन्फ़िगरेशन और सर्वर स्टार्टअप के लिए जिम्मेदार
    └── entry.server.ts  # सर्वर-साइड एंट्री फ़ाइल, SSR रेंडरिंग लॉजिक को हैंडल करती है
```

## प्रोजेक्ट कॉन्फ़िगरेशन

### package.json

`package.json` फ़ाइल बनाएं, प्रोजेक्ट डिपेंडेंसी और स्क्रिप्ट को कॉन्फ़िगर करें:

```json title="package.json"
{
  "name": "ssr-demo-vue3",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack-vue": "*",
    "@types/node": "22.8.6",
    "@vue/server-renderer": "^3.5.13",
    "typescript": "^5.7.3",
    "vue": "^3.5.13",
    "vue-tsc": "^2.1.6"
  }
}
```

`package.json` फ़ाइल बनाने के बाद, प्रोजेक्ट डिपेंडेंसी को इंस्टॉल करने की आवश्यकता है। आप निम्नलिखित किसी भी कमांड का उपयोग करके इंस्टॉल कर सकते हैं:
```bash
pnpm install
# या
yarn install
# या
npm install
```

यह सभी आवश्यक डिपेंडेंसी पैकेज को इंस्टॉल करेगा, जिसमें Vue3, TypeScript और SSR से संबंधित डिपेंडेंसी शामिल हैं।

### tsconfig.json

`tsconfig.json` फ़ाइल बनाएं, TypeScript कंपाइल विकल्प को कॉन्फ़िगर करें:

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

## सोर्स कोड संरचना

### app.vue

मुख्य एप्लिकेशन कंपोनेंट `src/app.vue` बनाएं, Vue3 के कंपोज़ेबल API का उपयोग करें:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Gez क्विक स्टार्ट</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file उदाहरण कंपोनेंट
 * @description Gez फ्रेमवर्क की बेसिक फंक्शनलिटी को डेमोस्ट्रेट करने के लिए ऑटो-अपडेटिंग टाइम के साथ पेज टाइटल दिखाता है
 */

import { onMounted, onUnmounted, ref } from 'vue';

// वर्तमान समय, हर सेकंड अपडेट होता है
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

`src/create-app.ts` फ़ाइल बनाएं, Vue एप्लिकेशन इंस्टेंस बनाने के लिए जिम्मेदार:

```ts title="src/create-app.ts"
/**
 * @file Vue इंस्टेंस क्रिएशन
 * @description Vue एप्लिकेशन इंस्टेंस को बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार
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

क्लाइंट-साइड एंट्री फ़ाइल `src/entry.client.ts` बनाएं:

```ts title="src/entry.client.ts"
/**
 * @file क्लाइंट-साइड एंट्री फ़ाइल
 * @description क्लाइंट-साइड इंटरैक्शन लॉजिक और डायनामिक अपडेट को हैंडल करती है
 */

import { createApp } from './create-app';

// Vue इंस्टेंस बनाएं
const { app } = createApp();

// Vue इंस्टेंस को माउंट करें
app.mount('#app');
```

### entry.node.ts

`entry.node.ts` फ़ाइल बनाएं, डेवलपमेंट एनवायरनमेंट और सर्वर स्टार्टअप को कॉन्फ़िगर करें:

```ts title="src/entry.node.ts"
/**
 * @file Node.js सर्वर एंट्री फ़ाइल
 * @description डेवलपमेंट एनवायरनमेंट कॉन्फ़िगरेशन और सर्वर स्टार्टअप के लिए जिम्मेदार, SSR रनटाइम एनवायरनमेंट प्रदान करता है
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * डेवलपमेंट एनवायरनमेंट के लिए एप्लिकेशन क्रिएटर को कॉन्फ़िगर करें
     * @description Rspack एप्लिकेशन इंस्टेंस को बनाने और कॉन्फ़िगर करने के लिए, डेवलपमेंट एनवायरनमेंट के लिए बिल्ड और हॉट अपडेट को सपोर्ट करता है
     * @param gez Gez फ्रेमवर्क इंस्टेंस, कोर फंक्शनलिटी और कॉन्फ़िगरेशन इंटरफेस प्रदान करता है
     * @returns कॉन्फ़िगर किया गया Rspack एप्लिकेशन इंस्टेंस, HMR और रियल-टाइम प्रीव्यू को सपोर्ट करता है
     */
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue3App(gez, {
                config(context) {
                    // यहां Rspack कंपाइल कॉन्फ़िगरेशन को कस्टमाइज़ करें
                }
            })
        );
    },

    /**
     * HTTP सर्वर को कॉन्फ़िगर और स्टार्ट करें
     * @description HTTP सर्वर इंस्टेंस बनाएं, Gez मिडलवेयर को इंटीग्रेट करें, SSR रिक्वेस्ट को हैंडल करें
     * @param gez Gez फ्रेमवर्क इंस्टेंस, मिडलवेयर और रेंडरिंग फंक्शनलिटी प्रदान करता है
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Gez मिडलवेयर का उपयोग करके रिक्वेस्ट को हैंडल करें
            gez.middleware(req, res, async () => {
                // सर्वर-साइड रेंडरिंग को एक्ज़ीक्यूट करें
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('सर्वर स्टार्ट: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

यह फ़ाइल डेवलपमेंट एनवायरनमेंट कॉन्फ़िगरेशन और सर्वर स्टार्टअप के लिए एंट्री फ़ाइल है, जिसमें दो मुख्य फंक्शनलिटी शामिल हैं:

1. `devApp` फ़ंक्शन: डेवलपमेंट एनवायरनमेंट के लिए Rspack एप्लिकेशन इंस्टेंस को बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार है, जो हॉट अपडेट और रियल-टाइम प्रीव्यू को सपोर्ट करता है। यहां `createRspackVue3App` का उपयोग करके Vue3 के लिए विशेष Rspack एप्लिकेशन इंस्टेंस बनाया जाता है।
2. `server` फ़ंक्शन: HTTP सर्वर को बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार है, जो Gez मिडलवेयर को इंटीग्रेट करके SSR रिक्वेस्ट को हैंडल करता है।

### entry.server.ts

सर्वर-साइड रेंडरिंग एंट्री फ़ाइल `src/entry.server.ts` बनाएं:

```ts title="src/entry.server.ts"
/**
 * @file सर्वर-साइड रेंडरिंग एंट्री फ़ाइल
 * @description सर्वर-साइड रेंडरिंग प्रोसेस, HTML जनरेशन और रिसोर्स इंजेक्शन के लिए जिम्मेदार
 */

import type { RenderContext } from '@gez/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Vue एप्लिकेशन इंस्टेंस बनाएं
    const { app } = createApp();

    // Vue के renderToString का उपयोग करके पेज कंटेंट जनरेट करें
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // डिपेंडेंसी कलेक्शन को कमिट करें, सभी आवश्यक रिसोर्स को लोड करने की पुष्टि करें
    await rc.commit();

    // पूर्ण HTML संरचना जनरेट करें
    rc.html = `<!DOCTYPE html>
<html lang="hi-IN">
<head>
    ${rc.preload()}
    <title>Gez क्विक स्टार्ट</title>
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

## प्रोजेक्ट को रन करें

उपरोक्त फ़ाइल कॉन्फ़िगरेशन को पूरा करने के बाद, आप निम्नलिखित कमांड का उपयोग करके प्रोजेक्ट को रन कर सकते हैं:

1. डेवलपमेंट मोड:
```bash
npm run dev
```

2. प्रोजेक्ट बिल्ड करें:
```bash
npm run build
```

3. प्रोडक्शन एनवायरनमेंट में रन करें:
```bash
npm run start
```

अब, आपने Gez पर आधारित Vue3 SSR एप्लिकेशन को सफलतापूर्वक बना लिया है! http://localhost:3000 पर विज़िट करके परिणाम देख सकते हैं।