<template>
  <div class="app">
    <app-nav current="remote" />
    
    <ui-module-header
      title="Esmx Module Linking Remote"
      description="这是一个 Module Linking 远程模块示例，用于展示可复用的组件。通过 Module Linking，你可以轻松地在不同项目间共享和复用组件，实现真正的模块化开发。"
    />

    <main class="app-main">
      <div class="container">
        <div class="showcase-grid">
          <!-- Remote 核心功能展示 -->
          <ui-showcase-section title="Remote 服务">
            <p class="intro-text">Remote 服务是一个独立的微前端服务，可以：</p>
            <ul class="feature-list">
              <li>
                <span class="bullet">•</span>
                <span>将组件、函数导出给其他应用使用</span>
              </li>
              <li>
                <span class="bullet">•</span>
                <span>支持运行时动态加载，实现代码共享</span>
              </li>
              <li>
                <span class="bullet">•</span>
                <span>确保所有应用使用相同版本的依赖</span>
              </li>
            </ul>
          </ui-showcase-section>

          <!-- 配置说明卡片 -->
          <ui-showcase-section title="配置说明">
            <div class="demo-item">
              <h3>模块导出</h3>
              <pre class="code-block"><code><span class="comment">// entry.node.ts</span>
<span class="keyword">export</span> <span class="keyword">default</span> {
  <span class="property">modules</span>: {
    <span class="property">exports</span>: [
      <span class="comment">// 导出 Vue 实例</span>
      <span class="string">'npm:vue'</span>,
      <span class="comment">// UI 组件</span>
      <span class="string">'root:src/components/index.ts'</span>,
      <span class="comment">// 组合式函数</span>
      <span class="string">'root:src/composables/index.ts'</span>,
      <span class="comment">// 示例组件</span>
      <span class="string">'root:src/examples/index.ts'</span>
    ]
  }
}</code></pre>
              <div class="tips">
                <div class="tip-item">
                  <span class="tip-icon">📦</span>
                  <span>需要支持 ESM 格式</span>
                </div>
                <div class="tip-item">
                  <span class="tip-icon">📝</span>
                  <span>需要 TypeScript 类型定义</span>
                </div>
              </div>
            </div>

            <div class="demo-item">
              <h3>导出类型</h3>
              <div class="export-types">
                <div class="export-type">
                  <code class="highlight">npm:package</code>
                  <p>用于共享核心依赖包（如 Vue），确保所有应用使用相同版本。</p>
                </div>
                <div class="export-type">
                  <code class="highlight">root:path</code>
                  <p>用于共享项目内的组件、函数等可复用模块。</p>
                </div>
              </div>
            </div>

            <div class="demo-item">
              <h3>导出示例</h3>
              <pre class="code-block"><code><span class="comment">// src/components/index.ts</span>
<span class="keyword">export</span> { <span class="property">UiButton</span> } <span class="keyword">from</span> <span class="string">'./ui-button.vue'</span>;
<span class="keyword">export</span> { <span class="property">UiCard</span> } <span class="keyword">from</span> <span class="string">'./ui-card.vue'</span>;

<span class="comment">// src/composables/index.ts</span>
<span class="keyword">export</span> { <span class="property">useTheme</span> } <span class="keyword">from</span> <span class="string">'./use-theme'</span>;</code></pre>
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
    UiModuleHeader,
    UiShowcaseSection
} from './components';
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 960px) {
  .container {
    max-width: 100%;
    padding: 0 1rem;
  }
}

.app-header {
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-8) 0;
}

.header-content {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.header-info {
  max-width: 640px;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-4);
  color: var(--color-text-primary);
}

.header-description {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-4);
}

.version-tags {
  display: flex;
  gap: var(--spacing-2);
}

.version-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.app-main {
  flex: 1;
  padding: var(--spacing-8) 0;
}

.showcase-grid {
  display: grid;
  gap: var(--spacing-6);
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-4) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  color: var(--color-text-secondary);
}

.bullet {
  color: var(--color-primary);
  font-weight: bold;
}

.intro-text {
  color: var(--color-text-secondary);
  margin: 0;
}

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

.code-block {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin: 0;
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
}

.code-block .comment {
  color: var(--color-text-tertiary);
}

.code-block .keyword {
  color: var(--color-primary);
}

.code-block .string {
  color: var(--color-success);
}

.code-block .property {
  color: var(--color-warning);
}

.export-types {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.export-type {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.export-type .highlight {
  margin-bottom: var(--spacing-2);
}

.export-type p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.tips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
  padding: var(--spacing-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

@media (min-width: 768px) {
  .export-types {
    flex-direction: row;
  }

  .export-type {
    flex: 1;
  }
}

.highlight {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
}
</style>