<template>
  <ui-card class="component-section">
    <template #header>
      <h2>主题定制</h2>
    </template>
    <div class="theme-controls">
      <div v-for="(color, key) in theme" :key="key" class="color-picker">
        <label>{{ formatKey(key) }}</label>
        <input
          type="color"
          :value="color"
          @input="handleColorChange($event, key)"
        />
      </div>
    </div>
    <template #footer>
      <div class="theme-footer">
        <ui-button type="primary" @click="handleReset">重置主题</ui-button>
      </div>
    </template>
  </ui-card>
</template>

<script setup lang="ts">
import { UiButton, UiCard } from '../components';
import type { Theme } from '../composables';
import { defaultTheme, useTheme } from '../composables';

const { theme, updateTheme } = useTheme();

const handleColorChange = (event: Event, key: keyof Theme) => {
    const input = event.target as HTMLInputElement;
    updateTheme({ [key]: input.value });
};

const handleReset = () => {
    updateTheme(defaultTheme);
};

const formatKey = (key: keyof Theme) => {
    const keyMap: Record<keyof Theme, string> = {
        colorPrimary: '主色',
        colorPrimaryDark: '主色（深）',
        colorSecondary: '次色',
        colorSecondaryDark: '次色（深）',
        colorSuccess: '成功色',
        colorSuccessDark: '成功色（深）',
        colorWarning: '警告色',
        colorWarningDark: '警告色（深）',
        colorDanger: '危险色',
        colorDangerDark: '危险色（深）',
        colorTextPrimary: '主要文本色',
        colorTextSecondary: '次要文本色',
        colorBackground: '背景色',
        colorBorder: '边框色'
    };
    return keyMap[key] || key;
};
</script>

<style scoped>
.theme-controls {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-picker label {
  flex: 1;
  color: var(--color-text-secondary);
}

.color-picker input {
  width: 50px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
}

.theme-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
