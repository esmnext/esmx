<template>
    <pre v-html="vHTML" :style="{'--space': space}"></pre>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
    data: any;
    space?: number;
    collapseDepth?: number;
    collapseRoot?: boolean;
}>();

// console.log(props.data);

const space = props.space !== void 0 && props.space > 0 ? props.space : 2;
const fnCache = Object.create(null) as Record<string, Function>;
let fnCount = 0;
const replacer = (k: string, v: any) => {
    switch (typeof v) {
        // function, undefined, symbol are ignored in normal JSON.stringify calls
        case 'undefined':
            return '\x01json-unknown\x01' + 'undefined';
        case 'symbol':
            return '\x01json-unknown\x01' + v.toString();
        case 'function':
            fnCache['' + fnCount] = v;
            return '\x01json-unknown\x02' + fnCount++;
        // bigint will report an error in a normal JSON.stringify call
        case 'bigint':
            return '\x01json-unknown\x03' + v.toString() + 'n';
        case 'object':
            // RegExp, Set, Map are changed to a string `{}` in a normal JSON.stringify call
            if (v instanceof RegExp) {
                return `\x01json-unknown\x04[object RegExp( ${v.toString()} )]`;
            }
            if (v instanceof Set || v instanceof Map) {
                return ('\x01json-unknown\x04' + v.toString()).replace(
                    /\]/,
                    `(${v.size})]`
                );
            }
    }
    return v;
};

const vHTML = computed(() =>
    JSON.stringify(props.data, replacer, space)
        .replace(
            /^(.*)"\\u0001json-unknown(\\u.*)"(,?)$/gm,
            'json-unknown$1$2$3'
        )
        .replace(/^( *)(".*?"):/gm, '$1<span class="json-key">$2</span>:')
        .replace(
            /(^ *|: )(".*")(,?)$/gm,
            '$1<span class="json-str">$2</span>$3'
        )
        .replace(
            /(^ *|: )(null|true|false)(,?)$/gm,
            '$1<span class="json-keyword">$2</span>$3'
        )
        .replace(/(^ *|: )(\d+)(,?)$/gm, '$1<span class="json-num">$2</span>$3')
        .replace(/^( *)(.*)([{[])$\n/gm, (all, spaces, content, bracket) => {
            const depth = spaces.length / space;
            let open =
                depth <= (props.collapseDepth ?? Number.POSITIVE_INFINITY);
            if (props.collapseRoot && depth === 0) open = false;
            return `<details${open ? ' open' : ''} class="json-collapse" style="--depth: ${depth}"
                ><summary
                    >${spaces}${content}<span class="json-bracket ${bracket}">${bracket}</span
                    ><span class="json-ellipsis"> ... </span
                ></summary
            ><div class="json-content">`.replace(/\n +>/g, '>');
        })
        .replace(
            /(^ *)([\]}])(,?)$\n?/gm,
            '$1<span class="json-bracket $2">$2</span>$3</div></details>'
        )
        .replace(/\[\]/g, '<span class="json-bracket [ ] []">[]</span>')
        .replace(/\{\}/g, '<span class="json-bracket { } {}">{}</span>')
        .replace(
            /json-unknown( *)(".*?"): \\u0001(.*)(,?$\n?)/gm,
            '<i class="json-unknown">$1<span class="json-key">$2</span>: $3$4</i>'
        )
        .replace(
            /json-unknown( *)(".*?"): \\u0004(.*?)(,?$\n?)/gm,
            '$1<span class="json-key">$2</span>: {<i class="json-unknown"> $3 </i>}$4'
        )
        .replace(
            /json-unknown( *)(".*?"): \\u0003(.*)(,?$\n?)/gm,
            '<i class="json-unknown error" title="TypeError: Do not know how to serialize a BigInt">$1<span class="json-key">$2</span>: $3$4</i>'
        )
        .replace(
            /json-unknown( *)(?:(".*?"): )?\\u0002(\d+)(,?$\n?)/gm,
            (all, spaces, key, funcId, end) => {
                key =
                    key === void 0
                        ? ''
                        : `<span class="json-key">${key}</span>: `;
                const func = fnCache[funcId];
                Reflect.deleteProperty(fnCache, funcId);
                const escapeHtmlMap: Record<string, string> = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&apos;'
                };
                // 转义html特殊字符 & 将 `\u0000` 的字符转成字符实体
                const fnStr = func
                    .toString()
                    .replace(/[&<>"']/g, (m) => escapeHtmlMap[m])
                    .replace(/\\u\{?([\da-f]{4})\}?/gi, '&#x$1;');
                const line1 = fnStr.split('\n')[0];
                let otherLines = fnStr.replace(line1, '');
                const len = otherLines.replace(/.*^( *)}\)?/ms, '$1').length;
                otherLines = otherLines.replace(
                    new RegExp('^' + ' '.repeat(len), 'gm'),
                    ''
                );
                let ellipsis =
                    otherLines.length === 0
                        ? ''
                        : line1.startsWith('function') ||
                            line1.startsWith('async function')
                          ? ' ... }'
                          : ' ... ' + (line1.endsWith('({') ? '})' : '}');
                ellipsis = ellipsis.length
                    ? `<span class="json-ellipsis">${ellipsis}</span>`
                    : '';
                const fnCollapse = `<details class="json-function"
                        ><summary>${line1}${ellipsis}</summary
                        ><pre>${otherLines}</pre
                    ></details
                >`;
                return (
                    key
                        ? `<i class="json-unknown">${spaces}${key}${fnCollapse}${end}</i>`
                        : `${spaces}<span class="json-keyword">null</span>${
                              end.includes(',') ? ',' : ''
                          }<i class="json-unknown"> ${fnCollapse}${end.includes('\n') ? '\n' : ''}</i>`
                ).replace(/\n +>/g, '>');
            }
        )
);

// console.log(vHTML.value);
</script>

<style scoped>
:deep(pre) { margin: 0; }
pre {
    border-left: var(--spacing-6) solid transparent;
}

:deep(*) {
    --marker-color: var(--text-tertiary);
    --hover-marker-color: var(--text-secondary);
    --bracket-obj: var(--music-primary);
    --bracket-arr: var(--music-secondary);
    --key-color: var(--warning-color);
    --str-color: #03a9f4;
    --num-color: var(--success-color);
    --keyword-color: var(--primary-color);
    --unknown-color: var(--text-tertiary);
    --unknown-error-color: var(--error-color);
    --indent-line-color: #8884;
    --indent-line-active-color: #888c;
}

:deep(.json-collapse) {
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
    color: var(--marker-color);
    content: '+ ';
}
:deep(.json-collapse[open] > summary::marker) {
    content: '- ';
}
:deep(summary:hover::marker) {
    color: var(--hover-marker-color);
}
:deep(.json-collapse:not([open]) > summary) {
    cursor: pointer;
}

/* hover 时 {}/[] 的边框 */
:deep(.json-collapse[open]:hover > summary .json-bracket) {
    border: 1px solid var(--border-dark);
    margin: -1px;
}
:deep(.json-collapse[open]:hover > .json-content > .json-bracket:last-child) {
    border: 1px solid var(--border-dark);
    margin: -1px;
}

:deep(.json-content) {
    position: relative;
    padding-left: 2ch;
}
:deep(.json-key) {
    color: var(--key-color);
    font-weight: bold;
}
:deep(.json-str) {
    color: var(--str-color);
}
:deep(.json-keyword) {
    color: var(--keyword-color);
}
:deep(.json-num) {
    color: var(--num-color);
}
:deep(.json-bracket) {
    font-weight: bold;
}
:deep(*).\{ { color: var(--bracket-obj); }
:deep(*).\} { color: var(--bracket-obj); }
:deep(*).\[ { color: var(--bracket-arr); }
:deep(*).\] { color: var(--bracket-arr); }

:deep(.json-collapse[open] > summary .json-ellipsis) { display: none; }
:deep(*).\{ + .json-ellipsis::after { content: '}'; color: var(--bracket-obj); font-weight: bold; }
:deep(*).\[ + .json-ellipsis::after { content: ']'; color: var(--bracket-arr); font-weight: bold; }

/* 缩进线 */
:deep(.json-content::after) {
    content: '';
    display: block;
    height: calc(100% - 1.75em);
    width: 0;
    border-left: 1px dashed var(--indent-line-color);
    position: absolute;
    left: calc(1ch * var(--space) * var(--depth) + 2ch + .4ch);
    top: 0;
    pointer-events: none;
}
:deep(.json-collapse:hover:not(:has(.json-collapse[open]:hover)) > .json-content::after) {
    border-color: var(--indent-line-active-color);
}

:deep(.json-unknown) {
    color: var(--unknown-color);
    user-select: none;
}
:deep(.json-unknown .json-key) {
    opacity: .5;
}
:deep(.json-unknown.error .json-key) {
    background: var(--unknown-error-color);
}

:deep(.json-function) {
    display: inline-block;
    vertical-align: top;
}
:deep(.json-function > summary::marker) {
    content: '';
}
:deep(.json-function[open] > summary::marker) {
    content: '';
}
:deep(.json-function[open] > summary .json-ellipsis) { display: none; }
:deep(.json-function > summary) { cursor: pointer; }
</style>
