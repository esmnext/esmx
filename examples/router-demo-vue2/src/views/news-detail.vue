<template>
  <div class="news-detail" :class="{ 'is-layer': isLayer }">
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
    </header>
    <div class="main-content">
      <article class="article">
        <div class="article-header">
          <h2 class="article-title">{{ news.title }}</h2>
          <div class="article-meta">
            <time class="meta-item">{{ formatDate(news.date) }}</time>
            <span class="meta-item">{{ news.author }}</span>
          </div>
        </div>
        <div class="article-content">
          <p class="lead">{{ news.description }}</p>
          <div class="feature-card">
            <span class="feature-icon">✨</span>
            <div>
              <h3>路由状态传递</h3>
              <p>当前页面 ID: {{ $route.state.id }}</p>
            </div>
          </div>
          <div class="content-body" v-html="news.content"></div>
        </div>
        <footer class="article-footer">
          <div class="tags">
            <span v-for="tag in news.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="actions">
            <button class="action-btn share-btn">
              <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              分享
            </button>
            <button class="action-btn like-btn" :class="{ 'is-active': isLiked }" @click="toggleLike">
              <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ isLiked ? '已点赞' : '点赞' }}
            </button>
          </div>
        </footer>
        <section class="related">
          <h3 class="related-title">相关新闻</h3>
          <ul class="related-list">
            <li v-for="item in relatedNews" :key="item.id" class="related-item">
              <RouterLink :to="{ path: `/news/${item.id}`, state: { id: item.id } }" class="related-link">
                <span>{{ item.title }}</span>
                <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </RouterLink>
            </li>
          </ul>
        </section>
      </article>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, useRoute } from '@esmx/router-vue';
import { ref } from 'vue';

const route = useRoute();
const isLayer = ref(false);
const isLiked = ref(false);

const news = {
    title: '探索 Esmx 路由的强大功能',
    date: new Date(),
    author: 'Esmx 团队',
    description: `这是新闻 #${route.state.id} 的详细内容，展示了 Esmx 路由的强大功能和灵活性。`,
    content: `
    <p>Esmx 路由是一个现代化的路由解决方案，为 Vue 应用提供了强大的导航能力。它支持动态路由匹配、嵌套路由、路由守卫等多种功能，让开发者能够构建复杂而高效的单页应用。</p>
    <h2>技术细节</h2>
    <pre><code>// 路由配置示例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/news/:id', component: NewsDetail },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
});</code></pre>
  `,
    tags: ['路由', 'Vue', 'Esmx']
};

const relatedNews = [
    { id: 1, title: '新闻 #1' },
    { id: 2, title: '新闻 #2' },
    { id: 3, title: '新闻 #3' }
];

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function toggleLike() {
    isLiked.value = !isLiked.value;
}
</script>

<style scoped>
.news-detail {
  background: var(--background-color);
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  padding: var(--spacing-4) 0;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(8px);
}

.header .back-btn {
  margin-left: var(--spacing-6);
}

@media (prefers-color-scheme: dark) {
  .header {
    background: rgba(30, 30, 30, 0.95);
  }
}

.back-btn {
  margin-right: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: 500;
  background: var(--surface-color);
  border: none;
  color: var(--back-color);
  border-radius: var(--border-radius-md);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
}
.back-btn:hover {
  background: var(--surface-hover);
  color: var(--back-hover);
}
.back-btn .icon {
  width: 16px;
  height: 16px;
}

.main-content {
  width: 100%;
  background: var(--card-color);
}

.article {
  padding: var(--spacing-6) var(--spacing-6) var(--spacing-6) var(--spacing-6);
}

.article-header {
  padding: 0;
  border-bottom: none;
  margin-bottom: var(--spacing-6);
}

.article-title {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-4xl);
  line-height: var(--line-height-tight);
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.article-meta {
  display: flex;
  gap: var(--spacing-5);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-2);
}

.article-content {
  padding: 0;
}

.lead {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  margin-bottom: var(--spacing-6);
  font-weight: 500;
}

.feature-card {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-5) var(--spacing-6);
  margin: var(--spacing-6) 0;
  background: var(--primary-50);
  border-radius: var(--border-radius-lg);
  border-left: var(--spacing-1) solid var(--primary-color);
  color: var(--text-primary);
  align-items: flex-start;
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  font-size: var(--font-size-2xl);
  margin-top: 0.1em;
}

.content-body {
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.content-body pre {
  padding: var(--spacing-4);
  background: var(--background-color);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
  margin: var(--spacing-5) 0;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xs);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6) 0 0 0;
  background: none;
  border-top: 1px solid var(--border-light);
  margin-top: var(--spacing-8);
}

.tags {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.tag {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--primary-color);
  background-color: var(--primary-50);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(255, 193, 7, 0.2);
}
.tag:hover {
  background: var(--primary-color);
  color: var(--text-white);
}

.actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-5);
  color: var(--primary-color);
  background: transparent;
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-xs);
}
.action-btn:hover {
  background: var(--primary-color);
  color: var(--text-white);
  box-shadow: var(--shadow-sm);
}
.action-btn.is-active {
  background: var(--primary-dark);
  color: var(--text-white);
  border-color: var(--primary-dark);
  box-shadow: var(--shadow-sm);
}

.related {
  margin-top: var(--spacing-8);
  margin-bottom: 0;
}
.related-title {
  margin: 0 0 var(--spacing-3) 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  text-align: left;
}
.related-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.related-item {
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
}
.related-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-2);
  color: var(--link-color);
  text-decoration: none;
  border-radius: var(--border-radius-md);
}
.related-link:hover {
  background: rgba(31, 114, 232, 0.08);
  color: var(--link-hover);
}
.related-link .icon {
}
.related-link:hover .icon {
  transform: translateX(4px);
}

@media (max-width: 900px) {
  .article {
    padding: var(--spacing-6) var(--spacing-4) var(--spacing-4) var(--spacing-4);
  }
  .header .back-btn {
    margin-left: var(--spacing-4);
  }
}
@media (max-width: 600px) {
  .header .back-btn {
    margin-left: var(--spacing-2);
  }
  .article {
    padding: var(--spacing-4) var(--spacing-2) var(--spacing-4) var(--spacing-2);
  }
  .article-footer {
    flex-direction: column;
    gap: var(--spacing-3);
    padding: var(--spacing-4) 0 0 0;
  }
}
</style>
