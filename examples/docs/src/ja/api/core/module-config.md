---
titleSuffix: Esmx フレームワーク モジュール設定 API リファレンス
description: Esmx フレームワークの ModuleConfig 設定インターフェースについて詳しく説明します。モジュールのインポート/エクスポートルール、エイリアス設定、外部依存関係管理などを含み、開発者がフレームワークのモジュールシステムを深く理解するのに役立ちます。
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, モジュール設定, モジュールインポート/エクスポート, 外部依存関係, エイリアス設定, 依存関係管理, Webアプリケーションフレームワーク
---

# ModuleConfig

ModuleConfig は、Esmx フレームワークのモジュール設定機能を提供し、モジュールのインポート/エクスポートルール、エイリアス設定、外部依存関係などを定義するために使用されます。

## 型定義

### PathType

- **型定義**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

モジュールパスタイプの列挙型：
- `npm`: node_modules 内の依存関係を表します
- `root`: プロジェクトルートディレクトリ内のファイルを表します

### ModuleConfig

- **型定義**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

モジュール設定インターフェース。サービスのエクスポート、インポート、外部依存関係の設定を定義するために使用されます。

#### exports

エクスポート設定リスト。サービス内の特定のコードユニット（コンポーネント、ユーティリティ関数など）を ESM 形式で外部に公開します。

以下の2種類をサポートします：
- `root:*`: ソースコードファイルをエクスポートします。例：`root:src/components/button.vue`
- `npm:*`: サードパーティの依存関係をエクスポートします。例：`npm:vue`

各エクスポート項目には以下の属性が含まれます：
- `name`: 元のエクスポートパス。例：`npm:vue` または `root:src/components`
- `type`: パスタイプ（`npm` または `root`）
- `importName`: インポート名。形式：`${serviceName}/${type}/${path}`
- `exportName`: エクスポートパス。サービスルートディレクトリからの相対パス
- `exportPath`: 実際のファイルパス
- `externalName`: 外部依存関係名。他のサービスがこのモジュールをインポートする際の識別子として使用されます

#### links

サービス依存関係設定マップ。現在のサービスが依存する他のサービス（ローカルまたはリモート）とそのローカルパスを設定します。各設定項目のキーはサービス名、値はそのサービスのローカルパスです。

インストール方法によって設定が異なります：
- ソースコードインストール（Workspace、Git）：dist ディレクトリを指す必要があります。ビルド後のファイルを使用するためです
- パッケージインストール（Link、静的サーバー、プライベートミラー、File）：パッケージディレクトリを直接指します。パッケージにはビルド後のファイルが含まれているためです

#### imports

外部依存関係マップ。使用する外部依存関係を設定します。通常はリモートモジュール内の依存関係を使用します。

各依存関係項目には以下の属性が含まれます：
- `match`: インポート文をマッチする正規表現
- `import`: 実際のモジュールパス

**例**：
```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // エクスポート設定
    exports: [
      'root:src/components/button.vue',  // ソースコードファイルをエクスポート
      'root:src/utils/format.ts',
      'npm:vue',  // サードパーティの依存関係をエクスポート
      'npm:vue-router'
    ],

    // インポート設定
    links: {
      // ソースコードインストール方式：dist ディレクトリを指す必要があります
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // パッケージインストール方式：パッケージディレクトリを直接指します
      'other-remote': 'root:./node_modules/other-remote'
    },

    // 外部依存関係設定
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies EsmxOptions;
```

### ParsedModuleConfig

- **型定義**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * パッケージ名
     */
    name: string
    /**
     * パッケージルートディレクトリ
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

解析されたモジュール設定。元のモジュール設定を標準化された内部形式に変換します：

#### name
現在のサービスの名前
- モジュールの識別とインポートパスの生成に使用されます

#### root
現在のサービスのルートディレクトリパス
- 相対パスの解決とビルド成果物の保存に使用されます

#### exports
エクスポート設定リスト
- `name`: 元のエクスポートパス。例：'npm:vue' または 'root:src/components'
- `type`: パスタイプ（npm または root）
- `importName`: インポート名。形式：'${serviceName}/${type}/${path}'
- `exportName`: エクスポートパス。サービスルートディレクトリからの相対パス
- `exportPath`: 実際のファイルパス
- `externalName`: 外部依存関係名。他のサービスがこのモジュールをインポートする際の識別子として使用されます

#### links
インポート設定リスト
- `name`: パッケージ名
- `root`: パッケージルートディレクトリ

#### imports
外部依存関係マップ
- モジュールのインポートパスを実際のモジュール位置にマッピングします
- `match`: インポート文をマッチする正規表現
- `import`: 実際のモジュールパス
```