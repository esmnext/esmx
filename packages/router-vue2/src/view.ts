import { defineComponent } from 'vue';

declare module 'vue/types' {
    interface VNodeData {
        dataView?: boolean;
    }
}

export const RouterView = defineComponent({
    functional: true,
    render(h, ctx) {
        // 标记当前 dataView 为true
        ctx.data.dataView = true;

        let { parent } = ctx;
        const { data } = ctx;

        const route = parent.$route;

        // 表示当前RouterView需要渲染的层级
        let depth = 0;

        // 当寻找到根节点时停止
        while (parent && parent._routerRoot !== parent) {
            // 获取父节点标签上的 data
            const vnodeData = parent?.$vnode?.data || {};
            if (vnodeData.dataView) {
                // 如果 parent.$vnode.dataView 为 true，则表示当前 routerView 已经渲染过了
                depth++;
            }
            // 递归向上查找
            parent.$parent && (parent = parent.$parent);
        }

        // 根据depth判断当前router-view 承载的是第几个匹配组件
        const matchRoute = route.matched[depth];
        if (!matchRoute) {
            return h();
        }

        return h(matchRoute.component || matchRoute.asyncComponent, data);
    }
});
