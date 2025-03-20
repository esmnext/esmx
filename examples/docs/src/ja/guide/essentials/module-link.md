---
titleSuffix: Gez フレームワークのサービス間コード共有メカニズム
description: Gez フレームワークのモジュールリンクメカニズムについて詳しく説明します。サービス間のコード共有、依存関係管理、ESM 仕様の実装について解説し、効率的なマイクロフロントエンドアプリケーションの構築を支援します。
head:
  - - meta
    - property: keywords
      content: Gez, モジュールリンク, Module Link, ESM, コード共有, 依存関係管理, マイクロフロントエンド
---

# モジュールリンク

Gez フレームワークは、サービス間のコード共有と依存関係を管理するための完全なモジュールリンクメカニズムを提供します。このメカニズムは ESM（ECMAScript Module）仕様に基づいて実装されており、ソースコードレベルのモジュールエクスポートとインポート、および完全な依存関係管理機能をサポートしています。

### コアコンセプト

#### モジュールエクスポート
モジュールエクスポートは、サービス内の特定のコードユニット（コンポーネント、ユーティリティ関数など）を ESM 形式で外部に公開するプロセスです。以下の2種類のエクスポートをサポートします：
- **ソースコードエクスポート**：プロジェクト内のソースコードファイルを直接エクスポート
- **依存関係エクスポート**：プロジェクトで使用するサードパーティの依存パッケージをエクスポート

#### モジュールリンク
モジュールインポートは、サービス内で他のサービスがエクスポートしたコードユニットを参照するプロセスです。以下のインストール方法をサポートします：
- **ソースコードインストール**：開発環境に適しており、リアルタイムの変更とホットリロードをサポート
- **パッケージインストール**：本番環境に適しており、ビルド成果物を直接使用

## モジュールエクスポート

### 設定説明

`entry.node.ts` でエクスポートするモジュールを設定します：

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        exports: [
            // ソースコードファイルをエクスポート
            'root:src/components/button.vue',  // Vue コンポーネント
            'root:src/utils/format.ts',        // ユーティリティ関数
            // サードパーティの依存関係をエクスポート
            'npm:vue',                         // Vue フレームワーク
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies GezOptions;
```

エクスポート設定は以下の2種類をサポートします：
- `root:*`：ソースコードファイルをエクスポートし、パスはプロジェクトのルートディレクトリからの相対パス
- `npm:*`：サードパーティの依存関係をエクスポートし、パッケージ名を直接指定

## モジュールインポート

### 設定説明

`entry.node.ts` でインポートするモジュールを設定します：

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        // リンク設定
        links: {
            // ソースコードインストール：ビルド成果物ディレクトリを指定
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // パッケージインストール：パッケージディレクトリを指定
            'other-remote': 'root:./node_modules/other-remote'
        },
        // インポートマッピング設定
        imports: {
            // リモートモジュールの依存関係を使用
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies GezOptions;
```

設定項目の説明：
1. **imports**：リモートモジュールのローカルパスを設定
   - ソースコードインストール：ビルド成果物ディレクトリ（dist）を指定
   - パッケージインストール：パッケージディレクトリを直接指定

2. **externals**：外部依存関係を設定
   - リモートモジュールの依存関係を共有するために使用
   - 同じ依存関係の重複ビルドを回避
   - 複数のモジュールで依存関係を共有可能

### インストール方法

#### ソースコードインストール
開発環境に適しており、リアルタイムの変更とホットリロードをサポートします。

1. **Workspace 方式**
Monorepo プロジェクトでの使用を推奨：
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Link 方式**
ローカル開発デバッグに使用：
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### パッケージインストール
本番環境に適しており、ビルド成果物を直接使用します。

1. **NPM Registry**
npm registry 経由でインストール：
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **静的サーバー**
HTTP/HTTPS プロトコル経由でインストール：
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## パッケージビルド

### 設定説明

`entry.node.ts` でビルドオプションを設定します：

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    // モジュールエクスポート設定
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // ビルド設定
    pack: {
        // ビルドを有効化
        enable: true,

        // 出力設定
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // カスタム package.json
        packageJson: async (gez, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // ビルド前処理
        onBefore: async (gez, pkg) => {
            // 型宣言を生成
            // テストケースを実行
            // ドキュメントを更新など
        },

        // ビルド後処理
        onAfter: async (gez, pkg, file) => {
            // CDN にアップロード
            // npm レポジトリに公開
            // テスト環境にデプロイなど
        }
    }
} satisfies GezOptions;
```

### ビルド成果物

```
your-app-name.tgz
├── package.json        # パッケージ情報
├── index.js            # 本番環境エントリーポイント
├── server/             # サーバーサイドリソース
│   └── manifest.json   # サーバーサイドリソースマッピング
├── node/               # Node.js ランタイム
└── client/             # クライアントサイドリソース
    └── manifest.json   # クライアントサイドリソースマッピング
```

### 公開プロセス

```bash
# 1. 本番バージョンをビルド
gez build

# 2. npm に公開
npm publish dist/versions/your-app-name.tgz
```