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
    padding: 0;
    overflow: hidden;
}

/* 英雄区域 */
.hero-section {
    padding: 4rem 2rem;
    margin-bottom: 4rem;
    background-color: var(--card-color);
    border-radius: var(--border-radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid rgba(0,0,0,0.08);
}

.hero-title {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem;
    color: var(--text-primary);
}

.hero-subtitle {
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--text-secondary);
    margin: 0;
    max-width: 600px;
}

/* 新闻部分 */
.news-container {
    padding: 0 1rem;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.news-card {
    background-color: var(--card-color);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0,0,0,0.08);
    position: relative;
}

.news-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
}

.card-content {
    padding: 1.5rem;
    flex-grow: 1;
}

.card-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: rgba(109, 40, 217, 0.1);
    color: var(--primary-color);
    border-radius: var(--border-radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

.card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    line-height: 1.4;
}

.card-meta {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.layer-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius-sm);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 10;
}

.news-card:hover .layer-button {
    opacity: 1;
    transform: translateY(0);
}

.layer-button:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(109, 40, 217, 0.3);
}

.card-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background-color: #f8f9fa;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    border-top: 1px solid rgba(0,0,0,0.05);
    transition: background-color var(--transition-fast);
}

.card-link:hover {
    background-color: #f1f3f5;
}

.link-icon {
    transition: transform var(--transition-fast);
}

.card-link:hover .link-icon {
    transform: translateX(5px);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .hero-section {
        padding: 3rem 1rem;
    }
    
    .hero-title {
        font-size: 2.2rem;
    }
    
    .news-grid {
        grid-template-columns: 1fr;
    }
}
</style>
