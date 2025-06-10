<template>
    <div class="app" :class="{ 'is-layer': $router.isLayer }">
        <view-page v-if="!$router.isLayer" />
        <view-layer v-else />
    </div>
</template>
<script lang="ts" setup>
import ViewLayer from './components/view-layer.vue';
import ViewPage from './components/view-page.vue';
</script>
<style>
/* 全局样式 */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

:root {
    /* 主色系 */
    --primary-color: #6d28d9;
    --primary-light: #8b5cf6;
    --primary-dark: #5b21b6;
    --primary-50: #faf5ff;
    --primary-100: #f3e8ff;
    --primary-500: #8b5cf6;
    
    /* 辅助色系 */
    --secondary-color: #10b981;
    --secondary-light: #34d399;
    --secondary-dark: #047857;
    
    /* 强调色 */
    --accent-color: #f97316;
    --accent-light: #fb923c;
    --accent-dark: #ea580c;
    
    /* 中性色系 */
    --background-color: #f8fafc;
    --background-light: #ffffff;
    --background-dark: #f1f5f9;
    --card-color: #ffffff;
    --surface-color: #ffffff;
    --surface-hover: #f8fafc;
    
    /* 文字颜色 */
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --text-tertiary: #94a3b8;
    --text-white: #ffffff;
    --text-muted: #cbd5e1;
    
    /* 边框颜色 */
    --border-color: #e2e8f0;
    --border-light: #f1f5f9;
    --border-dark: #cbd5e1;
    
    /* 圆角系统 */
    --border-radius-xs: 2px;
    --border-radius-sm: 4px;
    --border-radius-md: 6px;
    --border-radius-lg: 8px;
    --border-radius-xl: 12px;
    --border-radius-2xl: 16px;
    
    /* 阴影系统 */
    --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    
    /* 动画系统 */
    --transition-fast: 150ms ease;
    --transition-normal: 200ms ease;
    --transition-slow: 300ms ease;
    
    /* 间距系统 */
    --spacing-0: 0;
    --spacing-1: 4px;
    --spacing-2: 8px;
    --spacing-3: 12px;
    --spacing-4: 16px;
    --spacing-5: 20px;
    --spacing-6: 24px;
    --spacing-8: 32px;
    --spacing-10: 40px;
    --spacing-12: 48px;
    
    /* 字体系统 */
    --font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    
    /* 字体大小 */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-base: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-2xl: 24px;
    --font-size-3xl: 30px;
    --font-size-4xl: 36px;
    
    /* 行高 */
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;
    
    /* Z-index 层级 */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-modal: 1050;
    --z-tooltip: 1070;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
    :root {
        --background-color: #0f172a;
        --background-light: #1e293b;
        --background-dark: #334155;
        --card-color: #1e293b;
        --surface-color: #1e293b;
        --surface-hover: #334155;
        
        --text-primary: #f1f5f9;
        --text-secondary: #cbd5e1;
        --text-tertiary: #94a3b8;
        --text-muted: #64748b;
        
        --border-color: #334155;
        --border-light: #475569;
        --border-dark: #64748b;
        
        --primary-color: #8b5cf6;
        --primary-light: #a78bfa;
        --primary-dark: #7c3aed;
    }
}

/* 滚动条样式 */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: var(--background-color);
}

::-webkit-scrollbar-thumb {
    background: var(--border-dark);
    border-radius: var(--border-radius-sm);
}

::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
}


</style>
<style scoped>
.app {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}
</style>
