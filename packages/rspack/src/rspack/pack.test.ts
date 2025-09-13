import type { ManifestJsonExports } from '@esmx/core';
import { describe, expect, it } from 'vitest';
import { contentHash, generateExports } from './pack';

describe('generateExports', () => {
    it('should generate exports with both client and server files', () => {
        const clientExports: ManifestJsonExports = {
            'src/entry.client': {
                file: 'exports/src/entry.client.95f6085b.final.mjs',
                name: 'src/entry.client',
                pkg: true,
                identifier: 'ssr-vue2-remote/src/entry.client'
            },
            'src/components/index': {
                file: 'exports/src/components/index.a73d6772.final.mjs',
                name: 'src/components/index',
                pkg: true,
                identifier: 'ssr-vue2-remote/src/components/index'
            }
        };

        const serverExports: ManifestJsonExports = {
            'src/entry.server': {
                file: 'exports/src/entry.server.b85ed2ff.final.mjs',
                name: 'src/entry.server',
                pkg: true,
                identifier: 'ssr-vue2-remote/src/entry.server'
            },
            'src/components/index': {
                file: 'exports/src/components/index.12b57db5.final.mjs',
                name: 'src/components/index',
                pkg: true,
                identifier: 'ssr-vue2-remote/src/components/index'
            }
        };

        const result = generateExports({
            client: clientExports,
            server: serverExports
        });

        expect(result).toEqual({
            './src/entry.client':
                './client/exports/src/entry.client.95f6085b.final.mjs',
            './src/entry.server':
                './server/exports/src/entry.server.b85ed2ff.final.mjs',
            './src/components/index': {
                default:
                    './server/exports/src/components/index.12b57db5.final.mjs',
                browser:
                    './client/exports/src/components/index.a73d6772.final.mjs'
            }
        });
    });

    it('should merge with existing exports', () => {
        const clientExports: ManifestJsonExports = {
            index: {
                file: 'index.js',
                name: 'index',
                pkg: true,
                identifier: 'index'
            }
        };

        const serverExports: ManifestJsonExports = {
            index: {
                file: 'index.js',
                name: 'index',
                pkg: true,
                identifier: 'index'
            }
        };

        const existingExports = {
            './custom': './custom.js'
        };

        const result = generateExports({
            client: clientExports,
            server: serverExports,
            base: existingExports
        });

        expect(result).toEqual({
            './custom': './custom.js',
            '.': {
                default: './server/index.js',
                browser: './client/index.js'
            }
        });
    });

    it('should handle empty exports', () => {
        const clientExports: ManifestJsonExports = {};
        const serverExports: ManifestJsonExports = {};

        const result = generateExports({
            client: clientExports,
            server: serverExports
        });

        expect(result).toEqual({});
    });

    it('should handle only client exports', () => {
        const clientExports: ManifestJsonExports = {
            utils: {
                file: 'utils.js',
                name: 'utils',
                pkg: true,
                identifier: 'utils'
            }
        };

        const serverExports: ManifestJsonExports = {};

        const result = generateExports({
            client: clientExports,
            server: serverExports
        });

        expect(result).toEqual({
            './utils': './client/utils.js'
        });
    });

    it('should handle only server exports', () => {
        const clientExports: ManifestJsonExports = {};

        const serverExports: ManifestJsonExports = {
            api: {
                file: 'api.js',
                name: 'api',
                pkg: true,
                identifier: 'api'
            }
        };

        const result = generateExports({
            client: clientExports,
            server: serverExports
        });

        expect(result).toEqual({
            './api': './server/api.js'
        });
    });

    it('should handle index export correctly', () => {
        const clientExports: ManifestJsonExports = {
            index: {
                file: 'index.js',
                name: 'index',
                pkg: true,
                identifier: 'index'
            }
        };

        const serverExports: ManifestJsonExports = {
            index: {
                file: 'index.js',
                name: 'index',
                pkg: true,
                identifier: 'index'
            }
        };

        const result = generateExports({
            client: clientExports,
            server: serverExports
        });

        expect(result).toEqual({
            '.': {
                default: './server/index.js',
                browser: './client/index.js'
            }
        });
    });
});

describe('contentHash', () => {
    it('should generate SHA256 hash for buffer', () => {
        const buffer = Buffer.from('test content');
        const result = contentHash(buffer);

        expect(result).toMatch(/^sha256-[a-f0-9]{64}$/);
        expect(result).toBe(
            'sha256-6ae8a75555209fd6c44157c0aed8016e763ff435a19cf186f76863140143ff72'
        );
    });

    it('should use custom algorithm when provided', () => {
        const buffer = Buffer.from('test content');
        const result = contentHash(buffer, 'md5');

        expect(result).toMatch(/^md5-[a-f0-9]{32}$/);
        expect(result).toBe('md5-9473fdd0d880a43c21b7778d34872157');
    });

    it('should handle empty buffer', () => {
        const buffer = Buffer.from('');
        const result = contentHash(buffer);

        expect(result).toBe(
            'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        );
    });

    it('should handle binary data', () => {
        const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff]);
        const result = contentHash(buffer);

        expect(result).toMatch(/^sha256-[a-f0-9]{64}$/);
    });
});
