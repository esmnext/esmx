<template>
    <div id="app" class="app" :class="{ 'isLayer': $router.isLayer }">
        <header>
            <button @click="$router.back()">back</button>
            <button @click="$router.go(-1)">go(-1)</button>
            <h1>弹窗路由测试</h1>
            <button @click="$router.go(1)">go(1)</button>
            <button @click="$router.closeLayer()">closeAll</button>
            <button @click="$router.closeLayer({ descendantStrategy: 'hoisting' })">closeSelf</button>
        </header>

        <div v-if="!$router.isLayer">
            <router-link to="/xxx">/xxx</router-link>
            <router-link to="xxx">xxx</router-link>
            <router-link to="./xxx">./xxx</router-link>
            <router-link to="../xxx">../xxx</router-link>
            <router-link to="//xxx">//xxx</router-link>
            <router-link to=".">.</router-link>
            <router-link to="..">..</router-link>
            <router-link to="https://xxx">https://xxx</router-link>

            <br/>

            <router-link to="/xxx/">/xxx/</router-link>
            <router-link to="xxx/">xxx/</router-link>
            <router-link to="./xxx/">./xxx/</router-link>
            <router-link to="../xxx/">../xxx/</router-link>
            <router-link to="//xxx/">//xxx/</router-link>
            <router-link to="./">./</router-link>
            <router-link to="../">../</router-link>
            <router-link to="https://xxx/">https://xxx/</router-link>

            <br/>

            ?a=&b=1&b=2&c#h:
            <router-link to="/xxx?a=&b=1&b=2&c#h">/xxx?</router-link>
            <router-link to="xxx?a=&b=1&b=2&c#h">xxx?</router-link>
            <router-link to="./xxx?a=&b=1&b=2&c#h">./xxx?</router-link>
            <router-link to="../xxx?a=&b=1&b=2&c#h">../xxx?</router-link>
            <router-link to="//xxx?a=&b=1&b=2&c#h">//xxx?</router-link>
            <router-link to="?a=&b=1&b=2&c#h">?</router-link>
            <router-link to=".?a=&b=1&b=2&c#h">.?</router-link>
            <router-link to="..?a=&b=1&b=2&c#h">..?</router-link>
            <router-link to="./?a=&b=1&b=2&c#h">./?</router-link>
            <router-link to="../?a=&b=1&b=2&c#h">../?</router-link>
            <router-link to="./.?a=&b=1&b=2&c#h">./.?</router-link>
            <router-link to="../.?a=&b=1&b=2&c#h">../.?</router-link>
            <router-link to="././?a=&b=1&b=2&c#h">././?</router-link>
            <router-link to=".././?a=&b=1&b=2&c#h">.././?</router-link>
            <router-link to="https://xxx?a=&b=1&b=2&c#h">https://xxx?</router-link>
            <router-link to="">''</router-link>

            <br/>
            <router-link to="//localhost:3000/test1">//localhost:3000/test1</router-link>
            <router-link to="//localhost:3001/test1">//localhost:3001/test1</router-link>
        </div>

        <p v-if="$router.isLayer">{{ $route.href }}</p>

        <table><tbody>
            <tr
                v-for="method in ['push', 'pushWindow', 'replace', 'reload', 'forceReload', 'pushLayer']"
                :key="method"
                :class="method"
            >
                <td>{{ method }}:</td>
                <td>
                    <router-link to="/" :type="method">首页</router-link>
                    <router-link to="/test" :type="method">测试</router-link>
                    <router-link to="test1" :type="method">动态组件</router-link>
                    <router-link to="/404" :type="method">404</router-link>
                    <router-link to="baidu.com" :type="method">baidu</router-link>
                    <a
                        v-if="!$router.isLayer && method === 'pushLayer'"
                        href="/"
                        @click.capture.prevent.stop="openLayer"
                    >
                        home (closeLayer at 404)
                    </a>
                    <a href="/404" @click.capture.prevent.stop="testQuery">test query</a>
                </td>
            </tr>
        </tbody></table>

        <hr/>

        <router-view />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from '@esmx/router-vue2';
const router = useRouter();
const openLayer = (e: MouseEvent) => {
    const href = (e.target as HTMLAnchorElement).href;
    router.pushLayer(href, {
        hooks: {
            shouldCloseLayer: (from, to) => to.fullPath === '/404'
        }
    });
};
const testQuery = () => {
    router.push({
        path: '/404',
        query: {
            a: '1',
            b: undefined
        }
    });
};
</script>

<style lang="css" scoped>
a {
    color: #1b79c4;
}

header {
    display: flex;
    align-items: center;
}

button {
    height: 2rem;
}

button + button, a + a {
    margin-inline-start: 1ex;
}

h1 {
    margin: 0 1ex;
}

td:first-child {
    text-align: end;
}

.isLayer {
    width: fit-content;
    height: fit-content;
    max-width: 100%;
    max-height: 100%;
    margin: 0 auto;
    border: 1px solid #ccc;
    border-radius: .5rem;
    padding: 1ex;
}
</style>
