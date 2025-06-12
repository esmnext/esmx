# 测试编写规范

## 测试编写规范
测试编写必须遵循以下标准流程：

### 测试类型
#### 单元测试
- **目标**: 测试单个函数、类或模块
- **命名**: `module-name.test.ts` 或 `router-method.test.ts`
- **框架**: Vite + Vitest
- **覆盖率**: 核心逻辑100%，辅助功能80%+

### 编写流程
1. **技术方案评估**
   - 分析功能复杂度和测试价值
   - 避免过度测试和冗余测试
   - 确定测试优先级和分工

2. **单元测试规划**
   - **Router核心方法**: push、replace、go、back、forward等导航方法
   - **Route对象**: 路由解析、状态管理、参数处理
   - **Matcher系统**: 路径匹配、参数提取、路由解析
   - **Navigation**: 历史记录管理、状态同步
   - **守卫系统**: beforeEach、afterEach、beforeEnter等钩子
   - **工具函数**: 通用方法、数据转换、验证逻辑

3. **编写测试代码**
   - 使用AAA模式（Arrange-Act-Assert）
   - 测试用例独立性
   - 清晰的断言和错误信息

### 测试标准
- **可读性**: 测试名称清晰描述测试内容
- **独立性**: 测试用例之间无依赖关系
- **可维护性**: 使用辅助函数减少重复代码
- **完整性**: 覆盖所有关键路径和边界条件
- **真实性**: 禁止mock对象，必须使用真实对象创建
- **类型安全**: 禁止使用any类型，保证类型安全

### 命名规范
参考现有代码风格：

```typescript
// 主模块描述 - 使用中文 + 测试
describe('Router.back 测试', () => {
  // 分组描述 - 使用emoji + 中文
  describe('🎯 核心行为', () => {
    // 测试用例 - 使用中文描述预期行为
    test('back 应该返回 Promise<Route | null>', async () => {
      // 测试实现
    });
    
    // 复杂场景可使用it
    it('应该正确处理字符串路径', () => {
      // 测试实现
    });
  });
  
  describe('🔄 历史记录导航逻辑', () => {
    test('back 应该基于历史记录后退', async () => {
      // 测试实现
    });
  });
});
```

**命名约定**：
- 主describe：`模块名.方法名 测试`
- 分组describe：`emoji + 功能分组名`
- 测试用例：`方法名 + 应该 + 预期行为`
- 优先使用`test`，复杂场景可用`it`

### Router特有测试模式
- **Mock浏览器环境**: 使用vi.stubGlobal模拟window、location对象
- **路由器生命周期**: 正确的beforeEach和afterEach钩子清理
- **异步导航**: 使用async/await测试导航方法
- **守卫测试**: 模拟各种守卫返回值和重定向场景
- **状态验证**: 验证路由状态、参数、查询字符串等
- **错误处理**: 测试无效路径、导航失败等异常情况

### 编写约束
#### 禁止Mock对象
```typescript
// ❌ 错误 - 禁止使用mock对象
const mockRouter = vi.fn() as any;

// ✅ 正确 - 使用真实对象
const router = new Router({
  routes: [{ path: '/', component: 'Home' }],
  mode: RouterMode.abstract
});
```

#### 禁止Any类型
```typescript
// ❌ 错误 - 禁止使用any
const options = createOptions({} as any);

// ✅ 正确 - 使用具体类型
const options = createOptions({
  base: new URL('http://localhost/'),
  routes: []
});
```

### 测试分工原则
- **路由器核心**: Router类的主要功能和状态管理
- **路由解析**: Route对象的创建、解析和属性计算
- **路径匹配**: Matcher的路径匹配和参数提取逻辑
- **导航控制**: Navigation的历史记录和状态同步
- **守卫钩子**: 各种导航守卫的执行和拦截
- **边界情况**: 异常输入、错误处理、边界条件
- **避免冗余**: 不重复测试Vitest框架本身功能

## 工单报告输出规范

```markdown
已完成 [功能名称] 测试编写，包含 [数量] 个测试用例，覆盖率 [百分比]%。
```

---

*测试是代码质量的保障，必须先于功能代码编写。* 