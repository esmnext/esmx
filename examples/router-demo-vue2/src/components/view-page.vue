<template>
    <div>
        <nav class="esmx-nav">
            <div class="nav-content">
                <div class="nav-brand">
                    <img class="esmx-logo" src="https://www.esmnext.com/logo.svg" alt="Esmx Logo" width="32" height="32" />
                    <span class="brand-text">Esmx</span>
                    <span class="brand-subtitle">Router</span>
                </div>
                <div class="nav-links">
                    <router-link to="/" class="nav-item">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-text">首页</span>
                    </router-link>
                    <router-link to="/about" class="nav-item">
                        <span class="nav-icon">⚠️</span>
                        <span class="nav-text">404</span>
                    </router-link>
                    <router-link to="https://github.com/esmnext/esmx/tree/master/examples/router-demo-base"
                        class="nav-item nav-external">
                        <span class="nav-icon">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                        </span>
                        <span class="nav-text">Github</span>
                    </router-link>
                </div>
            </div>
        </nav>

        <div class="app-container">
            <main class="neo-content">
                <router-view />
            </main>

            <div class="neo-route-panel">
                <div class="panel-header">
                    <h2 class="panel-title">Route</h2>
                    <div class="panel-controls">
                        <span class="control-dot"></span>
                        <span class="control-dot"></span>
                        <span class="control-dot"></span>
                    </div>
                </div>
                <CollapsibleJson class="route-data" :data="$route" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue';
import CollapsibleJson from './collapsible-json.vue';
</script>

<style scoped>
.app-container {
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    padding: var(--spacing-6);
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: var(--spacing-6);
    min-height: calc(100vh - 120px); /* 调整高度，减去导航高度 */
}

/* 🌟 ESMX导航栏 */
.esmx-nav {
    background: var(--dark-mask),
        radial-gradient(circle at 20% 50%, #fff2 0, transparent 60%),
        radial-gradient(circle at 80% 20%, #fff1 0, transparent 60%),
        linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    position: relative;
    width: 100%;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border-bottom: var(--spacing-1) solid;
    border-image: linear-gradient(90deg, #fff5 0, #fffa 50%, #fff5 100%) 1;
}

@media (prefers-color-scheme: dark) {
    .esmx-nav {
        border-image: linear-gradient(90deg, #0008 0, #0002 50%, #0008 100%) 1;
    }
}

.nav-content {
    max-width: 960px;
    margin: 0 auto;
    padding: var(--spacing-5) var(--spacing-6);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-2) var(--spacing-4);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
}

.nav-brand:hover {
    background: rgba(255, 255, 255, 0.15);
}

.esmx-logo {
    filter: drop-shadow(0 2px 4px rgba(255, 160, 0, 0.3));
}

.brand-text {
    font-size: var(--font-size-2xl);
    font-weight: 800;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.05em;
}

.brand-subtitle {
    font-size: var(--font-size-sm);
    color: rgba(0, 0, 0, 0.7);
    font-weight: 600;
    background: rgba(255, 255, 255, 0.2);
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--border-radius-full);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-links {
    display: flex;
    gap: var(--spacing-2);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: white;
    padding: var(--spacing-3) var(--spacing-4);
    border-radius: var(--border-radius-lg);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    cursor: pointer;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.2);
}

.nav-external {
    background: rgba(255, 193, 7, 0.2);
    border-color: rgba(255, 193, 7, 0.3);
}

.nav-external:hover {
    background: rgba(255, 193, 7, 0.3);
}

.nav-icon {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-1);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    line-height: 1;
}

.nav-icon svg {
    width: 18px;
    height: 18px;
}

.nav-text {
    font-size: var(--font-size-sm);
    font-weight: 600;
    white-space: nowrap;
    line-height: 1.2;
}

/* 内容区域 */
.neo-content {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border-color);
}

.neo-content:hover {
    box-shadow: var(--shadow-xl);
}

.neo-content::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, transparent 50%, var(--primary-50));
    border-radius: 0 0 var(--border-radius-xl) 0;
    pointer-events: none;
    opacity: 0.6;
}

/* 路由信息面板 */
.neo-route-panel {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
}

.neo-route-panel:hover {
    box-shadow: var(--shadow-xl);
}

.panel-header {
    background: var(--dark-mask), linear-gradient(135deg, #FF5722, #2196F3);
    padding: var(--spacing-4) var(--spacing-6);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-title {
    color: var(--text-white);
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.panel-controls {
    display: flex;
    gap: var(--spacing-2);
}

.control-dot {
    width: var(--spacing-3);
    height: var(--spacing-3);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    cursor: pointer;
}

.control-dot:hover {
    background: rgba(255, 255, 255, 1);
}

.control-dot:nth-child(1) { background: #ff5f57; }
.control-dot:nth-child(2) { background: #ffbd2e; }
.control-dot:nth-child(3) { background: #28ca42; }

.route-data {
    background: var(--background-dark);
    color: var(--text-secondary);
    padding: var(--spacing-6);
    margin: 0;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    border-top: 1px solid var(--border-color);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .app-container {
        max-width: 100%;
        padding: var(--spacing-4);
        grid-gap: var(--spacing-4);
    }

    .nav-content {
        flex-direction: column;
        gap: var(--spacing-4);
        padding: var(--spacing-6);
    }

    .nav-brand {
        flex-direction: row;
    }

    .brand-subtitle {
        display: none;
    }

    .nav-links {
        width: 100%;
        justify-content: space-around;
        gap: var(--spacing-2);
    }

    .nav-item {
        padding: var(--spacing-2) var(--spacing-3);
        min-width: 0;
        flex: 1;
    }

    .nav-text {
        font-size: var(--font-size-xs);
    }

    .neo-content {
        padding: var(--spacing-6);
    }
}

@media (max-width: 480px) {
    .nav-links {
        flex-direction: column;
        width: 100%;
        gap: var(--spacing-2);
    }

    .nav-item {
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: var(--spacing-2);
    }

    .nav-icon {
        margin-bottom: 0;
        font-size: var(--font-size-base);
        height: 18px;
    }

    .nav-icon svg {
        width: 16px;
        height: 16px;
    }
}
</style>