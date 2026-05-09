<template>
    <div class="app">
        <Header />
        <main class="main">
            <div class="container">
                <div class="card">
                    <div class="badge">V2</div>
                    <h1 class="title">Vue 2 Micro-App</h1>
                    <p class="desc">This page is rendered by a Vue 2.7 micro-app.</p>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import Header from './header.vue';
</script>

<style scoped>
*, *::before, *::after {
    box-sizing: border-box;
}

.main {
    margin-left: 260px;
    min-height: 100vh;
    background: #f8fafc;
    padding: 32px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

.card {
    background: white;
    border-radius: 16px;
    padding: 48px;
    border: 1px solid #e2e8f0;
    text-align: center;
}

.badge {
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
}

.title {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 12px;
}

.desc {
    font-size: 1.125rem;
    color: #64748b;
    margin-bottom: 32px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}
</style>
