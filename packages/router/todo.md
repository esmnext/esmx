
* [ ] match 大小写敏感 配置项（目前不敏感
* [ ] match 可选的尾斜杠 配置项（目前是可选的
* [ ] match 优先级（目前按 vue2 route 的定义来
  * vue2 route 匹配的优先级就按照路由的定义顺序：路由定义得越早，优先级就越高。
  * vue3 route 的路由路径会有得分，优先级根据得分来排名
* [ ] path-to-regexp 库升级到最新版（有差异性规则 `+*?`

目前已知问题：

* [ ] router.navigation.length 无响应式
* [x] autoPush 没有对应实现
* [x] layerOptions.push 为 true 时，弹层关闭没有恢复浏览器的 history
