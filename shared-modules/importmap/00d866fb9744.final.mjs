(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"shared-modules\u002Fsrc\u002Fentry.client":"\u002Fshared-modules\u002Fexports\u002Fsrc\u002Fentry.client.ef46db37.final.mjs","shared-modules\u002F@esmx\u002Frouter":"\u002Fshared-modules\u002Fexports\u002F@esmx\u002Frouter.6322d508.final.mjs","shared-modules\u002Findex":"\u002Fshared-modules\u002Fexports\u002Findex.c382f59e.final.mjs","shared-modules":"\u002Fshared-modules\u002Fexports\u002Findex.c382f59e.final.mjs"},"scopes":{"\u002Fshared-modules\u002F":{"@esmx\u002Frouter":"\u002Fshared-modules\u002Fexports\u002F@esmx\u002Frouter.6322d508.final.mjs"}}};
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