<template>
    <div>
        <div :id="layout.headerId" v-html="layout.header"></div>
        <div style="margin-left: 260px; min-height: 100vh; background: #f8fafc; padding: 32px;">
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 48px;
                    border: 1px solid #e2e8f0;
                    text-align: center;
                ">
                    <div style="
                        width: 64px;
                        height: 64px;
                        background: linear-gradient(135deg, #3b82f6, #2563eb);
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 700;
                        font-size: 24px;
                        margin: 0 auto 24px;
                    ">V3</div>
                    <h1 style="
                        font-size: 2rem;
                        font-weight: 800;
                        color: #0f172a;
                        margin-bottom: 12px;
                    ">Vue 3 Micro-App</h1>
                    <p style="
                        font-size: 1.125rem;
                        color: #64748b;
                        margin-bottom: 32px;
                        max-width: 500px;
                        margin-left: auto;
                        margin-right: auto;
                    ">This page is rendered by a Vue 3.5 micro-app with full SSR support.</p>
                </div>
            </div>
        </div>
        <div :id="layout.footerId" v-html="layout.footer"></div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from '@esmx/router-vue';
import { Layout } from 'ssr-micro-shared/src/layout';
import { nextTick, onBeforeUnmount, onMounted } from 'vue';

const router = useRouter();
const layout = new Layout({ appId: 'vue3', router });

onMounted(() => {
    nextTick(() => layout.mount());
});
onBeforeUnmount(() => layout.unmount());
</script>
