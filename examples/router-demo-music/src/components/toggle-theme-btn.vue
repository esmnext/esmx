<template>
    <button class="theme-toggle" @click="isDark = !isDark" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        {{ isDark ? '☼' : '☽' }}
    </button>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

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

watch(() => isDark.value, applyTheme);

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
</script>

<style scoped>
/* 主题切换按钮 */
.theme-toggle {
    width: 44px;
    height: 44px;
    border-radius: var(--border-radius-full);
    border: 1px solid var(--border-light);
    background: var(--card-color);
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-md);
    transition: all var(--duration-normal);
}

.theme-toggle:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .theme-toggle {
        width: 40px;
        height: 40px;
        font-size: var(--font-size-base);
    }
}
</style>
