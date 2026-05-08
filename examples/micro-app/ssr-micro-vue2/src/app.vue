<template>
    <div>
        <div v-html="layout.header"></div>
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
                        background: linear-gradient(135deg, #42b883, #369870);
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 700;
                        font-size: 24px;
                        margin: 0 auto 24px;
                        box-shadow: 0 10px 15px -3px rgba(66, 184, 131, 0.3);
                    ">V2</div>
                    <h1 style="
                        font-size: 2rem;
                        font-weight: 800;
                        color: #0f172a;
                        margin-bottom: 12px;
                    ">Vue 2 Micro-App</h1>
                    <p style="
                        font-size: 1.125rem;
                        color: #64748b;
                        margin-bottom: 32px;
                        max-width: 500px;
                        margin-left: auto;
                        margin-right: auto;
                    ">This page is rendered by a Vue 2.7 micro-app using the Composition API, integrated via Esmx Router.</p>
                    <div style="
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 24px;
                        background: #ecfdf5;
                        border-radius: 8px;
                        color: #065f46;
                        font-family: monospace;
                        font-size: 14px;
                    ">
                        <span></span> ssr-micro-vue2
                    </div>
                    <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 14px; margin: 0;">Vue 2.7 with Composition API support</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-html="layout.footer"></div>
    </div>
</template>

<script>
import { useRouter } from '@esmx/router-vue';
import { Layout } from 'ssr-micro-shared/src/layout';
import { onBeforeUnmount, onMounted } from 'vue';

export default {
    setup() {
        const router = useRouter();
        const layout = new Layout({ appId: 'vue2', router });

        onMounted(() => layout.mount());
        onBeforeUnmount(() => layout.unmount());

        return { layout };
    }
};
</script>
