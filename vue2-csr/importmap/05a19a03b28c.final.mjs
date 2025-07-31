(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"vue2-csr\u002Fsrc\u002Fentry.client":"\u002Fvue2-csr\u002Fexports\u002Fsrc\u002Fentry.client.0cf1da3d.final.mjs","vue2-csr\u002Fvue":"\u002Fvue2-csr\u002Fexports\u002Fvue.1de5cf38.final.mjs"},"scopes":{"\u002Fvue2-csr\u002F":{"vue":"\u002Fvue2-csr\u002Fexports\u002Fvue.1de5cf38.final.mjs"}}};
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