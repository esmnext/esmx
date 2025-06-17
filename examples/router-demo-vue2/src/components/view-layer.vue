<template>
    <div class="layer-wrapper">
        <button class="global-close-btn" @click="$router.closeLayer()">
            <svg class="close-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        <div class="layer-container">
            <router-view />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from '@esmx/router-vue';

const $router = useRouter();
</script>

<style scoped>
.layer-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

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
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    position: relative;
    /* 自定义滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: var(--border-dark) transparent;
}

.layer-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
    z-index: var(--z-sticky);
}

.layer-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), transparent 50%);
    pointer-events: none;
    border-radius: var(--border-radius-xl);
}

/* 响应式设计 - 移动端全屏 */
@media (max-width: 768px) {
    .layer-wrapper {
        min-height: 100vh;
    }
    
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
    
    .layer-header {
        border-radius: 0;
    }
    
    .global-close-btn {
        display: none;
    }
    
    .close-icon {
        width: 12px;
        height: 12px;
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
    
    .global-close-btn {
        top: 16px;
        right: 16px;
    }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
    .layer-container {
        width: 800px;
        height: 800px;
    }
    
    .global-close-btn {
        top: 16px;
        right: 16px;
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
}

.layer-container::-webkit-scrollbar-thumb:hover {
    background: var(--border-color);
}

/* 全局关闭按钮 - 在容器外部右上角 */
.global-close-btn {
    position: fixed;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border: none;
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-full);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    z-index: var(--z-modal);
    box-shadow: var(--shadow-lg);
}

.global-close-btn:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
    border-color: var(--border-dark);
}

.close-icon {
    width: 12px;
    height: 12px;
}
</style>