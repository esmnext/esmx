# 分支创建规范

## 分支创建规范
分支创建必须遵循以下标准流程：

### 命名规则
#### 功能分支
```
feature-功能描述
```
- 示例：`feature-user-login`、`feature-payment-system`

#### 修复分支
```
fix-问题描述
```
- 示例：`fix-login-bug`、`fix-memory-leak`

#### 热修复分支
```
hotfix-紧急问题描述
```
- 示例：`hotfix-security-patch`、`hotfix-critical-bug`

### 创建流程
1. **确定分支类型和名称**
   - 根据工单内容确定分支类型
   - 使用简洁明确的描述命名

2. **从主分支创建**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b [分支名称]
   ```

3. **推送到远程仓库**
   ```bash
   git push -u origin [分支名称]
   ```

### 命名约定
- 使用小写字母和连字符
- 描述要简洁明确，不超过50个字符
- 避免使用特殊字符和空格
- 与工单描述保持一致

## 工单报告输出规范

```markdown
已成功创建分支 [分支名称] 并推送到远程仓库。
```

---

*分支管理是代码版本控制的基础，必须严格遵循规范。* 