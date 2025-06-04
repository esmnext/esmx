import type { Route, Router } from '@esmx/router';
import { getCurrentInstance, inject } from 'vue';

import { routerKey, routerViewLocationKey } from './symbols';

export function throwNoCurrentInstance(method: string) {
    if (!getCurrentInstance()) {
        throw new Error(
            `[router-vue]: Missing current instance. ${method}() must be called inside <script setup> or setup().`
        );
    }
}

export function useRouter(): Router {
    return inject(routerKey)!;
}

export function useRoute(): Route {
    return inject(routerViewLocationKey)!;
}
