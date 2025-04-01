import type { Route, RouterInstance } from '@esmx/router';
import { getCurrentInstance } from 'vue';

export function throwNoCurrentInstance(method) {
    if (!getCurrentInstance()) {
        throw new Error(
            `[router-vue]: Missing current instance. ${method}() must be called inside <script setup> or setup().`
        );
    }
}

export function useRouter(): RouterInstance {
    if (process.env.NODE_ENV !== 'production') {
        throwNoCurrentInstance('useRouter');
    }

    const vueInstance = getCurrentInstance();

    return vueInstance!.proxy.$root.$router;
}

export function useRoute(): Route {
    if (process.env.NODE_ENV !== 'production') {
        throwNoCurrentInstance('useRoute');
    }
    const vueInstance = getCurrentInstance();
    return vueInstance!.proxy.$root.$route;
}
