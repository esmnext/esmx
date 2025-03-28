---
titleSuffix: Esmx Çerçevesi Uyumluluk Rehberi
description: Esmx çerçevesinin ortam gereksinimlerini detaylı olarak açıklar, Node.js sürüm gereksinimlerini ve tarayıcı uyumluluk açıklamalarını içerir, geliştiricilerin geliştirme ortamını doğru şekilde yapılandırmasına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, tarayıcı uyumluluğu, TypeScript, es-module-shims, ortam yapılandırması
---

# Ortam Gereksinimleri

Bu belge, bu çerçeveyi kullanmak için gereken ortam gereksinimlerini, Node.js ortamı ve tarayıcı uyumluluğunu açıklar.

## Node.js Ortamı

Çerçeve, Node.js sürümü >= 22.6 gerektirir, bu özellikle TypeScript tür içe aktarımlarını desteklemek için kullanılır (`--experimental-strip-types` bayrağı aracılığıyla), ek derleme adımlarına gerek yoktur.

## Tarayıcı Uyumluluğu

Çerçeve, daha geniş bir tarayıcı desteği sağlamak için varsayılan olarak uyumluluk modunda oluşturulur. Ancak, tam tarayıcı uyumluluk desteği sağlamak için [es-module-shims](https://github.com/guybedford/es-module-shims) bağımlılığını manuel olarak eklemeniz gerektiğini unutmayın.

### Uyumluluk Modu (Varsayılan)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

[Can I Use](https://caniuse.com/?search=dynamic%20import) istatistiklerine göre, uyumluluk modunda tarayıcı kapsama oranı %96.81'dir.

### Yerel Destek Modu
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

Yerel destek modu aşağıdaki avantajlara sahiptir:
- Sıfır çalışma zamanı maliyeti, ek modül yükleyiciye gerek yok
- Tarayıcı tarafından yerel olarak çözümlenir, daha hızlı yürütme hızı
- Daha iyi kod bölme ve isteğe bağlı yükleme yetenekleri

[Can I Use](https://caniuse.com/?search=importmap) istatistiklerine göre, uyumluluk modunda tarayıcı kapsama oranı %93.5'tir.

### Uyumluluk Desteğini Etkinleştirme

::: warning Önemli Uyarı
Çerçeve varsayılan olarak uyumluluk modunda oluşturulsa da, eski tarayıcılar için tam destek sağlamak için projenize [es-module-shims](https://github.com/guybedford/es-module-shims) bağımlılığını eklemeniz gerekmektedir.

:::

HTML dosyasına aşağıdaki betiği ekleyin:

```html
<!-- Geliştirme ortamı -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Üretim ortamı -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip En İyi Uygulamalar

1. Üretim ortamı önerileri:
   - es-module-shims'i kendi sunucunuza dağıtın
   - Kaynak yüklemenin kararlılığını ve erişim hızını sağlayın
   - Potansiyel güvenlik risklerinden kaçının
2. Performans düşünceleri:
   - Uyumluluk modu küçük bir performans maliyeti getirir
   - Hedef kullanıcı kitlesinin tarayıcı dağılımına göre etkinleştirilip etkinleştirilmeyeceğine karar verebilirsiniz

:::