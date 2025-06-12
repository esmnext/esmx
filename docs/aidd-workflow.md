# AIDD 工作流引擎

## 1. 工作流程图

```mermaid
graph TD
    A["🎯 AI 创建工单<br/>读取 .ai/standards/issue.md"] --> A1["📝 创建工单文件<br/>保存到 .ai/issues/"]
    
    A1 --> B["🤖 AI 需求分析<br/>读取 .ai/standards/requirements.md"]
    
    B --> B1["📝 更新工单进度<br/>需求分析完成"]
    
    B1 --> C["🔍 AI 架构验证<br/>读取 .ai/architecture/ 目录"]
    
    C --> C1["📝 更新工单进度<br/>架构验证完成"]
    
    C1 --> D["🌿 AI 创建开发分支<br/>读取 .ai/standards/branch.md"]
    
    D --> D1["📝 更新工单进度<br/>开发分支创建完成"]
    
    D1 --> E["🧪 AI 编写单元测试<br/>读取 .ai/standards/testing.md"]
    
    E --> E1["📝 更新工单进度<br/>单元测试编写完成"]
    
    E1 --> F["💻 AI 编写代码<br/>读取 .ai/standards/coding.md"]
    
    F --> F1["📝 更新工单进度<br/>代码编写完成"]
    
    F1 --> G["📝 AI 文档编写<br/>读取 .ai/standards/documentation.md"]
    
    G --> G1["📝 更新工单进度<br/>文档编写完成"]
    
    G1 --> H["✅ AI 质量检测<br/>读取 .ai/standards/quality.md"]
    
    H --> H1["📝 更新工单进度<br/>质量检测完成"]
    
    H1 --> I{"🔍 质量达标?"}
    
    %% 主流程 - 垂直对齐
    I -->|✅| K["👨‍💻 人类审查<br/>读取 .ai/standards/review.md"]
    K --> L{"🤔 质量达标？"}
    L -->|✅| K1["📝 更新工单进度<br/>人类审核完成"]
    K1 --> O["📊 AI 输出完整报告<br/>读取 .ai/standards/report.md"]
    O --> P["👨‍💻 人类审查<br/>读取 .ai/standards/review.md"]
    P --> Q{"📋 质量达标?"}
    Q -->|✅ 完整| R["🚀 AI 提交PR<br/>读取 .ai/standards/pull-request.md"]
    
    %% 质量问题处理循环 - 侧边分支
    I -->|❌| J["🔧 AI 处理质量问题<br/>修复检测到的问题"]
    L -->|❌| J
    Q -->|❌| O
    J --> H
    
    R --> R1["📝 更新工单进度<br/>PR提交完成"]
    
    R1 --> S["✨ 任务完成<br/>工单状态更新为已完成"]
    
    %% 样式定义
    classDef aiProcess fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef humanProcess fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef output fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef feedback fill:#fff3e0,stroke:#ff6f00,stroke-width:2px
    
    class A,A1,B,B1,C,C1,D,D1,E,E1,F,F1,G,G1,H,H1,J,K1,O,R,R1 aiProcess
    class K,P humanProcess
    class I,L,Q decision
    class S output
```

## 2. 系统架构图

```mermaid
graph TB
    subgraph "🎯 输入层"
        A1["GitHub Issues"]
        A2["Pull Requests"]
        A3["Bug Reports"]
        A4["Feature Requests"]
    end
    
    subgraph "🤖 AI 核心引擎"
        B1["工单管理引擎<br/>• 工单创建和跟踪<br/>• 进度状态管理<br/>• 报告生成"]
        B2["需求分析引擎<br/>• 解析自然语言<br/>• 提取技术需求<br/>• 生成实现方案"]
        B3["架构验证引擎<br/>• 架构合规性检查<br/>• 设计模式验证<br/>• 性能要求验证"]
        B4["测试生成引擎<br/>• 全面测试用例生成<br/>• 测试场景覆盖"]
        B5["代码生成引擎<br/>• 基于测试实现功能<br/>• 遵循项目规范"]
        B6["文档生成引擎<br/>• 项目文档生成<br/>• 文档内容维护"]
        B7["质量检测引擎<br/>• 多维度质量检查<br/>• 自动问题分类<br/>• 修复建议生成"]
    end
    
    subgraph "📖 项目规范层"
        F1["工单规范<br/>• .ai/standards/issue.md"]
        F2["需求分析规范<br/>• .ai/standards/requirements.md"]
        F3["架构规范<br/>• .ai/architecture/"]
        F4["分支管理规范<br/>• .ai/standards/branch.md"]
        F5["测试标准<br/>• .ai/standards/testing.md"]
        F6["编码标准<br/>• .ai/standards/coding.md"]
        F7["文档标准<br/>• .ai/standards/documentation.md"]
        F8["质量标准<br/>• .ai/standards/quality.md"]
        F9["审查标准<br/>• .ai/standards/review.md"]
        F10["PR规范<br/>• .ai/standards/pull-request.md"]
        F11["报告模板<br/>• .ai/standards/report.md"]
    end
    
    subgraph "🔍 质量保证层"
        C1["代码质量检查"]
        C2["测试质量检查"]
        C3["文档质量检查"]
        C4["架构质量检查"]
    end
    
    subgraph "👨‍💻 人类协作层"
        D1["代码审查"]
        D2["需求确认"]
        D3["最终决策"]
    end
    
    subgraph "📊 监控反馈层"
        E1["开发效率监控"]
        E2["质量监控"]
        E3["流程监控"]
    end
    
    %% 连接关系
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> B6
    B6 --> B7
    
    %% 规范文件指导各个引擎
    F1 --> B1
    F2 --> B2
    F3 --> B3
    F4 --> B1
    F5 --> B4
    F6 --> B5
    F7 --> B6
    F8 --> B7
    F9 --> D1
    F10 --> B1
    F11 --> B1
    
    %% 质量检查
    B4 --> C2
    B5 --> C1
    B6 --> C3
    B3 --> C4
    
    C1 --> D1
    C2 --> D1
    C3 --> D1
    C4 --> D1
    
    D1 --> D2
    D2 --> D3
    
    D3 --> E1
    D3 --> E2
    D3 --> E3
    
    E1 --> B1
    E2 --> B1
    E3 --> B1
    
    %% 样式定义
    classDef input fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef ai fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef specification fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    classDef quality fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef human fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef monitor fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class A1,A2,A3,A4 input
    class B1,B2,B3,B4,B5,B6,B7 ai
    class F1,F2,F3,F4,F5,F6,F7,F8,F9,F10,F11 specification
    class C1,C2,C3,C4 quality
    class D1,D2,D3 human
    class E1,E2,E3 monitor
```

## 3. 规范文件结构

```
项目根目录/
└── .ai/                             # AI 规范文件根目录
    ├── standards/                   # 📋 规范目录
    │   ├── issue.md                 # 工单创建
    │   ├── requirements.md          # 需求分析
    │   ├── branch.md                # 分支管理
    │   ├── testing.md               # 测试编写
    │   ├── coding.md                # 代码编写
    │   ├── documentation.md         # 文档编写
    │   ├── quality.md               # 质量检测
    │   ├── review.md                # 审查检查
    │   ├── pull-request.md          # PR 提交
    │   └── report.md                # 报告格式
    ├── architecture/                # 🏗️ 架构文档目录
    │   ├── system.md                # 系统架构
    │   └── api.md                   # API 设计
    └── issues/                      # 🎯 工单目录
        └── (存放实际工单文件)
```

## 4. 核心特性

### 开发流程
- **测试驱动开发**: 测试→代码→文档的严格顺序
- **工单驱动**: 全程工单跟踪和状态更新
- **规范引导**: 每阶段都有对应规范文件指导

### 质量保证
- **四层质量检查**: 代码、测试、文档、架构
- **智能反馈**: 问题类型精确回退机制
- **人机协作**: 关键节点人类审查决策

### 应急机制
- **紧急处理通道**: 快速响应重要问题
- **持续监控**: 效率、质量、流程三重监控

## 5. 实施规范

### 工单管理
- 命名格式: `YYYY-MM-DD-功能描述`
- 优先级: 紧急/高/中/低
- 状态跟踪: 待处理→进行中→待审查→已完成

### 流程执行
- 每个重要节点完成后备份
- 所有变更保持清晰提交记录
- 确保文档与代码同步更新

### 紧急处理
- 绕过非关键检查加快响应
- 及时通知相关人员
- 后续补充完整测试和文档