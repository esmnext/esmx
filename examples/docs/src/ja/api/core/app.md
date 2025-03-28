---
titleSuffix: Esmx フレームワーク アプリケーション抽象インターフェース
description: Esmx フレームワークの App インターフェースについて詳しく説明します。アプリケーションのライフサイクル管理、静的リソース処理、サーバーサイドレンダリング機能をカバーし、開発者がアプリケーションのコア機能を理解し使用するのを支援します。
head:
  - - meta
    - property: keywords
      content: Esmx, App, アプリケーション抽象, ライフサイクル, 静的リソース, サーバーサイドレンダリング, API
---

# App

`App` は Esmx フレームワークのアプリケーション抽象化で、アプリケーションのライフサイクル管理、静的リソース処理、サーバーサイドレンダリングを統一的に管理するインターフェースを提供します。

```ts title="entry.node.ts"
export default {
  // 開発環境設定
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // Rspack 設定のカスタマイズ
        }
      })
    );
  }
}
```

## 型定義
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **型**: `Middleware`

静的リソース処理ミドルウェア。

開発環境：
- ソースコードの静的リソースリクエストを処理
- リアルタイムコンパイルとホットリロードをサポート
- no-cache キャッシュポリシーを使用

本番環境：
- ビルド後の静的リソースを処理
- 不変ファイルの長期キャッシュをサポート（.final.xxx）
- 最適化されたリソースロード戦略

```ts
server.use(esmx.middleware);
```

#### render

- **型**: `(options?: RenderContextOptions) => Promise<RenderContext>`

サーバーサイドレンダリング関数。実行環境に応じて異なる実装を提供：
- 本番環境（start）：ビルド後のサーバーエントリーファイル（entry.server）をロードしてレンダリングを実行
- 開発環境（dev）：ソースコード内のサーバーエントリーファイルをロードしてレンダリングを実行

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **型**: `() => Promise<boolean>`

本番環境ビルド関数。リソースのバンドルと最適化に使用されます。ビルドが成功すると true を返し、失敗すると false を返します。

#### destroy

- **型**: `() => Promise<boolean>`

リソースクリーンアップ関数。サーバーのシャットダウン、接続の切断などに使用されます。クリーンアップが成功すると true を返し、失敗すると false を返します。