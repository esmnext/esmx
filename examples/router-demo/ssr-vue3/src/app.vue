<template>
    <div class="app" :class="{ 'is-layer': $router.isLayer }">
        <view-page v-if="!$router.isLayer" />
        <view-layer v-else />
        <button class="theme-toggle" @click="isDark = !isDark" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            {{ isDark ? '☼' : '☽' }}
        </button>
    </div>
</template>
<script lang="ts" setup>
import { useRouter } from '@esmx/router-vue';
import { onMounted, ref, watch } from 'vue';
import ViewLayer from './components/view-layer.vue';
import ViewPage from './components/view-page.vue';

const $router = useRouter();

const isDark = ref(false);

const getAllPrefMediaRules = () =>
    Array.from(document.styleSheets).reduce((rules, sheet) => {
        for (const rule of Array.from(sheet.cssRules)) {
            if (!(rule instanceof CSSMediaRule)) continue;
            const mediaText = rule.media?.mediaText || '';
            if (!mediaText.includes('prefers-color-scheme')) continue;
            rules.push(rule);
        }
        return rules;
    }, [] as CSSMediaRule[]);

const saveAndGetOriColorScheme = (media: MediaList): string[] => {
    const mediaText = media.mediaText;
    const oriColorScheme: string[] = [];
    if (!mediaText.includes('original-prefers-color-scheme')) {
        if (mediaText.includes('light')) oriColorScheme.push('light');
        if (mediaText.includes('dark')) oriColorScheme.push('dark');
        media.appendMedium(
            `(original-prefers-color-scheme: ${oriColorScheme.join(' ')})`
        );
    } else {
        oriColorScheme.push(
            ...(mediaText
                .match(/original-prefers-color-scheme:\s*([a-z ]+)/)?.[1]
                .split(' ') || [])
        );
    }
    return oriColorScheme;
};

const applyTheme = (dark: boolean) =>
    getAllPrefMediaRules().forEach(({ media }) => {
        const oriColorScheme = saveAndGetOriColorScheme(media);
        if (oriColorScheme.length === 2) return;
        const mediaText = media.mediaText;
        const scheme = dark ? 'dark' : 'light';
        const antiScheme = dark ? 'light' : 'dark';
        if (mediaText.includes(`(prefers-color-scheme: ${antiScheme})`))
            media.deleteMedium(`(prefers-color-scheme: ${antiScheme})`);
        if (oriColorScheme.includes(scheme))
            media.appendMedium(`(prefers-color-scheme: ${scheme})`);
    });

onMounted(() => {
    if (typeof window === 'object') {
        isDark.value = window.matchMedia?.(
            '(prefers-color-scheme: dark)'
        ).matches;
        window
            .matchMedia?.('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                isDark.value = e.matches;
            });
    }
    applyTheme(isDark.value);
});
watch(isDark, (val) => applyTheme(val));
</script>
<style>
/* 全局样式 */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

:root {
    /* 🎯 主色系 - 基于 #FFC107 */
    --primary-color: #FFC107;
    --primary-light: #FFD54F;
    --primary-dark: #FF8F00;
    --primary-50: #FFFDE7;
    --primary-100: #FFF9C4;
    --primary-500: #FFC107;
    

    
    /* 🌐 中性色系 - 现代简洁 */
    --background-color: #FAFAFA;
    --background-light: #FFFFFF;
    --background-dark: #F5F5F5;
    --card-color: #FFFFFF;
    --surface-color: #FFFFFF;
    --surface-hover: #F5F5F5;
    
    /* 📝 文字颜色 */
    --text-primary: #212121;
    --text-secondary: #757575;
    --text-tertiary: #9E9E9E;
    --text-white: #FFFFFF;
    --text-muted: #BDBDBD;
    
    /* 🔗 链接颜色系统 */
    --link-color: #1F72E8;
    --link-hover: #1557B7;
    --link-visited: #7B1FA2;
    
    /* 🔙 返回按钮颜色 */
    --back-color: #374151;
    --back-hover: #1F2937;
    
    /* ✖️ 关闭按钮颜色 */
    --close-color: #6B7280;
    --close-hover: #4B5563;
    
    /* 🖼️ 边框颜色 */
    --border-color: #E0E0E0;
    --border-light: #F5F5F5;
    --border-dark: #BDBDBD;
    
    /* 🔘 圆角系统 */
    --border-radius-sm: 6px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --border-radius-xl: 16px;
    --border-radius-full: 9999px;
    
    /* 🌟 阴影系统 */
    --shadow-color: rgba(0, 0, 0, 0.1);
    --shadow-sm: 0 1px 3px 0 var(--shadow-color), 0 1px 2px -1px var(--shadow-color);
    --shadow-md: 0 4px 6px -1px var(--shadow-color), 0 2px 4px -2px var(--shadow-color);
    --shadow-lg: 0 10px 15px -3px var(--shadow-color), 0 4px 6px -4px var(--shadow-color);
    --shadow-xl: 0 20px 25px -5px var(--shadow-color), 0 8px 10px -6px var(--shadow-color);

    --dark-mask: linear-gradient(#0000, #0000);


    /* 📏 间距系统 */
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
    
    /* 🔤 字体系统 */
    --font-family: 'Inter', 'Space Grotesk', system-ui, -apple-system, sans-serif;
    --font-family-display: 'Space Grotesk', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
    
    /* 📏 字体大小 */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-base: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-2xl: 24px;
    --font-size-3xl: 30px;
    --font-size-4xl: 36px;
    --font-size-6xl: 60px;
    
    /* 📐 行高 */
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    
    /* 🎯 Z-index 层级 */
    --z-sticky: 1020;
    --z-modal: 1050;
}

/* 🌙 暗色模式支持 */
@media (prefers-color-scheme: dark) {
    :root {
        --background-color: #121212;
        --background-light: #1E1E1E;
        --background-dark: #0A0A0A;
        --card-color: #1E1E1E;
        --surface-color: #2D2D2D;
        --surface-hover: #3D3D3D;
        
        --text-primary: #FFFFFF;
        --text-secondary: #E0E0E0;
        --text-tertiary: #BDBDBD;
        --text-muted: #757575;
        
        /* 暗色模式链接颜色 */
        --link-color: #5B9BF8;
        --link-hover: #3B82F6;
        --link-visited: #BA68C8;
        
        /* 暗色模式返回按钮颜色 */
        --back-color: #9CA3AF;
        --back-hover: #D1D5DB;
        
        /* 暗色模式关闭按钮颜色 */
        --close-color: #9CA3AF;
        --close-hover: #D1D5DB;
        
        --border-color: #3D3D3D;
        --border-light: #2D2D2D;
        --border-dark: #555555;
        
        /* 保持主色不变 */
        --primary-color: #FFC107;
        --primary-light: #FFD54F;
        --primary-dark: #FF8F00;

        --primary-50: #34300d;
        --dark-mask: linear-gradient(#0006, #0006);
    }
}

/* 💫 全局基础样式 */
html {
    font-family: var(--font-family);
    line-height: var(--line-height-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

body {
    margin: 0;
    padding: 0;
    background: var(--background-color);
    color: var(--text-primary);
    overflow-x: hidden;
}

/* 🎨 滚动条样式 */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: var(--background-dark);
    border-radius: var(--border-radius-full);
}

::-webkit-scrollbar-thumb {
    background: var(--border-dark);
    border-radius: var(--border-radius-full);
}

::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
}

/* 🎯 选中文本样式 */
::selection {
    background: rgba(255, 193, 7, 0.3);
    color: var(--text-primary);
}

::-moz-selection {
    background: rgba(255, 193, 7, 0.3);
    color: var(--text-primary);
}

/* 🔗 链接默认样式 */
a {
    color: var(--link-color);
    text-decoration: none;
}

a:hover {
    color: var(--link-hover);
}

a:visited {
    color: var(--link-visited);
}

/* 🎛️ 表单元素样式重置 */
button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
}

/* 🎯 焦点样式 */
:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: var(--border-radius-sm);
}

</style>
<style scoped>
.app {
    min-height: 100vh;
    background: var(--background-color);
}

.app.is-layer {
    background: transparent;
}

/* Theme toggle button styles */
.theme-toggle {
    position: fixed;
    left: 24px;
    bottom: 24px;
    z-index: 2000;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: var(--card-color);
    color: var(--text-primary);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.theme-toggle:hover {
    background: var(--primary-color);
    color: var(--text-white);
    box-shadow: var(--shadow-md);
}
.theme-toggle:active {
    background: var(--primary-dark);
    box-shadow: var(--shadow-sm);
}
</style>
