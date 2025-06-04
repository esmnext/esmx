<template>
    <div id="app">
        <nav>            
            <router-link to="/">首页</router-link>
            <router-link to="/about">404</router-link>
            <router-link to="https://github.com/esmnext/esmx/tree/master/examples/router-demo-base">Github</router-link>
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
