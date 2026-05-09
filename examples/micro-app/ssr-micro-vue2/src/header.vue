<template>
    <div class="sidebar">
        <div class="brand">Esmx Hub</div>
        <nav class="nav">
            <a
                v-for="item in navItems"
                :key="item.path"
                :href="item.link.attributes.href"
                :class="['nav-item', { active: item.link.isActive }]"
                @click="item.link.navigate"
            >
                <span class="nav-icon">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
            </a>
        </nav>
    </div>
</template>

<script setup>
import { useLink } from '@esmx/router-vue';

const NAV_ITEMS = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/html/', label: 'HTML', icon: 'H' },
    { path: '/vue2/', label: 'Vue 2', icon: 'V2' },
    { path: '/vue3/', label: 'Vue 3', icon: 'V3' },
    { path: '/react/', label: 'React', icon: 'R' }
];

const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    link: useLink({ to: item.path, type: 'push', exact: 'route' })
}));
</script>

<style scoped>
.sidebar {
    width: 260px;
    background: #0f172a;
    color: white;
    padding: 24px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    z-index: 100;
    display: flex;
    flex-direction: column;
}

.brand {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid #334155;
    color: #fff;
}

.nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    text-decoration: none;
    color: #94a3b8;
    background: transparent;
    border-left: 3px solid transparent;
    cursor: pointer;
    font-weight: 400;
}

.nav-item:hover {
    background: rgba(59, 130, 246, 0.08);
    color: #cbd5e1;
}

.nav-item.active {
    color: #fff;
    background: rgba(59, 130, 246, 0.15);
    border-left-color: #3b82f6;
    font-weight: 600;
}

.nav-icon {
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
}
</style>
