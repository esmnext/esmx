---
titleSuffix: Esmx フレームワークのクライアントサイドレンダリング実装ガイド
description: Esmx フレームワークのクライアントサイドレンダリングメカニズムについて詳しく説明します。静的ビルド、デプロイ戦略、ベストプラクティスを含め、サーバーレス環境で効率的なフロントエンドレンダリングを実現するための開発者向けガイドです。
head:
  - - meta
    - property: keywords
      content: Esmx, クライアントサイドレンダリング, CSR, 静的ビルド, フロントエンドレンダリング, サーバーレスデプロイ, パフォーマンス最適化
---

# クライアントサイドレンダリング

クライアントサイドレンダリング（Client-Side Rendering, CSR）は、ブラウザ側でページのレンダリングを実行する技術アプローチです。Esmx では、Node.js サーバーインスタンスをデプロイできない場合、ビルド段階で静的な `index.html` ファイルを生成し、純粋なクライアントサイドレンダリングを実現できます。

## 使用シナリオ

以下のシナリオではクライアントサイドレンダリングの使用が推奨されます：

- **静的ホスティング環境**：GitHub Pages、CDN など、サーバーサイドレンダリングをサポートしていないホスティングサービス
- **シンプルなアプリケーション**：初期表示速度や SEO の要件が高くない小規模なアプリケーション
- **開発環境**：開発段階でのアプリケーションの迅速なプレビューとデバッグ

## 設定説明

### HTML テンプレート設定

クライアントサイドレンダリングモードでは、汎用的な HTML テンプレートを設定する必要があります。このテンプレートはアプリケーションのコンテナとして機能し、必要なリソース参照とマウントポイントを含みます。

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // 依存関係の収集をコミット
    await rc.commit();
    
    // HTML テンプレートを設定
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // リソースのプリロード
    <title>Esmx</title>
    ${rc.css()}               // スタイルの注入
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // インポートマップ
    ${rc.moduleEntry()}       // エントリーモジュール
    ${rc.modulePreload()}     // モジュールのプリロード
</body>
</html>
`;
};
```

### 静的 HTML 生成

本番環境でクライアントサイドレンダリングを使用するには、ビルド段階で静的な HTML ファイルを生成する必要があります。Esmx は `postBuild` フック関数を提供しており、この機能を実現できます：

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // 静的な HTML ファイルを生成
        const rc = await esmx.render();
        // HTML ファイルを書き込み
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```