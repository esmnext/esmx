<script lang="ts">
export default {
    name: 'test',
    beforeCreate() {
        console.log('@beforeCreate test');
    }
};
</script>

<template>
    <div>
        <h3 class="color">Test</h3>
        <pre>{{ $route }}</pre>
        <router-view />
    </div>
</template>

<style scoped>
h3 {
    font-weight: 500;
    top: -10px;
}

.color {
    color: saddlebrown;
}
</style>
