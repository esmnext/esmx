---
titleSuffix: Esmx फ्रेमवर्क पैकेजिंग कॉन्फ़िगरेशन API संदर्भ
description: Esmx फ्रेमवर्क के PackConfig कॉन्फ़िगरेशन इंटरफ़ेस का विस्तृत विवरण, जिसमें सॉफ़्टवेयर पैकेज पैकेजिंग नियम, आउटपुट कॉन्फ़िगरेशन और लाइफ़साइकल हुक शामिल हैं, जो डेवलपर्स को मानकीकृत बिल्ड प्रक्रिया को लागू करने में मदद करता है।
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, सॉफ़्टवेयर पैकेज पैकेजिंग, बिल्ड कॉन्फ़िगरेशन, लाइफ़साइकल हुक, पैकेजिंग कॉन्फ़िगरेशन, वेब एप्लिकेशन फ्रेमवर्क
---

# PackConfig

`PackConfig` सॉफ़्टवेयर पैकेज पैकेजिंग कॉन्फ़िगरेशन इंटरफ़ेस है, जिसका उपयोग सेवा के बिल्ड आउटपुट को मानक npm .tgz प्रारूप में पैकेज करने के लिए किया जाता है।

- **मानकीकरण**: npm मानक .tgz पैकेजिंग प्रारूप का उपयोग करता है
- **पूर्णता**: मॉड्यूल के स्रोत कोड, टाइप डिक्लेरेशन और कॉन्फ़िगरेशन फ़ाइलों सहित सभी आवश्यक फ़ाइलें शामिल हैं
- **संगतता**: npm इकोसिस्टम के साथ पूरी तरह से संगत, मानक पैकेज प्रबंधन वर्कफ़्लो का समर्थन करता है

## प्रकार परिभाषा

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

पैकेजिंग सुविधा को सक्षम करें या नहीं। सक्षम करने पर बिल्ड आउटपुट को मानक npm .tgz प्रारूप में पैकेज किया जाएगा।

- प्रकार: `boolean`
- डिफ़ॉल्ट मान: `false`

#### outputs

आउटपुट पैकेज फ़ाइल पथ निर्दिष्ट करें। निम्नलिखित कॉन्फ़िगरेशन विधियों का समर्थन करता है:
- `string`: एकल आउटपुट पथ, जैसे 'dist/versions/my-app.tgz'
- `string[]`: एकाधिक आउटपुट पथ, एक साथ कई संस्करण उत्पन्न करने के लिए
- `boolean`: true होने पर डिफ़ॉल्ट पथ 'dist/client/versions/latest.tgz' का उपयोग करता है

#### packageJson

package.json सामग्री को अनुकूलित करने के लिए कॉलबैक फ़ंक्शन। पैकेजिंग से पहले कॉल किया जाता है, package.json की सामग्री को अनुकूलित करने के लिए उपयोग किया जाता है।

- पैरामीटर:
  - `esmx: Esmx` - Esmx उदाहरण
  - `pkg: any` - मूल package.json सामग्री
- रिटर्न मान: `Promise<any>` - संशोधित package.json सामग्री

सामान्य उपयोग:
- पैकेज नाम और संस्करण संख्या संशोधित करना
- निर्भरताएँ जोड़ना या अद्यतन करना
- कस्टम फ़ील्ड जोड़ना
- प्रकाशन संबंधी जानकारी कॉन्फ़िगर करना

उदाहरण:
```ts
packageJson: async (esmx, pkg) => {
  // पैकेज जानकारी सेट करें
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'मेरा एप्लिकेशन';

  // निर्भरताएँ जोड़ें
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // प्रकाशन कॉन्फ़िगरेशन जोड़ें
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

पैकेजिंग से पहले की तैयारी के लिए कॉलबैक फ़ंक्शन।

- पैरामीटर:
  - `esmx: Esmx` - Esmx उदाहरण
  - `pkg: Record<string, any>` - package.json सामग्री
- रिटर्न मान: `Promise<void>`

सामान्य उपयोग:
- अतिरिक्त फ़ाइलें जोड़ना (README, LICENSE आदि)
- परीक्षण या बिल्ड सत्यापन निष्पादित करना
- दस्तावेज़ या मेटाडेटा उत्पन्न करना
- अस्थायी फ़ाइलों को साफ़ करना

उदाहरण:
```ts
onBefore: async (esmx, pkg) => {
  // दस्तावेज़ जोड़ें
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // परीक्षण निष्पादित करें
  await runTests();

  // दस्तावेज़ उत्पन्न करें
  await generateDocs();

  // अस्थायी फ़ाइलों को साफ़ करें
  await cleanupTempFiles();
}
```

#### onAfter

पैकेजिंग पूर्ण होने के बाद के प्रसंस्करण के लिए कॉलबैक फ़ंक्शन। .tgz फ़ाइल उत्पन्न होने के बाद कॉल किया जाता है, पैकेज आउटपुट को संसाधित करने के लिए उपयोग किया जाता है।

- पैरामीटर:
  - `esmx: Esmx` - Esmx उदाहरण
  - `pkg: Record<string, any>` - package.json सामग्री
  - `file: Buffer` - पैकेज की गई फ़ाइल सामग्री
- रिटर्न मान: `Promise<void>`

सामान्य उपयोग:
- npm रिपॉजिटरी (सार्वजनिक या निजी) पर प्रकाशित करना
- स्थिर संसाधन सर्वर पर अपलोड करना
- संस्करण प्रबंधन निष्पादित करना
- CI/CD प्रक्रिया ट्रिगर करना

उदाहरण:
```ts
onAfter: async (esmx, pkg, file) => {
  // npm निजी रिपॉजिटरी पर प्रकाशित करें
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // स्थिर संसाधन सर्वर पर अपलोड करें
  await uploadToServer(file, 'https://assets.example.com/packages');

  // संस्करण टैग बनाएँ
  await createGitTag(pkg.version);

  // तैनाती प्रक्रिया ट्रिगर करें
  await triggerDeploy(pkg.version);
}
```

## उपयोग उदाहरण

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // निर्यात करने के लिए आवश्यक मॉड्यूल कॉन्फ़िगर करें
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // पैकेजिंग कॉन्फ़िगरेशन
  pack: {
    // पैकेजिंग सुविधा सक्षम करें
    enable: true,

    // एक साथ कई संस्करण आउटपुट करें
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // package.json को अनुकूलित करें
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // पैकेजिंग से पहले तैयारी
    onBefore: async (esmx, pkg) => {
      // आवश्यक फ़ाइलें जोड़ें
      await fs.writeFile('dist/README.md', '# Your App\n\nमॉड्यूल निर्यात स्पष्टीकरण...');
      // टाइप जाँच निष्पादित करें
      await runTypeCheck();
    },

    // पैकेजिंग के बाद प्रसंस्करण
    onAfter: async (esmx, pkg, file) => {
      // निजी npm मिरर पर प्रकाशित करें
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // या स्थिर सर्वर पर तैनात करें
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```