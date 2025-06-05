<template>
    <div>
        <h1>详情页面</h1>
        <article>
            {{$route.state.id ?? '--'}}
        </article>
    </div>
</template>

<style scoped>
h3 {
    font-weight: 500;
    top: -10px;
}

.color {
    color: green;
}
</style>
