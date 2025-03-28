---
titleSuffix: Esmx フレームワーク モジュールインポートパスマッピングガイド
description: Esmx フレームワークのパスエイリアスメカニズムについて詳しく説明します。インポートパスの簡略化、深いネストの回避、型安全性、モジュール解決の最適化などの機能を紹介し、開発者がコードの保守性を向上させるのに役立ちます。
head:
  - - meta
    - property: keywords
      content: Esmx, パスエイリアス, Path Alias, TypeScript, モジュールインポート, パスマッピング, コード保守性
---

# パスエイリアス

パスエイリアス（Path Alias）は、モジュールインポートパスをマッピングするメカニズムで、開発者が完全なモジュールパスの代わりに短くて意味のある識別子を使用できるようにします。Esmx では、パスエイリアスメカニズムには以下の利点があります：

- **インポートパスの簡略化**：冗長な相対パスの代わりに意味のあるエイリアスを使用し、コードの可読性を向上させます
- **深いネストの回避**：`../../../../` のような多階層ディレクトリ参照による保守の困難さを解消します
- **型安全性**：TypeScript の型システムと完全に統合され、コード補完と型チェックを提供します
- **モジュール解決の最適化**：事前定義されたパスマッピングにより、モジュール解決のパフォーマンスを向上させます

## デフォルトのエイリアスメカニズム

Esmx はサービス名（Service Name）に基づく自動エイリアスメカニズムを採用しており、この設定より優れた設計には以下の特徴があります：

- **自動設定**：`package.json` の `name` フィールドに基づいてエイリアスを自動生成し、手動設定は不要です
- **統一された規約**：すべてのサービスモジュールが一貫した命名と参照規約に従うことを保証します
- **型サポート**：`npm run build:dts` コマンドと連携し、型宣言ファイルを自動生成し、サービス間の型推論を実現します
- **予測可能性**：サービス名からモジュールの参照パスを推測できるため、保守コストを低減します

## 設定説明

### package.json の設定

`package.json` では、`name` フィールドでサービスの名前を定義します。この名前はサービスのデフォルトのエイリアスプレフィックスとして使用されます：

```json title="package.json"
{
    "name": "your-app-name"
}
```

### tsconfig.json の設定

TypeScript がエイリアスパスを正しく解決できるようにするため、`tsconfig.json` で `paths` マッピングを設定する必要があります：

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

## 使用例

### サービス内部モジュールのインポート

```ts
// エイリアスを使用してインポート
import { MyComponent } from 'your-app-name/src/components';

// 同等の相対パスでのインポート
import { MyComponent } from '../components';
```

### 他のサービスモジュールのインポート

```ts
// 他のサービスのコンポーネントをインポート
import { SharedComponent } from 'other-service/src/components';

// 他のサービスのユーティリティ関数をインポート
import { utils } from 'other-service/src/utils';
```

::: tip ベストプラクティス
- 相対パスではなくエイリアスパスを優先して使用します
- エイリアスパスの意味と一貫性を保ちます
- エイリアスパスで過剰なディレクトリ階層を使用しないようにします

:::

``` ts
// コンポーネントをインポート
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// ユーティリティ関数をインポート
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// 型定義をインポート
import type { UserInfo } from 'your-app-name/src/types';
```

### サービス間のインポート

モジュールリンク（Module Link）を設定すると、他のサービスのモジュールを同じ方法でインポートできます：

```ts
// リモートサービスのコンポーネントをインポート
import { Header } from 'remote-service/src/components';

// リモートサービスのユーティリティ関数をインポート
import { logger } from 'remote-service/src/utils';
```

### カスタムエイリアス

サードパーティパッケージや特殊なシナリオでは、Esmx 設定ファイルでカスタムエイリアスを設定できます：

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Vue の特定のビルドバージョンを設定
                        'vue$': 'vue/dist/vue.esm.js',
                        // よく使うディレクトリに短いエイリアスを設定
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
1. ビジネスモジュールでは、プロジェクトの一貫性を保つために常にデフォルトのエイリアスメカニズムを使用することを推奨します
2. カスタムエイリアスは、主にサードパーティパッケージの特殊なニーズや開発体験の最適化に使用します
3. カスタムエイリアスの過剰使用は、コードの保守性やビルドの最適化に影響を与える可能性があります

:::