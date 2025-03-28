---
titleSuffix: Esmx फ्रेमवर्क मैनिफेस्ट फ़ाइल संदर्भ
description: Esmx फ्रेमवर्क के मैनिफेस्ट फ़ाइल (manifest.json) की संरचना का विस्तृत विवरण, जिसमें बिल्ड आउटपुट प्रबंधन, एक्सपोर्ट फ़ाइल मैपिंग और संसाधन सांख्यिकी शामिल हैं, जो डेवलपर्स को बिल्ड सिस्टम को समझने और उपयोग करने में मदद करता है।
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, बिल्ड मैनिफेस्ट, संसाधन प्रबंधन, बिल्ड आउटपुट, फ़ाइल मैपिंग, API
---

# ManifestJson

`manifest.json` Esmx फ्रेमवर्क द्वारा बिल्ड प्रक्रिया के दौरान उत्पन्न की जाने वाली मैनिफेस्ट फ़ाइल है, जो सेवा बिल्ड के आउटपुट की जानकारी रिकॉर्ड करती है। यह बिल्ड आउटपुट, एक्सपोर्ट फ़ाइल और संसाधन आकार सांख्यिकी को प्रबंधित करने के लिए एकीकृत इंटरफ़ेस प्रदान करती है।

```json title="dist/client/manifest.json"
{
  "name": "your-app-name",
  "exports": {
    "src/entry.client": "src/entry.client.8537e1c3.final.js",
    "src/title/index": "src/title/index.2d79c0c2.final.js"
  },
  "buildFiles": [
    "src/entry.client.2e0a89bc.final.css",
    "images/cat.ed79ef6b.final.jpeg",
    "chunks/830.63b8fd4f.final.css",
    "images/running-dog.76197e20.final.gif",
    "chunks/473.42c1ae75.final.js",
    "images/starry.d914a632.final.jpg",
    "images/sun.429a7bc5.final.png",
    "chunks/473.63b8fd4f.final.css",
    "images/logo.3923d727.final.svg",
    "chunks/534.63b8fd4f.final.css",
    "src/title/index.2d79c0c2.final.js",
    "src/entry.client.8537e1c3.final.js",
    "chunks/534.e85c5440.final.js",
    "chunks/830.cdbdf067.final.js"
  ],
  "chunks": {
    "your-app-name@src/views/home.ts": {
      "js": "chunks/534.e85c5440.final.js",
      "css": ["chunks/534.63b8fd4f.final.css"],
      "resources": [
        "images/cat.ed79ef6b.final.jpeg",
        "images/logo.3923d727.final.svg",
        "images/running-dog.76197e20.final.gif",
        "images/starry.d914a632.final.jpg",
        "images/sun.429a7bc5.final.png"
      ],
      "sizes": {
        "js": 7976,
        "css": 5739,
        "resource": 796974
      }
    }
  }
}
```

## प्रकार परिभाषाएँ
### ManifestJson

```ts
interface ManifestJson {
  name: string;
  exports: Record<string, string>;
  buildFiles: string[];
  chunks: Record<string, ManifestJsonChunks>;
}
```

#### name

- **प्रकार**: `string`

सेवा का नाम, EsmxOptions.name कॉन्फ़िगरेशन से लिया गया।

#### exports

- **प्रकार**: `Record<string, string>`

एक्सपोर्ट की गई फ़ाइलों की मैपिंग, key स्रोत फ़ाइल पथ है और value बिल्ड के बाद की फ़ाइल पथ है।

#### buildFiles

- **प्रकार**: `string[]`

बिल्ड आउटपुट की पूरी फ़ाइल सूची, जिसमें सभी उत्पन्न फ़ाइल पथ शामिल हैं।

#### chunks

- **प्रकार**: `Record<string, ManifestJsonChunks>`

स्रोत फ़ाइल और संकलित आउटपुट के बीच संबंध, key स्रोत फ़ाइल पथ है और value संकलन जानकारी है।

### ManifestJsonChunks

```ts
interface ManifestJsonChunks {
  js: string;
  css: string[];
  resources: string[];
  sizes: ManifestJsonChunkSizes;
}
```

#### js

- **प्रकार**: `string`

वर्तमान स्रोत फ़ाइल के संकलित JS फ़ाइल का पथ।

#### css

- **प्रकार**: `string[]`

वर्तमान स्रोत फ़ाइल से जुड़ी CSS फ़ाइलों की पथ सूची।

#### resources

- **प्रकार**: `string[]`

वर्तमान स्रोत फ़ाइल से जुड़े अन्य संसाधन फ़ाइलों की पथ सूची।

#### sizes

- **प्रकार**: `ManifestJsonChunkSizes`

बिल्ड आउटपुट का आकार सांख्यिकी जानकारी।

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **प्रकार**: `number`

JS फ़ाइल का आकार (बाइट्स में)।

#### css

- **प्रकार**: `number`

CSS फ़ाइल का आकार (बाइट्स में)।

#### resource

- **प्रकार**: `number`

संसाधन फ़ाइल का आकार (बाइट्स में)।