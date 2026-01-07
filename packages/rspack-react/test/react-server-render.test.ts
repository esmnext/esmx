import { describe, expect, it, vi } from 'vitest';
import loader, {
    reactServerRenderLoader
} from '../src/loaders/react-server-render';

describe('react-server-render loader', () => {
    it('should append SSR context initialization code', () => {
        const mockContext = {} as any;
        const inputCode = `
import React from 'react';
export default function MyComponent() {
    return <div>Hello World</div>;
}
`;

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain(inputCode);
        expect(result).toContain(
            "import { useContext, useEffect } from 'react'"
        );
        expect(result).toContain('function initImport()');
        expect(result).toContain('ssrContext.importMetaSet');
        expect(result).toContain('import.meta');
    });

    it('should preserve original component code', () => {
        const mockContext = {} as any;
        const inputCode = `export const MyComponent = () => <div>Test</div>;`;

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain(inputCode);
    });

    it('should export loader path', () => {
        expect(reactServerRenderLoader).toBeDefined();
        expect(typeof reactServerRenderLoader).toBe('string');
        expect(reactServerRenderLoader).toContain('react-server-render');
    });

    it('should handle empty input', () => {
        const mockContext = {} as any;
        const inputCode = '';

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain('function initImport()');
    });

    it('should include component wrapping logic', () => {
        const mockContext = {} as any;
        const inputCode = 'export default MyComponent;';

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain('WithSSRContext');
        expect(result).toContain('OriginalComponent');
        expect(result).toContain('__exports__.default = WithSSRContext');
    });
});
