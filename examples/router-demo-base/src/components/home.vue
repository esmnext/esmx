<script setup lang="ts"></script>

<template>
    <div>
        <h3 class="color">Home</h3>
        <router-view></router-view>
    </div>
</template>

<style scoped>
h3 {
    font-weight: 500;
    top: -10px;
}

.color {
    color: burlywood;
}
</style>
