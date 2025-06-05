<template>
    <div class="not-found-container">
        <div class="glitch-container">
            <div class="glitch" data-text="404">404</div>
            <div class="glow">404</div>
            <div class="scanlines"></div>
        </div>
        
        <div class="error-content">
            <h1 class="error-title">页面未找到</h1>
            <p class="error-message">看起来您迷失在了数字世界中。<br>您请求的页面可能已被移除或从未存在。</p>
            
            <div class="error-actions">
                <RouterLink to="/" class="home-button">
                    <span class="button-icon">🏠</span>
                    <span class="button-text">返回首页</span>
                </RouterLink>
                
                <button class="report-button" @click="reportError">
                    <span class="button-icon">🔍</span>
                    <span class="button-text">报告问题</span>
                </button>
            </div>
        </div>
        
        <div class="error-decoration">
            <div class="circuit-line line-1"></div>
            <div class="circuit-line line-2"></div>
            <div class="circuit-line line-3"></div>
            <div class="circuit-dot dot-1"></div>
            <div class="circuit-dot dot-2"></div>
            <div class="circuit-dot dot-3"></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue2';

function reportError() {
    alert('感谢您的反馈！我们已记录此问题。');
}
</script>
<style scoped>
.not-found-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    background-color: var(--card-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
}

/* 故障效果 */
.glitch-container {
    position: relative;
    margin-bottom: 2rem;
}

.glitch, .glow {
    font-size: 8rem;
    font-weight: 900;
    line-height: 1;
    position: relative;
    color: var(--primary-color);
    letter-spacing: -0.05em;
}

.glitch {
    position: relative;
}

.glitch::before,
.glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.glitch::before {
    left: 2px;
    text-shadow: -2px 0 var(--accent-color);
    clip: rect(24px, 550px, 90px, 0);
    animation: glitch-anim 3s infinite linear alternate-reverse;
}

.glitch::after {
    left: -2px;
    text-shadow: -2px 0 var(--secondary-color);
    clip: rect(85px, 550px, 140px, 0);
    animation: glitch-anim2 2.5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
    0% {
        clip: rect(42px, 9999px, 44px, 0);
        transform: skew(0.4deg);
    }
    5% {
        clip: rect(12px, 9999px, 59px, 0);
        transform: skew(0.5deg);
    }
    10% {
        clip: rect(48px, 9999px, 29px, 0);
        transform: skew(0.9deg);
    }
    15% {
        clip: rect(42px, 9999px, 73px, 0);
        transform: skew(0.1deg);
    }
    20% {
        clip: rect(63px, 9999px, 27px, 0);
        transform: skew(0.6deg);
    }
    25% {
        clip: rect(34px, 9999px, 55px, 0);
        transform: skew(0.5deg);
    }
    30% {
        clip: rect(86px, 9999px, 73px, 0);
        transform: skew(0.7deg);
    }
    35% {
        clip: rect(20px, 9999px, 20px, 0);
        transform: skew(0.5deg);
    }
    40% {
        clip: rect(26px, 9999px, 60px, 0);
        transform: skew(0.7deg);
    }
    45% {
        clip: rect(25px, 9999px, 66px, 0);
        transform: skew(0.1deg);
    }
    50% {
        clip: rect(57px, 9999px, 98px, 0);
        transform: skew(0.2deg);
    }
    55% {
        clip: rect(5px, 9999px, 46px, 0);
        transform: skew(0.9deg);
    }
    60% {
        clip: rect(82px, 9999px, 31px, 0);
        transform: skew(0.3deg);
    }
    65% {
        clip: rect(54px, 9999px, 27px, 0);
        transform: skew(0.5deg);
    }
    70% {
        clip: rect(28px, 9999px, 99px, 0);
        transform: skew(0.5deg);
    }
    75% {
        clip: rect(45px, 9999px, 69px, 0);
        transform: skew(0.5deg);
    }
    80% {
        clip: rect(23px, 9999px, 85px, 0);
        transform: skew(0.1deg);
    }
    85% {
        clip: rect(54px, 9999px, 84px, 0);
        transform: skew(0.2deg);
    }
    90% {
        clip: rect(45px, 9999px, 47px, 0);
        transform: skew(0.3deg);
    }
    95% {
        clip: rect(37px, 9999px, 20px, 0);
        transform: skew(0.7deg);
    }
    100% {
        clip: rect(4px, 9999px, 91px, 0);
        transform: skew(0.2deg);
    }
}

@keyframes glitch-anim2 {
    0% {
        clip: rect(65px, 9999px, 119px, 0);
        transform: skew(0.3deg);
    }
    5% {
        clip: rect(93px, 9999px, 53px, 0);
        transform: skew(0.2deg);
    }
    10% {
        clip: rect(25px, 9999px, 5px, 0);
        transform: skew(0.9deg);
    }
    15% {
        clip: rect(23px, 9999px, 42px, 0);
        transform: skew(0.2deg);
    }
    20% {
        clip: rect(18px, 9999px, 32px, 0);
        transform: skew(0.8deg);
    }
    25% {
        clip: rect(47px, 9999px, 82px, 0);
        transform: skew(0.4deg);
    }
    30% {
        clip: rect(36px, 9999px, 47px, 0);
        transform: skew(0.3deg);
    }
    35% {
        clip: rect(72px, 9999px, 49px, 0);
        transform: skew(0.5deg);
    }
    40% {
        clip: rect(40px, 9999px, 88px, 0);
        transform: skew(0.7deg);
    }
    45% {
        clip: rect(18px, 9999px, 75px, 0);
        transform: skew(0.3deg);
    }
    50% {
        clip: rect(50px, 9999px, 53px, 0);
        transform: skew(0.6deg);
    }
    55% {
        clip: rect(93px, 9999px, 55px, 0);
        transform: skew(0.2deg);
    }
    60% {
        clip: rect(5px, 9999px, 33px, 0);
        transform: skew(0.4deg);
    }
    65% {
        clip: rect(55px, 9999px, 49px, 0);
        transform: skew(0.5deg);
    }
    70% {
        clip: rect(57px, 9999px, 73px, 0);
        transform: skew(0.1deg);
    }
    75% {
        clip: rect(86px, 9999px, 8px, 0);
        transform: skew(0.2deg);
    }
    80% {
        clip: rect(28px, 9999px, 97px, 0);
        transform: skew(0.3deg);
    }
    85% {
        clip: rect(29px, 9999px, 98px, 0);
        transform: skew(0.9deg);
    }
    90% {
        clip: rect(2px, 9999px, 30px, 0);
        transform: skew(0.5deg);
    }
    95% {
        clip: rect(69px, 9999px, 75px, 0);
        transform: skew(0.7deg);
    }
    100% {
        clip: rect(44px, 9999px, 40px, 0);
        transform: skew(0.7deg);
    }
}

.glow {
    text-shadow: 0 0 10px var(--primary-color), 0 0 20px var(--primary-color), 0 0 30px var(--primary-color);
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    opacity: 0.8;
    animation: glow-pulse 2s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
    from {
        opacity: 0.8;
        text-shadow: 0 0 10px var(--primary-color), 0 0 20px var(--primary-color), 0 0 30px var(--primary-color);
    }
    to {
        opacity: 0.6;
        text-shadow: 0 0 5px var(--primary-color), 0 0 10px var(--primary-color), 0 0 15px var(--primary-color);
    }
}

.scanlines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 10;
}

.scanlines::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: repeating-linear-gradient(
        to bottom,
        transparent 0%,
        rgba(255, 255, 255, 0.05) 0.5%,
        transparent 1%
    );
    animation: scanline 8s linear infinite;
}

@keyframes scanline {
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(100%);
    }
}

/* 错误内容 */
.error-content {
    text-align: center;
    max-width: 600px;
    z-index: 1;
}

.error-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
    position: relative;
    display: inline-block;
}

.error-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 25%;
    width: 50%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
    border-radius: 2px;
}

.error-message {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 2.5rem;
    line-height: 1.6;
}

.error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.home-button, .report-button {
    display: flex;
    align-items: center;
    padding: 0.8rem 1.5rem;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    text-decoration: none;
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
    border: none;
    cursor: pointer;
    font-size: 1rem;
}

.home-button {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
}

.report-button {
    background-color: var(--card-color);
    color: var(--text-primary);
    border: 1px solid rgba(0,0,0,0.1);
}

.home-button::before, .report-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: all 0.6s;
}

.home-button:hover::before, .report-button:hover::before {
    left: 100%;
}

.home-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.report-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    background-color: #f8f9fa;
}

.button-icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
}

/* 装饰元素 */
.error-decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: -1;
}

.circuit-line {
    position: absolute;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    height: 2px;
    opacity: 0.3;
}

.line-1 {
    width: 30%;
    top: 20%;
    left: -5%;
    transform: rotate(30deg);
    animation: circuit-pulse 3s infinite alternate;
}

.line-2 {
    width: 40%;
    bottom: 30%;
    right: -10%;
    transform: rotate(-45deg);
    animation: circuit-pulse 4s infinite alternate-reverse;
}

.line-3 {
    width: 25%;
    bottom: 10%;
    left: 30%;
    transform: rotate(15deg);
    animation: circuit-pulse 5s infinite alternate;
}

.circuit-dot {
    position: absolute;
    background-color: var(--primary-color);
    border-radius: 50%;
    opacity: 0.4;
}

.dot-1 {
    width: 10px;
    height: 10px;
    top: 25%;
    left: 10%;
    animation: dot-pulse 2s infinite alternate;
}

.dot-2 {
    width: 15px;
    height: 15px;
    bottom: 20%;
    right: 15%;
    animation: dot-pulse 3s infinite alternate-reverse;
}

.dot-3 {
    width: 8px;
    height: 8px;
    top: 60%;
    left: 20%;
    animation: dot-pulse 4s infinite alternate;
}

@keyframes circuit-pulse {
    from {
        opacity: 0.2;
    }
    to {
        opacity: 0.5;
    }
}

@keyframes dot-pulse {
    from {
        transform: scale(0.8);
        opacity: 0.3;
    }
    to {
        transform: scale(1.2);
        opacity: 0.6;
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .glitch, .glow {
        font-size: 6rem;
    }
    
    .error-title {
        font-size: 2rem;
    }
    
    .error-message {
        font-size: 1rem;
    }
    
    .error-actions {
        flex-direction: column;
        gap: 1rem;
    }
    
    .home-button, .report-button {
        width: 100%;
        justify-content: center;
    }
}
</style>
