<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Esmx 快速开始</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file 示例组件
 * @description 展示一个带有自动更新时间的页面标题，用于演示 Esmx 框架的基本功能
 */

import { onMounted, onUnmounted, ref } from 'vue';

// 当前时间，每秒更新一次
const time = ref(new Date().toISOString());
let timer: NodeJS.Timeout;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date().toISOString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>