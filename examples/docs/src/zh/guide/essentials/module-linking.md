---
titleSuffix: "零运行时代码共享方案"
description: "Esmx 模块链接：基于 ESM 标准的零运行时微前端代码共享解决方案"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 模块链接, Module Linking, ESM, 代码共享, 微前端"
---

# 模块链接

模块链接（Module Linking）是 Esmx 提供的**跨应用代码共享方案**。它基于浏览器原生的 ESM（ECMAScript Modules）标准，让多个应用可以共享代码模块，无需任何额外的运行时库。

## 核心优势

- **零运行时开销**：直接使用浏览器原生 ESM 加载器，不引入任何代理或包装层。
- **高效共享**：通过导入映射（Import Maps）在构建时解析依赖，运行时直接加载。
- **版本隔离**：不同应用可使用同一包的不同版本，共存的 major 版本被自动隔离。
- **简单易用**：声明式配置，与原生 ESM 语法完全兼容。

简而言之，模块链接相当于一个"模块共享管理器"，让不同应用能够像使用本地模块一样，安全、高效地共享代码。

## 模型：在 `package.json` `esmx` 中声明

所有协议事实都写在**一个 `package.json` 字段** `esmx` 里，恰好有**四个可选子字段**。`entry.node.ts` 只保留*行为*（`devApp`、`server`、`postBuild`）以及环境链接 —— 把协议事实写进去会报错（`E_PROTOCOL_IN_BEHAVIOR`）。

| 字段 | 含义 |
|---|---|
| `entry` | 框架入口（`client` / `server`），每侧是一个 `./` 相对源文件路径，或 `false` 禁用该侧。库模块可省略。 |
| `exports` | 带**逻辑名**的子路径映射：键是 `./<name>`，值是 `./` 相对源文件或 `{ client, server }` 分叉（`false` 禁用某侧）。消费方永远看不到你的物理路径。 |
| `provides` | 本模块为消费方再导出的第三方包的纯数组（如 `["vue"]`）。供给的版本是你**解析出的已安装版本**，在构建时写入 manifest。 |
| `uses` | 你所消费的**模块名**的纯数组。不是 specifier，也不是版本 —— 只是名字。**数组顺序有意义**（见下方合并规则）。 |

一个模块的声明严格是**本地知识**：你可以在对其他任何模块一无所知的情况下写出它。三种角色覆盖所有工程。

### 角色 1 —— 供给方（共享平台包）

```json
{
    "name": "shared",
    "version": "3.2.1",
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": {
            "./ui": "./src/ui/index.ts",
            "./store": {
                "client": "./src/store.client.ts",
                "server": "./src/store.server.ts"
            }
        },
        "provides": ["vue", "@esmx/router"]
    }
}
```

消费方 `import 'shared/ui'` —— 一个逻辑名。重命名 `src/ui/index.ts` 不再是破坏性变更。

### 角色 2 —— 消费方 + 供给方（功能远程）

```json
{
    "name": "cart",
    "version": "1.8.0",
    "dependencies": { "shared": "^3.0.0" },
    "peerDependencies": { "vue": "^3.4.0", "@esmx/router": "^3.0.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": { "./widget": "./src/cart-widget.ts" },
        "uses": ["shared"]
    }
}
```

注意**没有**什么：没有 `imports` 映射，没有逐 specifier 接线，`esmx` 里也没有版本字段。版本范围就放在 npm 本来就放的地方 —— `dependencies`（∪ `peerDependencies`）—— 并在构建时对照挂载产物的实际版本校验。

### 角色 3 —— 组合方（宿主）

```json
{
    "name": "host",
    "version": "2.0.0",
    "dependencies": { "shared": "^3.0.0", "cart": "^1.5.0" },
    "peerDependencies": { "vue": "^3.4.0", "@esmx/router": "^3.0.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "uses": ["shared", "cart"]
    }
}
```

`uses` 是**传递的**：如果 `cart` uses `shared`，那么 uses `cart` 的宿主会通过链条得到 `shared` 的供给。业务应用只声明一行，对链条深度毫不知情。

## 接线如何被推导（你永远不用写）

两条规则取代所有手写映射。

**合并规则** —— 一句话：
`supply(M) = merge(supply(uses[0]), …, supply(uses[n]), M.provides)` —— 后面的条目覆盖前面的，模块自己的 `provides` 是隐含的最后一个元素，所以当两个模块供给同一个包时，**`uses` 数组的顺序决定谁赢**（按从通用到具体排列；具体层胜出，和 `Object.assign` 同一约定家族）。选举是**逐 major 版本**的 —— 共存的 major（如 vue 2 和 vue 3）是隔离的孤岛，各有自己的赢家，每个消费方接到满足自己声明范围的那个 major。

**查找规则** —— 在打包器遍历你的代码时逐 specifier 应用，无需预处理、无需声明：

```
裸 specifier 在我合并后的供给表里 → 外部化，接到赢家
哪里都找不到                     → 我自己打包的副本，由逐模块的 import-map scope 隔离
```

因此单实例共享是固有的（每个包一个赢家，整个闭包重接到它），多版本共存也不需要任何额外词汇 —— 一个自带副本的模块会被自动 scope 隔离。仅类型导入（`import type`）永远不产生接线。

## 挂载：产物从哪来

任何可通过 `node_modules` 解析的模块都会**自动挂载**在 `node_modules/<name>/dist`，无需路径配置。这覆盖了 registry 安装*和* monorepo 兄弟包：pnpm `workspace:*` 依赖的软链会被跟随并 realpath 化，所以一条普通的 `dependencies` 加上 `uses` 名字就是全部。

只有对于**不能**经 npm 解析的产物目录（部署路径、`@esmx/fetch` 输出），才需要加显式 `links` 条目。`links` 是**环境事实**而非协议事实，所以它是唯一还允许留在 `entry.node.ts` 里的 `modules` 键：

```ts
// host/entry.node.ts —— 只有环境链接，没有协议事实
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'my-remote': '/srv/deploy/my-remote/dist'
        }
    },
    async devApp(esmx) { /* ... */ },
    async server(esmx) { /* ... */ }
} satisfies EsmxOptions;
```

## 导入共享代码

一旦某模块进了你的 `dependencies` 和 `uses`，就用**逻辑名**导入它的导出：

```typescript
// host/src/api/orders.ts
import { App } from 'shared/ui';        // 逻辑导出名
import axios from 'axios';              // 被供给的包 —— 接到赢家

export async function fetchOrders() {
    const response = await axios.get('/api/orders');
    return response.data;
}
```

`axios` 解析到你合并供给表里*供给*它的那个模块（通过 `provides: ["axios"]`）；`shared/ui` 解析到 `shared` 模块声明的逻辑导出。你永远不用写物理路径，也不用手写 import map。

## 校验接线：`esmx validate`

`esmx validate` 是整个解析过程的**免构建 dry run** —— 挂载遍历、版本检查、供给合并、导出检查。每次改完声明就跑：

```bash
esmx validate          # 人类可读报告
esmx validate --json   # 机器可读信封（CI / Agent）
```

只有出现 error 级诊断时它才以非零码退出；只有警告则退出 0。没有 `esmx` 字段的包会报告 `protocol: "legacy"` 并退出 0。完整诊断分类（`E_NOT_LINKED`、`E_VERSION`、`E_SCHEMA`、`W_MULTI_CANDIDATE` 等）见 [LLM 简报](/llms.md#diagnostics-the-complete-taxonomy)。

## 完整示例：多版本共存

一个共享基座并排供给两个 major 的 Vue；每个业务应用接到自己声明范围满足的那一个 —— 全程没有任何手写 `imports`。

### 共享基座（`shared`）

```json
{
    "name": "shared",
    "version": "1.0.0",
    "dependencies": {
        "vue": "^3.5.0",
        "vue2": "npm:vue@^2.7.0",
        "@esmx/router": "^3.0.0"
    },
    "esmx": {
        "provides": ["vue", "vue2", "@esmx/router"]
    }
}
```

### Vue 3 应用（`vue3-app`）

```json
{
    "name": "vue3-app",
    "version": "1.0.0",
    "dependencies": { "shared": "workspace:*" },
    "peerDependencies": { "vue": "^3.5.0", "@esmx/router": "^3.0.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": { "./routes": "./src/routes.ts" },
        "uses": ["shared"]
    }
}
```

### Vue 2 应用（`vue2-app`）

```json
{
    "name": "vue2-app",
    "version": "1.0.0",
    "dependencies": { "shared": "workspace:*", "vue": "npm:vue@^2.7.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": { "./routes": "./src/routes.ts" },
        "uses": ["shared"]
    }
}
```

### 聚合宿主（`host`）

```json
{
    "name": "host",
    "version": "1.0.0",
    "dependencies": {
        "shared": "workspace:*",
        "vue2-app": "workspace:*",
        "vue3-app": "workspace:*"
    },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "uses": ["shared", "vue2-app", "vue3-app"]
    }
}
```

这展示了：

- **共享基座**：提供多版本框架支持；版本隔离来自 npm 别名（`npm:vue@^2.7.0`）加上 `provides` 声明 —— 每个 major 是一个隔离的选举分组。
- **Vue 3 / Vue 2 应用**：各自声明自己的 Vue 范围，只导出路由配置；解析器自动把它们接到匹配的 major。
- **聚合宿主**：组合子应用的单一入口 —— 每个子应用一行 `uses`，没有手写 import map。

构建好子应用后跑 `esmx validate --json`，确认整张图能解析。

## 旧语法（下个大版本移除）

> **新代码请始终使用上面的 `package.json` `esmx` 声明。** 下面的语法在过渡期仍然有效，你在存量工程里也*会*见到 —— 认识它、维护它，并把它改写成新声明来现代化。不要为新模块编写它。

旧工程把所有协议事实放在 `entry.node.ts` 的 `modules` 键下：

```ts
// entry.node.ts（旧）
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // 挂载模块的位置（手写相对 dist 路径）。
        links: { 'shared': '../shared/dist' },
        // 手写 specifier → 供给方接线（被供给合并取代）。
        imports: { 'vue': 'shared/vue' },
        // 字符串前缀 DSL：
        //   'pkg:vue'           → 再导出 npm 包 "vue"
        //                         （新协议：provides: ["vue"]）
        //   'root:src/index.ts' → 暴露一个源文件；公开名就是源路径
        //                         （"shared/src/index"）
        //                         （新协议：exports: { "./ui": "./src/ui/index.ts" }）
        exports: ['pkg:vue', 'root:src/index.ts']
    },
    async devApp(esmx) { /* ... */ },
    async server(esmx) { /* ... */ }
} satisfies EsmxOptions;
```

新协议消除的旧语法陷阱：

- **公开导出名等于源路径。** 旧消费方写 `import { x } from 'shared/src/index'` —— 目录结构就是 API，重命名一个源文件会破坏每个消费方。新协议下只有逻辑名（`'shared/ui'`）是公开的。
- **接线是手写的。** 每个消费方都要手写 `imports` 行，而新协议从声明中推导它们。
- **运行前不校验任何东西。** 没有版本检查、没有导出检查、没有结构化诊断。

这一切的转换是一次机械改写（可写成 codemod，但没有随框架提供的命令）。按照 RFC 0001，旧语法将在后续阶段被完全移除 —— 不存在长期双语法。
