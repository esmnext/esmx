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
    width: 600px;
    height: 600px;
    background: #fff;
    border: 1px solid #ccc;
    box-sizing: border-box;
    margin: 0 auto;
    overscroll-behavior: contain;
    border-radius: 12px;
    /* 自定义滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

/* 响应式设计 - 移动端全屏 */
@media (max-width: 768px) {
    .layer-container {
        width: 100vw;
        height: 100vh;
        border: none;
        border-radius: 0;
        margin: 0;
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
        width: 700px;
        height: 700px;
    }
}

/* Webkit 浏览器滚动条样式 */
.layer-container::-webkit-scrollbar {
    width: 6px;
}

.layer-container::-webkit-scrollbar-track {
    background: transparent;
}

.layer-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    transition: background-color 0.3s ease;
}

.layer-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.5);
}

/* 全局关闭按钮 */
.global-close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border: none;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 1000;
    backdrop-filter: blur(10px);
    opacity: 0.7;
}

/* 移动端关闭按钮优化 */
@media (max-width: 768px) {
    .global-close-btn {
        top: 0.5rem;
        right: 0.5rem;
        width: 36px;
        height: 36px;
        background-color: rgba(0, 0, 0, 0.4);
    }
    
    .close-icon {
        font-size: 1.6rem !important;
    }
}

.global-close-btn:hover {
    background-color: rgba(0, 0, 0, 0.4);
    opacity: 1;
    transform: scale(1.05);
}

.close-icon {
    font-size: 1.4rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1;
    font-weight: 300;
}

.global-close-btn:hover .close-icon {
    color: rgba(255, 255, 255, 1);
}
</style>