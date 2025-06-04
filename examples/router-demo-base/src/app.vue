<template>
    <div id="app">
        <nav>            
            <router-link to="/">首页</router-link>
            <router-link to="/test">测试</router-link>
            <router-link to="/test1">动态组件</router-link>
            <router-link to="/asdfasdfasdf">404</router-link>
            <router-link to="https://baidu.com?a=10&a=20" type="replaceWindow">404</router-link>
        </nav>
        <router-view />
        <div>
            <h2>Route</h2>
            <pre>{{ $route }}</pre>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue2';
</script>
