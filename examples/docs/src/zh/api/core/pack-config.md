---
titleSuffix: Esmx 框架打包配置 API 参考
description: 详细介绍 Esmx 框架的 PackConfig 配置接口，包括软件包打包规则、输出配置和生命周期钩子，帮助开发者实现标准化的构建流程。
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, 软件包打包, 构建配置, 生命周期钩子, 打包配置, Web 应用框架
---

# PackConfig

`PackConfig` 是软件包打包配置接口，用于将服务的构建产物打包成标准的 npm .tgz 格式软件包。

- **标准化**：使用 npm 标准的 .tgz 打包格式
- **完整性**：包含模块的源代码、类型声明和配置文件等所有必要文件
- **兼容性**：与 npm 生态系统完全兼容，支持标准的包管理工作流

## 类型定义

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

是否启用打包功能。启用后会将构建产物打包成标准的 npm .tgz 格式软件包。

- 类型：`boolean`
- 默认值：`false`

#### outputs

指定输出的软件包文件路径。支持以下配置方式：
- `string`: 单个输出路径，如 'dist/versions/my-app.tgz'
- `string[]`: 多个输出路径，用于同时生成多个版本
- `boolean`: true 时使用默认路径 'dist/client/versions/latest.tgz'

#### packageJson

自定义 package.json 内容的回调函数。在打包前调用，用于自定义 package.json 的内容。

- 参数：
  - `esmx: Esmx` - Esmx 实例
  - `pkg: any` - 原始的 package.json 内容
- 返回值：`Promise<any>` - 修改后的 package.json 内容

常见用途：
- 修改包名和版本号
- 添加或更新依赖项
- 添加自定义字段
- 配置发布相关信息

示例：
```ts
packageJson: async (esmx, pkg) => {
  // 设置包信息
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = '我的应用';

  // 添加依赖
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // 添加发布配置
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

打包前的准备工作回调函数。

- 参数：
  - `esmx: Esmx` - Esmx 实例
  - `pkg: Record<string, any>` - package.json 内容
- 返回值：`Promise<void>`

常见用途：
- 添加额外的文件（README、LICENSE 等）
- 执行测试或构建验证
- 生成文档或元数据
- 清理临时文件

示例：
```ts
onBefore: async (esmx, pkg) => {
  // 添加文档
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // 执行测试
  await runTests();

  // 生成文档
  await generateDocs();

  // 清理临时文件
  await cleanupTempFiles();
}
```

#### onAfter

打包完成后的处理回调函数。在 .tgz 文件生成后调用，用于处理打包产物。

- 参数：
  - `esmx: Esmx` - Esmx 实例
  - `pkg: Record<string, any>` - package.json 内容
  - `file: Buffer` - 打包后的文件内容
- 返回值：`Promise<void>`

常见用途：
- 发布到 npm 仓库（公共或私有）
- 上传到静态资源服务器
- 执行版本管理
- 触发 CI/CD 流程

示例：
```ts
onAfter: async (esmx, pkg, file) => {
  // 发布到 npm 私有仓库
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // 上传到静态资源服务器
  await uploadToServer(file, 'https://assets.example.com/packages');

  // 创建版本标签
  await createGitTag(pkg.version);

  // 触发部署流程
  await triggerDeploy(pkg.version);
}
```

## 使用示例

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // 配置需要导出的模块
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // 打包配置
  pack: {
    // 启用打包功能
    enable: true,

    // 同时输出多个版本
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // 自定义 package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // 打包前准备
    onBefore: async (esmx, pkg) => {
      // 添加必要文件
      await fs.writeFile('dist/README.md', '# Your App\n\n模块导出说明...');
      // 执行类型检查
      await runTypeCheck();
    },

    // 打包后处理
    onAfter: async (esmx, pkg, file) => {
      // 发布到私有 npm 镜像源
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // 或部署到静态服务器
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```