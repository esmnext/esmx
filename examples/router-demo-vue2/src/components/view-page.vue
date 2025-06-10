<template>
    <div class="app-container">
        <nav class="neo-nav">
            <div class="nav-brand">Esmx</div>
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
                    class="nav-item">
                    <span class="nav-icon">🔗</span>
                    <span class="nav-text">Github</span>
                </router-link>
            </div>
        </nav>

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
            <pre class="route-data">{{ $route }}</pre>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue2';
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
    min-height: 100vh;
}

/* 新型导航栏样式 */
.neo-nav {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: var(--border-radius-xl);
    padding: var(--spacing-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
}

.neo-nav::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
    pointer-events: none;
}

.nav-brand {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-white);
    letter-spacing: 0.05em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: var(--spacing-2) var(--spacing-4);
    background: rgba(255, 255, 255, 0.15);
    border-radius: var(--border-radius-sm);
    transition: background var(--transition-fast);
}

.nav-brand:hover {
    background: rgba(255, 255, 255, 0.2);
}

.nav-links {
    display: flex;
    gap: var(--spacing-3);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: var(--text-white);
    padding: var(--spacing-3) var(--spacing-5);
    border-radius: var(--border-radius-md);
    transition: background var(--transition-fast), transform var(--transition-fast);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.nav-icon {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-1);
}

.nav-text {
    font-size: var(--font-size-sm);
    font-weight: 600;
}

/* 内容区域 */
.neo-content {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border-color);
    transition: box-shadow var(--transition-normal);
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
    transition: box-shadow var(--transition-normal);
}

.neo-route-panel:hover {
    box-shadow: var(--shadow-xl);
}

.panel-header {
    background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
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
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    transition: background var(--transition-fast);
    cursor: pointer;
}

.control-dot:hover {
    background: rgba(255, 255, 255, 1);
}

.control-dot:nth-child(1) { background: #ff5f57; }
.control-dot:nth-child(2) { background: #ffbd2e; }
.control-dot:nth-child(3) { background: #28ca42; }

.route-data {
    background: #0f172a;
    color: #e2e8f0;
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

    .neo-nav {
        flex-direction: column;
        gap: var(--spacing-4);
        padding: var(--spacing-6);
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
        gap: var(--spacing-2);
    }

    .nav-icon {
        margin-bottom: 0;
        font-size: var(--font-size-lg);
    }
}
</style>