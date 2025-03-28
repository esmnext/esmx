---
titleSuffix: Esmx 框架打包配置 API 參考
description: 詳細介紹 Esmx 框架的 PackConfig 配置介面，包括軟體包打包規則、輸出配置和生命週期鉤子，幫助開發者實現標準化的建置流程。
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, 軟體包打包, 建置配置, 生命週期鉤子, 打包配置, Web 應用框架
---

# PackConfig

`PackConfig` 是軟體包打包配置介面，用於將服務的建置產物打包成標準的 npm .tgz 格式軟體包。

- **標準化**：使用 npm 標準的 .tgz 打包格式
- **完整性**：包含模組的原始碼、類型宣告和設定檔等所有必要檔案
- **相容性**：與 npm 生態系統完全相容，支援標準的套件管理工作流程

## 類型定義

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

是否啟用打包功能。啟用後會將建置產物打包成標準的 npm .tgz 格式軟體包。

- 類型：`boolean`
- 預設值：`false`

#### outputs

指定輸出的軟體包檔案路徑。支援以下配置方式：
- `string`: 單一輸出路徑，如 'dist/versions/my-app.tgz'
- `string[]`: 多個輸出路徑，用於同時產生多個版本
- `boolean`: true 時使用預設路徑 'dist/client/versions/latest.tgz'

#### packageJson

自訂 package.json 內容的回呼函式。在打包前呼叫，用於自訂 package.json 的內容。

- 參數：
  - `esmx: Esmx` - Esmx 實例
  - `pkg: any` - 原始的 package.json 內容
- 回傳值：`Promise<any>` - 修改後的 package.json 內容

常見用途：
- 修改套件名稱和版本號
- 新增或更新相依項目
- 新增自訂欄位
- 配置發佈相關資訊

範例：
```ts
packageJson: async (esmx, pkg) => {
  // 設定套件資訊
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = '我的應用';

  // 新增相依項目
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // 新增發佈配置
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

打包前的準備工作回呼函式。

- 參數：
  - `esmx: Esmx` - Esmx 實例
  - `pkg: Record<string, any>` - package.json 內容
- 回傳值：`Promise<void>`

常見用途：
- 新增額外的檔案（README、LICENSE 等）
- 執行測試或建置驗證
- 產生文件或元資料
- 清理暫存檔案

範例：
```ts
onBefore: async (esmx, pkg) => {
  // 新增文件
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // 執行測試
  await runTests();

  // 產生文件
  await generateDocs();

  // 清理暫存檔案
  await cleanupTempFiles();
}
```

#### onAfter

打包完成後的處理回呼函式。在 .tgz 檔案產生後呼叫，用於處理打包產物。

- 參數：
  - `esmx: Esmx` - Esmx 實例
  - `pkg: Record<string, any>` - package.json 內容
  - `file: Buffer` - 打包後的檔案內容
- 回傳值：`Promise<void>`

常見用途：
- 發佈到 npm 倉庫（公開或私有）
- 上傳到靜態資源伺服器
- 執行版本管理
- 觸發 CI/CD 流程

範例：
```ts
onAfter: async (esmx, pkg, file) => {
  // 發佈到 npm 私有倉庫
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // 上傳到靜態資源伺服器
  await uploadToServer(file, 'https://assets.example.com/packages');

  // 建立版本標籤
  await createGitTag(pkg.version);

  // 觸發部署流程
  await triggerDeploy(pkg.version);
}
```

## 使用範例

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // 配置需要匯出的模組
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // 打包配置
  pack: {
    // 啟用打包功能
    enable: true,

    // 同時輸出多個版本
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // 自訂 package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // 打包前準備
    onBefore: async (esmx, pkg) => {
      // 新增必要檔案
      await fs.writeFile('dist/README.md', '# Your App\n\n模組匯出說明...');
      // 執行類型檢查
      await runTypeCheck();
    },

    // 打包後處理
    onAfter: async (esmx, pkg, file) => {
      // 發佈到私有 npm 鏡像源
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // 或部署到靜態伺服器
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```