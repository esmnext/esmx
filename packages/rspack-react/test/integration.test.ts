/**
 * Integration Test Example for React Server Render Loader
 *
 * This file demonstrates how the loader transforms code and tracks SSR context.
 * These tests verify the loader's behavior without requiring full React rendering.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import loader from '../src/loaders/react-server-render';

describe('React Server Render Loader - Integration Tests', () => {
    beforeEach(() => {
        // Setup SSR context before each test
        (globalThis as any).__SSR_CONTEXT__ = {
            importMetaSet: new Set()
        };
    });

    it('should transform a simple React component', () => {
        const mockContext = {} as any;
        const inputCode = `
import React from 'react';

export default function MyComponent() {
    return <div>Hello World</div>;
}
`;

        const result = loader.call(mockContext, inputCode);

        // Verify original code is preserved
        expect(result).toContain('export default function MyComponent()');
        expect(result).toContain('<div>Hello World</div>');

        // Verify loader additions
        expect(result).toContain(
            "import { useContext, useEffect } from 'react'"
        );
        expect(result).toContain('function initImport()');
        expect(result).toContain('WithSSRContext');
        expect(result).toContain('__exports__.default = WithSSRContext');
    });

    it('should transform a component with exports', () => {
        const mockContext = {} as any;
        const inputCode = `
export const Button = ({ label }) => <button>{label}</button>;
export default Button;
`;

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain('export const Button');
        expect(result).toContain('export default Button');
        expect(result).toContain('OriginalComponent');
    });

    it('should handle TypeScript React components', () => {
        const mockContext = {} as any;
        const inputCode = `
import React from 'react';

interface Props {
    title: string;
    count: number;
}

export default function Counter({ title, count }: Props) {
    return (
        <div>
            <h1>{title}</h1>
            <p>Count: {count}</p>
        </div>
    );
}
`;

        const result = loader.call(mockContext, inputCode);

        // Verify TypeScript code is preserved
        expect(result).toContain('interface Props');
        expect(result).toContain('title: string');
        expect(result).toContain('count: number');
        expect(result).toContain('function Counter({ title, count }: Props)');

        // Verify loader transformation
        expect(result).toContain('WithSSRContext');
    });

    it('should handle class components', () => {
        const mockContext = {} as any;
        const inputCode = `
import React, { Component } from 'react';

export default class MyClassComponent extends Component {
    render() {
        return <div>Class Component</div>;
    }
}
`;

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain('class MyClassComponent extends Component');
        expect(result).toContain('render()');
        expect(result).toContain('WithSSRContext');
    });

    it('should preserve multiple exports', () => {
        const mockContext = {} as any;
        const inputCode = `
export const helper = () => 'helper';
export const utils = { foo: 'bar' };
export default function Main() {
    return <div>Main</div>;
}
`;

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain('export const helper');
        expect(result).toContain('export const utils');
        expect(result).toContain('export default function Main()');
    });

    it('should handle components with hooks', () => {
        const mockContext = {} as any;
        const inputCode = `
import React, { useState, useEffect } from 'react';

export default function HooksComponent() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        console.log('mounted');
    }, []);
    
    return <div onClick={() => setCount(count + 1)}>{count}</div>;
}
`;

        const result = loader.call(mockContext, inputCode);

        // Original hooks should be preserved
        expect(result).toContain('useState');
        expect(result).toContain('const [count, setCount] = useState(0)');

        // Loader should add its own useEffect
        expect(result).toContain(
            "import { useContext, useEffect } from 'react'"
        );
    });

    it('should verify SSR context tracking logic', () => {
        const mockContext = {} as any;
        const inputCode = 'export default () => <div>Test</div>;';

        const result = loader.call(mockContext, inputCode);

        // Check for SSR-only execution
        expect(result).toContain("typeof window === 'undefined'");
        expect(result).toContain('globalThis.__SSR_CONTEXT__');
        expect(result).toContain('ssrContext.importMetaSet');
        expect(result).toContain('import.meta');
    });

    it('should preserve component properties in wrapper', () => {
        const mockContext = {} as any;
        const inputCode = 'export default MyComponent;';

        const result = loader.call(mockContext, inputCode);

        // Check for property preservation logic
        expect(result).toContain('Object.keys(OriginalComponent)');
        expect(result).toContain(
            'WithSSRContext[key] = OriginalComponent[key]'
        );
    });

    it('should handle arrow function components', () => {
        const mockContext = {} as any;
        const inputCode = `
const ArrowComponent = () => {
    return <div>Arrow Function</div>;
};

export default ArrowComponent;
`;

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain('const ArrowComponent = ()');
        expect(result).toContain('export default ArrowComponent');
        expect(result).toContain('WithSSRContext');
    });

    it('should handle components with JSX fragments', () => {
        const mockContext = {} as any;
        const inputCode = `
export default function FragmentComponent() {
    return (
        <>
            <div>First</div>
            <div>Second</div>
        </>
    );
}
`;

        const result = loader.call(mockContext, inputCode);

        expect(result).toContain('<>');
        expect(result).toContain('</>');
        expect(result).toContain('FragmentComponent');
    });
});
