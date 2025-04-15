(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"ssr-vue2-host\u002Fsrc\u002Fentry.client":"\u002Fssr-vue2-host\u002Fsrc\u002Fentry.client.67c63470.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fentry.client":"\u002Fssr-vue2-remote\u002Fsrc\u002Fentry.client.eeb0d5a2.final.mjs","ssr-vue2-remote\u002Fvue":"\u002Fssr-vue2-remote\u002Fvue.94c707fc.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex":"\u002Fssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex.c96e475c.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex":"\u002Fssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex.fb511c82.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex":"\u002Fssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex.33b5ce0b.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents":"\u002Fssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex.c96e475c.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables":"\u002Fssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex.fb511c82.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples":"\u002Fssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex.33b5ce0b.final.mjs"}};
if (importmap.imports && base) {
    const imports = importmap.imports;
    Object.entries(imports).forEach(([k, v]) => {
        imports[k] = base + v;
    });
}
const script = document.createElement("script");
script.type = "importmap";
script.innerHTML = JSON.stringify(importmap);
document.head.appendChild(script);
})();