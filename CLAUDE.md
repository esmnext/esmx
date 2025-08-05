# Claude 开发指令集

> **说明**：本文件为 Claude Code AI 助手的专业开发指令集，用于规范代码生成、错误处理、项目结构等技术标准。

## 🌟 核心原则

**代码简洁性、安全性、自解释性**
- 编写简洁、技术性强的代码，提供准确示例
- 使用面向对象 + 函数式编程模式
- 优先选择迭代和模块化，避免代码重复
- 使用描述性变量名，带有辅助动词（如 isLoading, hasError）

## 🌐 语言使用规范

**统一的语言使用标准，确保团队协作和国际化兼容性**

### 用户沟通语言
使用用户的语言（中文用户用中文）：
- 工作流程界面
- 确认提示
- 错误信息

### 代码语言
一律使用英文：
- git commit 信息
- PR 标题和描述  
- 代码注释
- 变量和函数命名

## 💻 TypeScript 编码标准

### ESM 模块系统要求
- **强制使用 ESM (ECMAScript Modules) 进行开发**
- **使用 `import/export` 语句，禁用 `require/module.exports`**
- **Node.js 内置模块必须使用 `node:` 前缀**
- **配置 `"type": "module"` 在 package.json 中**

### Monorepo 开发规范
- **使用 `pnpm workspace` 管理 monorepo 依赖**
- **包间引用使用 workspace 协议：`"workspace:*"`**
- **核心包名遵循命名空间：`@your-org/package-name`**
- **示例项目使用项目内部导入，避免命名空间冲突**
- **共享配置文件放在根目录**
- **包级别的配置继承根配置**
- **examples 目录包含示例项目，支持嵌套结构**
- **构建产物 (`dist/`) 自动排除在 workspace 外**

#### 目录结构
```
project/
├── packages/           # 核心包目录
│   ├── core/
│   │   ├── package.json
│   │   └── src/
│   ├── utils/
│   │   ├── package.json
│   │   └── src/
│   └── ui/
│       ├── package.json
│       └── src/
├── examples/           # 示例项目目录
│   ├── basic-app/
│   │   ├── package.json
│   │   └── src/
│   └── advanced-demo/
│       ├── package.json
│       └── src/
├── package.json (workspace root)
├── pnpm-workspace.yaml
└── tsconfig.json (base config)
```

#### pnpm-workspace.yaml 配置
```yaml
packages:
  - 'packages/*'      # 核心包
  - 'examples/**'     # 示例项目（支持嵌套）
  - '!**/dist/**'     # 排除构建产物
```

#### 包间依赖
```json
{
  "dependencies": {
    "@your-org/core": "workspace:*",
    "@your-org/utils": "workspace:*"
  }
}
```

#### 导入规范
```typescript
// ✅ 核心包导入
import { createUser } from '@your-org/core';
import { logger } from '@your-org/utils';

// ✅ 示例项目导入（使用相对路径或项目别名）
import { createRouter } from '../router';
import { createVueRouter } from '../router-vue';

// ✅ 内部模块导入
import { validateEmail } from '../validators';
import { formatDate } from './utils';
```

### 类型安全要求
- **所有代码使用 TypeScript，优先使用 interfaces 而非 types**
- **❌ 避免 enums，使用 const 对象代替**
- **启用 TypeScript 严格模式以提高类型安全**
- **❌ 避免 `any` 类型，类型不确定时使用 `unknown`**

#### 代码示例

##### ✅ 推荐写法
```typescript
interface UserData {
  id: string;
  email: string;
  isActive: boolean;
}

const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

// 使用 unknown 而不是 any
const processInput = (input: unknown): UserData => {
  if (typeof input === 'object' && input !== null) {
    return input as UserData;
  }
  throw new Error('Invalid input');
};
```

##### ❌ 避免写法
```typescript
enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed', 
  FAILED = 'failed'
}

// 避免使用 any
const processInput = (input: any): UserData => {
  return input;
};
```

### 导入规范
**严格按照 Biome 默认导入顺序规范：**
1. **Bun 导入**：`bun:*` 模块
2. **Node.js 内置模块**：`node:*` 前缀的模块
3. **外部库**：来自 node_modules 的第三方包
4. **Monorepo 包间导入**：`@your-org/*` 命名空间的包
5. **相对导入（同级）**：`./` 开头的导入
6. **相对导入（父级）**：`../` 开头的导入
7. **内部模块（绝对路径）**：当前包内的绝对导入（仅在没有相对路径可用时使用）
8. **类型导入**：`import type` 语句（每个组内分别排列）

**重要要求：**
- **不同导入组之间必须用空行分隔**
- **同组内导入按字母顺序排列**
- **类型导入放在对应组的最后**
- **✅ Bun 和 Node.js 内置模块必须使用命名空间导入**
- **❌ 严格禁止 Node.js 内置模块的具名导入**

```typescript
// ✅ 符合 Biome 导入顺序规范
import fs from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';

import express from 'express';
import { z } from 'zod';

import { createUser } from '@your-org/core';
import { logger } from '@your-org/utils';

import { config } from './config';
import { database } from './lib/database';

import { validateRequest } from '../middleware';
import { userSchema } from '../schemas';

import { formatDate } from './utils';
import { constants } from './constants';

import type { Request, Response } from 'express';
import type { UserData } from '@your-org/core';
import type { Config } from './types';

// ❌ 禁止的导入模式
import { readFile } from 'node:fs/promises'; // 禁止：具名导入，应该使用命名空间导入
import { join } from 'node:path';            // 禁止：具名导入，应该使用命名空间导入

// ✅ 正确的 Node.js 内置模块导入方式
import fs from 'node:fs/promises';
import path from 'node:path';

// 使用时通过命名空间访问
const content = await fs.readFile('file.txt', 'utf-8');
const fullPath = path.join('/path', 'to', 'file');
const fs = require('fs');                    // 禁止：CommonJS
```

### 导出规范
- **优先使用命名导出**
- **只在绝对必要时使用默认导出**
- **使用 ESM 导出语法**
- **❌ 严格禁止 CommonJS 导出语法**

```typescript
// ✅ 推荐的 ESM 导出
export const createUser = (data: UserData): User => { /* */ };
export const updateUser = (id: string, data: Partial<UserData>): User => { /* */ };
export { validateEmail, formatDate } from './utils';

// ❌ 严格禁止的 CommonJS 导出
module.exports = { createUser, updateUser };
exports.createUser = (data) => { /* */ };
```

## ⚠️ 错误处理规范

### 严格限制 try-catch 使用
- **避免滥用**：禁止"写一段代码就包一个 try-catch"的习惯
- **强正当性要求**：每次使用 try-catch 都必须有充分的正当理由
- **优先 Result 模式**：绝大多数情况下使用 Result 模式处理错误
- **边界层使用**：try-catch 主要用于应用边界层和工具函数封装
- **禁止静默处理**：严禁在 catch 块中静默忽略错误

### ✅ Result 模式（推荐）
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 推荐的错误处理方式
const processUser = async (userData: unknown): Promise<Result<User, ValidationError>> => {
  if (!userData || typeof userData !== 'object') {
    return { 
      success: false, 
      error: new ValidationError('Invalid user data format') 
    };
  }
  
  const validationResult = validateUserData(userData);
  if (!validationResult.success) {
    return validationResult;
  }
  
  return { success: true, data: validationResult.data };
};
```

### 📝 try-catch 合理使用场景

#### 1. 工具函数封装
包括安全操作函数和 Result 模式适配器：

```typescript
// ✅ 合理使用：将底层 API 封装为 Result 模式
export const safeJsonParse = <T>(jsonString: string): Result<T, Error> => {
  try {
    const parsed = JSON.parse(jsonString);
    return { success: true, data: parsed };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};

export const safeDbOperation = async <T>(
  operation: () => Promise<T>
): Promise<Result<T, Error>> => {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};

// ✅ 安全的获取操作 - 允许返回 null
export const getUserById = async (id: string): Promise<User | null> => {
  const dbResult = await safeDbOperation(() => db.user.findById(id));
  return dbResult.success ? dbResult.data : null;
};

export const getConfigValue = async (key: string): Promise<string | null> => {
  const configResult = await safeReadFile('config.json');
  if (!configResult.success) {
    return null;
  }
  
  const parseResult = safeJsonParse<Record<string, string>>(configResult.data);
  if (!parseResult.success) {
    return null;
  }
  
  return parseResult.data[key] || null;
};

// ✅ 安全的查询操作
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await safeDbOperation(() => db.user.findByEmail(email));
  return result.success ? result.data : null;
};
```

**安全操作函数特征：**
- 函数名通常以 `get`、`find`、`fetch` 开头
- 返回类型为 `T | null`
- 失败时不会影响主要业务流程
- 调用方可以安全地处理 `null` 值

#### 2. 应用边界层
```typescript
// ✅ 合理使用：应用边界层的统一错误处理
const handleApiRequest = async (req: Request, res: Response) => {
  try {
    const result = await processUserRequest(req.body);
    
    if (!result.success) {
      const statusCode = getErrorStatusCode(result.error);
      res.status(statusCode).json({
        error: result.error.message,
        code: result.error.code
      });
      return;
    }
    
    res.json(result.data);
  } catch (error) {
    // 捕获意外的系统级错误
    console.error('Unexpected system error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

#### 3. 第三方库适配
```typescript
// ✅ 合理使用：适配不支持 Result 模式的第三方库
const adaptThirdPartyApi = async (params: ApiParams): Promise<Result<ApiResponse, Error>> => {
  try {
    // 第三方库可能抛出异常，需要适配
    const response = await thirdPartyLibrary.callApi(params);
    return { success: true, data: response };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};
```

#### 4. 资源清理场景
```typescript
// ✅ 合理使用：确保资源清理
const processFileWithCleanup = async (filePath: string): Promise<Result<ProcessedData, Error>> => {
  let fileHandle: FileHandle | null = null;
  
  try {
    fileHandle = await fs.open(filePath, 'r');
    const result = await processFileHandle(fileHandle);
    return result;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  } finally {
    // 确保资源被清理
    if (fileHandle) {
      await fileHandle.close();
    }
  }
};
```

### ❌ 禁止的 try-catch 使用

#### 1. 业务逻辑中的懒惰包装
```typescript
// ❌ 禁止：懒惰地包装每段代码
const createUser = async (userData: any) => {
  try {
    const user = await userService.create(userData);
    return user;
  } catch (error) {
    console.log('Error creating user:', error);
    return null; // 静默失败，隐藏问题
  }
};
```

#### 2. 静默错误处理
```typescript
// ❌ 禁止：静默忽略错误
const fetchUserData = async (id: string) => {
  try {
    return await api.getUser(id);
  } catch (error) {
    return {}; // 静默返回空对象，隐藏失败
  }
};
```

#### 3. 过度嵌套的错误处理
```typescript
// ❌ 禁止：每个操作都用 try-catch 包装
const complexOperation = async () => {
  try {
    const step1 = await operation1();
    try {
      const step2 = await operation2(step1);
      try {
        return await operation3(step2);
      } catch (error3) {
        console.log('Step 3 failed');
        return null;
      }
    } catch (error2) {
      console.log('Step 2 failed');
      return null;
    }
  } catch (error1) {
    console.log('Step 1 failed');
    return null;
  }
};
```

### 🛡️ 错误处理策略
- **❌ 禁止假装成功**: 执行失败了不能假装成功，要根据业务情况正确处理
- **Result 模式优先**: 核心业务逻辑必须使用 Result 模式
- **早期返回**: 使用早期返回处理错误条件，避免深层嵌套
- **错误传播**: 让错误向上传播到能够处理的边界层
- **类型安全**: 使用具体的错误类型，提供详细的错误信息
- **正当性检查**: try-catch 使用前必须确认有充分的正当理由

### ⚠️ 严格的错误流程控制
**核心原则**: 执行失败了不能假装成功，要根据业务情况正确处理错误。

### 🎯 错误处理模式选择指南

#### 必须使用 Result 模式的场景：
- **核心业务逻辑**：用户创建、数据处理、支付操作等
- **数据验证**：输入验证、业务规则检查
- **关键操作**：数据库写入、API 调用、文件操作

#### 允许使用 T | null 模式的场景：
- **查询操作**：查找用户、获取配置、读取缓存
- **非关键路径**：日志记录、监控数据、统计分析
- **降级处理**：功能可选失败，不影响主要流程

#### 必须使用异常处理的场景：
- **系统边界**：外部 API 调用、第三方库适配
- **资源管理**：文件句柄、数据库连接、网络连接
- **不可恢复错误**：系统级错误、配置错误

#### 文件操作示例
```typescript
// ❌ 禁止的方法 - 滥用 try-catch
try {
  const content = await fs.readFile('config.json', 'utf-8');
  return JSON.parse(content);
} catch (error) {
  console.log('File read failed, using default config');
  return defaultConfig; // 错误：失败后继续执行
}

// ✅ 正确的方法 - Result 模式 + 早期返回
const readConfigFile = async (filePath: string): Promise<Result<Config, FileError>> => {
  // 使用支持 Result 模式的文件读取工具
  const fileResult = await safeReadFile(filePath);
  if (!fileResult.success) {
    return { success: false, error: new FileError('Failed to read config file', filePath) };
  }
  
  const parseResult = safeJsonParse<Config>(fileResult.data);
  if (!parseResult.success) {
    return { success: false, error: new FileError('Invalid JSON in config file', filePath) };
  }
  
  return { success: true, data: parseResult.data };
};

// 调用方必须显式处理错误
const initializeApp = async (): Promise<Result<App, InitError>> => {
  const configResult = await readConfigFile('config.json');
  if (!configResult.success) {
    // 出错时立即返回，绝不继续执行
    return { success: false, error: new InitError('Config loading failed', configResult.error) };
  }
  
  // 只有成功时才继续
  return createApp(configResult.data);
};
```

#### 网络请求示例
```typescript
// ❌ 禁止的方法
try {
  const response = await fetch('/api/users');
  const users = await response.json();
  return users;
} catch (error) {
  return []; // 错误：失败后返回空数组并继续执行
}

// ✅ 正确的方法
const fetchUsers = async (): Promise<Result<User[], NetworkError>> => {
  const response = await safeFetch('/api/users');
  if (!response.success) {
    return { success: false, error: new NetworkError('Failed to fetch users', response.error) };
  }
  
  if (!response.data.ok) {
    return { 
      success: false, 
      error: new NetworkError(`HTTP ${response.data.status}: ${response.data.statusText}`) 
    };
  }
  
  const jsonResult = await safeJsonParse<User[]>(await response.data.text());
  if (!jsonResult.success) {
    return { success: false, error: new NetworkError('Invalid JSON response', jsonResult.error) };
  }
  
  return { success: true, data: jsonResult.data };
};
```

### 🏗️ 自定义错误类型
```typescript
export class ValidationError extends Error {
  constructor(
    message: string, 
    public readonly field: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class FileError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'FileError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```

### 🔧 工具函数示例
```typescript
// 安全的文件读取 - 使用 async/await
export const safeReadFile = async (filePath: string): Promise<Result<string, Error>> => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return { success: true, data };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};

// 安全的 JSON 解析
export const safeJsonParse = <T>(jsonString: string): Result<T, Error> => {
  try {
    const parsed = JSON.parse(jsonString);
    return { success: true, data: parsed };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};

// 安全的数据库操作
export const safeDbOperation = async <T>(
  operation: () => Promise<T>
): Promise<Result<T, Error>> => {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};
```

## 📝 Git 提交规范

### Conventional Commits 格式
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 提交类型
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 仅文档更改
- `style`: 不影响代码含义的更改
- `refactor`: 既不修复错误也不添加功能的代码更改
- `perf`: 提高性能的代码更改
- `test`: 添加缺失测试或更正现有测试
- `build`: 影响构建系统或外部依赖的更改
- `ci`: CI 配置文件和脚本的更改
- `chore`: 其他不修改 src 或 test 文件的更改

### 分支命名规范（使用短杠）
```bash
feat-user-authentication
fix-payment-validation-error
refactor-api-error-handling
docs-readme-installation-guide
chore-dependency-updates
```

### 提交消息示例
```bash
feat(auth): add JWT token validation

Implement token expiration check and refresh mechanism
Add comprehensive test coverage for authentication flow

Closes #123
BREAKING CHANGE: AUTH_SECRET environment variable now required
```

### 提交要求
- **标题行不超过 50 字符**
- **使用祈使语气**（"add" 不是 "added"）
- **首字母小写，末尾不加句号**
- **❌ 必须使用英文编写提交信息**


## 🧪 测试规范

### ✅ 测试原则
- **编写有意义的测试名称**，描述期望行为
- **使用 AAA 模式**：准备数据 → 执行操作 → 验证结果（用换行隔开，无需注释）
- **每次测试一个功能**
- **✅ 优先使用真实对象进行测试**
- **⚠️ 仅在必要时使用 mock**：外部 API、数据库、文件系统等无法使用真实对象的场景
- **确保测试隔离且可独立运行**
- **覆盖边界情况和错误条件**

### 📝 测试文件命名
- 使用 `[filename].test.ts` 格式
- DOM 相关测试使用 `[filename].dom.test.ts`

### 🏗️ 测试结构模板
```typescript
describe('UserService', () => {
  let userService: UserService;
  let testDatabase: TestDatabase;
  
  beforeEach(() => {
    testDatabase = createTestDatabase();
    userService = new UserService(testDatabase);
  });
  
  afterEach(() => {
    testDatabase.cleanup();
  });
  
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };
      
      const result = await userService.createUser(userData);
      
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.email).toBe(userData.email);
    });
    
    it('should return error for invalid email', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        name: 'Test User'
      };
      
      const result = await userService.createUser(invalidUserData);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('invalid email');
    });
  });
});
```

### 🎯 断言最佳实践
- **✅ 使用具体断言**：`toBe()`, `toEqual()`, `toBeInstanceOf()`
- **❌ 避免模糊断言**：`toBeTruthy()`, `toBeFalsy()`
- **异步测试使用** `await expect().resolves/rejects`

## 📦 开发常用命令

### ⚠️ 重要原则
**✅ 允许：读取信息、执行命令**
**❌ 严格禁止：修改系统配置、设置默认值、自动配置**

### 🔧 包管理命令

#### pnpm 命令
```bash
# 基础命令
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器
pnpm build            # 构建项目
pnpm test             # 运行测试
pnpm start            # 启动生产服务器
pnpm preview          # 预览构建结果

# 构建命令
pnpm build:packages   # 构建 packages 目录
pnpm build:examples   # 构建 examples 目录
pnpm build:ssr        # 构建 SSR 应用
pnpm build:dts        # 生成 TypeScript 声明文件
pnpm coverage         # 生成测试覆盖率报告

# 检查命令
pnpm lint:type        # TypeScript 类型检查
pnpm lint:js          # JavaScript/TypeScript 检查
pnpm lint:css         # CSS/Vue 样式检查

# 发布命令
pnpm release          # 发布到 npm

# Monorepo 命令
pnpm --filter "*" [command]              # 对所有包执行
pnpm --filter "./packages/**" [command]  # 对 packages 目录
pnpm --filter "./examples/**" [command]  # 对 examples 目录
pnpm -r [command]                        # 递归执行
```

#### npm 命令
```bash
npm install           # 安装依赖
npm run dev           # 启动开发服务器
npm run build         # 构建项目
npm run test          # 运行测试
```

### 📋 Node 版本查看
```bash
node --version        # 查看当前 Node 版本
node -v               # 简写形式
npm --version         # 查看 npm 版本
pnpm --version        # 查看 pnpm 版本
```

### 🔄 nvm 版本切换
```bash
nvm list              # 查看已安装的 Node 版本
nvm install 22        # 安装 Node 22
nvm install 24        # 安装 Node 24
nvm use 22            # 切换到 Node 22
nvm use 24            # 切换到 Node 24
nvm current           # 查看当前使用的版本
```

## 💬 注释使用策略

### 规范文档中的示例
- **允许使用注释**说明代码意图

### 生产代码
- **优先使用自解释的变量名和函数名**，减少注释依赖

### 测试代码
- **使用 AAA 模式时用换行分隔**，无需注释

### 注释语言
- **所有注释必须使用英文**


