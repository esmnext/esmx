---
titleSuffix: Esmx Çerçeve Modül Yapılandırma API Referansı
description: Esmx çerçevesinin ModuleConfig yapılandırma arayüzünü detaylı olarak açıklar, modül içe/dışa aktarma kurallarını, takma ad yapılandırmasını ve harici bağımlılık yönetimini içerir, geliştiricilerin çerçevenin modüler sistemini derinlemesine anlamasına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, modül yapılandırma, modül içe/dışa aktarma, harici bağımlılık, takma ad yapılandırması, bağımlılık yönetimi, Web uygulama çerçevesi
---

# ModuleConfig

ModuleConfig, Esmx çerçevesinin modül yapılandırma işlevlerini sağlar ve modüllerin içe/dışa aktarma kurallarını, takma ad yapılandırmasını ve harici bağımlılıkları tanımlamak için kullanılır.

## Tür Tanımları

### PathType

- **Tür Tanımı**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Modül yol türü numaralandırması:
- `npm`: node_modules içindeki bağımlılıkları temsil eder
- `root`: proje kök dizinindeki dosyaları temsil eder

### ModuleConfig

- **Tür Tanımı**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Modül yapılandırma arayüzü, servislerin dışa aktarma, içe aktarma ve harici bağımlılık yapılandırmalarını tanımlamak için kullanılır.

#### exports

Dışa aktarma yapılandırma listesi, servisteki belirli kod birimlerini (bileşenler, yardımcı fonksiyonlar vb.) ESM formatında dışarıya açıklar.

İki türü destekler:
- `root:*`: kaynak kod dosyalarını dışa aktarır, örneğin: `root:src/components/button.vue`
- `npm:*`: üçüncü taraf bağımlılıkları dışa aktarır, örneğin: `npm:vue`

Her dışa aktarma öğesi aşağıdaki özellikleri içerir:
- `name`: orijinal dışa aktarma yolu, örneğin: `npm:vue` veya `root:src/components`
- `type`: yol türü (`npm` veya `root`)
- `importName`: içe aktarma adı, format: `${serviceName}/${type}/${path}`
- `exportName`: dışa aktarma yolu, servis kök dizinine göre
- `exportPath`: gerçek dosya yolu
- `externalName`: harici bağımlılık adı, diğer servislerin bu modülü içe aktarırken kullanacağı tanımlayıcı

#### links

Servis bağımlılık yapılandırma eşlemesi, mevcut servisin bağımlı olduğu diğer servisleri (yerel veya uzak) ve bunların yerel yollarını yapılandırmak için kullanılır. Her yapılandırma öğesinin anahtarı servis adı, değeri ise bu servisin yerel yoludur.

Kurulum yöntemine göre yapılandırma farklılık gösterir:
- Kaynak kod kurulumu (Workspace, Git): dist dizinine işaret etmelidir, çünkü derlenmiş dosyalar kullanılır
- Paket kurulumu (Link, statik sunucu, özel kaynak, File): doğrudan paket dizinine işaret eder, çünkü paket içinde derlenmiş dosyalar bulunur

#### imports

Harici bağımlılık eşlemesi, kullanılacak harici bağımlılıkları yapılandırır, genellikle uzak modüllerdeki bağımlılıklar kullanılır.

Her bağımlılık öğesi aşağıdaki özellikleri içerir:
- `match`: içe aktarma ifadelerini eşleştirmek için kullanılan düzenli ifade
- `import`: gerçek modül yolu

**Örnek**:
```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Dışa aktarma yapılandırması
    exports: [
      'root:src/components/button.vue',  // kaynak kod dosyasını dışa aktar
      'root:src/utils/format.ts',
      'npm:vue',  // üçüncü taraf bağımlılığını dışa aktar
      'npm:vue-router'
    ],

    // İçe aktarma yapılandırması
    links: {
      // Kaynak kod kurulumu: dist dizinine işaret etmeli
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Paket kurulumu: doğrudan paket dizinine işaret et
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Harici bağımlılık yapılandırması
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies EsmxOptions;
```

### ParsedModuleConfig

- **Tür Tanımı**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Paket adı
     */
    name: string
    /**
     * Paket kök dizini
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Ayrıştırılmış modül yapılandırması, orijinal modül yapılandırmasını standartlaştırılmış iç formata dönüştürür:

#### name
Mevcut servisin adı
- Modülü tanımlamak ve içe aktarma yollarını oluşturmak için kullanılır

#### root
Mevcut servisin kök dizin yolu
- Göreli yolları çözümlemek ve derleme çıktılarını depolamak için kullanılır

#### exports
Dışa aktarma yapılandırma listesi
- `name`: orijinal dışa aktarma yolu, örneğin: 'npm:vue' veya 'root:src/components'
- `type`: yol türü (npm veya root)
- `importName`: içe aktarma adı, format: '${serviceName}/${type}/${path}'
- `exportName`: dışa aktarma yolu, servis kök dizinine göre
- `exportPath`: gerçek dosya yolu
- `externalName`: harici bağımlılık adı, diğer servislerin bu modülü içe aktarırken kullanacağı tanımlayıcı

#### links
İçe aktarma yapılandırma listesi
- `name`: paket adı
- `root`: paket kök dizini

#### imports
Harici bağımlılık eşlemesi
- Modülün içe aktarma yolunu gerçek modül konumuna eşler
- `match`: içe aktarma ifadelerini eşleştirmek için kullanılan düzenli ifade
- `import`: gerçek modül yolu
```