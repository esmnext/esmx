---
titleSuffix: Esmx फ्रेमवर्क परियोजना संरचना और मानक गाइड
description: Esmx फ्रेमवर्क की मानक परियोजना संरचना, प्रवेश फ़ाइल मानक और कॉन्फ़िगरेशन फ़ाइल मानक का विस्तृत विवरण, जो डेवलपर्स को मानकीकृत और रखरखाव योग्य SSR एप्लिकेशन बनाने में मदद करता है।
head:
  - - meta
    - property: keywords
      content: Esmx, परियोजना संरचना, प्रवेश फ़ाइल, कॉन्फ़िगरेशन मानक, SSR फ्रेमवर्क, TypeScript, परियोजना मानक, विकास मानक
---

# मानक मानदंड

Esmx एक आधुनिक SSR फ्रेमवर्क है, जो विकास और उत्पादन वातावरण में परियोजना की स्थिरता और रखरखाव क्षमता सुनिश्चित करने के लिए मानकीकृत परियोजना संरचना और पथ विश्लेषण तंत्र का उपयोग करता है।

## परियोजना संरचना मानक

### मानक निर्देशिका संरचना

```txt
root
│─ dist                  # संकलन आउटपुट निर्देशिका
│  ├─ package.json       # संकलन आउटपुट के बाद का पैकेज कॉन्फ़िगरेशन
│  ├─ server             # सर्वर-साइड संकलन आउटपुट
│  │  └─ manifest.json   # संकलन सूची आउटपुट, importmap उत्पन्न करने के लिए
│  ├─ node               # Node सर्वर प्रोग्राम संकलन आउटपुट
│  ├─ client             # क्लाइंट-साइड संकलन आउटपुट
│  │  ├─ versions        # संस्करण भंडारण निर्देशिका
│  │  │  └─ latest.tgz   # dist निर्देशिका को संग्रहित करें, सॉफ्टवेयर पैकेज वितरण प्रदान करने के लिए
│  │  └─ manifest.json   # संकलन सूची आउटपुट, importmap उत्पन्न करने के लिए
│  └─ src                # tsc द्वारा उत्पन्न फ़ाइल प्रकार
├─ src
│  ├─ entry.server.ts    # सर्वर-साइड एप्लिकेशन प्रवेश बिंदु
│  ├─ entry.client.ts    # क्लाइंट-साइड एप्लिकेशन प्रवेश बिंदु
│  └─ entry.node.ts      # Node सर्वर एप्लिकेशन प्रवेश बिंदु
├─ tsconfig.json         # TypeScript कॉन्फ़िगरेशन
└─ package.json          # पैकेज कॉन्फ़िगरेशन
```

::: tip विस्तारित ज्ञान
- `esmx.name` `package.json` के `name` फ़ील्ड से प्राप्त होता है
- `dist/package.json` रूट निर्देशिका के `package.json` से प्राप्त होता है
- `packs.enable` को `true` पर सेट करने पर ही `dist` निर्देशिका को संग्रहित किया जाएगा

:::

## प्रवेश फ़ाइल मानक

### entry.client.ts
क्लाइंट-साइड प्रवेश फ़ाइल के जिम्मेदारियां:
- **एप्लिकेशन आरंभीकरण**: क्लाइंट-साइड एप्लिकेशन की मूल सेटिंग्स कॉन्फ़िगर करना
- **रूटिंग प्रबंधन**: क्लाइंट-साइड रूटिंग और नेविगेशन को संभालना
- **स्थिति प्रबंधन**: क्लाइंट-साइड स्थिति का भंडारण और अद्यतन करना
- **इंटरैक्शन प्रबंधन**: उपयोगकर्ता इवेंट्स और इंटरफ़ेस इंटरैक्शन को संभालना

### entry.server.ts
सर्वर-साइड प्रवेश फ़ाइल के जिम्मेदारियां:
- **सर्वर-साइड रेंडरिंग**: SSR रेंडरिंग प्रक्रिया को निष्पादित करना
- **HTML जनरेशन**: प्रारंभिक पृष्ठ संरचना का निर्माण करना
- **डेटा प्रीफ़ेच**: सर्वर-साइड डेटा प्राप्ति को संभालना
- **स्थिति इंजेक्शन**: सर्वर-साइड स्थिति को क्लाइंट को पास करना
- **SEO अनुकूलन**: पृष्ठ की सर्च इंजन अनुकूलन सुनिश्चित करना

### entry.node.ts
Node.js सर्वर प्रवेश फ़ाइल के जिम्मेदारियां:
- **सर्वर कॉन्फ़िगरेशन**: HTTP सर्वर पैरामीटर्स सेट करना
- **रूटिंग प्रबंधन**: सर्वर-साइड रूटिंग नियमों को संभालना
- **मिडलवेयर एकीकरण**: सर्वर मिडलवेयर कॉन्फ़िगर करना
- **पर्यावरण प्रबंधन**: पर्यावरण चर और कॉन्फ़िगरेशन को संभालना
- **अनुरोध प्रतिक्रिया**: HTTP अनुरोध और प्रतिक्रिया को संभालना

## कॉन्फ़िगरेशन फ़ाइल मानक

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