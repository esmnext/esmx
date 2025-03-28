---
titleSuffix: Esmx फ्रेमवर्क HTML SSR एप्लिकेशन उदाहरण
description: Esmx पर आधारित HTML SSR एप्लिकेशन को शुरू से बनाने का उदाहरण, जिसमें प्रोजेक्ट इनिशियलाइज़ेशन, HTML कॉन्फ़िगरेशन और एंट्री फ़ाइल सेटअप शामिल हैं।
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, SSR एप्लिकेशन, TypeScript कॉन्फ़िगरेशन, प्रोजेक्ट इनिशियलाइज़ेशन, सर्वर-साइड रेंडरिंग, क्लाइंट-साइड इंटरैक्शन
---

# HTML

यह ट्यूटोरियल आपको Esmx पर आधारित एक HTML SSR एप्लिकेशन को शुरू से बनाने में मदद करेगा। हम एक पूर्ण उदाहरण के माध्यम से दिखाएंगे कि Esmx फ्रेमवर्क का उपयोग करके सर्वर-साइड रेंडरिंग एप्लिकेशन कैसे बनाया जाता है।

## प्रोजेक्ट संरचना

सबसे पहले, प्रोजेक्ट की मूल संरचना को समझते हैं:

```bash
.
├── package.json         # प्रोजेक्ट कॉन्फ़िग फ़ाइल, डिपेंडेंसी और स्क्रिप्ट कमांड को परिभाषित करती है
├── tsconfig.json        # TypeScript कॉन्फ़िग फ़ाइल, कंपाइल विकल्प सेट करती है
└── src                  # सोर्स कोड डायरेक्टरी
    ├── app.ts           # मुख्य एप्लिकेशन कंपोनेंट, पेज संरचना और इंटरैक्शन लॉजिक को परिभाषित करता है
    ├── create-app.ts    # एप्लिकेशन इंस्टेंस क्रिएशन फैक्टरी, एप्लिकेशन को इनिशियलाइज़ करने के लिए जिम्मेदार
    ├── entry.client.ts  # क्लाइंट-साइड एंट्री फ़ाइल, ब्राउज़र-साइड रेंडरिंग को हैंडल करती है
    ├── entry.node.ts    # Node.js सर्वर एंट्री फ़ाइल, डेवलपमेंट एनवायरनमेंट कॉन्फ़िगरेशन और सर्वर स्टार्टअप के लिए जिम्मेदार
    └── entry.server.ts  # सर्वर-साइड एंट्री फ़ाइल, SSR रेंडरिंग लॉजिक को हैंडल करती है
```

## प्रोजेक्ट कॉन्फ़िगरेशन

### package.json

`package.json` फ़ाइल बनाएं, प्रोजेक्ट डिपेंडेंसी और स्क्रिप्ट को कॉन्फ़िगर करें:

```json title="package.json"
{
  "name": "ssr-demo-html",
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
    "typescript": "^5.7.3"
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

यह सभी आवश्यक डिपेंडेंसी पैकेज को इंस्टॉल करेगा, जिसमें TypeScript और SSR से संबंधित डिपेंडेंसी शामिल हैं।

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
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## सोर्स कोड संरचना

### app.ts

मुख्य एप्लिकेशन कंपोनेंट `src/app.ts` बनाएं, पेज संरचना और इंटरैक्शन लॉजिक को इम्प्लीमेंट करें:

```ts title="src/app.ts"
/**
 * @file उदाहरण कंपोनेंट
 * @description Esmx फ्रेमवर्क की मूल कार्यक्षमता को प्रदर्शित करने के लिए ऑटो-अपडेट समय के साथ एक पेज टाइटल दिखाता है
 */

export default class App {
    /**
     * वर्तमान समय, ISO फॉर्मेट में
     * @type {string}
     */
    public time = '';

    /**
     * एप्लिकेशन इंस्टेंस बनाएं
     * @param {SsrContext} [ssrContext] - सर्वर-साइड कॉन्टेक्स्ट, इम्पोर्ट मेटाडेटा कलेक्शन शामिल है
     */
    public constructor(public ssrContext?: SsrContext) {
        // कंस्ट्रक्टर में अतिरिक्त इनिशियलाइज़ेशन की आवश्यकता नहीं है
    }

    /**
     * पेज कंटेंट रेंडर करें
     * @returns {string} पेज HTML संरचना लौटाता है
     */
    public render(): string {
        // सर्वर-साइड एनवायरनमेंट में सही ढंग से इम्पोर्ट मेटाडेटा को कलेक्ट करना सुनिश्चित करें
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx क्विक स्टार्ट</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * क्लाइंट-साइड इनिशियलाइज़ेशन
     * @throws {Error} जब समय डिस्प्ले एलिमेंट नहीं मिलता है तो एरर थ्रो करता है
     */
    public onClient(): void {
        // समय डिस्प्ले एलिमेंट प्राप्त करें
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('समय डिस्प्ले एलिमेंट नहीं मिला');
        }

        // टाइमर सेट करें, हर सेकंड समय अपडेट करें
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * सर्वर-साइड इनिशियलाइज़ेशन
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * सर्वर-साइड कॉन्टेक्स्ट इंटरफ़ेस
 * @interface
 */
export interface SsrContext {
    /**
     * इम्पोर्ट मेटाडेटा कलेक्शन
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

`src/create-app.ts` फ़ाइल बनाएं, एप्लिकेशन इंस्टेंस बनाने के लिए जिम्मेदार:

```ts title="src/create-app.ts"
/**
 * @file एप्लिकेशन इंस्टेंस क्रिएशन
 * @description एप्लिकेशन इंस्टेंस बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार
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

क्लाइंट-साइड एंट्री फ़ाइल `src/entry.client.ts` बनाएं:

```ts title="src/entry.client.ts"
/**
 * @file क्लाइंट-साइड एंट्री फ़ाइल
 * @description क्लाइंट-साइड इंटरैक्शन लॉजिक और डायनामिक अपडेट के लिए जिम्मेदार
 */

import { createApp } from './create-app';

// एप्लिकेशन इंस्टेंस बनाएं और इनिशियलाइज़ करें
const { app } = createApp();
app.onClient();
```

### entry.node.ts

`entry.node.ts` फ़ाइल बनाएं, डेवलपमेंट एनवायरनमेंट कॉन्फ़िगरेशन और सर्वर स्टार्टअप को कॉन्फ़िगर करें:

```ts title="src/entry.node.ts"
/**
 * @file Node.js सर्वर एंट्री फ़ाइल
 * @description डेवलपमेंट एनवायरनमेंट कॉन्फ़िगरेशन और सर्वर स्टार्टअप के लिए जिम्मेदार, SSR रनटाइम एनवायरनमेंट प्रदान करता है
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * डेवलपमेंट एनवायरनमेंट के लिए एप्लिकेशन क्रिएटर को कॉन्फ़िगर करें
     * @description Rspack एप्लिकेशन इंस्टेंस बनाएं और कॉन्फ़िगर करें, डेवलपमेंट एनवायरनमेंट के लिए बिल्ड और हॉट रीलोडिंग सपोर्ट करता है
     * @param esmx Esmx फ्रेमवर्क इंस्टेंस, कोर फंक्शनलिटी और कॉन्फ़िगरेशन इंटरफ़ेस प्रदान करता है
     * @returns कॉन्फ़िगर किया गया Rspack एप्लिकेशन इंस्टेंस लौटाता है, HMR और रियल-टाइम प्रीव्यू सपोर्ट करता है
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // यहां Rspack कंपाइल कॉन्फ़िगरेशन को कस्टमाइज़ करें
                }
            })
        );
    },

    /**
     * HTTP सर्वर को कॉन्फ़िगर करें और स्टार्ट करें
     * @description HTTP सर्वर इंस्टेंस बनाएं, Esmx मिडलवेयर को इंटीग्रेट करें, SSR रिक्वेस्ट को हैंडल करें
     * @param esmx Esmx फ्रेमवर्क इंस्टेंस, मिडलवेयर और रेंडरिंग फंक्शनलिटी प्रदान करता है
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Esmx मिडलवेयर का उपयोग करके रिक्वेस्ट को हैंडल करें
            esmx.middleware(req, res, async () => {
                // सर्वर-साइड रेंडरिंग करें
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('सर्वर शुरू: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

यह फ़ाइल डेवलपमेंट एनवायरनमेंट कॉन्फ़िगरेशन और सर्वर स्टार्टअप के लिए एंट्री फ़ाइल है, जिसमें दो मुख्य फंक्शनलिटी शामिल हैं:

1. `devApp` फ़ंक्शन: डेवलपमेंट एनवायरनमेंट के लिए Rspack एप्लिकेशन इंस्टेंस बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार है, हॉट रीलोडिंग और रियल-टाइम प्रीव्यू फंक्शनलिटी को सपोर्ट करता है।
2. `server` फ़ंक्शन: HTTP सर्वर बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार है, Esmx मिडलवेयर को इंटीग्रेट करके SSR रिक्वेस्ट को हैंडल करता है।

### entry.server.ts

सर्वर-साइड रेंडरिंग एंट्री फ़ाइल `src/entry.server.ts` बनाएं:

```ts title="src/entry.server.ts"
/**
 * @file सर्वर-साइड रेंडरिंग एंट्री फ़ाइल
 * @description सर्वर-साइड रेंडरिंग प्रोसेस, HTML जनरेशन और रिसोर्स इंजेक्शन के लिए जिम्मेदार
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// पेज कंटेंट जनरेशन लॉजिक को एनकैप्सुलेट करें
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // सर्वर-साइड रेंडरिंग कॉन्टेक्स्ट को एप्लिकेशन इंस्टेंस में इंजेक्ट करें
    app.ssrContext = ssrContext;
    // सर्वर-साइड को इनिशियलाइज़ करें
    app.onServer();

    // पेज कंटेंट जनरेट करें
    return app.render();
};

export default async (rc: RenderContext) => {
    // एप्लिकेशन इंस्टेंस बन