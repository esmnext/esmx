<template>
    <div>
        <div :id="layout.headerId" v-html="layout.header"></div>
        <div id="esmx-main" :style="mainStyle">
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: white; border-radius: 16px; padding: 48px; border: 1px solid #e2e8f0; text-align: center;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #42b883, #369870); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px; margin: 0 auto 20px;" role="img" aria-label="Vue 2">V2</div>
                    <h1 style="font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Vue 2 Micro-App</h1>
                    <p style="font-size: 1.125rem; color: #64748b; margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">This page is rendered by a Vue 2.7 micro-app.</p>
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
const mainStyle = `margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; background: #f8fafc; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));`;

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
