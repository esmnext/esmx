---
titleSuffix: Gez फ्रेमवर्क Preact+HTM SSR एप्लिकेशन उदाहरण
description: Gez पर आधारित Preact+HTM SSR एप्लिकेशन को शुरू से बनाने का तरीका, जिसमें प्रोजेक्ट इनिशियलाइज़ेशन, Preact कॉन्फ़िगरेशन और एंट्री फ़ाइल सेटअप शामिल हैं।
head:
  - - meta
    - property: keywords
      content: Gez, Preact, HTM, SSR एप्लिकेशन, TypeScript कॉन्फ़िगरेशन, प्रोजेक्ट इनिशियलाइज़ेशन, सर्वर-साइड रेंडरिंग, क्लाइंट-साइड इंटरैक्शन
---

# Preact+HTM

यह ट्यूटोरियल आपको Gez पर आधारित Preact+HTM SSR एप्लिकेशन को शुरू से बनाने में मदद करेगा। हम एक पूर्ण उदाहरण के माध्यम से दिखाएंगे कि Gez फ्रेमवर्क का उपयोग करके सर्वर-साइड रेंडरिंग एप्लिकेशन कैसे बनाया जाता है।

## प्रोजेक्ट संरचना

सबसे पहले, प्रोजेक्ट की मूल संरचना को समझते हैं:

```bash
.
├── package.json         # प्रोजेक्ट कॉन्फ़िगरेशन फ़ाइल, डिपेंडेंसी और स्क्रिप्ट कमांड को परिभाषित करती है
├── tsconfig.json        # TypeScript कॉन्फ़िगरेशन फ़ाइल, कंपाइल विकल्प सेट करती है
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
  "name": "ssr-demo-preact-htm",
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
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
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

यह सभी आवश्यक डिपेंडेंसी पैकेज को इंस्टॉल करेगा, जिसमें Preact, HTM, TypeScript और SSR से संबंधित डिपेंडेंसी शामिल हैं।

### tsconfig.json

`tsconfig.json` फ़ाइल बनाएं, TypeScript कंपाइल विकल्प को कॉन्फ़िगर करें:

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

## सोर्स कोड संरचना

### app.ts

मुख्य एप्लिकेशन कंपोनेंट `src/app.ts` बनाएं, Preact के क्लास कंपोनेंट और HTM का उपयोग करें:

```ts title="src/app.ts"
/**
 * @file उदाहरण कंपोनेंट
 * @description Gez फ्रेमवर्क की मूल कार्यक्षमता को प्रदर्शित करने के लिए ऑटो-अपडेटिंग समय के साथ एक पेज टाइटल दिखाता है
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
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Gez क्विक स्टार्ट</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

`src/create-app.ts` फ़ाइल बनाएं, जो एप्लिकेशन इंस्टेंस बनाने के लिए जिम्मेदार है:

```ts title="src/create-app.ts"
/**
 * @file एप्लिकेशन इंस्टेंस क्रिएशन
 * @description एप्लिकेशन इंस्टेंस को बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार
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

क्लाइंट-साइड एंट्री फ़ाइल `src/entry.client.ts` बनाएं:

```ts title="src/entry.client.ts"
/**
 * @file क्लाइंट-साइड एंट्री फ़ाइल
 * @description क्लाइंट-साइड इंटरैक्शन लॉजिक और डायनामिक अपडेट को हैंडल करता है
 */

import { render } from 'preact';
import { createApp } from './create-app';

// एप्लिकेशन इंस्टेंस बनाएं
const { app } = createApp();

// एप्लिकेशन इंस्टेंस को माउंट करें
render(app, document.getElementById('app')!);
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
     * @description Rspack एप्लिकेशन इंस्टेंस बनाएं और कॉन्फ़िगर करें, डेवलपमेंट एनवायरनमेंट के लिए बिल्ड और हॉट रीलोडिंग के लिए
     * @param gez Gez फ्रेमवर्क इंस्टेंस, कोर फंक्शनलिटी और कॉन्फ़िगरेशन इंटरफेस प्रदान करता है
     * @returns कॉन्फ़िगर किया गया Rspack एप्लिकेशन इंस्टेंस, HMR और रियल-टाइम प्रीव्यू को सपोर्ट करता है
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
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
                // सर्वर-साइड रेंडरिंग को एक्जीक्यूट करें
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('सर्वर शुरू: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

यह फ़ाइल डेवलपमेंट एनवायरनमेंट कॉन्फ़िगरेशन और सर्वर स्टार्टअप के लिए एंट्री फ़ाइल है, जिसमें दो मुख्य कार्यक्षमताएं शामिल हैं:

1. `devApp` फ़ंक्शन: डेवलपमेंट एनवायरनमेंट के लिए Rspack एप्लिकेशन इंस्टेंस को बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार है, जो हॉट रीलोडिंग और रियल-टाइम प्रीव्यू को सपोर्ट करता है। यहां `createRspackHtmlApp` का उपयोग करके Preact+HTM के लिए विशेष Rspack एप्लिकेशन इंस्टेंस बनाया जाता है।
2. `server` फ़ंक्शन: HTTP सर्वर को बनाने और कॉन्फ़िगर करने के लिए जिम्मेदार है, जो Gez मिडलवेयर को इंटीग्रेट करके SSR रिक्वेस्ट को हैंडल करता है।

### entry.server.ts

सर्वर-साइड रेंडरिंग एंट्री फ़ाइल `src/entry.server.ts` बनाएं:

```ts title="src/entry.server.ts"
/**
 * @file सर्वर-साइड रेंडरिंग एंट्री फ़ाइल
 * @description सर्वर-साइड रेंडरिंग प्रोसेस, HTML जनरेशन और रिसोर्स इंजेक्शन के लिए जिम्मेदार
 */

import type { RenderContext } from '@gez/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // एप्लिकेशन इंस्टेंस बनाएं
    const { app } = createApp();

    // Preact के renderToString का उपयोग करके पेज कंटेंट जनरेट करें
    const html = render(app);

    // डिपेंडेंसी कलेक्शन को कमिट करें, यह सुनिश्चित करें कि सभी आवश्यक रिसोर्स लोड हो गए हैं
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

अब, आपने Gez पर आधारित Preact+HTM SSR एप्लिकेशन को सफलतापूर्वक बना लिया है! http://localhost:3000 पर जाकर परिणाम देखें।