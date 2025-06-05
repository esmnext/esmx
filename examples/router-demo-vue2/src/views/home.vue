<template>
    <div class="home-container">
        <div class="hero-section">
            <h1 class="glitch-title" data-text="Esmx Router">Esmx Router</h1>
            <p class="hero-subtitle">探索下一代路由体验</p>
            <div class="hero-decoration">
                <div class="circle"></div>
                <div class="square"></div>
                <div class="triangle"></div>
            </div>
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
                    <RouterLink :to="{
                        path: `/news/${id}`,
                        state: { id }
                    }" class="card-link">
                        <span class="link-text">查看详情</span>
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
    position: relative;
    padding: 4rem 2rem;
    margin-bottom: 3rem;
    background: linear-gradient(120deg, var(--primary-dark), var(--primary-color));
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    min-height: 300px;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.1;
}

.glitch-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0 0 1rem;
    position: relative;
    text-shadow: 0 0 10px rgba(255,255,255,0.3);
    animation: glitch 5s infinite;
}

.glitch-title::before,
.glitch-title::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.glitch-title::before {
    left: 2px;
    text-shadow: -2px 0 var(--accent-color);
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
}

.glitch-title::after {
    left: -2px;
    text-shadow: -2px 0 var(--secondary-color);
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim2 5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
    0% {
        clip: rect(31px, 9999px, 94px, 0);
        transform: skew(0.85deg);
    }
    5% {
        clip: rect(70px, 9999px, 71px, 0);
        transform: skew(0.17deg);
    }
    10% {
        clip: rect(75px, 9999px, 92px, 0);
        transform: skew(0.4deg);
    }
    15% {
        clip: rect(56px, 9999px, 18px, 0);
        transform: skew(0.22deg);
    }
    20% {
        clip: rect(46px, 9999px, 46px, 0);
        transform: skew(0.2deg);
    }
    25% {
        clip: rect(77px, 9999px, 97px, 0);
        transform: skew(0.44deg);
    }
    30% {
        clip: rect(81px, 9999px, 98px, 0);
        transform: skew(0.07deg);
    }
    35% {
        clip: rect(31px, 9999px, 88px, 0);
        transform: skew(0.8deg);
    }
    40% {
        clip: rect(85px, 9999px, 91px, 0);
        transform: skew(0.28deg);
    }
    45% {
        clip: rect(40px, 9999px, 25px, 0);
        transform: skew(0.39deg);
    }
    50% {
        clip: rect(93px, 9999px, 79px, 0);
        transform: skew(0.7deg);
    }
    55% {
        clip: rect(3px, 9999px, 57px, 0);
        transform: skew(0.32deg);
    }
    60% {
        clip: rect(30px, 9999px, 4px, 0);
        transform: skew(0.83deg);
    }
    65% {
        clip: rect(69px, 9999px, 56px, 0);
        transform: skew(0.76deg);
    }
    70% {
        clip: rect(88px, 9999px, 39px, 0);
        transform: skew(0.2deg);
    }
    75% {
        clip: rect(18px, 9999px, 53px, 0);
        transform: skew(0.85deg);
    }
    80% {
        clip: rect(95px, 9999px, 59px, 0);
        transform: skew(0.15deg);
    }
    85% {
        clip: rect(72px, 9999px, 67px, 0);
        transform: skew(0.12deg);
    }
    90% {
        clip: rect(50px, 9999px, 80px, 0);
        transform: skew(0.1deg);
    }
    95% {
        clip: rect(2px, 9999px, 96px, 0);
        transform: skew(0.01deg);
    }
    100% {
        clip: rect(53px, 9999px, 5px, 0);
        transform: skew(0.01deg);
    }
}

@keyframes glitch-anim2 {
    0% {
        clip: rect(65px, 9999px, 100px, 0);
        transform: skew(0.54deg);
    }
    5% {
        clip: rect(93px, 9999px, 62px, 0);
        transform: skew(0.89deg);
    }
    10% {
        clip: rect(70px, 9999px, 51px, 0);
        transform: skew(0.25deg);
    }
    15% {
        clip: rect(57px, 9999px, 45px, 0);
        transform: skew(0.39deg);
    }
    20% {
        clip: rect(89px, 9999px, 44px, 0);
        transform: skew(0.56deg);
    }
    25% {
        clip: rect(42px, 9999px, 98px, 0);
        transform: skew(0.33deg);
    }
    30% {
        clip: rect(29px, 9999px, 88px, 0);
        transform: skew(0.7deg);
    }
    35% {
        clip: rect(4px, 9999px, 41px, 0);
        transform: skew(0.71deg);
    }
    40% {
        clip: rect(26px, 9999px, 100px, 0);
        transform: skew(0.59deg);
    }
    45% {
        clip: rect(59px, 9999px, 3px, 0);
        transform: skew(0.76deg);
    }
    50% {
        clip: rect(10px, 9999px, 86px, 0);
        transform: skew(0.46deg);
    }
    55% {
        clip: rect(34px, 9999px, 25px, 0);
        transform: skew(0.32deg);
    }
    60% {
        clip: rect(54px, 9999px, 11px, 0);
        transform: skew(0.07deg);
    }
    65% {
        clip: rect(82px, 9999px, 59px, 0);
        transform: skew(0.89deg);
    }
    70% {
        clip: rect(97px, 9999px, 47px, 0);
        transform: skew(0.09deg);
    }
    75% {
        clip: rect(100px, 9999px, 95px, 0);
        transform: skew(0.11deg);
    }
    80% {
        clip: rect(66px, 9999px, 66px, 0);
        transform: skew(0.75deg);
    }
    85% {
        clip: rect(97px, 9999px, 82px, 0);
        transform: skew(0.31deg);
    }
    90% {
        clip: rect(52px, 9999px, 35px, 0);
        transform: skew(0.07deg);
    }
    95% {
        clip: rect(12px, 9999px, 23px, 0);
        transform: skew(0.8deg);
    }
    100% {
        clip: rect(78px, 9999px, 81px, 0);
        transform: skew(0.12deg);
    }
}

.hero-subtitle {
    font-size: 1.2rem;
    font-weight: 300;
    margin-bottom: 2rem;
    opacity: 0.9;
    max-width: 600px;
}

.hero-decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
    pointer-events: none;
}

.circle, .square, .triangle {
    position: absolute;
    opacity: 0.2;
}

.circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: var(--accent-color);
    top: -30px;
    right: 10%;
    animation: float 8s ease-in-out infinite;
}

.square {
    width: 100px;
    height: 100px;
    background: var(--secondary-color);
    bottom: -20px;
    left: 15%;
    transform: rotate(45deg);
    animation: float 10s ease-in-out infinite reverse;
}

.triangle {
    width: 0;
    height: 0;
    border-left: 80px solid transparent;
    border-right: 80px solid transparent;
    border-bottom: 140px solid var(--primary-light);
    top: 40%;
    right: -40px;
    animation: float 12s ease-in-out infinite 1s;
}

@keyframes float {
    0% {
        transform: translateY(0) rotate(0deg);
    }
    50% {
        transform: translateY(-20px) rotate(5deg);
    }
    100% {
        transform: translateY(0) rotate(0deg);
    }
}

/* 新闻部分 */
.news-container {
    padding: 0 1rem;
}

.section-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--text-primary);
    position: relative;
    display: inline-block;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), transparent);
    border-radius: 2px;
}

.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.news-card {
    position: relative;
    background-color: var(--card-color);
    border-radius: var(--border-radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0,0,0,0.05);
}

.news-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
}

.news-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
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
    
    .glitch-title {
        font-size: 2.5rem;
    }
    
    .news-grid {
        grid-template-columns: 1fr;
    }
}
</style>
