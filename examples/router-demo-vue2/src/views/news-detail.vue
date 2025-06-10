<template>
    <div class="detail-container" :class="{ 'is-layer': $router.isLayer }">
        <div class="news-header-bar" v-if="!$router.isLayer">
            <RouterLink to="/" class="back-button">
                <span class="back-icon">←</span>
                <span>返回列表</span>
            </RouterLink>
            <div class="news-id-badge">新闻 #{{ $route.state.id }}</div>
        </div>
        
        <div class="layer-header" v-if="$router.isLayer">
            <button class="layer-back-button" @click="$router.back()">
                <svg class="back-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <div class="layer-title">新闻详情</div>
        </div>
        
        <div class="news-detail-card">
            <div class="card-header">
                <h1 class="news-title">探索 Esmx 路由的强大功能</h1>
                <div class="news-meta">
                    <span class="news-date">{{ new Date().toLocaleDateString() }}</span>
                    <span class="news-author">作者: Esmx 团队</span>
                </div>
            </div>
            
            <div class="news-content">
                <div class="content-section">
                    <p class="lead-paragraph">这是新闻 #{{ $route.state.id }} 的详细内容，展示了 Esmx 路由的强大功能和灵活性。</p>
                    
                    <p>Esmx 路由是一个现代化的路由解决方案，为 Vue 应用提供了强大的导航能力。它支持动态路由匹配、嵌套路由、路由守卫等多种功能，让开发者能够构建复杂而高效的单页应用。</p>
                    
                    <div class="feature-highlight">
                        <div class="highlight-icon">✨</div>
                        <div class="highlight-content">
                            <h3>路由状态传递</h3>
                            <p>如您所见，当前页面的 ID ({{ $route.state.id }}) 是通过路由状态传递的，这展示了 Esmx 路由在页面间传递数据的能力。</p>
                        </div>
                    </div>
                    
                    <p>除了基本的路由功能外，Esmx 路由还提供了许多高级特性，如路由元信息、动态导入组件、滚动行为控制等，这些特性使得构建现代化的 Web 应用变得更加简单和高效。</p>
                </div>
                
                <div class="content-section">
                    <h2 class="section-title">技术细节</h2>
                    <div class="code-block">
                        <pre><code>// 路由配置示例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/news/:id', component: NewsDetail },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
});</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="tags">
                    <span class="tag">路由</span>
                    <span class="tag">Vue</span>
                    <span class="tag">Esmx</span>
                </div>
                <div class="share-buttons">
                    <button class="share-btn">分享</button>
                    <button class="like-btn">点赞</button>
                </div>
            </div>
        </div>
        
        <div class="related-news">
            <h3 class="related-title">相关新闻</h3>
            <div class="related-items">
                <RouterLink v-for="relatedId in getRelatedIds()" :key="relatedId"
                    :to="{ path: `/news/${relatedId}`, state: { id: relatedId } }"
                    class="related-item">
                    <span class="related-id">新闻 #{{ relatedId }}</span>
                    <span class="related-arrow">→</span>
                </RouterLink>
            </div>
        </div>

    </div>
</template>
<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue2';

// 生成相关新闻ID（当前ID附近的3个ID）
function getRelatedIds() {
    const relatedIds = [];

    for (let i = 1; i <= 3; i++) {
        relatedIds.push(i);
    }
    return relatedIds;
}
</script>
<style scoped>
.detail-container {
    padding: 0;
    max-width: 900px;
    margin: 0 auto;
    min-height: 100vh;
}

.detail-container.is-layer {
    max-width: 100%;
    margin: 0;
    padding: 1rem;
    min-height: auto;
    background-color: var(--bg-color);
    border-radius: var(--border-radius-lg);
}

/* 头部导航栏 */
.news-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 0.5rem 0;
}

.back-button {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-secondary);
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-md);
    transition: all var(--transition-fast);
    background-color: var(--card-color);
    box-shadow: var(--shadow-sm);
}

.back-button:hover {
    transform: translateX(-3px);
    color: var(--primary-color);
    box-shadow: var(--shadow-md);
}

.back-icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
    transition: transform var(--transition-fast);
}

.back-button:hover .back-icon {
    transform: translateX(-3px);
}

.news-id-badge {
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: white;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
}

.news-id-badge::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
    transform: rotate(45deg);
    animation: shine 3s infinite;
}

@keyframes shine {
    0% {
        left: -50%;
    }
    100% {
        left: 150%;
    }
}

/* 新闻卡片 */
.news-detail-card {
    background-color: var(--card-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    margin-bottom: 2rem;
    position: relative;
}

.news-detail-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
}

.card-header {
    padding: 2rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.news-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem;
    color: var(--text-primary);
    line-height: 1.3;
}

.news-meta {
    display: flex;
    gap: 1.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.news-date, .news-author {
    display: flex;
    align-items: center;
}

.news-content {
    padding: 2rem;
    line-height: 1.7;
    color: var(--text-primary);
}

.content-section {
    margin-bottom: 2rem;
}

.lead-paragraph {
    font-size: 1.2rem;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-weight: 500;
}

.feature-highlight {
    display: flex;
    background-color: rgba(109, 40, 217, 0.05);
    border-radius: var(--border-radius-md);
    padding: 1.5rem;
    margin: 1.5rem 0;
    border-left: 4px solid var(--primary-color);
}

.highlight-icon {
    font-size: 2rem;
    margin-right: 1rem;
    color: var(--primary-color);
}

.highlight-content h3 {
    margin-top: 0;
    color: var(--primary-color);
    font-size: 1.2rem;
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
    position: relative;
    display: inline-block;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 50%;
    height: 3px;
    background: linear-gradient(to right, var(--primary-color), transparent);
    border-radius: 2px;
}

.code-block {
    background-color: #2d2d2d;
    border-radius: var(--border-radius-md);
    padding: 1.5rem;
    overflow-x: auto;
    margin: 1rem 0;
}

.code-block pre {
    margin: 0;
}

.code-block code {
    color: #e6e6e6;
    font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background-color: rgba(0,0,0,0.02);
    border-top: 1px solid rgba(0,0,0,0.05);
}

.tags {
    display: flex;
    gap: 0.5rem;
}

.tag {
    background-color: rgba(109, 40, 217, 0.1);
    color: var(--primary-color);
    padding: 0.3rem 0.8rem;
    border-radius: var(--border-radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
}

.share-buttons {
    display: flex;
    gap: 0.75rem;
}

.share-btn, .like-btn {
    background-color: var(--card-color);
    border: 1px solid rgba(0,0,0,0.1);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.share-btn:hover, .like-btn:hover {
    background-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

/* 相关新闻 */
.related-news {
    margin-top: 3rem;
}

.related-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    position: relative;
    display: inline-block;
}

.related-title::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40%;
    height: 3px;
    background: linear-gradient(to right, var(--primary-color), transparent);
    border-radius: 2px;
}

.related-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}

.related-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: var(--card-color);
    border-radius: var(--border-radius-md);
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
    border: 1px solid rgba(0,0,0,0.05);
}

.related-item:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    color: var(--primary-color);
}

.related-arrow {
    transition: transform var(--transition-fast);
}

.related-item:hover .related-arrow {
    transform: translateX(5px);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .card-header, .news-content, .card-footer {
        padding: 1.5rem;
    }
    
    .news-title {
        font-size: 1.5rem;
    }
    
    .news-meta {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .card-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .related-items {
        grid-template-columns: 1fr;
    }
}

/* 弹层头部 */
.layer-header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    margin: -1.5rem -1.5rem 1.5rem -1.5rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(0,0,0,0.08);
    gap: 0.75rem;
}

.layer-back-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem;
    border: none;
    border-radius: 8px;
    background: rgba(0,0,0,0.03);
    cursor: pointer;
    transition: all 0.2s ease;
    color: #555;
    line-height: 1;
    min-width: 2rem;
    min-height: 2rem;
}

.layer-back-button:hover {
    background: rgba(0,0,0,0.06);
    color: #333;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.layer-back-button:active {
    background: rgba(0,0,0,0.08);
    transform: scale(0.95);
}

.layer-back-button .back-icon {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
    transition: transform 0.2s ease;
}

.layer-back-button:hover .back-icon {
    transform: translateX(-2px);
}

.layer-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
    text-align: center;
    margin-right: 2rem;
}

/* 弹层模式下的样式调整 */
.is-layer .news-detail-card {
    margin-bottom: 1rem;
    box-shadow: var(--shadow-sm);
}

.is-layer .related-news {
    margin-top: 1.5rem;
}

.is-layer .card-header,
.is-layer .news-content,
.is-layer .card-footer {
    padding: 1.5rem;
}

.is-layer .news-title {
    font-size: 1.5rem;
}

.is-layer .related-items {
    grid-template-columns: 1fr;
    gap: 0.75rem;
}

.is-layer .related-item {
    padding: 0.75rem 1rem;
}

</style>
