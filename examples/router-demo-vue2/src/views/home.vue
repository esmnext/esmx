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
import { RouterLink } from '@esmx/router-vue';
</script>
<style scoped>
.home-container {
    padding: var(--spacing-6);
    max-width: 900px;
    margin: 0 auto;
}

/* 🌟 英雄区域 */
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
    position: relative;
    overflow: hidden;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--spacing-1);
    background: var(--dark-mask), linear-gradient(90deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    opacity: 0.8;
}

.hero-section:hover {
    box-shadow: var(--shadow-md);
}

.hero-title {
    font-family: var(--font-family-display);
    font-size: var(--font-size-4xl);
    font-weight: 800;
    margin: 0 0 var(--spacing-4);
    color: var(--text-primary);
    letter-spacing: -0.02em;
    position: relative;
    z-index: 1;
}

.hero-subtitle {
    font-size: var(--font-size-lg);
    font-weight: 400;
    color: var(--text-secondary);
    margin: 0;
    max-width: 600px;
    position: relative;
    z-index: 1;
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
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-light);
    position: relative;
    overflow: hidden;
}

.news-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--spacing-1);
    background: var(--dark-mask), linear-gradient(90deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    opacity: 0;
}

.news-card:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--border-color);
}

.news-card:hover::before {
    opacity: 1;
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
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    margin-bottom: var(--spacing-3);
    border: 1px solid rgba(255, 193, 7, 0.2);
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
    padding: var(--spacing-2) var(--spacing-4);
    background: var(--dark-mask), var(--primary-color);
    color: var(--text-white);
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    display: none;
    z-index: 10;
    box-shadow: var(--shadow-md);
}

.news-card:hover .layer-button {
    display: block;
}

.layer-button:hover {
    background: var(--primary-dark);
    box-shadow: var(--shadow-lg);
}

.card-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-4) var(--spacing-6);
    background: var(--surface-color);
    color: var(--link-color);
    text-decoration: none;
    font-weight: 600;
    border-top: 1px solid var(--border-light);
    cursor: pointer;
}

.card-link:hover {
    background: var(--surface-hover);
    color: var(--link-hover);
}

.link-icon {
    font-size: var(--font-size-lg);
    font-weight: bold;
}

.card-link:hover .link-icon {
    color: var(--link-hover);
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
