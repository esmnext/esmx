<template>
    <div>
        <h1>Home</h1>
        <ul>
            <li v-for="id in 10">
                <RouterLink :to="`/news/${id}`">{{ id }}</RouterLink>
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
