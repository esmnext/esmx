<template>
    <div id="app">
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
                    <router-link to="https://github.com/esmnext/esmx/tree/master/examples/router-demo-base" class="nav-item">
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
    </div>
</template>
<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue2';
</script>
<style>
/* 全局样式 */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

:root {
    --primary-color: #6d28d9;
    --primary-light: #8b5cf6;
    --primary-dark: #5b21b6;
    --secondary-color: #10b981;
    --accent-color: #f97316;
    --background-color: #f8fafc;
    --card-color: #ffffff;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 24px;
    --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
}

body {
    font-family: 'Space Grotesk', sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
    color: var(--text-primary);
    min-height: 100vh;
}

#app {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.app-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 2rem;
}

/* 新型导航栏样式 */
.neo-nav {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: var(--border-radius-lg);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow-md);
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
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    pointer-events: none;
}

.nav-brand {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    letter-spacing: 1px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    padding: 0.5rem 1rem;
    background-color: rgba(255,255,255,0.1);
    border-radius: var(--border-radius-sm);
    backdrop-filter: blur(4px);
}

.nav-links {
    display: flex;
    gap: 1rem;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: var(--border-radius-md);
    transition: transform var(--transition-fast), background-color var(--transition-fast);
    background-color: rgba(255,255,255,0.1);
    backdrop-filter: blur(4px);
}

.nav-item:hover {
    background-color: rgba(255,255,255,0.2);
    transform: translateY(-3px);
}

.nav-icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
}

.nav-text {
    font-size: 0.9rem;
    font-weight: 500;
}

/* 内容区域 */
.neo-content {
    background-color: var(--card-color);
    border-radius: var(--border-radius-lg);
    padding: 2rem;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.05);
}

.neo-content::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, transparent 50%, rgba(109, 40, 217, 0.1));
    border-radius: 0 0 var(--border-radius-lg) 0;
    pointer-events: none;
}

/* 路由信息面板 */
.neo-route-panel {
    background-color: var(--card-color);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(0,0,0,0.05);
}

.panel-header {
    background: linear-gradient(to right, var(--secondary-color), var(--accent-color));
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-title {
    color: white;
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.panel-controls {
    display: flex;
    gap: 0.5rem;
}

.control-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: rgba(255,255,255,0.7);
}

.route-data {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 1.5rem;
    margin: 0;
    overflow-x: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .app-container {
        padding: 1rem;
        grid-gap: 1rem;
    }
    
    .neo-nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-links {
        width: 100%;
        justify-content: space-around;
    }
    
    .nav-item {
        padding: 0.5rem 0.75rem;
    }
}
</style>
