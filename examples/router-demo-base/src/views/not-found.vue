<script setup lang="ts"></script>

<template>
    <div>
        <h3 class="color">404</h3>
        <router-view></router-view>
    </div>
</template>

<style scoped>
h3 {
    font-weight: 500;
    top: -10px;
}

.color {
    color: green;
}
</style>
