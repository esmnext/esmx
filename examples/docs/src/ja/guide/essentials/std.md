---
titleSuffix: Esmx フレームワーク プロジェクト構造と規約ガイド
description: Esmx フレームワークの標準プロジェクト構造、エントリーファイル規約、設定ファイル規約について詳しく説明し、開発者が規範的で保守可能な SSR アプリケーションを構築するのを支援します。
head:
  - - meta
    - property: keywords
      content: Esmx, プロジェクト構造, エントリーファイル, 設定規約, SSRフレームワーク, TypeScript, プロジェクト規約, 開発標準
---

# 標準規約

Esmx はモダンな SSR フレームワークで、標準化されたプロジェクト構造とパス解決メカニズムを採用しており、開発環境と本番環境での一貫性と保守性を確保します。

## プロジェクト構造規約

### 標準ディレクトリ構造

```txt
root
│─ dist                  # コンパイル出力ディレクトリ
│  ├─ package.json       # コンパイル後のパッケージ設定
│  ├─ server             # サーバーサイドのコンパイル出力
│  │  └─ manifest.json   # コンパイルマニフェスト出力、importmap 生成用
│  ├─ node               # Node サーバープログラムのコンパイル出力
│  ├─ client             # クライアントサイドのコンパイル出力
│  │  ├─ versions        # バージョン保存ディレクトリ
│  │  │  └─ latest.tgz   # dist ディレクトリをアーカイブし、パッケージ配布用
│  │  └─ manifest.json   # コンパイルマニフェスト出力、importmap 生成用
│  └─ src                # tsc で生成されたファイルタイプ
├─ src
│  ├─ entry.server.ts    # サーバーサイドアプリケーションのエントリーポイント
│  ├─ entry.client.ts    # クライアントサイドアプリケーションのエントリーポイント
│  └─ entry.node.ts      # Node サーバーアプリケーションのエントリーポイント
├─ tsconfig.json         # TypeScript 設定
└─ package.json          # パッケージ設定
```

::: tip 拡張知識
- `esmx.name` は `package.json` の `name` フィールドから取得されます
- `dist/package.json` はルートディレクトリの `package.json` から生成されます
- `packs.enable` を `true` に設定すると、`dist` ディレクトリがアーカイブされます

:::

## エントリーファイル規約

### entry.client.ts
クライアントサイドのエントリーファイルは以下の役割を担います：
- **アプリケーションの初期化**：クライアントアプリケーションの基本設定を構成
- **ルーティング管理**：クライアントサイドのルーティングとナビゲーションを処理
- **状態管理**：クライアントサイドの状態の保存と更新を実装
- **インタラクション処理**：ユーザーイベントとUIインタラクションを管理

### entry.server.ts
サーバーサイドのエントリーファイルは以下の役割を担います：
- **サーバーサイドレンダリング**：SSR レンダリングプロセスを実行
- **HTML 生成**：初期ページ構造を構築
- **データプリフェッチ**：サーバーサイドのデータ取得を処理
- **状態注入**：サーバーサイドの状態をクライアントに渡す
- **SEO 最適化**：ページの検索エンジン最適化を確保

### entry.node.ts
Node.js サーバーのエントリーファイルは以下の役割を担います：
- **サーバー設定**：HTTP サーバーのパラメータを設定
- **ルーティング処理**：サーバーサイドのルーティングルールを管理
- **ミドルウェア統合**：サーバーミドルウェアを構成
- **環境管理**：環境変数と設定を処理
- **リクエスト応答**：HTTP リクエストとレスポンスを処理

## 設定ファイル規約

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
