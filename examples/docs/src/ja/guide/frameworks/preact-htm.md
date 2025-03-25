---
titleSuffix: Gez フレームワーク Preact+HTM SSR アプリケーション例
description: Gez を使用した Preact+HTM SSR アプリケーションをゼロから構築する方法を紹介します。プロジェクトの初期化、Preact の設定、エントリーファイルの設定など、フレームワークの基本的な使い方を実例を通して説明します。
head:
  - - meta
    - property: keywords
      content: Gez, Preact, HTM, SSRアプリケーション, TypeScript設定, プロジェクト初期化, サーバーサイドレンダリング, クライアントサイドインタラクション
---

# Preact+HTM

このチュートリアルでは、Gez を使用した Preact+HTM SSR アプリケーションをゼロから構築する方法を説明します。Gez フレームワークを使用してサーバーサイドレンダリング（SSR）アプリケーションを作成する方法を、完全な例を通して紹介します。

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
  "name": "ssr-demo-preact-htm",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
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

これにより、Preact、HTM、TypeScript、および SSR 関連の依存パッケージがすべてインストールされます。

### tsconfig.json

`tsconfig.json` ファイルを作成し、TypeScript のコンパイルオプションを設定します：

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "node",
        "strict": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "paths": {
            "ssr-demo-preact-htm/src/*": [
                "./src/*"
            ],
            "ssr-demo-preact-htm/*": [
                "./*"
            ]
        }
    },
    "include": [
        "src"
    ],
    "exclude": [
        "dist"
    ]
}
```

## ソースコード構造

### app.ts

メインアプリケーションコンポーネント `src/app.ts` を作成し、Preact のクラスコンポーネントと HTM を使用します：

```ts title="src/app.ts"
/**
 * @file サンプルコンポーネント
 * @description Gez フレームワークの基本的な機能をデモンストレーションするための、自動更新されるタイムスタンプ付きのページタイトルを表示
 */

import { Component } from 'preact';
import { html } from 'htm/preact';

export default class App extends Component {
    state = {
        time: new Date().toISOString()
    };

    timer: NodeJS.Timeout | null = null;

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                time: new Date().toISOString()
            });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        const { time } = this.state;
        return html`
            <div>
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Gez クイックスタート</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

`src/create-app.ts` ファイルを作成し、アプリケーションインスタンスの作成を担当します：

```ts title="src/create-app.ts"
/**
 * @file アプリケーションインスタンス作成
 * @description アプリケーションインスタンスの作成と設定を担当
 */

import type { VNode } from 'preact';
import { html } from 'htm/preact';
import App from './app';

export function createApp(): { app: VNode } {
    const app = html`<${App} />`;
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

import { render } from 'preact';
import { createApp } from './create-app';

// アプリケーションインスタンスを作成
const { app } = createApp();

// アプリケーションインスタンスをマウント
render(app, document.getElementById('app')!);
```

### entry.node.ts

`entry.node.ts` ファイルを作成し、開発環境の設定とサーバーの起動を担当します：

```ts title="src/entry.node.ts"
/**
 * @file Node.js サーバーエントリーファイル
 * @description 開発環境の設定とサーバーの起動を担当し、SSR ランタイム環境を提供
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * 開発環境のアプリケーション作成を設定
     * @description Rspack アプリケーションインスタンスを作成し、開発環境のビルドとホットリロードを設定
     * @param gez Gez フレームワークインスタンス、コア機能と設定インターフェースを提供
     * @returns 設定された Rspack アプリケーションインスタンスを返し、HMR とリアルタイムプレビューをサポート
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // ここで Rspack コンパイル設定をカスタマイズ
                }
            })
        );
    },

    /**
     * HTTP サーバーを設定して起動
     * @description HTTP サーバーインスタンスを作成し、Gez ミドルウェアを統合して SSR リクエストを処理
     * @param gez Gez フレームワークインスタンス、ミドルウェアとレンダリング機能を提供
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Gez ミドルウェアを使用してリクエストを処理
            gez.middleware(req, res, async () => {
                // サーバーサイドレンダリングを実行
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('サーバー起動: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

このファイルは、開発環境の設定とサーバーの起動のためのエントリーファイルです。主に以下の2つのコア機能を含みます：

1. `devApp` 関数：開発環境の Rspack アプリケーションインスタンスを作成し、ホットリロードとリアルタイムプレビュー機能をサポートします。ここでは `createRspackHtmlApp` を使用して、Preact+HTM 用の Rspack アプリケーションインスタンスを作成します。
2. `server` 関数：HTTP サーバーを作成し、Gez ミドルウェアを統合して SSR リクエストを処理します。

### entry.server.ts

サーバーサイドレンダリングエントリーファイル `src/entry.server.ts` を作成します：

```ts title="src/entry.server.ts"
/**
 * @file サーバーサイドレンダリングエントリーファイル
 * @description サーバーサイドレンダリングプロセス、HTML 生成、リソース注入を担当
 */

import type { RenderContext } from '@gez/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // アプリケーションインスタンスを作成
    const { app } = createApp();

    // Preact の renderToString を使用してページコンテンツを生成
    const html = render(app);

    // 依存関係の収集をコミットし、必要なリソースがすべてロードされることを確認
    await rc.commit();

    // 完全な HTML 構造を生成
    rc.html = `<!DOCTYPE html>
<html lang="ja">
<head>
    ${rc.preload()}
    <title>Gez クイックスタート</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
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

2. プロジェクトのビルド：
```bash
npm run build
```

3. 本番環境での実行：
```bash
npm run start
```

これで、Gez を使用した Preact+HTM SSR アプリケーションが正常に作成されました！http://localhost:3000 にアクセスして効果を確認できます。