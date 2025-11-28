<template>
    <div>
        <p>Count: {{ count }}</p>
        <button @click="count++">这是自己服务的组件，点击我试试。</button>
    </div>
</template>
<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>
<style lang="less" scoped>
button {
    padding: 5px 10px;
    border-radius: 5px;
    margin: 0;
}
</style>