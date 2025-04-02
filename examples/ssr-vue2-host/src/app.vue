<template>
  <div class="app">
    <app-nav current="host" />
    
    <ui-module-header
      title="Esmx Module Link Host"
      description="这是一个基于 Module Link 的宿主应用示例，演示了如何在 SSR 环境下集成和使用远程模块。通过 Module Link 的依赖共享机制，可以确保宿主应用和远程模块使用相同版本的 Vue 实例，有效避免运行时冲突。"
    />

    <main class="app-main">
      <div class="container">
        <div class="showcase-grid">
          <!-- 配置与使用 -->
          <ui-showcase-section title="配置与使用">
            <div class="demo-item">
              <h3>模块配置</h3>
              <pre class="code-block"><code><span class="comment">// entry.node.ts</span>
<span class="keyword">export</span> <span class="keyword">default</span> {
  <span class="property">modules</span>: {
    <span class="comment">// 导入的模块基本配置</span>
    <span class="property">links</span>: {
      <span class="string">'ssr-vue2-remote'</span>: <span class="string">'root:../ssr-vue2-remote/dist'</span>
    },
    <span class="comment">// 外部依赖映射</span>
    <span class="property">imports</span>: {
      <span class="property">vue</span>: <span class="string">'ssr-vue2-remote/npm/vue'</span>
    }
  }
}</code></pre>
            </div>

            <div class="demo-item">
              <h3>导入组件</h3>
              <pre class="code-block"><code><span class="keyword">import</span> { <span class="function">AppNav</span>, <span class="function">UiButton</span>, <span class="function">UiCard</span> } <span class="keyword">from</span> <span class="string">'ssr-vue2-remote/src/components'</span>;</code></pre>
            </div>

            <div class="demo-item">
              <h3>使用组件</h3>
              <pre class="code-block"><code><span class="tag">&lt;<span class="name">template</span>&gt;</span>
  <span class="tag">&lt;<span class="name">div</span> <span class="attr">class</span>=<span class="string">"demo"</span>&gt;</span>
    <span class="tag">&lt;<span class="name">ui-button</span> <span class="attr">type</span>=<span class="string">"primary"</span>&gt;</span>主要按钮<span class="tag">&lt;/<span class="name">ui-button</span>&gt;</span>
    <span class="tag">&lt;<span class="name">ui-button</span> <span class="attr">type</span>=<span class="string">"secondary"</span>&gt;</span>次要按钮<span class="tag">&lt;/<span class="name">ui-button</span>&gt;</span>
    
    <span class="tag">&lt;<span class="name">ui-card</span>&gt;</span>
      <span class="tag">&lt;<span class="name">template</span> <span class="attr">#header</span>&gt;</span>
        <span class="tag">&lt;<span class="name">h4</span>&gt;</span>卡片标题<span class="tag">&lt;/<span class="name">h4</span>&gt;</span>
      <span class="tag">&lt;/<span class="name">template</span>&gt;</span>
      <span class="tag">&lt;<span class="name">p</span>&gt;</span>卡片内容<span class="tag">&lt;/<span class="name">p</span>&gt;</span>
    <span class="tag">&lt;/<span class="name">ui-card</span>&gt;</span>
  <span class="tag">&lt;/<span class="name">div</span>&gt;</span>
<span class="tag">&lt;/<span class="name">template</span>&gt;</span>

<span class="tag">&lt;<span class="name">script</span> <span class="attr">setup</span>&gt;</span>
<span class="keyword">import</span> { <span class="function">UiButton</span>, <span class="function">UiCard</span> } <span class="keyword">from</span> <span class="string">'ssr-vue2-remote/src/components'</span>;
<span class="tag">&lt;/<span class="name">script</span>&gt;</span></code></pre>
            </div>
          </ui-showcase-section>

          <!-- 按钮组件 -->
          <ui-showcase-section title="组件展示">
            <div class="demo-item">
              <h3>按钮类型</h3>
              <div class="demo-row">
                <ui-button type="primary">主要按钮</ui-button>
                <ui-button type="secondary">次要按钮</ui-button>
                <ui-button type="text">文本按钮</ui-button>
              </div>
            </div>

            <div class="demo-item">
              <h3>按钮状态</h3>
              <div class="demo-row">
                <ui-button type="primary" loading>加载中</ui-button>
                <ui-button type="primary" disabled>禁用状态</ui-button>
              </div>
            </div>

            <div class="demo-item">
              <h3>按钮尺寸</h3>
              <div class="demo-row">
                <ui-button type="primary" size="large">大按钮</ui-button>
                <ui-button type="primary">默认尺寸</ui-button>
                <ui-button type="primary" size="small">小按钮</ui-button>
              </div>
            </div>
          </ui-showcase-section>

          <!-- 布局组件 -->
          <ui-showcase-section title="布局组件">
            <div class="demo-item">
              <h3>基础卡片</h3>
              <div class="demo-row">
                <ui-card>
                  <p>这是一个基础卡片的内容</p>
                </ui-card>
              </div>
            </div>
          </ui-showcase-section>
        </div>
      </div>
    </main>

    <app-footer />
  </div>
</template>

<script setup lang="ts">
import {
    AppFooter,
    AppNav,
    UiButton,
    UiCard,
    UiModuleHeader,
    UiShowcaseSection
} from 'ssr-vue2-remote/src/components';
</script>

<style>
:root {
  /* 主题色 */
  --color-primary: #FFA000;
  --color-primary-light: #FFB74D;
  --color-primary-dark: #FF8F00;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* 文字颜色 */
  --color-text-primary: #2C3E50;
  --color-text-secondary: #34495E;
  --color-text-tertiary: #6b7280;
  
  /* 背景色 */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #FFF5E6;
  --color-bg-tertiary: #FFF8E1;
  
  /* 边框颜色 */
  --color-border: #FFE0B2;
  --color-border-light: #FFF3E0;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* 圆角 */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  
  /* 间距 */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  
  /* 字体 */
  --font-sans: ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, 'Fira Code', monospace;
  
  /* 布局 */
  --header-height: 4rem;
  --nav-height: 3.5rem;
  --container-width: 64rem;
}

/* 基础布局 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-tertiary, #f3f4f6);
}

.container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 头部样式 */
.app-header {
  background-color: var(--color-bg-primary, #fff);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  padding: var(--spacing-8, 2rem) 0;
}

.header-content {
  background: var(--color-bg-primary, #fff);
  border-radius: var(--radius-lg, 0.5rem);
  padding: var(--spacing-6, 1.5rem);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  transition: box-shadow 0.2s ease-in-out;
}

.header-content:hover {
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.header-info {
  max-width: 36rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
  margin: 0;
  line-height: 1.4;
}

.header-description {
  color: var(--color-text-secondary, #4b5563);
  margin: var(--spacing-4, 1rem) 0;
  font-size: 1.125rem;
  line-height: 1.75;
}

.version-tags {
  display: flex;
  gap: var(--spacing-3, 0.75rem);
  margin-top: var(--spacing-4, 1rem);
}

.version-tag {
  display: inline-block;
  padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
  background-color: var(--color-bg-secondary, #f3f4f6);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.875rem;
  color: var(--color-text-secondary, #4b5563);
  font-family: var(--font-mono, ui-monospace);
}

/* 主要内容区域 */
.app-main {
  flex: 1;
  padding: var(--spacing-8, 2rem) 0;
}

.showcase-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6, 1.5rem);
}

.showcase-section {
  background: var(--color-bg-primary, #fff);
  border-radius: var(--radius-lg, 0.5rem);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  transition: box-shadow 0.2s ease-in-out;
}

.showcase-section:hover {
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
  margin: 0;
  padding: var(--spacing-4, 1rem) var(--spacing-6, 1.5rem);
  line-height: 1.5;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-lg, 0.5rem) var(--radius-lg, 0.5rem) 0 0;
  min-height: 64px;
  display: flex;
  align-items: center;
}

.section-content {
  padding: var(--spacing-6, 1.5rem);
}

/* 演示项目样式 */
.demo-item {
  margin-bottom: var(--spacing-6);
}

.demo-item:last-child {
  margin-bottom: 0;
}

.demo-item h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-3);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3, 0.75rem);
  align-items: center;
}

/* 代码块样式 */
.code-block {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
}

.code-block code {
  font-family: inherit;
}

.code-block .comment {
  color: var(--color-text-tertiary);
}

.code-block .keyword {
  color: #f08d49;  /* import/export 等关键字颜色 */
}

.code-block .string {
  color: #42b983;  /* Vue 默认的绿色 */
}

.code-block .property {
  color: var(--color-warning);
}

.code-block .function {
  color: #e06c75;  /* 函数/组件名称颜色 */
}

.code-block .tag {
  color: #2973b7;  /* Vue 模板标签颜色 */
}

.code-block .name {
  color: #2973b7;  /* 标签名称颜色 */
}

.code-block .attr {
  color: #73a7d9;  /* 属性名称颜色 */
}

/* 响应式布局 */
@media (max-width: 960px) {
  .container {
    max-width: 100%;
    padding: 0 1rem;
  }
}

@media (max-width: 640px) {
  .app-header {
    padding: var(--spacing-6, 1.5rem) 0;
  }

  .header-content {
    padding: var(--spacing-4, 1rem);
  }

  h1 {
    font-size: 1.5rem;
  }

  .header-description {
    font-size: 1rem;
    margin: var(--spacing-3, 0.75rem) 0;
  }

  .showcase-section {
    border-radius: var(--radius-md, 0.375rem);
  }

  .section-title {
    padding: var(--spacing-4, 1rem);
  }

  .section-content {
    padding: var(--spacing-4, 1rem);
  }

  .demo-row {
    flex-direction: column;
    align-items: stretch;
  }

  :deep(.button) {
    width: 100%;
    justify-content: center;
  }

  .code-block {
    font-size: 0.75rem;
    padding: var(--spacing-3, 0.75rem);
  }
}

/* 组件样式覆盖 */
:deep(.button) {
  height: 2.25rem;
  padding: 0 1rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

:deep(.button--primary) {
  background: var(--color-primary, #FFA000);
  border: 1px solid var(--color-primary, #FFA000);
  color: white;
}

:deep(.button--primary:hover) {
  background: var(--color-primary-dark, #FF8F00);
  border-color: var(--color-primary-dark, #FF8F00);
}

:deep(.button--secondary) {
  background: var(--color-bg-secondary, #f2f3f5);
  border: 1px solid var(--color-border, #e5e6eb);
  color: var(--color-text-primary, #4e5969);
}

:deep(.button--secondary:hover) {
  background: var(--color-bg-hover, #e5e6eb);
}

:deep(.button--text) {
  background: transparent;
  border: none;
  color: var(--color-primary, #FFA000);
  padding: 0;
}

:deep(.button--text:hover) {
  color: var(--color-primary-dark, #FF8F00);
}

:deep(.button[disabled]) {
  background: var(--color-bg-disabled, #f2f3f5);
  border-color: var(--color-border, #e5e6eb);
  color: var(--color-text-disabled, #c9cdd4);
  cursor: not-allowed;
}

:deep(.button.is-loading) {
  position: relative;
  pointer-events: none;
}

:deep(.button.is-loading .button__loading) {
  margin-right: 0.5rem;
}

:deep(.button--large) {
  height: 2.5rem;
  padding: 0 1.25rem;
  font-size: 1rem;
}

:deep(.button--small) {
  height: 2rem;
  padding: 0 0.75rem;
  font-size: 0.813rem;
}

:deep(.card) {
  background: var(--color-bg-primary, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 0.5rem);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  transition: box-shadow 0.2s ease-in-out;
}

:deep(.card:hover) {
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

:deep(.card__header) {
  padding: var(--spacing-4, 1rem) var(--spacing-6, 1.5rem);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-lg, 0.5rem) var(--radius-lg, 0.5rem) 0 0;
}

:deep(.card__header h4) {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
  margin: 0;
  line-height: 1.5;
}

:deep(.card__content) {
  padding: var(--spacing-6, 1.5rem);
  color: var(--color-text-secondary, #4b5563);
  line-height: 1.6;
}

.demo-content {
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: var(--color-bg-content);
}

.card-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>