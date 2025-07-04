<template>
    <div class="bubble-bg">
        <slot></slot>
    </div>
</template>

<style scoped>
.bubble-bg {
    position: relative;
    color: white;
    background: linear-gradient(135deg, var(--music-primary) 0%, var(--music-secondary) 100%);
}

.bubble-bg::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150%;
    aspect-ratio: 1 / 1;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="white"><circle cx="20" cy="20" r="2" opacity=".1"/><circle cx="80" cy="40" r="1.5" opacity=".15"/><circle cx="20" cy="55" r="2" opacity=".05"/><circle cx="40" cy="80" r="1" opacity=".1"/></svg>');
    background-size: 250px 250px;
    background-position: 0 0;
    transform-origin: 50% 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    animation: float 15s infinite linear, rotate 600s infinite linear;
    pointer-events: none;
}

@keyframes float {
    to { background-position: 250px 250px; }
}
@keyframes rotate {
    to { transform: translate(-50%, -50%) rotate(-360deg); }
}
</style>
