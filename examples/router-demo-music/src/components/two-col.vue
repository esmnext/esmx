<template>
    <div class="two-column-layout">
        <slot></slot>
    </div>
</template>

<style scoped>
.two-column-layout {
    display: flex;
    width: 100%;
    gap: var(--spacing-4);
}
.two-column-layout > *:first-child {
    width: calc(var(--left-width, 38.2%) - var(--spacing-4) / 2);
}
.two-column-layout > *:last-child {
    flex: 1;
}
</style>
