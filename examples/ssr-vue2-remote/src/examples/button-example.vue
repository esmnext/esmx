<template>
  <ui-card class="component-section">
    <template #header>
      <h2>Button 按钮</h2>
    </template>
    <div class="component-doc">
      <div class="demo-block">
        <h3>基础用法</h3>
        <div class="demo-content">
          <div class="button-group">
            <ui-button v-for="type in buttonTypes" :key="type" :type="type">
              {{ buttonTypeMap[type] }}
            </ui-button>
          </div>
        </div>
      </div>

      <div class="demo-block">
        <h3>尺寸</h3>
        <div class="demo-content">
          <div class="button-group">
            <ui-button v-for="size in buttonSizes" :key="size" :size="size" type="primary">
              {{ buttonSizeMap[size] }}
            </ui-button>
          </div>
        </div>
      </div>

      <div class="demo-block">
        <h3>状态</h3>
        <div class="demo-content">
          <div class="button-group">
            <ui-button type="primary" loading>加载中</ui-button>
            <ui-button type="primary" disabled>禁用状态</ui-button>
          </div>
        </div>
      </div>
    </div>
  </ui-card>
</template>

<script setup lang="ts">
import type { ButtonSize, ButtonType } from '../components';
import { UiButton, UiCard } from '../components';

const buttonTypes: ButtonType[] = ['primary', 'secondary', 'text'];
const buttonTypeMap: Record<ButtonType, string> = {
    primary: '主要按钮',
    secondary: '次要按钮',
    text: '文本按钮',
    success: '成功按钮',
    warning: '警告按钮',
    danger: '危险按钮'
};

const buttonSizes: ButtonSize[] = ['small', 'medium', 'large'];
const buttonSizeMap: Record<ButtonSize, string> = {
    small: '小型',
    medium: '中型',
    large: '大型'
};
</script>

<style scoped>
.component-doc {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.demo-block h3 {
  margin: 0 0 1rem;
  font-size: 1.2rem;
  color: var(--color-text-primary);
}

.demo-content {
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: white;
  border: 1px solid var(--color-border);
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
