---
titleSuffix: Esmx フレームワーク パッケージング設定 API リファレンス
description: Esmx フレームワークの PackConfig 設定インターフェースについて詳しく説明します。パッケージングルール、出力設定、ライフサイクルフックを含み、開発者が標準化されたビルドプロセスを実現するのに役立ちます。
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, パッケージング, ビルド設定, ライフサイクルフック, パッケージング設定, Web アプリケーションフレームワーク
---

# PackConfig

`PackConfig` は、サービスのビルド成果物を標準的な npm .tgz 形式のパッケージにパッケージングするための設定インターフェースです。

- **標準化**: npm 標準の .tgz パッケージ形式を使用
- **完全性**: モジュールのソースコード、型宣言、設定ファイルなど、必要なすべてのファイルを含む
- **互換性**: npm エコシステムと完全に互換性があり、標準的なパッケージ管理ワークフローをサポート

## 型定義

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

パッケージング機能を有効にするかどうか。有効にすると、ビルド成果物が標準的な npm .tgz 形式のパッケージにパッケージングされます。

- 型: `boolean`
- デフォルト値: `false`

#### outputs

出力するパッケージファイルのパスを指定します。以下の設定方法をサポートします：
- `string`: 単一の出力パス、例: 'dist/versions/my-app.tgz'
- `string[]`: 複数の出力パス、複数のバージョンを同時に生成する場合に使用
- `boolean`: true の場合、デフォルトのパス 'dist/client/versions/latest.tgz' を使用

#### packageJson

package.json の内容をカスタマイズするコールバック関数。パッケージング前に呼び出され、package.json の内容をカスタマイズするために使用されます。

- パラメータ:
  - `esmx: Esmx` - Esmx インスタンス
  - `pkg: any` - 元の package.json の内容
- 戻り値: `Promise<any>` - 変更後の package.json の内容

一般的な用途:
- パッケージ名とバージョン番号の変更
- 依存関係の追加または更新
- カスタムフィールドの追加
- 公開関連情報の設定

例:
```ts
packageJson: async (esmx, pkg) => {
  // パッケージ情報を設定
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = '私のアプリケーション';

  // 依存関係を追加
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // 公開設定を追加
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

パッケージング前の準備作業を行うコールバック関数。

- パラメータ:
  - `esmx: Esmx` - Esmx インスタンス
  - `pkg: Record<string, any>` - package.json の内容
- 戻り値: `Promise<void>`

一般的な用途:
- 追加ファイルの追加（README、LICENSE など）
- テストまたはビルド検証の実行
- ドキュメントまたはメタデータの生成
- 一時ファイルのクリーンアップ

例:
```ts
onBefore: async (esmx, pkg) => {
  // ドキュメントを追加
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // テストを実行
  await runTests();

  // ドキュメントを生成
  await generateDocs();

  // 一時ファイルをクリーンアップ
  await cleanupTempFiles();
}
```

#### onAfter

パッケージング完了後の処理を行うコールバック関数。.tgz ファイルが生成された後に呼び出され、パッケージング成果物を処理するために使用されます。

- パラメータ:
  - `esmx: Esmx` - Esmx インスタンス
  - `pkg: Record<string, any>` - package.json の内容
  - `file: Buffer` - パッケージング後のファイル内容
- 戻り値: `Promise<void>`

一般的な用途:
- npm レジストリ（公開またはプライベート）への公開
- 静的リソースサーバーへのアップロード
- バージョン管理の実行
- CI/CD プロセスのトリガー

例:
```ts
onAfter: async (esmx, pkg, file) => {
  // npm プライベートレジストリに公開
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // 静的リソースサーバーにアップロード
  await uploadToServer(file, 'https://assets.example.com/packages');

  // バージョンタグを作成
  await createGitTag(pkg.version);

  // デプロイプロセスをトリガー
  await triggerDeploy(pkg.version);
}
```

## 使用例

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // エクスポートするモジュールを設定
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // パッケージング設定
  pack: {
    // パッケージング機能を有効にする
    enable: true,

    // 複数のバージョンを同時に出力
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // package.json をカスタマイズ
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // パッケージング前の準備
    onBefore: async (esmx, pkg) => {
      // 必要なファイルを追加
      await fs.writeFile('dist/README.md', '# Your App\n\nモジュールエクスポートの説明...');
      // 型チェックを実行
      await runTypeCheck();
    },

    // パッケージング後の処理
    onAfter: async (esmx, pkg, file) => {
      // プライベート npm レジストリに公開
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // または静的サーバーにデプロイ
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```