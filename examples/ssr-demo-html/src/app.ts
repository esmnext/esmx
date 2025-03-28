/**
 * @file 示例组件
 * @description 展示一个带有自动更新时间的页面标题，用于演示 Esmx 框架的基本功能
 */

export default class App {
    /**
     * 当前时间，使用 ISO 格式
     * @type {string}
     */
    public time = '';

    /**
     * 创建应用实例
     * @param {SsrContext} [ssrContext] - 服务端上下文，包含导入元数据集合
     */
    public constructor(public ssrContext?: SsrContext) {
        // 构造函数中不需要额外初始化
    }

    /**
     * 渲染页面内容
     * @returns {string} 返回页面 HTML 结构
     */
    public render(): string {
        // 确保在服务端环境下正确收集导入元数据
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx 快速开始</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * 客户端初始化
     * @throws {Error} 当找不到时间显示元素时抛出错误
     */
    public onClient(): void {
        // 获取时间显示元素
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('找不到时间显示元素');
        }

        // 设置定时器，每秒更新一次时间
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * 服务端初始化
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * 服务端上下文接口
 * @interface
 */
export interface SsrContext {
    /**
     * 导入元数据集合
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
