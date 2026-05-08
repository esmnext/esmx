<template>
    <div>
        <div v-html="header"></div>
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
                        box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
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
                    ">This page is rendered by a Vue 3.5 micro-app with full SSR support, script setup syntax, and modern tooling.</p>
                    <div style="
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 24px;
                        background: #eff6ff;
                        border-radius: 8px;
                        color: #1e40af;
                        font-family: monospace;
                        font-size: 14px;
                    ">
                        <span></span> ssr-micro-vue3
                    </div>
                    <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 14px; margin: 0;">Vue 3.5 with Composition API and SSR</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-html="footer"></div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from '@esmx/router-vue';
import { useLayout } from 'ssr-micro-shared/src/layout';
import { computed, onBeforeUnmount, onMounted } from 'vue';

const router = useRouter();
const layout = useLayout({ appId: 'vue3', router });

const header = computed(() => layout.header);
const footer = computed(() => layout.footer);

onMounted(() => layout.mount());
onBeforeUnmount(() => layout.unmount());
</script>
