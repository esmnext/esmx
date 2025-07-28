(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"vue3-csr\u002Fsrc\u002Fentry.client":"\u002Fvue3-csr\u002Fexports\u002Fsrc\u002Fentry.client.9f70d34f.final.mjs"},"scopes":{"\u002Fvue3-csr\u002F":{}}};
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