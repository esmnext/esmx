(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"ssr-vue2-host\u002Fsrc\u002Fentry.client":"\u002Fssr-vue2-host\u002Fexports\u002Fsrc\u002Fentry.client.bdbf2662.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fentry.client":"\u002Fssr-vue2-remote\u002Fexports\u002Fsrc\u002Fentry.client.9acc7a68.final.mjs","ssr-vue2-remote\u002Fvue":"\u002Fssr-vue2-remote\u002Fexports\u002Fvue.389c4cab.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex":"\u002Fssr-vue2-remote\u002Fexports\u002Fsrc\u002Fcomponents\u002Findex.4d451495.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex":"\u002Fssr-vue2-remote\u002Fexports\u002Fsrc\u002Fcomposables\u002Findex.c2bfa8f0.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex":"\u002Fssr-vue2-remote\u002Fexports\u002Fsrc\u002Fexamples\u002Findex.b4bf7a37.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents":"\u002Fssr-vue2-remote\u002Fexports\u002Fsrc\u002Fcomponents\u002Findex.4d451495.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables":"\u002Fssr-vue2-remote\u002Fexports\u002Fsrc\u002Fcomposables\u002Findex.c2bfa8f0.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples":"\u002Fssr-vue2-remote\u002Fexports\u002Fsrc\u002Fexamples\u002Findex.b4bf7a37.final.mjs"},"scopes":{"\u002Fssr-vue2-host\u002F":{"vue":"\u002Fssr-vue2-remote\u002Fexports\u002Fvue.389c4cab.final.mjs"},"\u002Fssr-vue2-remote\u002F":{"vue":"\u002Fssr-vue2-remote\u002Fexports\u002Fvue.389c4cab.final.mjs"}}};
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