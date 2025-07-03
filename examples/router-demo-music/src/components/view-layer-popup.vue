<template>
    <div class="view-layer">
        <div class="layer-backdrop" @click="$router.closeLayer()" />
        <div class="layer-content">
            <button class="layer-back" @click="$router.back()" v-if="$router.navigation.length">←</button>
            <button class="info" title="Current Route" @click="showRouteInfo = true">ℹ</button>
            <button class="layer-close" @click="$router.closeLayer()">×</button>
            <router-view />
        </div>
        <RouteInfoModal :show="showRouteInfo" @close="showRouteInfo = false" />
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import RouteInfoModal from './route-info-modal.vue';
import { useRouter } from '@esmx/router-vue';
const $router = useRouter();

const showRouteInfo = ref(false);

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
    align-items: flex-end;
    justify-content: center;
    animation: fadeIn var(--duration-normal) ease-out;
}

.layer-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, #0008, #0000);
    /* backdrop-filter: blur(8px); */
    cursor: pointer;
}

.layer-content {
    position: relative;
    background: var(--card-color);
    border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
    box-shadow: var(--shadow-xl);
    width: 61.8vw;
    height: 70vh;
    max-height: 80vh;
    margin-bottom: var(--player-height);
    overflow: auto;
    animation: slideUpFromBottom var(--duration-slow) ease-out, fadeIn var(--duration-normal) ease-out;
    overscroll-behavior: contain;
}

.layer-close, .layer-back, .info {
    position: absolute;
    top: var(--spacing-4);
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
    user-select: none;
    border: 1px solid var(--border-light);
}

.layer-close {
    right: var(--spacing-4);
}

.info {
    right: calc(var(--spacing-4) * 4);
}

.layer-back {
    left: var(--spacing-4);
}

:is(.layer-close, .layer-back, .info):hover {
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

@keyframes slideUpFromBottom {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}
</style>
