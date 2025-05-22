(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"ssr-preact-htm\u002Fsrc\u002Fentry.client":"\u002Fssr-preact-htm\u002Fsrc\u002Fentry.client.1343e1af.final.mjs"},"scopes":{"\u002Fssr-preact-htm\u002F":{}}};
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