<template>
    <div>
        <div :id="layout.headerId" v-html="layout.header"></div>
        <main class="esmx-demo-main">
            <article class="esmx-demo-card">
                <section class="esmx-demo-card__source esmx-code">
                    <header class="esmx-code__header">
                        <span class="esmx-code__file">src/app.vue</span>
                    </header>
                    <div class="esmx-code__body">
                        <pre>{{ sourceSnippet }}</pre>
                    </div>
                </section>

                <section class="esmx-demo-card__rendered">
                    <h1 class="esmx-demo-card__title">{{ title }}</h1>

                    <div class="esmx-stat">
                        <div class="esmx-stat__label">Count</div>
                        <div class="esmx-stat__value">{{ count }}</div>
                    </div>

                    <div class="esmx-demo-card__actions">
                        <button
                            type="button"
                            class="esmx-btn esmx-btn--primary"
                            @click="count++"
                        >
                            +
                        </button>
                        <button
                            type="button"
                            class="esmx-btn"
                            @click="count--"
                        >
                            −
                        </button>
                    </div>

                    <div class="esmx-demo-card__tags">
                        <span class="esmx-badge esmx-badge--vue">
                            <span
                                class="esmx-dot esmx-dot--vue"
                                aria-hidden="true"
                            ></span>
                            Vue 2.7
                        </span>
                        <span class="esmx-badge">Rspack</span>
                        <span class="esmx-badge">SSR</span>
                    </div>
                </section>
            </article>

            <footer class="esmx-demo-source">
                source ·
                <code>examples/micro-app/ssr-micro-vue2/src/app.vue</code>
            </footer>
        </main>
        <div :id="layout.footerId" v-html="layout.footer"></div>
    </div>
</template>

<script setup>
import { useRouter } from '@esmx/router-vue';
import { Layout, t } from 'ssr-micro-shared/src/index';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const router = useRouter();
const layout = new Layout({ appId: 'vue2', router });
const count = ref(0);
const title = t(router, 'fwVue2Title');

// The Vue 2.7 idiom the demo is illustrating — `ref()` from the Composition
// API plugin that ships with 2.7, paired with the `<script setup>` syntax.
const sourceSnippet = `<script setup>
import { ref } from 'vue'

const count = ref(0)
${'</scr' + 'ipt>'}

<template>
  <p>Count: {{ count }}</p>
  <button @click="count++">+</button>
  <button @click="count--">−</button>
</template>`;

onMounted(() => layout.mount());
onBeforeUnmount(() => layout.unmount());
</script>
