<template>
    <div>
        <div :id="layout.headerId" v-html="layout.header"></div>
        <div :style="mainStyle">
            <div style="max-width: 800px; margin: 0 auto;">
                <div :style="cardStyle">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;" role="img" aria-label="Vue 3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                            <path d="M16 2L2 28h8.4L16 17.6 21.6 28H30L16 2z" fill="#fff"/>
                            <path d="M16 2l-5.6 9.6L16 19.6l5.6-8L16 2z" fill="#42b883" opacity="0.6"/>
                        </svg>
                    </div>
                    <h1 style="font-size: 2rem; font-weight: 800; color: var(--esmx-text-primary); margin-bottom: 16px;">Vue 3 Micro-App</h1>
                    <div style="max-width:300px;margin:0 auto;">
                        <input type="range" min="1" max="30" v-model.number="n" style="width:100%;margin-bottom:16px;" />
                        <div style="font-size:2rem;font-weight:800;color:var(--esmx-text-primary);margin-bottom:12px;">{{ n }} → {{ label }}</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;">
                            <span v-for="i in 15" :key="i" :style="{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                background: i % 15 === 0 ? '#8b5cf6' : i % 3 === 0 ? '#3b82f6' : i % 5 === 0 ? '#10b981' : 'var(--esmx-bg-main)',
                                color: i % 15 === 0 || i % 3 === 0 || i % 5 === 0 ? '#fff' : 'var(--esmx-text-muted)'
                            }">{{ i }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div :id="layout.footerId" v-html="layout.footer"></div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from '@esmx/router-vue';
import { useHead } from '@unhead/vue';
import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const router = useRouter();
const layout = new Layout({ appId: 'vue3', router });
const mainStyle = `margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));`;
const cardStyle =
    'background: var(--esmx-bg-card); border-radius: 16px; padding: 48px; border: 1px solid var(--esmx-border); text-align: center;';

useHead({
    title: 'Vue 3 Micro-App',
    meta: [
        {
            name: 'description',
            content:
                'This page is rendered by a Vue 3.5 micro-app with full SSR support.'
        }
    ]
});

const n = ref(1);
const label = computed(() =>
    n.value % 15 === 0
        ? 'FizzBuzz'
        : n.value % 3 === 0
          ? 'Fizz'
          : n.value % 5 === 0
            ? 'Buzz'
            : String(n.value)
);

onMounted(() => layout.mount());
onBeforeUnmount(() => layout.unmount());
</script>
