<template>
    <div class="not-found-container">
        <div class="glitch-container">
            <div class="glitch">404</div>
        </div>
        
        <div class="error-content">
            <h1 class="error-title">页面未找到</h1>
            <p class="error-message">看起来您迷失在了数字世界中。<br>您请求的页面可能已被移除或从未存在。</p>
            
            <div class="error-actions">
                <RouterLink to="/" class="home-button">
                    <span class="button-icon">🏠</span>
                    <span class="button-text">返回首页</span>
                </RouterLink>
                
                <button class="report-button" @click="reportError">
                    <span class="button-icon">🔍</span>
                    <span class="button-text">报告问题</span>
                </button>
            </div>
        </div>
        

    </div>
</template>
<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue2';

function reportError() {
    alert('感谢您的反馈！我们已记录此问题。');
}
</script>
<style scoped>
.not-found-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: var(--spacing-8);
    position: relative;
    overflow: hidden;
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-light);
}

/* 404 数字 */
.glitch-container {
    position: relative;
    margin-bottom: var(--spacing-8);
}

.glitch {
    font-size: clamp(var(--font-size-6xl), 12vw, 128px);
    font-weight: 900;
    line-height: 1;
    position: relative;
    color: var(--primary-color);
    letter-spacing: -0.05em;
    font-family: var(--font-family-display);
}

/* 错误内容 */
.error-content {
    text-align: center;
    max-width: 600px;
    z-index: 2;
}

.error-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-4);
    letter-spacing: -0.02em;
    font-family: var(--font-family-display);
}

.error-message {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--spacing-8);
}

.error-actions {
    display: flex;
    gap: var(--spacing-4);
    justify-content: center;
    flex-wrap: wrap;
}

.home-button, .report-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--border-radius-md);
    font-weight: 600;
    text-decoration: none;
    position: relative;
    font-size: var(--font-size-base);
}

.home-button {
    background: var(--primary-color);
    color: var(--text-white);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--primary-color);
}

.report-button {
    background: var(--surface-color);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-xs);
}

.home-button:hover {
    background: var(--primary-dark);
    border-color: var(--primary-dark);
    box-shadow: var(--shadow-lg);
}

.report-button:hover {
    background: var(--surface-hover);
    box-shadow: var(--shadow-sm);
    border-color: var(--border-color);
}

.button-icon {
    font-size: var(--font-size-lg);
}

.button-text {
    position: relative;
    z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .not-found-container {
        padding: var(--spacing-6);
        min-height: 70vh;
    }
    
    .error-title {
        font-size: var(--font-size-2xl);
    }
    
    .error-message {
        font-size: var(--font-size-base);
    }
    
    .error-actions {
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-3);
    }
    
    .home-button, .report-button {
        width: 100%;
        max-width: 240px;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .not-found-container {
        padding: var(--spacing-4);
    }
    
    .glitch {
        font-size: var(--font-size-6xl);
    }
    
    .error-title {
        font-size: var(--font-size-xl);
    }
    
    .error-message {
        font-size: var(--font-size-sm);
    }
}
</style>
