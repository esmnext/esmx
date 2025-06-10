<template>
    <div class="layer-container">
        <button class="global-close-btn" @click="$router.closeLayer()">
            <span class="close-icon">×</span>
        </button>
        <router-view />
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from '@esmx/router-vue2';

const $router = useRouter();
</script>

<style scoped>
.layer-container {
    overflow-y: auto;
    width: 700px;
    height: 700px;
    background: var(--card-color);
    border: 1px solid var(--border-color);
    box-sizing: border-box;
    margin: 0 auto;
    overscroll-behavior: contain;
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-2xl);
    position: relative;
    /* 自定义滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: var(--border-dark) transparent;
}

.layer-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 50%);
    pointer-events: none;
    border-radius: var(--border-radius-xl);
}

/* 响应式设计 - 移动端全屏 */
@media (max-width: 768px) {
    .layer-container {
        width: 100vw;
        height: 100vh;
        border: none;
        border-radius: 0;
        margin: 0;
        box-shadow: none;
    }
    
    .layer-container::before {
        border-radius: 0;
    }
}

/* 平板端适配 */
@media (min-width: 769px) and (max-width: 1024px) {
    .layer-container {
        width: 90vw;
        height: 90vh;
        max-width: 800px;
        max-height: 800px;
    }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
    .layer-container {
        width: 800px;
        height: 800px;
    }
}

/* Webkit 浏览器滚动条样式 */
.layer-container::-webkit-scrollbar {
    width: 8px;
}

.layer-container::-webkit-scrollbar-track {
    background: transparent;
    border-radius: var(--border-radius-sm);
}

.layer-container::-webkit-scrollbar-thumb {
    background: var(--border-dark);
    border-radius: var(--border-radius-sm);
    transition: background var(--transition-fast);
}

.layer-container::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
}

/* 全局关闭按钮 */
.global-close-btn {
    position: absolute;
    top: var(--spacing-4);
    right: var(--spacing-4);
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--transition-fast), opacity var(--transition-fast);
    z-index: var(--z-modal);
    opacity: 0.8;
}

/* 移动端关闭按钮优化 */
@media (max-width: 768px) {
    .global-close-btn {
        top: var(--spacing-2);
        right: var(--spacing-2);
        width: 40px;
        height: 40px;
        background: rgba(0, 0, 0, 0.7);
    }
    
    .global-close-btn .close-icon {
        font-size: var(--font-size-xl);
    }
}

.global-close-btn:hover {
    background: rgba(0, 0, 0, 0.8);
    opacity: 1;
}

.close-icon {
    font-size: var(--font-size-lg);
    color: rgba(255, 255, 255, 0.9);
    line-height: 1;
    font-weight: 300;
}

.global-close-btn:hover .close-icon {
    color: rgba(255, 255, 255, 1);
}
</style>