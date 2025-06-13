 # Router 功能 AIDD 工作流程

## 🎯 功能范围限定

### 开发范围
本 AIDD 工作流程专门负责 **Router 路由功能** 的开发，限定范围如下：

#### 源码目录
```
packages/router/
├── src/                    # 核心源码目录
│   ├── router.ts          # Router 主类
│   ├── router-*.test.ts   # Router 相关测试
│   ├── route.ts           # Route 类
│   ├── route.test.ts      # Route 测试
│   ├── navigation.ts      # Navigation 类
│   ├── navigation.test.ts # Navigation 测试
│   ├── micro-app.ts       # MicroApp 类
│   ├── micro-app.test.ts  # MicroApp 测试
│   ├── matcher.ts         # 路由匹配器
│   ├── matcher.test.ts    # 匹配器测试
│   ├── options.ts         # 选项解析
│   ├── options.test.ts    # 选项测试
│   ├── route-task.ts      # 路由任务系统
│   ├── route-task.test.ts # 任务系统测试
│   ├── util.ts            # 工具函数
│   ├── util.test.ts       # 工具函数测试
│   ├── types.ts           # 类型定义
│   └── index.ts           # 导出入口
├── docs/                  # 文档目录
├── package.json           # 包配置
├── README.md              # 英文文档（待创建）
├── README_CN.md           # 中文文档（待创建）
├── biome.json             # 代码格式化配置
├── build.config.ts        # 构建配置
└── tsconfig.json          # TypeScript 配置
```

#### 文档目录
```
examples/docs/src/
├── en/router/             # 英文文档目录
│   ├── getting-started.md # 快速开始
│   ├── basic-usage.md     # 基础用法
│   ├── advanced.md        # 高级特性
│   ├── api/              # API 参考文档
│   │   ├── router.md     # Router 类文档
│   │   ├── route.md      # Route 类文档
│   │   └── navigation.md # Navigation 类文档
│   ├── guides/           # 使用指南
│   │   ├── routing.md    # 路由配置
│   │   ├── guards.md     # 路由守卫
│   │   └── history.md    # 历史记录
│   └── examples/         # 示例代码
│       ├── basic.md      # 基础示例
│       └── advanced.md   # 高级示例
└── zh/router/            # 中文文档目录（结构与英文一致）
    ├── getting-started.md
    ├── basic-usage.md
    ├── advanced.md
    ├── api/
    ├── guides/
    └── examples/
```

#### AI 规范目录
```
docs/router/               # 当前目录 - AIDD 规范
├── README.md             # 本文件 - AI 必读
├── standards/            # 开发规范目录
│   ├── issue.md         # 工单创建规范
│   ├── requirements-analysis.md # 需求分析规范
│   ├── branch.md        # 分支管理规范
│   ├── testing.md       # 测试编写规范
│   ├── coding.md        # 代码编写规范
│   ├── documentation.md # 文档编写规范
│   ├── quality.md       # 质量检测规范
│   ├── report.md        # 完整报告规范
│   └── pull-request.md  # PR 提交规范
├── architecture/         # 架构文档目录
│   ├── system.md        # 系统架构设计
│   └── api.md           # API 设计规范
└── issues/              # 工单存储目录（运行时创建）
    └── (工单文件)
```

## 🤝 跨域协作
如果开发涉及其他功能模块，AI 应该：
1. **识别跨域需求**：分析功能实现是否需要修改其他模块
2. **提出协作方案**：明确需要修改的模块、接口和依赖关系
3. **等待人类确认**：不得直接修改其他模块，必须等待人类审核和确认
4. **协作执行**：确认后在对应模块的 AIDD 规范中创建协作工单

## 📋 AI 开发指南

### 工作流程
1. **创建工单** - 使用 `standards/issue.md` 规范
2. **需求分析** - 使用 `standards/requirements-analysis.md` 规范
3. **架构验证** - 参考 `architecture/` 目录文档
4. **创建分支** - 使用 `standards/branch.md` 规范
5. **编写测试** - 使用 `standards/testing.md` 规范
6. **编写代码** - 使用 `standards/coding.md` 规范
7. **编写文档** - 使用 `standards/documentation.md` 规范
8. **质量检测** - 使用 `standards/quality.md` 规范
9. **完整报告** - 使用 `standards/report.md` 规范
10. **提交PR** - 使用 `standards/pull-request.md` 规范

### 开发要求
- 详细质量标准请参考 `standards/quality.md`
- 详细开发工具配置请参考各规范文件

## 🔧 快速开始

### 环境准备
```bash
# 安装依赖
pnpm install

# 进入 router 包目录
cd packages/router
```

### 创建工单
参考 `standards/issue.md` 规范创建工单文件

## 📞 联系信息

- **项目仓库**：[esmx](https://github.com/your-org/esmx)
- **文档地址**：[Router 文档](https://your-docs-site.com/router)
- **问题反馈**：[GitHub Issues](https://github.com/your-org/esmx/issues)

---

*本文件是 AI 开发 Router 功能的必读指南，请在开始任何开发工作前仔细阅读。*