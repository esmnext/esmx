<template>
    <pre v-html="vHTML"></pre>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
    data: any;
}>();

const vHTML = computed(() =>
    JSON.stringify(props.data, null, 2)
        .replace(/^( *)(".*"):/gm, '$1<span class="json-key">$2</span>:')
        .replace(/: (".*")(,?)$/gm, ': <span class="json-str">$1</span>$2')
        .replace(/(^ *|: )(null|true|false)(,?)$/gm, '$1<span class="json-keyword">$2</span>$3')
        .replace(/(: | +)(\d+)(,?)$/gm, '$1<span class="json-num">$2</span>$3')
        .replace(/(^.*)([{[])$\n/gm, `<details open
            ><summary
                >$1<span class="json-bracket $2">$2</span
                ><span class="json-ellipsis"> ... </span
            ></summary
        ><div class="json-content">`)
        .replace(/(^ *)([\]}])(,?)$\n?/gm, '$1<span class="json-bracket $2">$2</span>$3</div></details>')
        .replace(/\[\]/g, '<span class="json-bracket [ ]">[]</span>')
        .replace(/\{\}/g, '<span class="json-bracket { }">{}<\/span>')
);
</script>

<style scoped>
pre {
    margin: 0;
    border-left: var(--spacing-6) solid transparent;
}
:deep(details) {
    margin: 0;
    margin-left: -2ch;
    padding: 0;
}
:deep(summary:hover) {
    background-color: #8882;
}
:deep(summary::marker) {
    cursor: pointer;
    font: inherit;
    color: var(--text-muted);
    content: '+ ';
}
:deep(details[open] > summary::marker) {
    content: '- ';
}
:deep(summary:hover::marker) {
    color: var(--text-tertiary);
}
:deep(details:not([open]) > summary) {
    cursor: pointer;
}

:deep(details[open]:hover > summary .json-bracket) {
    border: 1px solid var(--border-dark);
    margin-left: -1px;
    margin-top: -1px;
}
:deep(details[open]:hover > .json-content > .json-bracket:last-child) {
    border: 1px solid var(--border-dark);
    margin-left: -1px;
    margin-top: -1px;
}

:deep(.json-content) {
    padding-left: 2ch;
}
:deep(.json-key) {
    color: var(--primary-color);
    font-weight: bold;
}
:deep(.json-str) {
    color: #f44336;
}
:deep(.json-keyword) {
    color: var(--link-color);
}
:deep(.json-num) {
    color: #28a745;
}
:deep(.json-bracket) {
    font-weight: bold;
}
:deep(*).\{ { color: var(--link-hover); }
:deep(*).\} { color: var(--link-hover); }
:deep(*).\[ { color: var(--link-visited); }
:deep(*).\] { color: var(--link-visited); }

:deep(details[open] > summary .json-ellipsis) { display: none; }
:deep(*).\{ + .json-ellipsis::after { content: '}'; color: var(--link-hover); font-weight: bold; }
:deep(*).\[ + .json-ellipsis::after { content: ']'; color: var(--link-visited); font-weight: bold; }
</style>
