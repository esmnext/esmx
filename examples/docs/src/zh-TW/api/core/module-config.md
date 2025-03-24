---
titleSuffix: Gez 框架模組配置 API 參考
description: 詳細介紹 Gez 框架的 ModuleConfig 配置介面，包括模組匯入匯出規則、別名配置和外部依賴管理，幫助開發者深入理解框架的模組化系統。
head:
  - - meta
    - property: keywords
      content: Gez, ModuleConfig, 模組配置, 模組匯入匯出, 外部依賴, 別名配置, 依賴管理, Web 應用框架
---

# ModuleConfig

ModuleConfig 提供了 Gez 框架的模組配置功能，用於定義模組的匯入匯出規則、別名配置和外部依賴等。

## 類型定義

### PathType

- **類型定義**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

模組路徑類型列舉：
- `npm`: 表示 node_modules 中的依賴
- `root`: 表示專案根目錄下的檔案

### ModuleConfig

- **類型定義**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

模組配置介面，用於定義服務的匯出、匯入和外部依賴配置。

#### exports

匯出配置列表，將服務中的特定程式碼單元（如元件、工具函數等）以 ESM 格式對外暴露。

支援兩種類型：
- `root:*`: 匯出原始碼檔案，如：`root:src/components/button.vue`
- `npm:*`: 匯出第三方依賴，如：`npm:vue`

每個匯出項包含以下屬性：
- `name`: 原始匯出路徑，如：`npm:vue` 或 `root:src/components`
- `type`: 路徑類型（`npm` 或 `root`）
- `importName`: 匯入名稱，格式：`${serviceName}/${type}/${path}`
- `exportName`: 匯出路徑，相對於服務根目錄
- `exportPath`: 實際的檔案路徑
- `externalName`: 外部依賴名稱，用於其他服務匯入此模組時的識別

#### links

服務依賴配置映射，用於配置當前服務依賴的其他服務（本地或遠端）及其本地路徑。每個配置項的鍵為服務名稱，值為該服務在本地的路徑。

安裝方式不同，配置也不同：
- 原始碼安裝（Workspace、Git）：需要指向 dist 目錄，因為需要使用建置後的檔案
- 軟體包安裝（Link、靜態伺服器、私有鏡像源、File）：直接指向套件目錄，因為套件中已包含建置後的檔案

#### imports

外部依賴映射，配置要使用的外部依賴，通常是使用遠端模組中的依賴。

每個依賴項包含以下屬性：
- `match`: 用於匹配匯入語句的正則表達式
- `import`: 實際的模組路徑

**範例**：
```ts title="entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
  modules: {
    // 匯出配置
    exports: [
      'root:src/components/button.vue',  // 匯出原始碼檔案
      'root:src/utils/format.ts',
      'npm:vue',  // 匯出第三方依賴
      'npm:vue-router'
    ],

    // 匯入配置
    links: {
      // 原始碼安裝方式：需要指向 dist 目錄
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // 軟體包安裝方式：直接指向套件目錄
      'other-remote': 'root:./node_modules/other-remote'
    },

    // 外部依賴配置
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies GezOptions;
```

### ParsedModuleConfig

- **類型定義**:
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
     * 軟體包名稱
     */
    name: string
    /**
     * 軟體包根目錄
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

解析後的模組配置，將原始的模組配置轉換為標準化的內部格式：

#### name
當前服務的名稱
- 用於識別模組和產生匯入路徑

#### root
當前服務的根目錄路徑
- 用於解析相對路徑和建置產物的存放

#### exports
匯出配置列表
- `name`: 原始匯出路徑，如：'npm:vue' 或 'root:src/components'
- `type`: 路徑類型（npm 或 root）
- `importName`: 匯入名稱，格式：'${serviceName}/${type}/${path}'
- `exportName`: 匯出路徑，相對於服務根目錄
- `exportPath`: 實際的檔案路徑
- `externalName`: 外部依賴名稱，用於其他服務匯入此模組時的識別

#### links
匯入配置列表
- `name`: 軟體包名稱
- `root`: 軟體包根目錄

#### imports
外部依賴映射
- 將模組的匯入路徑映射到實際的模組位置
- `match`: 用於匹配匯入語句的正則表達式
- `import`: 實際的模組路徑
```