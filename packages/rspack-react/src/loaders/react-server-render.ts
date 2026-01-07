import { fileURLToPath } from 'node:url';
import type { rspack } from '@esmx/rspack';

const ADD_IMPORT = `
import { useContext, useEffect } from 'react';
function initImport() {
    const OriginalComponent = __exports__.default || __exports__;
    const WithSSRContext = (props) => {
        // Access SSR context from React context or global
        const ssrContext = typeof window === 'undefined' 
            ? (globalThis.__SSR_CONTEXT__ || {})
            : {};
        
        useEffect(() => {
            // Only run on server-side
            if (typeof window === 'undefined' && ssrContext.importMetaSet) {
                ssrContext.importMetaSet.add(import.meta);
            }
        }, []);
        
        return OriginalComponent(props);
    };
    
    // Preserve component properties
    Object.keys(OriginalComponent).forEach(key => {
        WithSSRContext[key] = OriginalComponent[key];
    });
    
    __exports__.default = WithSSRContext;
}
initImport();
`;

export default function (this: rspack.LoaderContext, text: string) {
    return text + ADD_IMPORT;
}

// Use a try-catch to handle environments where import.meta.resolve is not available
let loaderPath: string;
try {
    loaderPath = fileURLToPath(import.meta.resolve(import.meta.url));
} catch {
    // Fallback for test environments
    loaderPath = fileURLToPath(import.meta.url);
}

export const reactServerRenderLoader = loaderPath;
