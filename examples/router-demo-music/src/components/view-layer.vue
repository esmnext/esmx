<template>
    <div class="view-layer">
        <div class="layer-backdrop" @click="$router.back()" />
        <div class="layer-content">
            <button class="layer-close" @click="$router.back()">×</button>
            <router-view />
        </div>
    </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.view-layer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-modal);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn var(--duration-normal) ease-out;
}

.layer-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--overlay-color);
    backdrop-filter: blur(8px);
    cursor: pointer;
}

.layer-content {
    position: relative;
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-xl);
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    animation: slideUp var(--duration-normal) ease-out;
}

.layer-close {
    position: absolute;
    top: var(--spacing-4);
    right: var(--spacing-4);
    z-index: 10;
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: var(--border-radius-full);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    line-height: 1;
    transition: all var(--duration-fast);
}

.layer-close:hover {
    background: var(--bg-tertiary);
    transform: scale(1.1);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
