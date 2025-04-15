<template>
  <div class="remote-doc">
    <!-- 介绍部分 -->
    <section class="doc-section intro-section">
      <h2 class="section-title">Remote 服务</h2>
      <div class="section-content">
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
      </div>
    </section>

    <!-- 配置部分 -->
    <section class="doc-section config-section">
      <h2 class="section-title">配置说明</h2>
      <div class="section-content">
        <!-- 导出方式 -->
        <div class="subsection">
          <h3 class="subsection-title">模块导出</h3>
          <p class="subsection-desc">Remote 服务提供两种导出方式：</p>
          
          <div class="export-methods">
            <!-- 第三方依赖导出 -->
            <div class="export-method">
              <div class="method-header">
                <code class="highlight">npm:package</code>
                <span class="method-name">导出第三方依赖</span>
              </div>
              <div class="method-content">
                <p>用于共享核心依赖包（如 Vue），确保所有应用使用相同版本。</p>
                <div class="code-block-wrapper">
                  <div class="code-header" style="background: #2d2d2d; padding: 0.5rem 1rem; border-top-left-radius: 8px; border-top-right-radius: 8px; border-bottom: 1px solid #3d3d3d;">
                    <span class="filename" style="color: #888; font-family: monospace; font-size: 0.875rem;">entry.node.ts</span>
                  </div>
                  <div class="code-block" style="background: #1e1e1e; padding: 1rem; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; font-family: monospace; line-height: 1.5;">
                    <div style="color: #abb2bf;">
                      <span style="color: #c678dd;">export</span> <span style="color: #c678dd;">default</span> {<br>
                      &nbsp;&nbsp;modules: {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;exports: [<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #5c6370;">// 导出 Vue 实例</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #98c379;">'npm:vue'</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;]<br>
                      &nbsp;&nbsp;}<br>
                      }
                    </div>
                  </div>
                </div>
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
            </div>

            <!-- 本地模块导出 -->
            <div class="export-method">
              <div class="method-header">
                <code class="highlight">root:path</code>
                <span class="method-name">导出本地模块</span>
              </div>
              <div class="method-content">
                <p>用于共享项目内的组件、函数等可复用模块。</p>
                <div class="code-block-wrapper">
                  <div class="code-header" style="background: #2d2d2d; padding: 0.5rem 1rem; border-top-left-radius: 8px; border-top-right-radius: 8px; border-bottom: 1px solid #3d3d3d;">
                    <span class="filename" style="color: #888; font-family: monospace; font-size: 0.875rem;">entry.node.ts</span>
                  </div>
                  <div class="code-block" style="background: #1e1e1e; padding: 1rem; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; font-family: monospace; line-height: 1.5;">
                    <div style="color: #abb2bf;">
                      <span style="color: #c678dd;">export</span> <span style="color: #c678dd;">default</span> {<br>
                      &nbsp;&nbsp;modules: {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;exports: [<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #5c6370;">// UI 组件</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #98c379;">'root:src/components/index.ts'</span>,<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #5c6370;">// 组合式函数</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #98c379;">'root:src/composables/index.ts'</span>,<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #5c6370;">// 示例组件</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #98c379;">'root:src/examples/index.ts'</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;]<br>
                      &nbsp;&nbsp;}<br>
                      }
                    </div>
                  </div>
                </div>
                <div class="tips">
                  <div class="tip-item">
                    <span class="tip-icon">📁</span>
                    <span>建议使用 index.ts 统一导出</span>
                  </div>
                  <div class="tip-item">
                    <span class="tip-icon">🔍</span>
                    <span>路径基于项目根目录</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.remote-doc {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.doc-section {
  margin-bottom: 3rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.section-title {
  margin: 0;
  padding: 1rem 1.5rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-dark, #2C3E50);
  background-color: #f8fafc;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.section-content {
  padding: 1.5rem;
  color: var(--text-light, #34495E);
}

.intro-text {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  color: var(--text-light, #34495E);
}

.feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-list li {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: var(--background-light, #FFFFFF);
  border: 1px solid var(--border-color, #FFE0B2);
  border-radius: var(--border-radius, 8px);
  transition: all var(--transition-fast, 0.2s) ease;
}

.feature-list li:hover {
  box-shadow: 0 4px 12px var(--shadow-color, rgba(255, 152, 0, 0.1));
}

.bullet {
  color: var(--primary-color, #FFC107);
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.feature-list span {
  color: var(--text-light, #34495E);
  line-height: 1.6;
}

.subsection {
  margin-bottom: 2rem;
}

.subsection:last-child {
  margin-bottom: 0;
}

.subsection-title {
  margin: 2rem 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark, #2C3E50);
}

.subsection-desc {
  margin: 0 0 1.5rem;
  color: var(--text-light, #34495E);
}

.export-methods {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.export-method {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--background-light, #FFFFFF);
  border: 1px solid var(--border-color, #FFE0B2);
  border-radius: var(--border-radius, 8px);
  transition: all var(--transition-fast, 0.2s) ease;
}

.export-method:hover {
  box-shadow: 0 4px 12px var(--shadow-color, rgba(255, 152, 0, 0.1));
}

.method-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.method-header code {
  padding: 0.25rem 0.5rem;
  background: var(--background-dark, #FFF5E6);
  color: var(--primary-dark, #FFA000);
  border-radius: 4px;
  font-size: 0.875rem;
}

.method-header .method-name {
  font-weight: 600;
  color: var(--text-dark, #2C3E50);
}

.method-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.method-content p {
  color: var(--text-light, #34495E);
  margin-bottom: 1rem;
}

.code-block-wrapper {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.code-header {
  padding: 0.75rem 1rem;
  background-color: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.filename {
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  color: #9da5b4;
}

.code-block {
  margin: 0;
  padding: 1rem;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-x: auto;
}

.code-block code {
  display: block;
  white-space: pre;
}

.code-block .comment { color: #6a9955; }
.code-block .string { color: #ce9178; }

.tips {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--background-dark, #FFF5E6);
  border: 1px solid var(--border-color, #FFE0B2);
  border-radius: var(--border-radius, 8px);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 1.25rem;
}

.tip-item span {
  color: var(--text-light, #34495E);
  font-size: 0.875rem;
}
</style>
