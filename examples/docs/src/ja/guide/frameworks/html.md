---
titleSuffix: Esmx フレームワーク HTML SSR アプリケーション例
description: Esmx を使用した HTML SSR アプリケーションをゼロから構築する方法を紹介します。プロジェクトの初期化、HTML 設定、エントリーファイルの設定など、フレームワークの基本的な使い方を実例で示します。
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, SSRアプリケーション, TypeScript設定, プロジェクト初期化, サーバーサイドレンダリング, クライアントサイドインタラクション
---

# HTML

このチュートリアルでは、Esmx を使用した HTML SSR アプリケーションをゼロから構築する方法を紹介します。Esmx フレームワークを使用してサーバーサイドレンダリングアプリケーションを作成する方法を、完全な例を通して示します。

## プロジェクト構造

まず、プロジェクトの基本構造を確認しましょう：

```bash
.
├── package.json         # プロジェクト設定ファイル、依存関係とスクリプトコマンドを定義
├── tsconfig.json        # TypeScript 設定ファイル、コンパイルオプションを設定
└── src                  # ソースコードディレクトリ
    ├── app.ts           # メインアプリケーションコンポーネント、ページ構造とインタラクションロジックを定義
    ├── create-app.ts    # アプリケーションインスタンス作成ファクトリ、アプリケーションの初期化を担当
    ├── entry.client.ts  # クライアントサイドエントリーファイル、ブラウザサイドレンダリングを処理
    ├── entry.node.ts    # Node.js サーバーエントリーファイル、開発環境設定とサーバー起動を担当
    └── entry.server.ts  # サーバーサイドエントリーファイル、SSR レンダリングロジックを処理
```

## プロジェクト設定

### package.json

`package.json` ファイルを作成し、プロジェクトの依存関係とスクリプトを設定します：

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
  }
}
```

`package.json` ファイルを作成した後、プロジェクトの依存関係をインストールする必要があります。以下のいずれかのコマンドを使用してインストールできます：
```bash
pnpm install
# または
yarn install
# または
npm install
```

これにより、TypeScript や SSR 関連の依存関係を含むすべての必要なパッケージがインストールされます。

### tsconfig.json

`tsconfig.json` ファイルを作成し、TypeScript のコンパイルオプションを設定します：

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## ソースコード構造

### app.ts

メインアプリケーションコンポーネント `src/app.ts` を作成し、ページ構造とインタラクションロジックを実装します：

```ts title="src/app.ts"
/**
 * @file サンプルコンポーネント
 * @description Esmx フレームワークの基本的な機能をデモンストレーションするための、自動更新される時間付きのページタイトルを表示
 */

export default class App {
    /**
     * 現在時刻、ISO フォーマット
     * @type {string}
     */
    public time = '';

    /**
     * アプリケーションインスタンスを作成
     * @param {SsrContext} [ssrContext] - サーバーサイドコンテキスト、インポートメタデータのコレクションを含む
     */
    public constructor(public ssrContext?: SsrContext) {
        // コンストラクタ内で追加の初期化は不要
    }

    /**
     * ページ内容をレンダリング
     * @returns {string} ページの HTML 構造を返す
     */
    public render(): string {
        // サーバーサイド環境で正しくインポートメタデータを収集する
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx クイックスタート</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * クライアントサイドの初期化
     * @throws {Error} 時間表示要素が見つからない場合にエラーをスロー
     */
    public onClient(): void {
        // 時間表示要素を取得
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('時間表示要素が見つかりません');
        }

        // タイマーを設定し、1秒ごとに時間を更新
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * サーバーサイドの初期化
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * サーバーサイドコンテキストインターフェース
 * @interface
 */
export interface SsrContext {
    /**
     * インポートメタデータのコレクション
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

`src/create-app.ts` ファイルを作成し、アプリケーションインスタンスの作成を担当します：

```ts title="src/create-app.ts"
/**
 * @file アプリケーションインスタンス作成
 * @description アプリケーションインスタンスの作成と設定を担当
 */

import App from './app';

export function createApp() {
    const app = new App();
    return {
        app
    };
}
```

### entry.client.ts

クライアントサイドエントリーファイル `src/entry.client.ts` を作成します：

```ts title="src/entry.client.ts"
/**
 * @file クライアントサイドエントリーファイル
 * @description クライアントサイドのインタラクションロジックと動的更新を担当
 */

import { createApp } from './create-app';

// アプリケーションインスタンスを作成し、初期化
const { app } = createApp();
app.onClient();
```

### entry.node.ts

`entry.node.ts` ファイルを作成し、開発環境の設定とサーバーの起動を担当します：

```ts title="src/entry.node.ts"
/**
 * @file Node.js サーバーエントリーファイル
 * @description 開発環境の設定とサーバーの起動を担当し、SSR ランタイム環境を提供
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * 開発環境のアプリケーション作成器を設定
     * @description Rspack アプリケーションインスタンスを作成し、開発環境のビルドとホットリロードを設定
     * @param esmx Esmx フレームワークインスタンス、コア機能と設定インターフェースを提供
     * @returns 設定された Rspack アプリケーションインスタンスを返す、HMR とリアルタイムプレビューをサポート
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // ここで Rspack コンパイル設定をカスタマイズ
                }
            })
        );
    },

    /**
     * HTTP サーバーを設定して起動
     * @description HTTP サーバーインスタンスを作成し、Esmx ミドルウェアを統合して SSR リクエストを処理
     * @param esmx Esmx フレームワークインスタンス、ミドルウェアとレンダリング機能を提供
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Esmx ミドルウェアを使用してリクエストを処理
            esmx.middleware(req, res, async () => {
                // サーバーサイドレンダリングを実行
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('サーバー起動: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

このファイルは、開発環境の設定とサーバーの起動のためのエントリーファイルで、以下の2つの主要な機能を含みます：

1. `devApp` 関数：開発環境の Rspack アプリケーションインスタンスを作成し、ホットリロードとリアルタイムプレビュー機能をサポートします。
2. `server` 関数：HTTP サーバーを作成し、Esmx ミドルウェアを統合して SSR リクエストを処理します。

### entry.server.ts

サーバーサイドレンダリングエントリーファイル `src/entry.server.ts` を作成します：

```ts title="src/entry.server.ts"
/**
 * @file サーバーサイドレンダリングエントリーファイル
 * @description サーバーサイドレンダリングプロセス、HTML 生成、リソース注入を担当
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// ページ内容生成ロジックをカプセル化
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // サーバーサイドレンダリングコンテキストをアプリケーションインスタンスに注入
    app.ssrContext = ssrContext;
    // サーバーサイドを初期化
    app.onServer();

    // ページ内容を生成
    return app.render();
};

export default async (rc: RenderContext) => {
    // アプリケーションインスタンスを作成し、app インスタンスを含むオブジェクトを返す
    const { app } = createApp();
    // renderToString を使用してページ内容を生成
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // 依存関係の収集をコミットし、必要なリソースがすべてロードされることを確認
    await rc.commit();

    // 完全な HTML 構造を生成
    rc.html = `<!DOCTYPE html>
<html lang="ja">
<head>
    ${rc.preload()}
    <title>Esmx クイックスタート</title>
    ${rc.css()}
</head>
<body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

## プロジェクトの実行

上記のファイル設定が完了したら、以下のコマンドを使用してプロジェクトを実行できます：

1. 開発モード：
```bash
npm run dev
```

2. プロジェクトをビルド：
```bash
npm run build
```

3. 本番環境で実行：
```bash
npm run start
```

これで、Esmx を使用した HTML SSR アプリケーションが正常に作成されました！ http://localhost:3000 にアクセスして結果を確認できます。