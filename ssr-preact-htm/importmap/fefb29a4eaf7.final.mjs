(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"ssr-preact-htm\u002Fsrc\u002Fentry.client":"\u002Fssr-preact-htm\u002Fsrc\u002Fentry.client.f37263ae.final.mjs"},"scopes":{"\u002Fssr-preact-htm\u002F":{}}};
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