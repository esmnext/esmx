# 代码编写规范

## 基本要求
- 遵循项目现有代码风格
- 保持代码简洁清晰
- 详细工具配置和质量标准请参考 `quality.md`

## 代码结构规范

### 导入顺序
```typescript
// 1. Node.js 内置模块类型导入
import type { IncomingMessage, ServerResponse } from 'node:http';

// 2. 第三方库类型导入
import type { MatchFunction } from 'path-to-regexp';

// 3. 本地模块导入（按类型分组）
import { CONSTANTS } from './constants';
import { UtilityClass } from './utility-class';
import {
    type LocalType,
    LocalEnum,
    utilityFunction
} from './local-module';
import type {
    InterfaceA,
    InterfaceB
} from './types';
import {
    helperFunctionA,
    helperFunctionB
} from './utils';
```

### 类定义结构
```typescript
export class ExampleClass {
    // 1. 公共只读属性
    public readonly options: OptionsType;
    public readonly config: ConfigType;
    public readonly isEnabled: boolean;
    
    // 2. 私有属性
    private _internalState: StateType | null = null;
    private _counter = 0;
    
    // 3. 私有只读属性（复杂对象）
    private readonly _handlers = {
        beforeAction: [] as HandlerType[],
        afterAction: [] as HandlerType[]
    };
    
    // 4. getter 属性
    public get currentState() {
        return this._internalState;
    }
    
    // 5. 构造函数
    public constructor(options: OptionsType) {
        this.options = options;
        this.config = parseOptions(options);
        this.isEnabled = Boolean(options.feature?.enable);
    }
    
    // 6. 公共方法
    public async execute(input: InputType): Promise<ResultType> {
        return this._internalExecute(ActionType.execute, input);
    }
    
    // 7. 私有方法
    private async _internalExecute(
        actionType: ActionType,
        input: InputType
    ): Promise<ResultType> {
        // 实现逻辑
    }
}
```

## 命名规范

### 基础约定
- **类名**：PascalCase - `ConfigManager`, `DataProcessor`
- **接口名**：PascalCase - `UserOptions`, `ProcessorConfig`
- **类型别名**：PascalCase - `CallbackFunction`, `HandlerType`
- **枚举名**：PascalCase - `ProcessStatus`, `ActionType`
- **枚举值**：camelCase - `pending`, `inProgress`, `completed`
- **变量名**：camelCase - `inputData`, `configOptions`
- **常量名**：UPPER_SNAKE_CASE - `DEFAULT_TIMEOUT`, `MAX_RETRIES`
- **私有属性/方法**：_camelCase - `_state`, `_counter`, `_processData`
- **文件名**：kebab-case.ts - `config-manager.ts`, `data-processor.ts`

### 语义化命名
```typescript
// 方向性命名
interface ProcessOptions {
    fromSource?: SourceType;      // from + 来源
    toTarget?: TargetType;        // to + 目标
    withConfig?: ConfigType;      // with + 配置
}

// 钩子函数命名：动作 + 时机
type BeforeProcessHook = (data: Data, context: Context) => Promise<boolean>;
type AfterProcessHook = (result: Result, context: Context) => void;
type OnErrorHook = (error: Error, context: Context) => void;
```

## 类型定义规范

### 接口定义
```typescript
// 基础配置接口
export interface BaseOptions {
    id?: string;
    timeout?: number;
    context?: Record<string | symbol, any>;
    /** 详细说明可选参数的使用场景 */
    enableFeature?: boolean;
}

// 继承接口
export interface ParsedOptions extends Readonly<Required<BaseOptions>> {
    readonly parsedConfig: ParsedConfigType;
    readonly processor: ProcessorType;
}
```

### 类型别名
```typescript
// 联合类型
export type InputData = string | object | Buffer;
export type ConfigSource = ConfigObject | ConfigCallback;

// 函数类型
export type ProcessorFunction = (input: InputType, context: ContextType) => Promise<OutputType>;

// 结果类型
export type ProcessResult<T> =
    | { success: true; data: T }
    | { success: false; error: Error };

// 工具类型
export type Awaitable<T> = T | Promise<T>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

### 枚举定义
```typescript
// 字符串枚举（便于调试和序列化）
export enum ProcessStatus {
    idle = 'idle',
    processing = 'processing',
    completed = 'completed',
    failed = 'failed'
}

export enum ActionType {
    create = 'create',
    update = 'update',
    delete = 'delete',
    query = 'query'
}
```

## 错误处理规范

### 异常抛出
```typescript
// 状态验证错误
throw new Error(
    `Invalid operation: cannot perform ${operation} in ${currentStatus} state (expected: ${expectedStatus})`
);

// 参数验证错误
throw new Error(
    `Invalid parameter: ${paramName} must be ${expectedType}, received ${actualType}`
);

// 资源错误
throw new Error(
    `Resource not found: ${resourceType} with id '${resourceId}' does not exist`
);
```

### 边界条件处理
```typescript
// 空值检查
if (!data?.length) return defaultValue;

// 类型检查
if (typeof callback !== 'function') {
    this._callback = null;
    return;
}

// 状态检查
if (this.status !== ExpectedStatus.ready) {
    throw new Error(`Cannot execute: current status is ${this.status}`);
}
```

## 异步操作规范

### Promise 使用
```typescript
public async processData(input: InputType): Promise<OutputType> {
    return this._internalProcess(input);
}

public async waitForCompletion(): Promise<ResultType | null> {
    const result = await this._checkStatus();
    if (result === null) {
        this._handleTimeout?.();
        return null;
    }
    return this._finalizeResult(result);
}
```

### 并发处理
```typescript
// 并行执行
await Promise.all(
    items.map(async (item) => {
        try {
            return await processItem(item);
        } catch (error) {
            throw new Error(`Failed to process item ${item.id}: ${error.message}`);
        }
    })
);

// 串行执行
for (const processor of this._processors) {
    const result = await processor.execute(data);
    if (!result.success) {
        return result;
    }
    data = result.data;
}
```

## 注释规范

### JSDoc 注释
```typescript
/**
 * 处理器配置接口
 * @template T 输入数据类型
 * @template R 输出结果类型
 */
export interface ProcessorConfig<T, R> {
    /**
     * 处理函数
     * @param input 待处理的数据
     * @param context 处理上下文
     * @returns 处理结果的 Promise
     * @throws {ValidationError} 当输入数据无效时
     */
    process(input: T, context: ProcessContext): Promise<R>;
}
```

### 行内注释
```typescript
// 初始化内部计数器
private _counter = 0;

// 查找需要处理的项目（满足条件且未处理的）
const pendingItems = allItems.filter(
    item => item.status === 'pending' && !item.processed
);

// 有变化时执行更新，无变化时跳过
if (hasChanges(newData, currentData)) {
    await this.updateData(newData);
} else {
    this.skipUpdate();
}
```

## 性能优化规范

### 对象创建优化
```typescript
// 使用 readonly 标记不可变数据
public readonly config: Readonly<ConfigType>;

// 使用对象缓存避免重复创建
private readonly _processorCache = new Map<string, ProcessorType>();

// 延迟初始化昂贵资源
private _expensiveResource?: ExpensiveResourceType;
get expensiveResource(): ExpensiveResourceType {
    if (!this._expensiveResource) {
        this._expensiveResource = createExpensiveResource();
    }
    return this._expensiveResource;
}
```

### 循环和条件优化
```typescript
// 使用 for...of 遍历
for (const handler of this._handlers) {
    const result = await handler.execute(data);
    if (shouldStop(result)) break;
}

// 早期返回减少嵌套
if (!isValid(input)) return null;
if (!hasPermission(user)) return null;

// 使用可选链和空值合并
const result = config?.advanced?.feature?.enabled ?? false;
const timeout = options.timeout ?? DEFAULT_TIMEOUT;
```

## 测试规范
详细测试编写规范请参考 `testing.md`

## 版本兼容性规范

### 向后兼容
```typescript
// 保持接口的可选属性，避免破坏性变更
export interface ProcessorOptions {
    timeout?: number;           // 保持可选
    /** 新增功能，默认禁用以保持兼容 */
    enableNewFeature?: boolean; // 新增可选属性
}

// 使用联合类型支持多种输入
export type InputSource = ConfigObject | string;
export type ProcessorType =
    | Record<string, ProcessorCallback | undefined>
    | ProcessorCallback;

// 重新导出类型，保持向后兼容
export type { CoreClass };
```

## 代码质量检查清单
- [ ] TypeScript 类型检查通过，无 any 类型滥用
- [ ] Biome 代码格式化通过，代码风格一致
- [ ] 所有公共 API 都有 JSDoc 注释
- [ ] 错误处理覆盖异常场景，错误信息清晰
- [ ] 异步操作正确处理并发和错误情况
- [ ] 测试覆盖率达到项目要求（详见 `testing.md` 和 `quality.md`）
- [ ] 性能关键路径已优化
- [ ] 向后兼容性已验证

## 工单报告输出规范

```markdown
已完成 [功能名称] 代码编写，符合项目编码规范和质量标准。
```

---

*代码编写是功能实现的核心环节，必须确保代码质量和可维护性。*