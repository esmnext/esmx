(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"router-demo-music\u002Fsrc\u002Fentry.client":"\u002Frouter-demo-music\u002Fexports\u002Fsrc\u002Fentry.client.7d2f95cf.final.mjs","router-demo-music\u002Fvue":"\u002Frouter-demo-music\u002Fexports\u002Fvue.1de5cf38.final.mjs","router-demo-music\u002F@esmx\u002Frouter":"\u002Frouter-demo-music\u002Fexports\u002F@esmx\u002Frouter.6322d508.final.mjs","router-demo-music\u002F@esmx\u002Frouter-vue":"\u002Frouter-demo-music\u002Fexports\u002F@esmx\u002Frouter-vue.0a731974.final.mjs"},"scopes":{"\u002Frouter-demo-music\u002F":{"vue":"\u002Frouter-demo-music\u002Fexports\u002Fvue.1de5cf38.final.mjs","@esmx\u002Frouter":"\u002Frouter-demo-music\u002Fexports\u002F@esmx\u002Frouter.6322d508.final.mjs","@esmx\u002Frouter-vue":"\u002Frouter-demo-music\u002Fexports\u002F@esmx\u002Frouter-vue.0a731974.final.mjs"}}};
const set = (data) => {
    if (!data) return;
    Object.entries(data).forEach(([k, v]) => {
        data[k] = base + v;
    });
};
set(importmap.imports);
if (importmap.scopes) {
    Object.values(importmap.scopes).forEach(set);
}
const script = document.createElement("script");
script.type = "importmap";
script.innerText = JSON.stringify(importmap);
document.head.appendChild(script);
})();