declare module '@esmx/rspack-react' {
    import type { Esmx } from '@esmx/core';

    export interface RspackReactAppOptions {
        config?: (context: any) => void;
        chain?: (context: any) => void;
    }

    export function createRspackReactApp(
        esmx: Esmx,
        options?: RspackReactAppOptions
    ): Promise<any>;
}
