---
titleSuffix: Esmx Çerçevesi Paketleme Yapılandırma API Referansı
description: Esmx çerçevesinin PackConfig yapılandırma arayüzünü detaylı olarak açıklar, yazılım paketi paketleme kurallarını, çıktı yapılandırmasını ve yaşam döngüsü kancalarını içerir, geliştiricilerin standartlaştırılmış yapı süreçlerini uygulamasına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, yazılım paketi paketleme, yapı yapılandırması, yaşam döngüsü kancaları, paketleme yapılandırması, Web uygulama çerçevesi
---

# PackConfig

`PackConfig`, hizmetlerin yapı ürünlerini standart npm .tgz formatında yazılım paketleri olarak paketlemek için kullanılan bir yazılım paketi paketleme yapılandırma arayüzüdür.

- **Standartlaştırma**: npm standart .tgz paketleme formatını kullanır
- **Bütünlük**: Modülün kaynak kodunu, tür bildirimlerini ve yapılandırma dosyalarını içeren tüm gerekli dosyaları içerir
- **Uyumluluk**: npm ekosistemi ile tam uyumlu, standart paket yönetimi iş akışlarını destekler

## Tür Tanımı

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

Paketleme özelliğinin etkinleştirilip etkinleştirilmeyeceği. Etkinleştirildiğinde yapı ürünleri standart npm .tgz formatında yazılım paketleri olarak paketlenir.

- Tür: `boolean`
- Varsayılan değer: `false`

#### outputs

Çıktı yazılım paketi dosya yolunu belirtir. Aşağıdaki yapılandırma yöntemlerini destekler:
- `string`: Tek bir çıktı yolu, örneğin 'dist/versions/my-app.tgz'
- `string[]`: Birden fazla çıktı yolu, aynı anda birden fazla sürüm oluşturmak için kullanılır
- `boolean`: true olduğunda varsayılan yol 'dist/client/versions/latest.tgz' kullanılır

#### packageJson

package.json içeriğini özelleştirmek için geri çağırma fonksiyonu. Paketlemeden önce çağrılır, package.json içeriğini özelleştirmek için kullanılır.

- Parametreler:
  - `esmx: Esmx` - Esmx örneği
  - `pkg: any` - Orijinal package.json içeriği
- Dönüş değeri: `Promise<any>` - Değiştirilmiş package.json içeriği

Yaygın kullanımlar:
- Paket adını ve sürüm numarasını değiştirme
- Bağımlılıkları ekleme veya güncelleme
- Özel alanlar ekleme
- Yayınlama bilgilerini yapılandırma

Örnek:
```ts
packageJson: async (esmx, pkg) => {
  // Paket bilgilerini ayarla
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Uygulamam';

  // Bağımlılık ekle
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Yayın yapılandırması ekle
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Paketleme öncesi hazırlık işlemleri için geri çağırma fonksiyonu.

- Parametreler:
  - `esmx: Esmx` - Esmx örneği
  - `pkg: Record<string, any>` - package.json içeriği
- Dönüş değeri: `Promise<void>`

Yaygın kullanımlar:
- Ek dosyalar ekleme (README, LICENSE vb.)
- Test veya yapı doğrulama çalıştırma
- Dokümantasyon veya meta veri oluşturma
- Geçici dosyaları temizleme

Örnek:
```ts
onBefore: async (esmx, pkg) => {
  // Dokümantasyon ekle
  await fs.writeFile('dist/README.md', '# Uygulamam');
  await fs.writeFile('dist/LICENSE', 'MIT Lisansı');

  // Testleri çalıştır
  await runTests();

  // Dokümantasyon oluştur
  await generateDocs();

  // Geçici dosyaları temizle
  await cleanupTempFiles();
}
```

#### onAfter

Paketleme tamamlandıktan sonraki işlemler için geri çağırma fonksiyonu. .tgz dosyası oluşturulduktan sonra çağrılır, paketleme ürünlerini işlemek için kullanılır.

- Parametreler:
  - `esmx: Esmx` - Esmx örneği
  - `pkg: Record<string, any>` - package.json içeriği
  - `file: Buffer` - Paketlenmiş dosya içeriği
- Dönüş değeri: `Promise<void>`

Yaygın kullanımlar:
- npm deposuna yayınlama (genel veya özel)
- Statik kaynak sunucusuna yükleme
- Sürüm yönetimi yapma
- CI/CD sürecini tetikleme

Örnek:
```ts
onAfter: async (esmx, pkg, file) => {
  // Özel npm deposuna yayınla
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Statik sunucuya yükle
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Git etiketi oluştur
  await createGitTag(pkg.version);

  // Dağıtım sürecini tetikle
  await triggerDeploy(pkg.version);
}
```

## Kullanım Örneği

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Dışa aktarılacak modülleri yapılandır
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Paketleme yapılandırması
  pack: {
    // Paketleme özelliğini etkinleştir
    enable: true,

    // Birden fazla sürüm çıktısı
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // package.json'ı özelleştir
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Paketleme öncesi hazırlık
    onBefore: async (esmx, pkg) => {
      // Gerekli dosyaları ekle
      await fs.writeFile('dist/README.md', '# Uygulamanız\n\nModül dışa aktarma açıklamaları...');
      // Tür kontrolü çalıştır
      await runTypeCheck();
    },

    // Paketleme sonrası işlemler
    onAfter: async (esmx, pkg, file) => {
      // Özel npm kaynağına yayınla
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Veya statik sunucuya dağıt
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```