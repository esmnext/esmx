<template>
    <div class="home-container">
        <div class="hero-section">
            <h1 class="hero-title">Esmx Router</h1>
            <p class="hero-subtitle">探索下一代路由体验</p>
        </div>
        
        <div class="news-container">
            <h2 class="section-title">最新动态</h2>
            <div class="news-grid">
                <div v-for="id in 10" :key="id" class="news-card">
                    <div class="card-content">
                        <div class="card-tag">新闻 #{{ id }}</div>
                        <div class="card-title">探索 Esmx 路由的强大功能</div>
                        <div class="card-meta">{{ new Date().toLocaleDateString() }}</div>
                    </div>
                    <button @click="$router.pushLayer(`/news/${id}`)" class="layer-button">
                        弹层预览
                    </button>
                    <RouterLink :to="{
                        path: `/news/${id}`,
                        state: { id }
                    }" class="card-link">
                        查看详情
                        <span class="link-icon">→</span>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue2';
</script>
<style scoped>
.home-container {
    padding: var(--spacing-6);
    max-width: 900px;
    margin: 0 auto;
}

/* 英雄区域 */
.hero-section {
    padding: var(--spacing-12) var(--spacing-8);
    margin-bottom: var(--spacing-8);
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-normal);
}

.hero-section:hover {
    box-shadow: var(--shadow-md);
}

.hero-title {
    font-size: var(--font-size-4xl);
    font-weight: 800;
    margin: 0 0 var(--spacing-4);
    color: var(--text-primary);
    letter-spacing: -0.02em;
}

.hero-subtitle {
    font-size: var(--font-size-lg);
    font-weight: 400;
    color: var(--text-secondary);
    margin: 0;
    max-width: 600px;
}

/* 新闻部分 */
.news-container {
    margin-top: var(--spacing-8);
}

.section-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin-bottom: var(--spacing-6);
    color: var(--text-primary);
    letter-spacing: -0.02em;
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-6);
}

.news-card {
    background: var(--card-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-light);
    position: relative;
    overflow: hidden;
}

.news-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-color);
}

.card-content {
    padding: var(--spacing-6);
    flex-grow: 1;
}

.card-tag {
    display: inline-block;
    padding: var(--spacing-1) var(--spacing-3);
    background: var(--primary-50);
    color: var(--primary-color);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 700;
    margin-bottom: var(--spacing-3);
    border: 1px solid rgba(109, 40, 217, 0.1);
}

.card-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-3);
    line-height: var(--line-height-tight);
}

.card-meta {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: 500;
}

.layer-button {
    position: absolute;
    top: var(--spacing-4);
    right: var(--spacing-4);
    padding: var(--spacing-2) var(--spacing-3);
    background: var(--primary-color);
    color: var(--text-white);
    border: none;
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
    cursor: pointer;
    display: none;
    z-index: 10;
}

.news-card:hover .layer-button {
    display: block;
}

.layer-button:hover {
    background: var(--primary-dark);
}

.card-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-4) var(--spacing-6);
    background: var(--surface-color);
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    border-top: 1px solid var(--border-light);
    transition: background var(--transition-fast), color var(--transition-fast);
}

.card-link:hover {
    background: var(--surface-hover);
    color: var(--primary-dark);
}

.link-icon {
    transition: transform var(--transition-fast);
    font-size: var(--font-size-lg);
    font-weight: bold;
}

.card-link:hover .link-icon {
    transform: translateX(4px);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .home-container {
        padding: var(--spacing-4);
    }
    
    .hero-section {
        padding: var(--spacing-8) var(--spacing-6);
        margin-bottom: var(--spacing-6);
    }
    
    .hero-title {
        font-size: var(--font-size-3xl);
    }
    
    .hero-subtitle {
        font-size: var(--font-size-base);
    }
    
    .news-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-4);
    }
    
    .section-title {
        font-size: var(--font-size-2xl);
        margin-bottom: var(--spacing-4);
    }
}

@media (max-width: 480px) {
    .home-container {
        padding: var(--spacing-2);
    }
    
    .hero-section {
        padding: var(--spacing-6) var(--spacing-4);
    }
    
    .hero-title {
        font-size: var(--font-size-2xl);
    }
    
    .card-content {
        padding: var(--spacing-4);
    }
    
    .card-link {
        padding: var(--spacing-3) var(--spacing-4);
    }
}
</style>
