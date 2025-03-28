---
titleSuffix: フレームワークコアクラス API リファレンス
description: Esmx フレームワークのコアクラス API について詳しく説明します。アプリケーションライフサイクル管理、静的リソース処理、サーバーサイドレンダリング機能など、フレームワークのコア機能を深く理解するためのガイドです。
head:
  - - meta
    - property: keywords
      content: Esmx, API, ライフサイクル管理, 静的リソース, サーバーサイドレンダリング, Rspack, Web アプリケーションフレームワーク
---

# Esmx

## はじめに

Esmx は Rspack をベースにした高性能な Web アプリケーションフレームワークで、アプリケーションライフサイクル管理、静的リソース処理、サーバーサイドレンダリング機能を提供します。

## 型定義

### RuntimeTarget

- **型定義**:
```ts
type RuntimeTarget = 'client' | 'server'
```

アプリケーションの実行環境タイプ：
- `client`: ブラウザ環境で実行され、DOM 操作やブラウザ API をサポート
- `server`: Node.js 環境で実行され、ファイルシステムやサーバーサイド機能をサポート

### ImportMap

- **型定義**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES モジュールのインポートマッピングタイプ。

#### SpecifierMap

- **型定義**:
```ts
type SpecifierMap = Record<string, string>
```

モジュール識別子のマッピングタイプで、モジュールのインポートパスのマッピング関係を定義します。

#### ScopesMap

- **型定義**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

スコープマッピングタイプで、特定のスコープ下でのモジュールインポートマッピング関係を定義します。

### COMMAND

- **型定義**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

コマンドタイプの列挙型：
- `dev`: 開発環境コマンドで、開発サーバーを起動し、ホットリロードをサポート
- `build`: ビルドコマンドで、本番環境のビルド成果物を生成
- `preview`: プレビューコマンドで、ローカルプレビューサーバーを起動
- `start`: 起動コマンドで、本番環境サーバーを実行

## インスタンスオプション

Esmx フレームワークのコア設定オプションを定義します。

```ts
interface EsmxOptions {
  root?: string
  isProd?: boolean
  basePathPlaceholder?: string | false
  modules?: ModuleConfig
  packs?: PackConfig
  devApp?: (esmx: Esmx) => Promise<App>
  server?: (esmx: Esmx) => Promise<void>
  postBuild?: (esmx: Esmx) => Promise<void>
}
```

#### root

- **型**: `string`
- **デフォルト値**: `process.cwd()`

プロジェクトのルートディレクトリパス。絶対パスまたは相対パスを指定でき、相対パスの場合は現在の作業ディレクトリに基づいて解決されます。

#### isProd

- **型**: `boolean`
- **デフォルト値**: `process.env.NODE_ENV === 'production'`

環境識別子。
- `true`: 本番環境
- `false`: 開発環境

#### basePathPlaceholder

- **型**: `string | false`
- **デフォルト値**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

ベースパスのプレースホルダー設定。実行時にリソースのベースパスを動的に置換するために使用されます。`false` に設定するとこの機能を無効にできます。

#### modules

- **型**: `ModuleConfig`

モジュール設定オプション。プロジェクトのモジュール解決ルールを設定するために使用され、モジュールエイリアスや外部依存関係などの設定を含みます。

#### packs

- **型**: `PackConfig`

パッケージ設定オプション。ビルド成果物を標準の npm .tgz 形式のパッケージにパッケージ化するために使用されます。

#### devApp

- **型**: `(esmx: Esmx) => Promise<App>`

開発環境アプリケーション作成関数。開発環境でのみ使用され、開発サーバーのアプリケーションインスタンスを作成するために使用されます。

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Rspack 設定をカスタマイズ
        }
      })
    )
  }
}
```

#### server

- **型**: `(esmx: Esmx) => Promise<void>`

サーバー起動設定関数。HTTP サーバーの設定と起動に使用され、開発環境と本番環境の両方で使用できます。

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000);
  }
}
```

#### postBuild

- **型**: `(esmx: Esmx) => Promise<void>`

ビルド後処理関数。プロジェクトのビルドが完了した後に実行され、以下の用途に使用できます：
- 追加のリソース処理
- デプロイ操作
- 静的ファイルの生成
- ビルド通知の送信

## インスタンスプロパティ

### name

- **型**: `string`
- **読み取り専用**: `true`

現在のモジュールの名前で、モジュール設定から取得されます。

### varName

- **型**: `string`
- **読み取り専用**: `true`

モジュール名に基づいて生成された有効な JavaScript 変数名。

### root

- **型**: `string`
- **読み取り専用**: `true`

プロジェクトルートディレクトリの絶対パス。設定された `root` が相対パスの場合、現在の作業ディレクトリに基づいて解決されます。

### isProd

- **型**: `boolean`
- **読み取り専用**: `true`

現在が本番環境かどうかを判断します。設定オプションの `isProd` が優先され、設定されていない場合は `process.env.NODE_ENV` に基づいて判断されます。

### basePath

- **型**: `string`
- **読み取り専用**: `true`
- **例外**: `NotReadyError` - フレームワークが初期化されていない場合

スラッシュで始まり終わるモジュールのベースパスを取得します。返される形式は `/${name}/` で、`name` はモジュール設定から取得されます。

### basePathPlaceholder

- **型**: `string`
- **読み取り専用**: `true`

実行時に動的に置換されるベースパスのプレースホルダーを取得します。設定により無効にすることができます。

### middleware

- **型**: `Middleware`
- **読み取り専用**: `true`

静的リソース処理ミドルウェアを取得します。環境に応じて異なる実装を提供します：
- 開発環境：ソースコードのリアルタイムコンパイルとホットリロードをサポート
- 本番環境：静的リソースの長期キャッシュをサポート

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **型**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **読み取り専用**: `true`

サーバーサイドレンダリング関数を取得します。環境に応じて異なる実装を提供します：
- 開発環境：ホットリロードとリアルタイムプレビューをサポート
- 本番環境：最適化されたレンダリングパフォーマンスを提供

```ts
// 基本的な使用法
const rc = await esmx.render({
  params: { url: req.url }
});

// 高度な設定
const rc = await esmx.render({
  base: '',                    // ベースパス
  importmapMode: 'inline',     // インポートマップモード
  entryName: 'default',        // レンダリングエントリ
  params: {
    url: req.url,
    state: { user: 'admin' }   // 状態データ
  }
});
```

### COMMAND

- **型**: `typeof COMMAND`
- **読み取り専用**: `true`

コマンド列挙型の定義を取得します。

### moduleConfig

- **型**: `ParsedModuleConfig`
- **読み取り専用**: `true`
- **例外**: `NotReadyError` - フレームワークが初期化されていない場合

現在のモジュールの完全な設定情報を取得します。モジュール解決ルールやエイリアス設定などが含まれます。

### packConfig

- **型**: `ParsedPackConfig`
- **読み取り専用**: `true`
- **例外**: `NotReadyError` - フレームワークが初期化されていない場合

現在のモジュールのパッケージ関連設定を取得します。出力パスや package.json の処理などが含まれます。

## インスタンスメソッド

### constructor()

- **パラメータ**: 
  - `options?: EsmxOptions` - フレームワーク設定オプション
- **戻り値**: `Esmx`

Esmx フレームワークインスタンスを作成します。

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **パラメータ**: `command: COMMAND`
- **戻り値**: `Promise<boolean>`
- **例外**:
  - `Error`: 重複初期化時
  - `NotReadyError`: 未初期化インスタンスへのアクセス時

Esmx フレームワークインスタンスを初期化します。以下のコア初期化プロセスを実行します：

1. プロジェクト設定の解析（package.json、モジュール設定、パッケージ設定など）
2. アプリケーションインスタンスの作成（開発環境または本番環境）
3. コマンドに応じたライフサイクルメソッドの実行

::: warning 注意
- 重複初期化時にはエラーがスローされます
- 未初期化のインスタンスにアクセスすると `NotReadyError` がスローされます

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **戻り値**: `Promise<boolean>`

Esmx フレームワークインスタンスを破棄し、リソースのクリーンアップや接続のクローズなどを実行します。主に以下の用途に使用されます：
- 開発サーバーの停止
- 一時ファイルやキャッシュのクリーンアップ
- システムリソースの解放

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **戻り値**: `Promise<boolean>`

アプリケーションのビルドプロセスを実行し、以下の処理を行います：
- ソースコードのコンパイル
- 本番環境のビルド成果物の生成
- コードの最適化と圧縮
- リソースマニフェストの生成

::: warning 注意
フレームワークインスタンスが初期化されていない状態で呼び出すと `NotReadyError` がスローされます
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // ビルド完了後に静的 HTML を生成
    const render = await esmx.render({
      params: { url: '/' }
    });
    esmx.writeSync(
      esmx.resolvePath('dist/client', 'index.html'),
      render.html
    );
  }
}
```

### server()

- **戻り値**: `Promise<void>`
- **例外**: `NotReadyError` - フレームワークが初期化されていない場合

HTTP サーバーと設定サーバーインスタンスを起動します。以下のライフサイクルで呼び出されます：
- 開発環境（dev）：開発サーバーを起動し、ホットリロードを提供
- 本番環境（start）：本番サーバーを起動し、本番環境レベルのパフォーマンスを提供

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // 静的リソースの処理
      esmx.middleware(req, res, async () => {
        // サーバーサイドレンダリング
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  }
}
```

### postBuild()

- **戻り値**: `Promise<boolean>`

ビルド後の処理ロジックを実行し、以下の用途に使用されます：
- 静的 HTML ファイルの生成
- ビルド成果物の処理
- デプロイタスクの実行
- ビルド通知の送信

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // 複数ページの静的 HTML を生成
    const pages = ['/', '/about', '/404'];

    for (const url of pages) {
      const render = await esmx.render({
        params: { url }
      });

      await esmx.write(
        esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
        render.html
      );
    }
  }
}
```

### resolvePath

プロジェクトパスを解決し、相対パスを絶対パスに変換します。

- **パラメータ**:
  - `projectPath: ProjectPath` - プロジェクトパスタイプ
  - `...args: string[]` - パスセグメント
- **戻り値**: `string` - 解決された絶対パス

- **例**:
```ts
// 静的リソースパスを解決
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

ファイル内容を同期書き込みします。

- **パラメータ**:
  - `filepath`: `string` - ファイルの絶対パス
  - `data`: `any` - 書き込むデータ。文字列、Buffer、またはオブジェクトを指定できます
- **戻り値**: `boolean` - 書き込みが成功したかどうか

- **例**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

JSON ファイルを同期読み取りし、解析します。

- **パラメータ**:
  - `filename`: `string` - JSON ファイルの絶対パス

- **戻り値**: `any` - 解析された JSON オブジェクト
- **例外**: ファイルが存在しないか、JSON 形式が不正な場合に例外がスローされます

- **例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // manifest オブジェクトを使用
}
```

### readJson()

JSON ファイルを非同期読み取りし、解析します。

- **パラメータ**:
  - `filename`: `string` - JSON ファイルの絶対パス

- **戻り値**: `Promise<any>` - 解析された JSON オブジェクト
- **例外**: ファイルが存在しないか、JSON 形式が不正な場合に例外がスローされます

- **例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // manifest オブジェクトを使用
}
```

### getManifestList()

ビルドマニフェストリストを取得します。

- **パラメータ**:
  - `target`: `RuntimeTarget` - ターゲット環境タイプ
    - `'client'`: クライアント環境
    - `'server'`: サーバー環境

- **戻り値**: `Promise<readonly ManifestJson[]>` - 読み取り専用のビルドマニフェストリスト
- **例外**: フレームワークインスタンスが初期化されていない場合に `NotReadyError` がスローされます

このメソッドは、指定されたターゲット環境のビルドマニフェストリストを