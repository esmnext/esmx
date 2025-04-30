(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"scopes":{"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002F":{"vue":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fvue.94c707fc.final.mjs"}},"imports":{"ssr-vue2-remote\u002Fsrc\u002Fentry.client":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fentry.client.ff05d892.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fcomponents\u002Findex.5a16b3f8.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fcomposables\u002Findex.fb511c82.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fexamples\u002Findex.27a73631.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fcomponents\u002Findex.5a16b3f8.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fcomposables\u002Findex.fb511c82.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fexamples\u002Findex.27a73631.final.mjs"}};
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