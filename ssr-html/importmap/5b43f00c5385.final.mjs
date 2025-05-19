(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"scopes":{},"imports":{"ssr-html\u002Fsrc\u002Fentry.client":"\u002Fssr-html\u002Fsrc\u002Fentry.client.2bd0c29c.final.mjs","ssr-html\u002Fsrc\u002Ftitle\u002Findex":"\u002Fssr-html\u002Fsrc\u002Ftitle\u002Findex.2d79c0c2.final.mjs","ssr-html\u002Fsrc\u002Ftitle":"\u002Fssr-html\u002Fsrc\u002Ftitle\u002Findex.2d79c0c2.final.mjs"}};
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