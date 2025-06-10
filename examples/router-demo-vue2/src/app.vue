<template>
    <div class="app" :class="{ 'is-layer': $router.isLayer }">
        <view-page v-if="!$router.isLayer" />
        <view-layer v-else />
    </div>
</template>
<script lang="ts" setup>
import ViewPage from './components/view-page.vue';
import ViewLayer from './components/view-layer.vue';
</script>
<style>
/* 全局样式 */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

:root {
    --primary-color: #6d28d9;
    --primary-light: #8b5cf6;
    --primary-dark: #5b21b6;
    --secondary-color: #10b981;
    --accent-color: #f97316;
    --background-color: #f8fafc;
    --card-color: #ffffff;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 24px;
    --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
}

body {
    font-family: 'Space Grotesk', sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
    color: var(--text-primary);
    min-height: 100vh;
}

</style>
<style scoped>
.app {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
