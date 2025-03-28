---
titleSuffix: Esmx フレームワーク レンダリングコンテキスト API リファレンス
description: Esmx フレームワークの RenderContext コアクラスの詳細説明。レンダリング制御、リソース管理、状態同期、ルーティング制御などの機能を提供し、開発者が効率的なサーバーサイドレンダリングを実現するのを支援します。
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, サーバーサイドレンダリング, レンダリングコンテキスト, 状態同期, リソース管理, Web アプリケーションフレームワーク
---

# RenderContext

RenderContext は Esmx フレームワークのコアクラスで、サーバーサイドレンダリング（SSR）のライフサイクル全体を管理します。レンダリングコンテキスト、リソース管理、状態同期などの重要なタスクを処理するための完全な API を提供します：

- **レンダリング制御**：サーバーサイドレンダリングプロセスを管理し、マルチエントリーレンダリング、条件付きレンダリングなどのシナリオをサポート
- **リソース管理**：JS、CSS などの静的リソースをインテリジェントに収集して注入し、ロードパフォーマンスを最適化
- **状態同期**：サーバーサイドの状態シリアライズを処理し、クライアント側での正しいハイドレーションを保証
- **ルーティング制御**：サーバーサイドリダイレクト、ステータスコード設定などの高度な機能をサポート

## 型定義

### ServerRenderHandle

サーバーサイドレンダリング処理関数の型定義。

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

サーバーサイドレンダリング処理関数は、RenderContext インスタンスを引数として受け取り、サーバーサイドレンダリングロジックを処理する非同期または同期関数です。

```ts title="entry.node.ts"
// 1. 非同期処理関数
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. 同期処理関数
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

レンダリングプロセス中に収集されたリソースファイルリストの型定義。

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: JavaScript ファイルリスト
- **css**: スタイルシートファイルリスト
- **modulepreload**: プリロードが必要な ESM モジュールリスト
- **resources**: その他のリソースファイルリスト（画像、フォントなど）

```ts
// リソースファイル列表示例
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

importmap の生成モードを定義します。

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: importmap の内容を直接 HTML にインライン化します。以下のシナリオに適しています：
  - HTTP リクエスト数を減らす必要がある場合
  - importmap の内容が小さい場合
  - 初回ロードのパフォーマンスが重要な場合
- `js`: importmap の内容を独立した JS ファイルとして生成します。以下のシナリオに適しています：
  - importmap の内容が大きい場合
  - ブラウザのキャッシュメカニズムを利用する必要がある場合
  - 複数のページで同じ importmap を共有する場合

レンダリングコンテキストクラスは、サーバーサイドレンダリング（SSR）プロセス中のリソース管理と HTML 生成を担当します。
## インスタンスオプション

レンダリングコンテキストの設定オプションを定義します。

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **型**: `string`
- **デフォルト値**: `''`

静的リソースのベースパス。
- すべての静的リソース（JS、CSS、画像など）はこのパスを基準にロードされます
- ランタイムでの動的設定をサポートし、再ビルドは不要です
- 多言語サイト、マイクロフロントエンドアプリケーションなどのシナリオでよく使用されます

#### entryName

- **型**: `string`
- **デフォルト値**: `'default'`

サーバーサイドレンダリングエントリー関数名。サーバーサイドレンダリング時に使用するエントリー関数を指定するために使用され、1つのモジュールが複数のレンダリング関数をエクスポートする場合に使用されます。

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // モバイル端末向けレンダリングロジック
};

export const desktop = async (rc: RenderContext) => {
  // デスクトップ向けレンダリングロジック
};
```

#### params

- **型**: `Record<string, any>`
- **デフォルト値**: `{}`

レンダリングパラメータ。レンダリング関数に任意の型のパラメータを渡すことができ、リクエスト情報（URL、クエリパラメータなど）を渡すためによく使用されます。

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **型**: `'inline' | 'js'`
- **デフォルト値**: `'inline'`

インポートマップ（Import Map）の生成モード：
- `inline`: importmap の内容を直接 HTML にインライン化します
- `js`: importmap の内容を独立した JS ファイルとして生成します


## インスタンスプロパティ

### esmx

- **型**: `Esmx`
- **読み取り専用**: `true`

Esmx インスタンスの参照。フレームワークのコア機能と設定情報にアクセスするために使用されます。

### redirect

- **型**: `string | null`
- **デフォルト値**: `null`

リダイレクト先のアドレス。設定すると、サーバーはこの値に基づいて HTTP リダイレクトを実行できます。ログイン認証、権限制御などのシナリオでよく使用されます。

```ts title="entry.node.ts"
// ログイン認証の例
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // ページのレンダリングを続行...
};

// 権限制御の例
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // ページのレンダリングを続行...
};
```

### status

- **型**: `number | null`
- **デフォルト値**: `null`

HTTP レスポンスステータスコード。任意の有効な HTTP ステータスコードを設定でき、エラー処理、リダイレクトなどのシナリオでよく使用されます。

```ts title="entry.node.ts"
// 404 エラー処理の例
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // 404 ページをレンダリング...
    return;
  }
  // ページのレンダリングを続行...
};

// 一時リダイレクトの例
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // 一時リダイレクト、リクエストメソッドを保持
    return;
  }
  // ページのレンダリングを続行...
};
```

### html

- **型**: `string`
- **デフォルト値**: `''`

HTML コンテンツ。最終的に生成される HTML コンテンツを設定および取得するために使用され、設定時にベースパスのプレースホルダーを自動的に処理します。

```ts title="entry.node.ts"
// 基本的な使用法
export default async (rc: RenderContext) => {
  // HTML コンテンツを設定
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// 動的ベースパス
const rc = await esmx.render({
  base: '/app',  // ベースパスを設定
  params: { url: req.url }
});

// HTML 内のプレースホルダーは自動的に置換されます：
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// 置換後：
// /app/your-app-name/css/style.css
```

### base

- **型**: `string`
- **読み取り専用**: `true`
- **デフォルト値**: `''`

静的リソースのベースパス。すべての静的リソース（JS、CSS、画像など）はこのパスを基準にロードされ、ランタイムでの動的設定をサポートします。

```ts
// 基本的な使用法
const rc = await esmx.render({
  base: '/esmx',  // ベースパスを設定
  params: { url: req.url }
});

// 多言語サイトの例
const rc = await esmx.render({
  base: '/cn',  // 中国語サイト
  params: { lang: 'zh-CN' }
});

// マイクロフロントエンドアプリケーションの例
const rc = await esmx.render({
  base: '/app1',  // サブアプリケーション1
  params: { appId: 1 }
});
```

### entryName

- **型**: `string`
- **読み取り専用**: `true`
- **デフォルト値**: `'default'`

サーバーサイドレンダリングエントリー関数名。entry.server.ts から使用するレンダリング関数を選択するために使用されます。

```ts title="entry.node.ts"
// デフォルトエントリー関数
export default async (rc: RenderContext) => {
  // デフォルトのレンダリングロジック
};

// 複数のエントリー関数
export const mobile = async (rc: RenderContext) => {
  // モバイル端末向けレンダリングロジック
};

export const desktop = async (rc: RenderContext) => {
  // デスクトップ向けレンダリングロジック
};

// デバイスタイプに基づいてエントリー関数を選択
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **型**: `Record<string, any>`
- **読み取り専用**: `true`
- **デフォルト値**: `{}`

レンダリングパラメータ。サーバーサイドレンダリングプロセス中にパラメータを渡してアクセスするために使用され、リクエスト情報、ページ設定などを渡すためによく使用されます。

```ts
// 基本的な使用法 - URL と言語設定を渡す
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// ページ設定 - テーマとレイアウトを設定
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// 環境設定 - API アドレスを注入
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **型**: `Set<ImportMeta>`

モジュール依存関係収集セット。コンポーネントのレンダリングプロセス中にモジュール依存関係を自動的に追跡して記録し、現在のページレンダリングで実際に使用されたリソースのみを収集します。

```ts
// 基本的な使用法
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // レンダリングプロセス中にモジュール依存関係を自動的に収集
  // フレームワークはコンポーネントレンダリング時に自動的に context.importMetaSet.add(import.meta) を呼び出します
  // 開発者は依存関係収集を手動で処理する必要はありません
  return '<div id="app">Hello World</div>';
};

// 使用例
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **型**: `RenderFiles`

リソースファイルリスト：
- js: JavaScript ファイルリスト
- css: スタイルシートファイルリスト
- modulepreload: プリロードが必要な ESM モジュールリスト
- resources: その他のリソースファイルリスト（画像、フォントなど）

```ts
// リソース収集
await rc.commit();

// リソース注入
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- リソースをプリロード -->
    ${rc.preload()}
    <!-- スタイルシートを注入 -->
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
```

### importmapMode

- **型**: `'inline' | 'js'`
- **デフォルト値**: `'inline'`

インポートマップの生成モード：
- `inline`: importmap の内容を直接 HTML にインライン化します
- `js`: importmap の内容を独立した JS ファイルとして生成します


## インスタンスメソッド

### serialize()

- **パラメータ**: 
  - `input: any` - シリアライズするデータ
  - `options?: serialize.SerializeJSOptions` - シリアライズオプション
- **戻り値**: `string`

JavaScript オブジェクトを文字列にシリアライズします。サーバーサイドレンダリングプロセス中に状態データをシリアライズし、データを HTML に安全に埋め込むために使用されます。

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **パラメータ**: 
  - `varName: string` - 変数名
  - `data: Record<string, any>` - 状態データ
- **戻り値**: `string`

状態データをシリアライズして HTML に注入します。安全なシリアライズ方法を使用してデータを処理し、複雑なデータ構造をサポートします。

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **戻り値**: `Promise<void>`

依存関係収集をコミットしてリソースリストを更新します。importMetaSet から使用されたすべてのモジュールを収集し、manifest ファイルに基づいて各モジュールの具体的なリソースを解析します。

```ts
// レンダリングして依存関係をコミット
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// 依存関係収集をコミット
await rc.commit();
```

### preload()

- **戻り値**: `string`

リソースプリロードタグを生成します。CSS と JavaScript リソースをプリロードするために使用され、優先度設定をサポートし、ベースパスを自動的に処理します。

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- スタイルシートを注入 -->
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### css()

- **戻り値**: `string`

CSS スタイルシートタグを生成します。収集された CSS