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

        <table><tbody>
            <tr
                v-for="method in ['push', 'replace', 'pushWindow', 'replaceWindow', 'pushLayer']"
                :key="method"
                :class="method"
            >
                <td>{{ method }}:</td>
                <td>
                    <router-link to="/" :type="method">首页</router-link>
                    <router-link to="/test" :type="method">测试</router-link>
                    <router-link to="/test1" :type="method">动态组件</router-link>
                    <router-link to="/404" :type="method">404</router-link>
                </td>
            </tr>
        </tbody></table>

        <hr/>

        <router-view />
    </div>
</template>

<script setup lang="ts">
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

button + button {
    margin-left: 1ex;
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
