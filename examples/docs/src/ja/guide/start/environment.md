---
titleSuffix: Esmx フレームワーク互換性ガイド
description: Esmx フレームワークの環境要件について詳しく説明します。Node.js のバージョン要件やブラウザ互換性について解説し、開発者が正しく開発環境を設定できるよう支援します。
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, ブラウザ互換性, TypeScript, es-module-shims, 環境設定
---

# 環境要件

このドキュメントでは、本フレームワークを使用するために必要な環境要件について説明します。Node.js 環境とブラウザ互換性について解説します。

## Node.js 環境

フレームワークは Node.js バージョン >= 22.6 を必要とします。これは主に TypeScript の型インポート（`--experimental-strip-types` フラグを使用）をサポートするためで、追加のコンパイル手順は不要です。

## ブラウザ互換性

フレームワークはデフォルトで互換モードでビルドされ、より広範なブラウザをサポートします。ただし、完全なブラウザ互換性を実現するには、手動で [es-module-shims](https://github.com/guybedford/es-module-shims) 依存関係を追加する必要があります。

### 互換モード（デフォルト）
- 🌐 Chrome：>= 87 
- 🔷 Edge：>= 88 
- 🦊 Firefox：>= 78 
- 🧭 Safari：>= 14 

[Can I Use](https://caniuse.com/?search=dynamic%20import) の統計データによると、互換モードでのブラウザカバレッジは 96.81% です。

### ネイティブサポートモード
- 🌐 Chrome：>= 89 
- 🔷 Edge：>= 89 
- 🦊 Firefox：>= 108 
- 🧭 Safari：>= 16.4 

ネイティブサポートモードには以下の利点があります：
- ランタイムオーバーヘッドがゼロで、追加のモジュールローダーが不要
- ブラウザがネイティブで解析するため、実行速度が速い
- コード分割とオンデマンドロードの能力が向上

[Can I Use](https://caniuse.com/?search=importmap) の統計データによると、互換モードでのブラウザカバレッジは 93.5% です。

### 互換サポートの有効化

::: warning 重要
フレームワークはデフォルトで互換モードでビルドされますが、古いブラウザの完全なサポートを実現するには、プロジェクトに [es-module-shims](https://github.com/guybedford/es-module-shims) 依存関係を追加する必要があります。

:::

HTML ファイルに以下のスクリプトを追加してください：

```html
<!-- 開発環境 -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- 本番環境 -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip ベストプラクティス

1. 本番環境での推奨事項：
   - es-module-shims を自社サーバーにデプロイする
   - リソースのロードの安定性とアクセス速度を確保する
   - 潜在的なセキュリティリスクを回避する
2. パフォーマンスの考慮事項：
   - 互換モードではわずかなパフォーマンスオーバーヘッドが発生する
   - ターゲットユーザーのブラウザ分布に基づいて有効化するかどうかを決定する

:::