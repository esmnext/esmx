---
titleSuffix: Esmx 框架模組導入路徑映射指南
description: 詳細介紹 Esmx 框架的路徑別名機制，包括簡化導入路徑、避免深層嵌套、類型安全和模組解析優化等特性，幫助開發者提升程式碼可維護性。
head:
  - - meta
    - property: keywords
      content: Esmx, 路徑別名, Path Alias, TypeScript, 模組導入, 路徑映射, 程式碼可維護性
---

# 路徑別名

路徑別名（Path Alias）是一種模組導入路徑映射機制，它允許開發者使用簡短、語義化的識別符來替代完整的模組路徑。在 Esmx 中，路徑別名機制具有以下優勢：

- **簡化導入路徑**：使用語義化的別名替代冗長的相對路徑，提高程式碼可讀性
- **避免深層嵌套**：消除多層級目錄引用（如 `../../../../`）帶來的維護困難
- **類型安全**：與 TypeScript 的類型系統完全整合，提供程式碼補全和類型檢查
- **模組解析優化**：通過預定義的路徑映射，提升模組解析效能

## 預設別名機制

Esmx 採用基於服務名稱（Service Name）的自動別名機制，這種約定優於配置的設計具有以下特點：

- **自動配置**：基於 `package.json` 中的 `name` 欄位自動生成別名，無需手動配置
- **統一規範**：確保所有服務模組遵循一致的命名和引用規範
- **類型支援**：配合 `npm run build:dts` 指令，自動生成類型宣告檔案，實現跨服務的類型推導
- **可預測性**：通過服務名稱即可推斷出模組的引用路徑，降低維護成本

## 配置說明

### package.json 配置

在 `package.json` 中，通過 `name` 欄位定義服務的名稱，該名稱將作為服務的預設別名前綴：

```json title="package.json"
{
    "name": "your-app-name"
}
```

### tsconfig.json 配置

為了使 TypeScript 能夠正確解析別名路徑，需要在 `tsconfig.json` 中配置 `paths` 映射：

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## 使用範例

### 導入服務內部模組

```ts
// 使用別名導入
import { MyComponent } from 'your-app-name/src/components';

// 等效的相對路徑導入
import { MyComponent } from '../components';
```

### 導入其他服務模組

```ts
// 導入其他服務的元件
import { SharedComponent } from 'other-service/src/components';

// 導入其他服務的工具函數
import { utils } from 'other-service/src/utils';
```

::: tip 最佳實踐
- 優先使用別名路徑而不是相對路徑
- 保持別名路徑的語義化和一致性
- 避免在別名路徑中使用過多的目錄層級

:::

``` ts
// 導入元件
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// 導入工具函數
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// 導入類型定義
import type { UserInfo } from 'your-app-name/src/types';
```

### 跨服務導入

當配置了模組連結（Module Link）後，可以使用相同的方式導入其他服務的模組：

```ts
// 導入遠端服務的元件
import { Header } from 'remote-service/src/components';

// 導入遠端服務的工具函數
import { logger } from 'remote-service/src/utils';
```

### 自定義別名

對於第三方套件或特殊場景，可以通過 Esmx 配置檔案自定義別名：

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // 為 Vue 配置特定的建置版本
                        'vue$': 'vue/dist/vue.esm.js',
                        // 為常用目錄配置簡短別名
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning 注意事項
1. 對於業務模組，建議始終使用預設的別名機制，以保持專案的一致性
2. 自定義別名主要用於處理第三方套件的特殊需求或優化開發體驗
3. 過度使用自定義別名可能會影響程式碼的可維護性和建置優化

:::