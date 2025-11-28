<template>
    <div :class="['view-layer', layerSlideDir, { showing }]">
        <div class="layer-backdrop" @click.stop="routerAct('closeLayer')" />
        <div class="layer-content">
            <div class="btns">
                <button class="layer-back" @click="routerAct('back')" v-if="len > 1">←</button>
                <RouterLink :to="toSame('up')" v-if="layerSlideDir !== 'up'" type="pushLayer" title="Slide from up">☝︎</RouterLink>
                <RouterLink :to="toSame('right')" v-if="layerSlideDir !== 'right'" type="pushLayer" title="Slide from right">☞</RouterLink>
                <RouterLink :to="toSame('down')" v-if="layerSlideDir !== 'down'" type="pushLayer" title="Slide from down">☟</RouterLink>
                <RouterLink :to="toSame('left')" v-if="layerSlideDir !== 'left'" type="pushLayer" title="Slide from left">☜</RouterLink>
                <button title="Current Route" @click="showRouteInfo = true">ℹ</button>
                <button @click="routerAct('closeLayer')">×</button>
            </div>
            <RouterView />
        </div>
        <RouteInfoModal :show="showRouteInfo" @close="showRouteInfo = false" />
    </div>
</template>

<script lang="ts" setup>
import { RouteLocationInput } from '@esmx/router';
import { RouterLink, RouterView, useRoute, useRouter } from '@esmx/router-vue';
import { onMounted, ref, watch } from 'vue';
import RouteInfoModal from '../components/route-info-modal.vue';

const $router = useRouter();
const $route = useRoute();

const layerSlideDir = $router.context.layerSlideDir || 'up';

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

const toSame = (dir: string): RouteLocationInput => ({
    path: $route.fullPath,
    layer: {
        routerOptions: {
            rootStyle: {
                position: 'absolute'
            },
            context: {
                ...$router.context,
                layerSlideDir: dir
            }
        }
    }
});
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
    transition: opacity var(--duration-normal) ease-out;
    opacity: 0;
}

.up { --bg-deg: 180deg; --translate: 0, 100%; }
.right { --bg-deg: 270deg; --translate: -100%, 0; }
.down { --bg-deg: 0deg; --translate: 0, -100%; }
.left { --bg-deg: 90deg; --translate: 100%, 0; }

.up {
    align-items: flex-end;
    justify-content: center;
}
.right {
    align-items: center;
    justify-content: flex-start;
}
.down {
    align-items: flex-start;
    justify-content: center;
}
.left {
    align-items: center;
    justify-content: flex-end;
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
    background: linear-gradient(var(--bg-deg), #0008, #0000);
    mask: linear-gradient(var(--bg-deg), red 20%, #0000 calc(100% - var(--player-height)));
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
    overflow: auto;
    overscroll-behavior: contain;
    transition: opacity var(--duration-slow) ease-out, transform var(--duration-normal) ease-out;
    opacity: 0;
    transform: translate(var(--translate));
}

.up .layer-content {
    margin-bottom: var(--player-height);
}

.left .layer-content,
.right .layer-content {
    height: 100%;
    max-height: 100%;
}

.down .layer-content {
    border-radius: 0 0 var(--border-radius-xl) var(--border-radius-xl);
}
.left .layer-content {
    border-radius: var(--border-radius-xl) 0 0 var(--border-radius-xl);
}
.right .layer-content {
    border-radius: 0 var(--border-radius-xl) var(--border-radius-xl) 0;
}

.showing .layer-content {
    opacity: 1;
    transform: translate(0);
}

.btns {
    position: absolute;
    top: var(--spacing-4);
    left: 0;
    padding: 0 var(--spacing-4);
    display: flex;
    gap: var(--spacing-2);
    z-index: 10;
    justify-content: flex-end;
    width: 100%;
}

.btns > * {
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

.layer-back {
    margin-right: auto;
}

.btns > *:hover {
    background: var(--bg-tertiary);
    transform: scale(1.1);
}
</style>
