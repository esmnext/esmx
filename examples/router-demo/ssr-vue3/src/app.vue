<template>
    <div class="app" :class="{ 'is-layer': $router.isLayer, hasSong: !!currentSong }">
        <ViewPage v-if="!$router.isLayer" />
        <ViewLayerDrawer v-else-if="$router.context?.layerType === 'drawer'" />
        <ViewLayer v-else />
        <MiniPlayer v-if="currentSong && !$router.isLayer" />
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from '@esmx/router-vue';
import { computed } from 'vue';
import { MiniPlayer } from './components';
import { ViewLayer, ViewLayerDrawer } from './layout';
import ViewPage from './layout/view-page.vue';
import { useMusicStore } from './store/music-store';

const musicStore = useMusicStore();

const $router = useRouter();

const currentSong = computed(() => musicStore.currentSong.value);
</script>

<style>
:root {
    /* 🎨 颜色变量 */
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    --primary-light: #8b5cf6;
    --accent-color: #ec4899;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
    
    /* 🎵 音乐主题色 */
    --music-primary: #8b5cf6;
    --music-secondary: #ec4899;
    --music-gradient: linear-gradient(135deg, var(--music-primary) 0%, var(--music-secondary) 100%);
    
    /* 文本颜色 */
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --text-tertiary: #9ca3af;
    --text-inverse: #ffffff;
    
    /* 背景颜色 */
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --bg-tertiary: #f3f4f6;
    --card-color: #ffffff;
    --overlay-color: #0008;
    
    /* 边框颜色 */
    --border-light: #e5e7eb;
    --border-medium: #d1d5db;
    --border-dark: #9ca3af;
    
    /* 阴影 */
    --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* 间距 */
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-5: 1.25rem;
    --spacing-6: 1.5rem;
    --spacing-7: 1.75rem;
    --spacing-8: 2rem;
    --spacing-10: 2.5rem;
    --spacing-12: 3rem;
    --spacing-16: 4rem;
    --spacing-20: 5rem;
    
    /* 圆角 */
    --border-radius-sm: 0.25rem;
    --border-radius: 0.375rem;
    --border-radius-md: 0.5rem;
    --border-radius-lg: 0.75rem;
    --border-radius-xl: 1rem;
    --border-radius-2xl: 1.5rem;
    --border-radius-full: 9999px;
    
    /* 字体大小 */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    --font-size-5xl: 3rem;
    
    /* 字体系列 */
    --font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-family-display: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
    
    /* Z-index 层级 */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
    
    /* 动画时长 */
    --duration-fast: 150ms;
    --duration-normal: 200ms;
    --duration-slow: 300ms;
    
    /* 音乐播放器特定变量 */
    --player-height: 80px;
    --sidebar-width: 240px;
}

@media (prefers-color-scheme: dark) {
    :root {
        --text-primary: #f9fafb;
        --text-secondary: #d1d5db;
        --text-tertiary: #9ca3af;
        --text-inverse: #111827;
        
        --bg-primary: #111827;
        --bg-secondary: #1f2937;
        --bg-tertiary: #374151;
        --card-color: #1f2937;
        --overlay-color: #0006;
        
        --border-light: #374151;
        --border-medium: #4b5563;
        --border-dark: #6b7280;
        
        --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    font-family: var(--font-family-sans);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    font-size: var(--font-size-base);
    transition: background-color var(--duration-normal), color var(--duration-normal);
    overflow: hidden scroll;
}

/* override button default style https://github.com/necolas/normalize.css/blob/master/normalize.css */
button {
  border: none;
  padding: 0;
  background: none;
  color: inherit;
  font: inherit;
  line-height: inherit;
  text-transform: none;
  -webkit-appearance: button;
  margin: 0;
  outline: none;
  cursor: pointer;
}

a {
    color: inherit;
    text-decoration: none;
}

/* 滚动条样式 */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: var(--border-radius-full);
}

::-webkit-scrollbar-thumb:hover {
    background: var(--border-dark);
}

/* 选择文本样式 */
::selection {
    background: var(--primary-color);
    color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
    :root {
        --sidebar-width: 200px;
        --player-height: 70px;
    }
}
</style>

<style scoped>
.app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
}

.app.is-layer {
    overflow: hidden;
}

.app.hasSong {
    padding-bottom: var(--player-height);
}
</style>
