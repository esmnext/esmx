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
                    <h1 style="font-size: 2rem; font-weight: 800; color: var(--esmx-text-primary); margin-bottom: 12px;">Vue 3 Micro-App</h1>
                    <p style="font-size: 1.125rem; color: var(--esmx-text-secondary); margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">This page is rendered by a Vue 3.5 micro-app with full SSR support.</p>
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
import { onBeforeUnmount, onMounted } from 'vue';

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

onMounted(() => layout.mount());
onBeforeUnmount(() => layout.unmount());
</script>
