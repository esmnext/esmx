<template>
    <div class="view-layer" :class="{ showing }">
        <div class="layer-backdrop" @click="routerAct('closeLayer')" />
        <div class="layer-content">
            <button class="layer-back" @click="routerAct('back')" v-if="len > 1">←</button>
            <button class="info" title="Current Route" @click="showRouteInfo = true">ℹ</button>
            <button class="layer-close" @click="routerAct('closeLayer')">×</button>
            <router-view />
        </div>
        <RouteInfoModal :show="showRouteInfo" @close="showRouteInfo = false" />
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from '@esmx/router-vue';
import { onMounted, ref, watch } from 'vue';
import RouteInfoModal from './route-info-modal.vue';
const $router = useRouter();
const $route = useRoute();

const len = ref($router.navigation.length);
watch(
    () => $route.fullPath,
    () => {
        len.value = $router.navigation.length;
    }
);

const showRouteInfo = ref(false);

const showing = ref(false);
onMounted(() => setTimeout(() => (showing.value = true)));
const routerAct = async (type: 'closeLayer' | 'back') => {
    if (!showing.value) return;
    if (type === 'back' && $router.navigation.length > 1) {
        $router.back();
        return;
    }
    const animationDuration = (() => {
        try {
            let durationStr = getComputedStyle(
                document.documentElement
            ).getPropertyValue('--duration-slow');
            if (durationStr.startsWith('.')) durationStr = '0' + durationStr;
            let duration = Number.parseFloat(durationStr);
            if (!durationStr.endsWith('ms')) duration *= 1000;
            return duration || 400;
        } catch {
            return 400; // 默认值
        }
    })();
    showing.value = false;
    await new Promise((s) => setTimeout(s, animationDuration));
    $router[type]();
};
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
    transition: opacity var(--duration-normal) ease-out;
    opacity: 0;
}

.view-layer.showing {
    opacity: 1;
}

.layer-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, #0008, #0000);
    mask: linear-gradient(red 20%, #0000 calc(100% - var(--player-height)));
    cursor: pointer;
    animation: blur-in 1s forwards;
}

@keyframes blur-in {
    from { backdrop-filter: blur(0px); }
    to { backdrop-filter: blur(8px); }
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
    overscroll-behavior: contain;
    transition: opacity var(--duration-slow) ease-out, transform var(--duration-normal) ease-out;
    opacity: 0;
    transform: translateY(100%);
}

.showing .layer-content {
    opacity: 1;
    transform: translateY(0);
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
</style>
