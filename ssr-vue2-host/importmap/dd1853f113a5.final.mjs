(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"imports":{"ssr-vue2-host\u002Fsrc\u002Fentry.client":"\u002Fssr-vue2-host\u002Fsrc\u002Fentry.client.25f7c713.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fentry.client":"\u002Fssr-vue2-remote\u002Fsrc\u002Fentry.client.a5327755.final.mjs","ssr-vue2-remote\u002Fvue":"\u002Fssr-vue2-remote\u002Fvue.389c4cab.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex":"\u002Fssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex.bba452e0.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex":"\u002Fssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex.c2bfa8f0.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex":"\u002Fssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex.2bb5cdf5.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomponents":"\u002Fssr-vue2-remote\u002Fsrc\u002Fcomponents\u002Findex.bba452e0.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fcomposables":"\u002Fssr-vue2-remote\u002Fsrc\u002Fcomposables\u002Findex.c2bfa8f0.final.mjs","ssr-vue2-remote\u002Fsrc\u002Fexamples":"\u002Fssr-vue2-remote\u002Fsrc\u002Fexamples\u002Findex.2bb5cdf5.final.mjs"},"scopes":{"\u002Fssr-vue2-host\u002F":{"vue":"\u002Fssr-vue2-remote\u002Fvue.389c4cab.final.mjs"},"\u002Fssr-vue2-remote\u002F":{"vue":"\u002Fssr-vue2-remote\u002Fvue.389c4cab.final.mjs"}}};
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