<template>
  <div class="news-detail" :class="{ 'is-layer': isLayer }">
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        返回
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
import { ref } from 'vue';
import { RouterLink, useRoute } from '@esmx/router-vue2';

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
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: var(--card-color);
  border-bottom: 1px solid var(--border-light);
}

.back-btn {
  margin-right: 12px;
  padding: 8px 12px;
  font-size: 14px;
  background: transparent;
  border: none;
  color: var(--primary-color);
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.back-btn:hover {
  background: rgba(109, 40, 217, 0.08);
}



.main-content {
  width: 100%;
  background: var(--card-color);
  min-height: calc(100vh - 100px);
}

.article {
  padding: 24px 24px 20px 24px;
}

.article-header {
  padding: 0;
  border-bottom: none;
  margin-bottom: 24px;
}

.article-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  line-height: 1.2;
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.article-meta {
  display: flex;
  gap: 20px;
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 8px;
}

.article-content {
  padding: 0;
}

.lead {
  font-size: 18px;
  line-height: 1.7;
  color: var(--text-primary);
  margin-bottom: 24px;
  font-weight: 500;
}

.feature-card {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  margin: 24px 0;
  background: #f6f5fd;
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--primary-color);
  color: var(--text-primary);
  align-items: flex-start;
}

.feature-icon {
  font-size: 24px;
  margin-top: 0.1em;
}

.content-body {
  line-height: 1.8;
  color: var(--text-primary);
  font-size: 17px;
}

.content-body pre {
  padding: 16px;
  background: var(--background-color);
  border-radius: var(--border-radius-sm);
  overflow-x: auto;
  margin: 19px 0;
  border: 1px solid rgba(0,0,0,0.08);
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0 0 0;
  background: none;
  border-top: 1px solid rgba(0,0,0,0.08);
  margin-top: 32px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  background-color: rgba(109, 40, 217, 0.1);
  border-radius: var(--border-radius-sm);
  transition: background 0.15s, color 0.15s;
}
.tag:hover {
  background: var(--primary-color);
  color: #fff;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  color: var(--primary-color);
  background: transparent;
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius-sm);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.action-btn:hover {
  background: var(--primary-color);
  color: #fff;
}
.action-btn.is-active {
  background: var(--primary-dark);
  color: #fff;
  border-color: var(--primary-dark);
}

.related {
  margin-top: 40px;
}
.related-title {
  margin: 0 0 13px 0;
  font-size: 18px;
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
  gap: 4px;
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
  padding: 12px 8px;
  color: var(--primary-color);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: background 0.15s, color 0.15s;
}
.related-link:hover {
  background: rgba(109, 40, 217, 0.08);
  color: var(--primary-dark);
}
.related-link .icon {
  transition: transform 0.15s;
}
.related-link:hover .icon {
  transform: translateX(4px);
}

@media (max-width: 900px) {
  .article {
    padding: 24px 16px 16px 16px;
  }
  .header {
    padding: 16px 16px;
  }
}
@media (max-width: 600px) {
  .header {
    padding: 16px 8px;
  }
  .article {
    padding: 16px 8px 8px 8px;
  }
  .article-footer {
    flex-direction: column;
    gap: 12px;
    padding: 16px 0 0 0;
  }
}
</style>
