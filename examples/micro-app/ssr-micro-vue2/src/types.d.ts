import type { Unhead } from 'unhead/types';

declare module 'vue/types/vue' {
    interface Vue {
        $head: Unhead;
    }
}

declare module 'vue/types/v3-component-public-instance' {
    interface ComponentCustomProperties {
        $head: Unhead;
    }
}
