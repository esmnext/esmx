# GitHub PR 五阶段工作流规则

## 🚀 概述

这是一个严格的五阶段 GitHub Pull Request 工作流系统，**每个阶段都有明确的进入和离开条件，绝对禁止跳过任何阶段**。

```text
🎯 需求讨论 → 🌿 分支创建 → 💻 开发实现 → 📝 预提交确认 → ✅ 最终提交
```

---

## 📋 工作流阶段

### 🎯 阶段一：需求讨论 (`STAGE_1_REQUIREMENTS`)

**目标**：分析需求，确定技术方案

**进入条件**：用户开始新功能或 Bug 修复讨论

**AI 行为**：
```text
📋 当前阶段：需求讨论阶段
🎯 当前任务：需求分析和技术方案讨论
🔄 下一步：等待用户确认"需求讨论完成，进入分支创建阶段"

✅ 允许操作：
- codebase_search, read_file, grep_search（分析代码）
- file_search, list_dir, web_search（查找信息）

❌ 严格禁止：
- edit_file, search_replace, delete_file（修改代码）
- run_terminal_cmd（运行命令）

⚠️ 阶段提醒：当前正在进行需求讨论，禁止修改任何代码
```

**离开条件**：用户明确确认"需求讨论完成，进入分支创建阶段"

---

### 🌿 阶段二：分支创建 (`STAGE_2_BRANCH`)

**目标**：创建符合规范的功能分支

**分支命名规范**（使用短杠分割）：
```bash
feat-feature-name         # 新功能开发，如：feat-user-authentication
fix-bug-description       # Bug 修复，如：fix-login-error
docs-doc-name            # 文档更新，如：docs-api-reference
refactor-refactor-scope  # 代码重构，如：refactor-auth-service
perf-optimization-scope  # 性能优化，如：perf-route-loading
test-test-scope          # 测试相关，如：test-unit-tests
```

**AI 行为**：
```text
📋 当前阶段：分支创建阶段
🎯 当前任务：创建符合规范的分支
🔄 下一步：创建分支后确认"分支创建完成，进入开发阶段"

✅ 允许操作：
- run_terminal_cmd（仅限以下 git 操作）
  - git status, git branch
  - git checkout master, git pull origin master（拉取最新代码）
  - git checkout -b {branch-name}

❌ 严格禁止：
- 任何代码修改操作
- 除分支操作外的所有终端命令

⚠️ 阶段提醒：当前正在创建分支，禁止修改代码
```

**离开条件**：分支创建成功且用户确认"分支创建完成，进入开发阶段"

---

### 💻 阶段三：开发实现 (`STAGE_3_DEVELOPMENT`)

**目标**：实现功能代码，确保质量

**AI 行为**：
```text
📋 当前阶段：开发阶段
🎯 当前任务：代码开发和功能实现
🔄 下一步：开发完成后确认"开发完成，进入预提交阶段"

✅ 允许操作：
- edit_file, search_replace（修改代码）
- delete_file（谨慎使用）
- run_terminal_cmd（测试、构建、lint）
- 所有分析工具

❌ 严格禁止的 git 操作：
- git commit, git push, gh pr create

⚠️ 阶段提醒：可以修改代码，但禁止提交
```

**质量检查**：每次重要修改后自动运行
```bash
# 基础检查（每次修改后必须运行）
npm run lint:js && npm run lint:type && npm run test

# 完整检查（提交前运行，根据修改内容选择）
npm run lint:css    # 如果修改了 CSS/Vue 文件
npm run build       # 验证构建是否成功
```

**离开条件**：功能完成、测试通过、用户确认"开发完成，进入预提交阶段"

---

### 📝 阶段四：预提交确认 (`STAGE_4_PRE_COMMIT`)

**目标**：生成并确认提交信息和 PR 描述

**双重确认流程**：

#### 第一步：中文确认
AI 按以下模板生成中文确认信息：

```text
📋 提交信息确认（中文版）

Commit 信息
类型: feat/fix/docs/refactor/perf/test
作用域: 包名/模块名
描述: 简短描述变更内容

PR 信息
标题: 类型(作用域): 简短描述
描述:
- 🎯 变更内容: 具体变更项目
- 🔧 技术细节: 技术实现细节
- ✅ 测试情况: 单元测试通过、集成测试通过、手动测试完成

请确认以上信息是否正确？（回复"是"确认）
```

#### 第二步：英文确认
只有中文确认通过后，AI 按以下模板生成英文确认信息：

```text
📋 提交信息确认（英文版）

Commit Message
{type}({scope}): {description}

{detailed description}

PR Information
Title: {type}({scope}): {description}
Description:
- 🎯 Changes: Specific changes made
- 🔧 Technical Details: Technical implementation details
- ✅ Testing: Unit tests pass, Integration tests pass, Manual testing completed

请确认英文版本是否正确？（回复"确认无误，允许提交"）
```

**离开条件**：双重确认完成，用户明确确认"确认无误，允许提交"

---

### ✅ 阶段五：最终提交 (`STAGE_5_CONFIRMED`)

**目标**：使用英文版本信息执行 git 提交和 PR 创建

**AI 行为**：
```text
📋 当前阶段：最终提交阶段
🎯 当前任务：使用英文版本信息执行git提交和PR创建
🔄 下一步：按顺序执行提交流程

✅ 允许操作：
- run_terminal_cmd（仅限git提交和PR创建操作）

❌ 严格禁止：
- edit_file, search_replace, delete_file（代码修改）

⚠️ 阶段提醒：必须使用阶段四确认的英文版本信息
```

**提交流程**（严格按顺序）：
```bash
git add .
git commit -m "英文版本的commit信息"  
git push origin 分支名
gh pr create --title "英文版本的PR标题" --body "英文版本的PR描述"
```

**注意**：必须使用阶段四英文确认步骤中的英文版本信息进行提交

**完成条件**：代码推送成功，PR 创建成功

---

## 🛡️ 安全防护机制

### 工具调用拦截器
每个工具调用前都会验证当前阶段权限，分支创建时会验证命名格式（短杠连接）：

**注意**：以下为逻辑约束说明，AI 应在每次工具调用前进行相应的检查和验证。

```typescript
// 这是逻辑约束描述，不是可执行代码
const stageRules = {
    'STAGE_1_REQUIREMENTS': {
        allowed: ['codebase_search', 'read_file', 'grep_search', 'file_search', 'list_dir', 'web_search'],
        prohibited: ['edit_file', 'search_replace', 'delete_file', 'run_terminal_cmd']
    },
    'STAGE_2_BRANCH': {
        allowed: ['run_terminal_cmd'], // 仅限 git 分支操作
        prohibited: ['edit_file', 'search_replace', 'delete_file']
    },
    'STAGE_3_DEVELOPMENT': {
        allowed: ['edit_file', 'search_replace', 'delete_file', 'run_terminal_cmd', '所有分析工具'],
        prohibited: [] // git commit/push 在命令级别拦截
    },
    'STAGE_4_PRE_COMMIT': {
        allowed: [], // 仅文本生成，无工具调用
        prohibited: ['所有工具调用']
    },
    'STAGE_5_CONFIRMED': {
        allowed: ['run_terminal_cmd'], // 仅限 git 提交操作
        prohibited: ['edit_file', 'search_replace', 'delete_file']
    }
};

// 分支名验证逻辑（AI 应在创建分支前检查）
function validateBranchName(branchName: string): boolean {
    const validPrefixes = ['feat-', 'fix-', 'docs-', 'refactor-', 'perf-', 'test-'];
    const hasValidPrefix = validPrefixes.some(prefix => branchName.startsWith(prefix));
    const isKebabCase = /^[a-z]+(-[a-z0-9]+)+$/.test(branchName);
    
    if (!hasValidPrefix || !isKebabCase) {
        throw new Error('分支名必须使用有效前缀和短杠分割格式，如：feat-user-authentication');
    }
    return true;
}
```

### 状态管理实现方式
由于 Cursor 环境限制，状态管理通过以下方式实现：

1. **会话级状态**：AI 在对话中追踪当前阶段
2. **用户确认机制**：依赖用户明确的阶段转换确认
3. **工具调用前验证**：AI 在每次工具调用前检查当前阶段权限
4. **强制状态显示**：每次回复都必须显示当前阶段信息

### Git 操作特殊拦截
- **阶段二**：只允许 `git status/branch/checkout/pull` 分支操作，分支名必须使用短杠连接格式（如：feat-feature-name）
- **阶段三**：禁止 `git commit/push` 提交操作  
- **阶段五**：只允许 `git add/commit/push/gh pr create` 提交操作

---

## 🎮 完整使用示例

```text
👤 用户: "我想添加一个新的用户认证功能"

🤖 AI: 
📋 当前阶段：需求讨论阶段 (STAGE_1_REQUIREMENTS)
🎯 当前任务：需求分析和技术方案讨论

我来分析现有的用户认证系统...
[使用 codebase_search, read_file 分析代码]

基于分析，建议实现方案是...

⚠️ 阶段提醒：当前正在进行需求讨论，禁止修改任何代码

---

👤 用户: "需求讨论完成，进入分支创建阶段"

🤖 AI:
✅ 阶段转换确认：STAGE_1_REQUIREMENTS → STAGE_2_BRANCH

📋 当前阶段：分支创建阶段 (STAGE_2_BRANCH)
现在为您创建功能分支...

git checkout master
git pull origin master
git checkout -b feat-user-authentication
✅ 分支创建成功

---

👤 用户: "分支创建完成，进入开发阶段"  

🤖 AI:
✅ 阶段转换确认：STAGE_2_BRANCH → STAGE_3_DEVELOPMENT

📋 当前阶段：开发阶段 (STAGE_3_DEVELOPMENT)
现在开始实现用户认证功能...

[使用 edit_file, search_replace 开发代码]
[运行质量检查：npm run lint:js && npm run lint:type && npm run test]

---

👤 用户: "开发完成，进入预提交阶段"

🤖 AI:
✅ 阶段转换确认：STAGE_3_DEVELOPMENT → STAGE_4_PRE_COMMIT

📋 当前阶段：预提交阶段 (STAGE_4_PRE_COMMIT)

📋 提交信息确认（中文版）

Commit 信息  
类型: feat  
作用域: core  
描述: 添加用户认证功能

PR 信息  
标题: feat(core): 添加用户认证功能  
描述:  
- 🎯 变更内容: 实现JWT认证和用户登录功能
- 🔧 技术细节: 使用bcrypt加密密码，集成passport中间件  
- ✅ 测试情况: 单元测试通过、集成测试通过、手动测试完成

请确认以上信息是否正确？（回复"是"确认）

---

👤 用户: "是"

🤖 AI:
📋 提交信息确认（英文版）

Commit Message
feat(core): add user authentication feature

Implement JWT authentication and user login functionality

PR Information  
Title: feat(core): add user authentication feature  
Description:  
- 🎯 Changes: Implement JWT authentication and user login functionality
- 🔧 Technical Details: Use bcrypt for password encryption, integrate passport middleware  
- ✅ Testing: Unit tests pass, Integration tests pass, Manual testing completed

请确认英文版本是否正确？（回复"确认无误，允许提交"）

---

👤 用户: "确认无误，允许提交"

🤖 AI:
✅ 阶段转换确认：STAGE_4_PRE_COMMIT → STAGE_5_CONFIRMED

📋 当前阶段：最终提交阶段 (STAGE_5_CONFIRMED)
🚀 执行提交流程...

git add .
git commit -m "feat(core): add user authentication feature"
git push origin feat-user-authentication
gh pr create --title "feat(core): add user authentication feature" --body "## 🎯 Changes
- Implement JWT authentication and user login functionality

## 🔧 Technical Details
- Use bcrypt for password encryption, integrate passport middleware

## ✅ Testing
- Unit tests pass, Integration tests pass, Manual testing completed"

🎉 PR 创建成功！工作流完成
```

---

## ⚠️ 绝对禁止事项

1. **跳过阶段**：任何情况下都不能跳过工作流阶段
2. **违规操作**：不能在错误的阶段执行禁止的操作
3. **自动确认**：不能代替用户进行阶段转换确认  
4. **修改状态**：不能在没有用户明确确认的情况下修改阶段状态
5. **合并步骤**：不能将多个阶段的操作合并执行

**违反任何禁止事项将导致工作流立即中断！**

---

## 📚 状态显示要求

AI 必须在每次回复中显示：
```text
📋 当前阶段：{stageName} ({stageCode})
🎯 当前任务：{currentTask}  
✅ 已完成：{completedActions}
🔄 下一步：{nextAction}

⚠️ 阶段提醒：{stageReminder}
```

---

**这是最高优先级规则，任何其他规则都不能违反此工作流！**
