(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"scopes":{"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002F":{"vue":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fvue.94c707fc.final.mjs"}},"imports":{"ssr-vue2-remote\u002Fsrc\u002Fentry.client":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fentry.client.71bc1fc7.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fcomponents\u002Findex.ea6adf5c.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fcomposables\u002Findex.fb511c82.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-vue2-remote\u002Fdist\u002Fserver\u002Fsrc\u002Fexamples\u002Findex.22bf3520.final.mjs"}};
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