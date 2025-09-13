import type { Esmx } from './core';

/**
 * 软件包打包配置接口。
 * 用于将服务的构建产物打包成标准的 npm .tgz 格式软件包。
 *
 * 特点：
 * - **标准化**：使用 npm 标准的 .tgz 打包格式
 * - **完整性**：包含模块的源代码、类型声明和配置文件等所有必要文件
 * - **兼容性**：与 npm 生态系统完全兼容，支持标准的包管理工作流
 *
 * 使用场景：
 * - 模块打包发布
 * - 版本发布管理
 * - CI/CD 流程集成
 *
 * @example
 * ```ts
 * // entry.node.ts
 * import type { EsmxOptions } from '@esmx/core';
 *
 * export default {
 *   modules: {
 *     // 配置需要导出的模块
 *     exports: [
 *       'root:src/components/button.vue',
 *       'root:src/utils/format.ts',
 *       'pkg:vue',
 *       'pkg:vue-router'
 *     ]
 *   },
 *   // 打包配置
 *   pack: {
 *     // 启用打包功能
 *     enable: true,
 *
 *     // 同时输出多个版本
 *     outputs: [
 *       'dist/versions/latest.tgz',
 *       'dist/versions/1.0.0.tgz'
 *     ],
 *
 *     // 自定义 package.json
 *     packageJson: async (esmx, pkg) => {
 *       pkg.name = '@your-scope/your-app';
 *       pkg.version = '1.0.0';
 *       // 添加构建脚本
 *       pkg.scripts = {
 *         "prepare": "npm run build",
 *         "build": "npm run build:dts && npm run build:ssr",
 *         "build:ssr": "esmx build",
 *         "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
 *       };
 *       return pkg;
 *     },
 *
 *     // 打包前准备
 *     onBefore: async (esmx, pkg) => {
 *       // 添加必要文件
 *       await fs.writeFile('dist/README.md', '# Your App\n\n模块导出说明...');
 *       // 执行类型检查
 *       await runTypeCheck();
 *     },
 *
 *     // 打包后处理
 *     onAfter: async (esmx, pkg, file) => {
 *       // 发布到私有 npm 镜像源
 *       await publishToRegistry(file, {
 *         registry: 'https://npm.your-registry.com/'
 *       });
 *       // 或部署到静态服务器
 *       await uploadToServer(file, 'https://static.example.com/packages');
 *     }
 *   }
 * } satisfies EsmxOptions;
 * ```
 */
export interface PackConfig {
    /**
     * 是否启用打包功能。
     * 启用后会将构建产物打包成标准的 npm .tgz 格式软件包。
     * @default false
     */
    enable?: boolean;

    /**
     * 指定输出的软件包文件路径。
     * 支持以下配置方式：
     * - string: 单个输出路径，如 'dist/versions/my-app.tgz'
     * - string[]: 多个输出路径，用于同时生成多个版本
     * - boolean: true 时使用默认路径 'dist/client/versions/latest.tgz'
     *
     * @example
     * ```ts
     * // 单个输出
     * outputs: 'dist/app.tgz'
     *
     * // 多个版本
     * outputs: [
     *   'dist/versions/latest.tgz',
     *   'dist/versions/1.0.0.tgz'
     * ]
     *
     * // 使用默认路径
     * outputs: true
     * ```
     *
     * @default 'dist/client/versions/latest.tgz'
     */
    outputs?: string | string[] | boolean;

    /**
     * package.json 处理函数。
     * 在打包前调用，用于自定义 package.json 的内容。
     *
     * 常见用途：
     * - 修改包名和版本号
     * - 添加或更新依赖项
     * - 添加自定义字段
     * - 配置发布相关信息
     *
     * @param esmx - Esmx 实例
     * @param pkgJson - 原始的 package.json 内容
     * @returns 处理后的 package.json 内容
     *
     * @example
     * ```ts
     * packageJson: async (esmx, pkg) => {
     *   // 设置包信息
     *   pkg.name = 'my-app';
     *   pkg.version = '1.0.0';
     *   pkg.description = '我的应用';
     *
     *   // 添加依赖
     *   pkg.dependencies = {
     *     'vue': '^3.0.0',
     *     'express': '^4.17.1'
     *   };
     *
     *   // 添加发布配置
     *   pkg.publishConfig = {
     *     registry: 'https://registry.example.com'
     *   };
     *
     *   return pkg;
     * }
     * ```
     */
    packageJson?: (
        esmx: Esmx,
        pkgJson: Record<string, any>
    ) => Promise<Record<string, any>>;

    /**
     * 打包前的钩子函数。
     * 在生成 .tgz 文件之前调用，用于执行准备工作。
     *
     * 常见用途：
     * - 添加额外的文件（README、LICENSE 等）
     * - 执行测试或构建验证
     * - 生成文档或元数据
     * - 清理临时文件
     *
     * @param esmx - Esmx 实例
     * @param pkgJson - 处理后的 package.json 内容
     *
     * @example
     * ```ts
     * onBefore: async (esmx, pkg) => {
     *   // 添加文档
     *   await fs.writeFile('dist/README.md', '# My App');
     *   await fs.writeFile('dist/LICENSE', 'MIT License');
     *
     *   // 执行测试
     *   await runTests();
     *
     *   // 生成文档
     *   await generateDocs();
     * }
     * ```
     */
    onBefore?: (esmx: Esmx, pkgJson: Record<string, any>) => Promise<void>;

    /**
     * 打包后的钩子函数。
     * 在 .tgz 文件生成后调用，用于处理打包产物。
     *
     * 常见用途：
     * - 发布到 npm 仓库（公共或私有）
     * - 上传到静态资源服务器
     * - 执行版本管理
     * - 触发 CI/CD 流程
     *
     * @param esmx - Esmx 实例
     * @param pkgJson - 最终的 package.json 内容
     * @param file - 生成的 .tgz 文件内容
     *
     * @example
     * ```ts
     * onAfter: async (esmx, pkg, file) => {
     *   // 发布到 npm 私有仓库
     *   await publishToRegistry(file, {
     *     registry: 'https://registry.example.com'
     *   });
     *
     *   // 上传到静态资源服务器
     *   await uploadToServer(file, 'https://assets.example.com/packages');
     *
     *   // 创建版本标签
     *   await createGitTag(pkg.version);
     *
     *   // 触发部署流程
     *   await triggerDeploy(pkg.version);
     * }
     * ```
     */
    onAfter?: (
        esmx: Esmx,
        pkgJson: Record<string, any>,
        file: Buffer
    ) => Promise<void>;
}

/**
 * PackConfig 配置解析后的内部接口。
 * 将用户配置标准化，设置默认值，便于框架内部使用。
 *
 * 主要处理：
 * - 确保所有可选字段都有默认值
 * - 统一输出路径格式
 * - 标准化回调函数
 */
export interface ParsedPackConfig {
    /**
     * 是否启用打包功能。
     * 解析后总是有确定的布尔值。
     * @default false
     */
    enable: boolean;

    /**
     * 解析后的输出文件路径列表。
     * 将所有输出格式统一转换为字符串数组：
     * - 布尔值 true → ['dist/client/versions/latest.tgz']
     * - 字符串 → [输入的字符串]
     * - 字符串数组 → 保持不变
     */
    outputs: string[];

    /**
     * 标准化的 package.json 处理函数。
     * 未配置时使用默认函数，保持原始内容不变。
     */
    packageJson: (
        esmx: Esmx,
        pkgJson: Record<string, any>
    ) => Promise<Record<string, any>>;

    /**
     * 标准化的打包前钩子函数。
     * 未配置时使用空函数。
     */
    onBefore: (esmx: Esmx, pkgJson: Record<string, any>) => Promise<void>;

    /**
     * 标准化的打包后钩子函数。
     * 未配置时使用空函数。
     */
    onAfter: (
        esmx: Esmx,
        pkgJson: Record<string, any>,
        file: Buffer
    ) => Promise<void>;
}

export function parsePackConfig(config: PackConfig = {}): ParsedPackConfig {
    const outputs: string[] = [];
    if (typeof config.outputs === 'string') {
        outputs.push(config.outputs);
    } else if (Array.isArray(config.outputs)) {
        outputs.push(...config.outputs);
    } else if (config.outputs !== false) {
        outputs.push('dist/client/versions/latest.tgz');
    }
    return {
        enable: config.enable ?? false,
        outputs,
        async packageJson(esmx, pkgJson) {
            if (config.packageJson) {
                pkgJson = await config.packageJson(esmx, pkgJson);
            }
            return pkgJson;
        },
        async onBefore(esmx, pkgJson: Record<string, any>) {
            await config.onBefore?.(esmx, pkgJson);
        },
        async onAfter(esmx, pkgJson, file) {
            await config.onAfter?.(esmx, pkgJson, file);
        }
    };
}
