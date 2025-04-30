function t(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}const{app:e}={app:new class e{render(){return this.ssrContext&&this.ssrContext.importMetaSet.add(import.meta),`
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx \u{5FEB}\u{901F}\u{5F00}\u{59CB}</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `}onClient(){let t=document.querySelector("#app time");if(!t)throw Error("找不到时间显示元素");setInterval(()=>{this.time=new Date().toISOString(),t.setAttribute("datetime",this.time),t.textContent=this.time},1e3)}onServer(){this.time=new Date().toISOString()}constructor(e){t(this,"ssrContext",void 0),t(this,"time",void 0),this.ssrContext=e,this.time=""}}};e.onClient();