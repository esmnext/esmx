<template>
    <div>
        <div :id="layout.headerId" v-html="layout.header"></div>
        <div :style="mainStyle">
            <div style="max-width: 800px; margin: 0 auto;">
                <div :style="cardStyle">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #42b883, #369870); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;" role="img" aria-label="Vue 2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                            <path d="M16 2L2 28h8.4L16 17.6 21.6 28H30L16 2z" fill="#fff"/>
                            <path d="M16 2l-5.6 9.6L16 19.6l5.6-8L16 2z" fill="#35495e" opacity="0.8"/>
                        </svg>
                    </div>
                    <h1 style="font-size: 2rem; font-weight: 800; color: var(--esmx-text-primary); margin-bottom: 16px;">Vue 2 Micro-App</h1>
                    <div style="max-width:360px;margin:0 auto;">
                        <div style="display:flex;gap:8px;margin-bottom:12px;">
                            <input v-model="newTodo" @keyup.enter="add" placeholder="Add a todo..." style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--esmx-border);background:var(--esmx-bg-main);color:var(--esmx-text-primary);">
                            <button @click="add" style="padding:8px 16px;background:var(--esmx-link);color:#fff;border:none;border-radius:8px;cursor:pointer;">Add</button>
                        </div>
                        <ul v-if="todos.length" style="list-style:none;text-align:left;padding:0;">
                            <li v-for="(todo, i) in todos" :key="i" @click="remove(i)" style="padding:8px 12px;cursor:pointer;border-radius:6px;margin-bottom:4px;background:var(--esmx-bg-main);color:var(--esmx-text-primary);transition:0.2s;">{{ todo }}</li>
                        </ul>
                        <p v-else style="color:var(--esmx-text-muted);font-size:0.9rem;">No todos yet — click items to remove</p>
                    </div>
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
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';

const router = useRouter();
const layout = new Layout({ appId: 'vue2', router });
const newTodo = ref('');
const todos = ref([]);
const add = () => {
    const t = newTodo.value.trim();
    if (!t) return;
    todos.value.push(t);
    newTodo.value = '';
};
const remove = (i) => todos.value.splice(i, 1);
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
