(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"ssr-html\u002Fsrc\u002Fentry.client":"\u002Fssr-html\u002Fsrc\u002Fentry.client.759ee756.final.mjs","ssr-html\u002Fsrc\u002Ftitle\u002Findex":"\u002Fssr-html\u002Fsrc\u002Ftitle\u002Findex.2d79c0c2.final.mjs","ssr-html\u002Fsrc\u002Ftitle":"\u002Fssr-html\u002Fsrc\u002Ftitle\u002Findex.2d79c0c2.final.mjs"},"scopes":{"\u002Fssr-html\u002F":{}}};
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