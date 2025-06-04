<template>
    <div>
        <h1>Home</h1>
        <ul>
            <li v-for="id in 100">
                <RouterLink :to="`/news/${id}`" />
            </li>
        </ul>
    </div>
</template>
<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue2';
</script>
<style scoped>
h3 {
    font-weight: 500;
    top: -10px;
}

.color {
    color: burlywood;
}
</style>
