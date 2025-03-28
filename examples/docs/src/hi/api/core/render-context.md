---
titleSuffix: Esmx फ्रेमवर्क रेंडरिंग संदर्भ API संदर्भ
description: Esmx फ्रेमवर्क के RenderContext कोर क्लास का विस्तृत विवरण, जिसमें रेंडरिंग नियंत्रण, संसाधन प्रबंधन, स्थिति सिंक्रनाइज़ेशन और रूटिंग नियंत्रण जैसी कार्यक्षमताएं शामिल हैं, जो डेवलपर्स को कुशल सर्वर-साइड रेंडरिंग (SSR) को लागू करने में मदद करती हैं।
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, सर्वर-साइड रेंडरिंग, रेंडरिंग संदर्भ, स्थिति सिंक्रनाइज़ेशन, संसाधन प्रबंधन, वेब एप्लिकेशन फ्रेमवर्क
---

# RenderContext

RenderContext, Esmx फ्रेमवर्क में एक कोर क्लास है, जो सर्वर-साइड रेंडरिंग (SSR) के पूर्ण जीवनचक्र को प्रबंधित करता है। यह रेंडरिंग संदर्भ, संसाधन प्रबंधन, स्थिति सिंक्रनाइज़ेशन जैसे महत्वपूर्ण कार्यों को संभालने के लिए एक पूर्ण API प्रदान करता है:

- **रेंडरिंग नियंत्रण**: सर्वर-साइड रेंडरिंग प्रक्रिया को प्रबंधित करता है, मल्टी-एंट्री रेंडरिंग, कंडीशनल रेंडरिंग जैसे परिदृश्यों का समर्थन करता है
- **संसाधन प्रबंधन**: JS, CSS जैसे स्टेटिक संसाधनों को इंटेलिजेंटली एकत्र और इंजेक्ट करता है, लोडिंग प्रदर्शन को अनुकूलित करता है
- **स्थिति सिंक्रनाइज़ेशन**: सर्वर स्थिति को सीरियलाइज़ करता है, क्लाइंट-साइड हाइड्रेशन को सुनिश्चित करता है
- **रूटिंग नियंत्रण**: सर्वर-साइड रीडायरेक्ट, स्टेटस कोड सेटिंग जैसी उन्नत कार्यक्षमताओं का समर्थन करता है

## प्रकार परिभाषाएं

### ServerRenderHandle

सर्वर-साइड रेंडरिंग हैंडलर फ़ंक्शन का प्रकार परिभाषा।

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

सर्वर-साइड रेंडरिंग हैंडलर फ़ंक्शन एक एसिंक्रोनस या सिंक्रोनस फ़ंक्शन है, जो RenderContext इंस्टेंस को पैरामीटर के रूप में प्राप्त करता है, और सर्वर-साइड रेंडरिंग लॉजिक को संभालता है।

```ts title="entry.node.ts"
// 1. एसिंक्रोनस हैंडलर फ़ंक्शन
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. सिंक्रोनस हैंडलर फ़ंक्शन
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

रेंडरिंग प्रक्रिया में एकत्रित संसाधन फ़ाइलों की सूची का प्रकार परिभाषा।

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: JavaScript फ़ाइलों की सूची
- **css**: स्टाइलशीट फ़ाइलों की सूची
- **modulepreload**: प्रीलोड करने के लिए आवश्यक ESM मॉड्यूल की सूची
- **resources**: अन्य संसाधन फ़ाइलों की सूची (इमेज, फ़ॉन्ट आदि)

```ts
// संसाधन फ़ाइल सूची उदाहरण
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

importmap के जनरेट मोड को परिभाषित करता है।

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: importmap सामग्री को सीधे HTML में इनलाइन करता है, निम्नलिखित परिदृश्यों के लिए उपयुक्त:
  - HTTP अनुरोधों की संख्या को कम करने की आवश्यकता हो
  - importmap सामग्री छोटी हो
  - फर्स्ट-लोड प्रदर्शन के लिए उच्च आवश्यकता हो
- `js`: importmap सामग्री को एक अलग JS फ़ाइल के रूप में जनरेट करता है, निम्नलिखित परिदृश्यों के लिए उपयुक्त:
  - importmap सामग्री बड़ी हो
  - ब्राउज़र कैशिंग मैकेनिज्म का उपयोग करने की आवश्यकता हो
  - एकाधिक पेज समान importmap साझा करते हों

रेंडरिंग संदर्भ क्लास, जो सर्वर-साइड रेंडरिंग (SSR) प्रक्रिया में संसाधन प्रबंधन और HTML जनरेशन के लिए जिम्मेदार है।
## इंस्टेंस विकल्प

रेंडरिंग संदर्भ के कॉन्फ़िगरेशन विकल्पों को परिभाषित करता है।

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **प्रकार**: `string`
- **डिफ़ॉल्ट मान**: `''`

स्टेटिक संसाधनों का बेस पाथ।
- सभी स्टेटिक संसाधन (JS, CSS, इमेज आदि) इस पाथ के आधार पर लोड होंगे
- रनटाइम पर डायनामिक कॉन्फ़िगरेशन का समर्थन करता है, पुनः बिल्ड की आवश्यकता नहीं
- मल्टी-लैंग्वेज साइट्स, माइक्रो-फ्रंटेंड एप्लिकेशन जैसे परिदृश्यों में उपयोगी

#### entryName

- **प्रकार**: `string`
- **डिफ़ॉल्ट मान**: `'default'`

सर्वर-साइड रेंडरिंग एंट्री फ़ंक्शन का नाम। जब एक मॉड्यूल एकाधिक रेंडरिंग फ़ंक्शन एक्सपोर्ट करता है, तो इसका उपयोग सर्वर-साइड रेंडरिंग के लिए उपयोग किए जाने वाले एंट्री फ़ंक्शन को निर्दिष्ट करने के लिए किया जाता है।

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // मोबाइल रेंडरिंग लॉजिक
};

export const desktop = async (rc: RenderContext) => {
  // डेस्कटॉप रेंडरिंग लॉजिक
};
```

#### params

- **प्रकार**: `Record<string, any>`
- **डिफ़ॉल्ट मान**: `{}`

रेंडरिंग पैरामीटर। रेंडरिंग फ़ंक्शन को किसी भी प्रकार के पैरामीटर पास किए जा सकते हैं, आमतौर पर अनुरोध जानकारी (URL, क्वेरी पैरामीटर आदि) पास करने के लिए उपयोग किया जाता है।

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'hi-IN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **प्रकार**: `'inline' | 'js'`
- **डिफ़ॉल्ट मान**: `'inline'`

इम्पोर्ट मैप (Import Map) का जनरेट मोड:
- `inline`: importmap सामग्री को सीधे HTML में इनलाइन करता है
- `js`: importmap सामग्री को एक अलग JS फ़ाइल के रूप में जनरेट करता है


## इंस्टेंस गुण

### esmx

- **प्रकार**: `Esmx`
- **केवल पढ़ने योग्य**: `true`

Esmx इंस्टेंस का संदर्भ। फ्रेमवर्क कोर कार्यक्षमताओं और कॉन्फ़िगरेशन जानकारी तक पहुंचने के लिए उपयोग किया जाता है।

### redirect

- **प्रकार**: `string | null`
- **डिफ़ॉल्ट मान**: `null`

रीडायरेक्ट एड्रेस। सेट करने पर, सर्वर इस मान के आधार पर HTTP रीडायरेक्ट कर सकता है, आमतौर पर लॉगिन वेरिफिकेशन, परमिशन कंट्रोल जैसे परिदृश्यों में उपयोग किया जाता है।

```ts title="entry.node.ts"
// लॉगिन वेरिफिकेशन उदाहरण
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // पेज रेंडरिंग जारी रखें...
};

// परमिशन कंट्रोल उदाहरण
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // पेज रेंडरिंग जारी रखें...
};
```

### status

- **प्रकार**: `number | null`
- **डिफ़ॉल्ट मान**: `null`

HTTP रिस्पांस स्टेटस कोड। किसी भी वैध HTTP स्टेटस कोड को सेट किया जा सकता है, आमतौर पर एरर हैंडलिंग, रीडायरेक्ट जैसे परिदृश्यों में उपयोग किया जाता है।

```ts title="entry.node.ts"
// 404 एरर हैंडलिंग उदाहरण
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // 404 पेज रेंडर करें...
    return;
  }
  // पेज रेंडरिंग जारी रखें...
};

// टेम्पररी रीडायरेक्ट उदाहरण
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // टेम्पररी रीडायरेक्ट, अनुरोध मेथड को अपरिवर्तित रखें
    return;
  }
  // पेज रेंडरिंग जारी रखें...
};
```

### html

- **प्रकार**: `string`
- **डिफ़ॉल्ट मान**: `''`

HTML सामग्री। अंतिम जनरेटेड HTML सामग्री को सेट और प्राप्त करने के लिए उपयोग किया जाता है, सेट करते समय बेस पाथ प्लेसहोल्डर को स्वचालित रूप से हैंडल करता है।

```ts title="entry.node.ts"
// बेसिक उपयोग
export default async (rc: RenderContext) => {
  // HTML सामग्री सेट करें
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// डायनामिक बेस पाथ
const rc = await esmx.render({
  base: '/app',  // बेस पाथ सेट करें
  params: { url: req.url }
});

// HTML में प्लेसहोल्डर स्वचालित रूप से रिप्लेस हो जाएंगे:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// रिप्लेस होगा:
// /app/your-app-name/css/style.css
```

### base

- **प्रकार**: `string`
- **केवल पढ़ने योग्य**: `true`
- **डिफ़ॉल्ट मान**: `''`

स्टेटिक संसाधनों का बेस पाथ। सभी स्टेटिक संसाधन (JS, CSS, इमेज आदि) इस पाथ के आधार पर लोड होंगे, रनटाइम पर डायनामिक कॉन्फ़िगरेशन का समर्थन करता है।

```ts
// बेसिक उपयोग
const rc = await esmx.render({
  base: '/esmx',  // बेस पाथ सेट करें
  params: { url: req.url }
});

// मल्टी-लैंग्वेज साइट्स उदाहरण
const rc = await esmx.render({
  base: '/hi',  // हिंदी साइट
  params: { lang: 'hi-IN' }
});

// माइक्रो-फ्रंटेंड एप्लिकेशन उदाहरण
const rc = await esmx.render({
  base: '/app1',  // सब-एप्लिकेशन1
  params: { appId: 1 }
});
```

### entryName

- **प्रकार**: `string`
- **केवल पढ़ने योग्य**: `true`
- **डिफ़ॉल्ट मान**: `'default'`

सर्वर-साइड रेंडरिंग एंट्री फ़ंक्शन का नाम। entry.server.ts से उपयोग किए जाने वाले रेंडरिंग फ़ंक्शन का चयन करने के लिए उपयोग किया जाता है।

```ts title="entry.node.ts"
// डिफ़ॉल्ट एंट्री फ़ंक्शन
export default async (rc: RenderContext) => {
  // डिफ़ॉल्ट रेंडरिंग लॉजिक
};

// एकाधिक एंट्री फ़ंक्शन
export const mobile = async (rc: RenderContext) => {
  // मोबाइल रेंडरिंग लॉजिक
};

export const desktop = async (rc: RenderContext) => {
  // डेस्कटॉप रेंडरिंग लॉजिक
};

// डिवाइस टाइप के आधार पर एंट्री फ़ंक्शन का चयन
const rc = await esmx.render({
  entryName: