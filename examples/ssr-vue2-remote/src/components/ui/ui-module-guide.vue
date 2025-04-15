<template>
  <div class="ui-module-guide">
    <h2>模块导出配置</h2>
    <div class="guide-content">
      <div class="code-block">
        <div class="code-text">
          <span class="keyword">export</span> <span class="keyword">default</span> {<br>
          &nbsp;&nbsp;modules: {<br>
          &nbsp;&nbsp;&nbsp;&nbsp;exports: [<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="comment">// Vue 实例</span><br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">'npm:vue'</span><br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="comment">// UI 组件</span><br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">'root:src/components/index.ts'</span>,<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="comment">// 组合式函数</span><br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="string">'root:src/composables/index.ts'</span><br>
          &nbsp;&nbsp;&nbsp;&nbsp;]<br>
          &nbsp;&nbsp;}<br>
          }
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ModuleGuideProps {
    // 目前没有 props，但为了保持一致的类型定义模式，我们仍然定义一个空接口
}

defineProps<ModuleGuideProps>();
</script>

<style scoped>
.ui-module-guide {
  width: 100%;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
}

.guide-content {
  margin: 1rem 0;
}

.code-block {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.7;
}

.code-text {
  color: #abb2bf;
}

.keyword {
  color: #c678dd;
}

.string {
  color: #98c379;
}

.comment {
  color: #5c6370;
}
</style>
