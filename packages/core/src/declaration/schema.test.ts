import { describe, expect, it } from 'vitest';

import { esmxDeclarationSchema, validateDeclaration } from './schema';
import { DiagnosticCode } from './types';

describe('esmxDeclarationSchema', () => {
    it('should be a draft 2020-12 schema for the esmx field', () => {
        expect(esmxDeclarationSchema.$schema).toBe(
            'https://json-schema.org/draft/2020-12/schema'
        );
        expect(Object.keys(esmxDeclarationSchema.properties)).toEqual([
            'entry',
            'exports',
            'provides',
            'uses'
        ]);
        expect(esmxDeclarationSchema.additionalProperties).toBe(false);
    });
});

describe('validateDeclaration', () => {
    it('should accept a full valid declaration without diagnostics', () => {
        const input = {
            entry: {
                client: './src/entry.client.ts',
                server: './src/entry.server.ts'
            },
            exports: {
                './ui': './src/ui/index.ts',
                './store': {
                    client: './src/store.client.ts',
                    server: false
                }
            },
            provides: ['vue', '@esmx/router'],
            uses: ['shared']
        };

        const result = validateDeclaration(input, 'cart');

        expect(result.diagnostics).toEqual([]);
        expect(result.declaration).toEqual(input);
    });

    it('should reject a non-object esmx field', () => {
        const result = validateDeclaration('nope', 'cart');

        expect(result.declaration).toBeNull();
        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0].code).toBe(DiagnosticCode.E_SCHEMA);
        expect(result.diagnostics[0].severity).toBe('error');
        expect(result.diagnostics[0].module).toBe('cart');
    });

    it('should reject export keys without a ./ subpath prefix', () => {
        const result = validateDeclaration(
            { exports: { widget: './src/widget.ts' } },
            'cart'
        );

        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0].code).toBe(DiagnosticCode.E_SCHEMA);
        expect(result.diagnostics[0].message).toContain('"widget"');
        expect(result.declaration?.exports).toEqual({});
    });

    it('should reject non-relative export file paths', () => {
        const result = validateDeclaration(
            { exports: { './widget': 'src/widget.ts' } },
            'cart'
        );

        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0].code).toBe(DiagnosticCode.E_SCHEMA);
        expect(result.diagnostics[0].message).toContain('./');
    });

    it('should reject wrong types in provides and uses', () => {
        const result = validateDeclaration(
            { provides: 'vue', uses: ['shared', '', 42] },
            'cart'
        );

        const codes = result.diagnostics.map((d) => d.code);
        expect(codes).toEqual([
            DiagnosticCode.E_SCHEMA,
            DiagnosticCode.E_SCHEMA,
            DiagnosticCode.E_SCHEMA
        ]);
        expect(result.declaration?.provides).toBeUndefined();
        expect(result.declaration?.uses).toEqual(['shared']);
    });

    it('should reject non-relative entry paths and unknown keys', () => {
        const result = validateDeclaration(
            {
                entry: { client: 'src/entry.client.ts', node: './x.ts' },
                bogus: true
            },
            'cart'
        );

        const codes = result.diagnostics.map((d) => d.code);
        expect(codes).toHaveLength(3);
        expect(new Set(codes)).toEqual(new Set([DiagnosticCode.E_SCHEMA]));
    });

    it('should reject invalid env-fork values', () => {
        const result = validateDeclaration(
            { exports: { './store': { client: true, server: './s.ts' } } },
            'cart'
        );

        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0].code).toBe(DiagnosticCode.E_SCHEMA);
        expect(result.declaration?.exports).toEqual({});
    });
});
