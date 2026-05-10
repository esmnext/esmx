<template>
    <div>
        <div :id="layout.headerId" v-html="layout.header"></div>
        <div :id="layout.appId + '-main'" :style="mainStyle">
            <div style="max-width: 800px; margin: 0 auto;">
                <div :style="cardStyle">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #42b883, #369870); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;" role="img" aria-label="Vue 2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                            <path d="M16 2L2 28h8.4L16 17.6 21.6 28H30L16 2z" fill="#fff"/>
                            <path d="M16 2l-5.6 9.6L16 19.6l5.6-8L16 2z" fill="#35495e" opacity="0.8"/>
                        </svg>
                    </div>
                    <h1 style="font-size: 2rem; font-weight: 800; color: var(--esmx-text-primary); margin-bottom: 12px;">Vue 2 Micro-App</h1>
                    <p style="font-size: 1.125rem; color: var(--esmx-text-secondary); margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">This page is rendered by a Vue 2.7 micro-app.</p>
                </div>
            </div>
        </div>
        <div :id="layout.footerId" v-html="layout.footer"></div>
    </div>
</template>

<script setup>
import { useRouter } from '@esmx/router-vue';
import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';
import { useHead } from 'unhead';
import { getCurrentInstance, onBeforeUnmount, onMounted } from 'vue';

const router = useRouter();
const layout = new Layout({ appId: 'vue2', router });
const mainStyle = `margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));`;
const cardStyle =
    'background: var(--esmx-bg-card); border-radius: 16px; padding: 48px; border: 1px solid var(--esmx-border); text-align: center;';

const instance = getCurrentInstance();
const head = instance.proxy.$root.$head;

const headEntry = useHead(head, {
    title: 'Vue 2 Micro-App',
    meta: [
        {
            name: 'description',
            content: 'This page is rendered by a Vue 2.7 micro-app.'
        }
    ]
});

onMounted(() => layout.mount());

onBeforeUnmount(() => {
    headEntry.dispose();
    layout.unmount();
});
</script>
