import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { assert, describe, test } from 'vitest';
import {
    analyzeDirectory,
    formatSize,
    generateSizeReport,
    generateTextReport
} from './file-size-stats';

describe('formatSize', () => {
    test('should format bytes correctly', () => {
        assert.equal(formatSize(0), '0 B');
        assert.equal(formatSize(512), '512 B');
        assert.equal(formatSize(1024), '1.0 KB');
        assert.equal(formatSize(1536), '1.5 KB');
        assert.equal(formatSize(1048576), '1.0 MB');
        assert.equal(formatSize(1073741824), '1.0 GB');
    });
});

describe('analyzeDirectory', () => {
    test('should throw error for non-existent directory', () => {
        try {
            analyzeDirectory('/non-existent-path');
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.equal(
                (error as Error).message,
                'Directory does not exist: /non-existent-path'
            );
        }
    });

    test('should throw error for file path', () => {
        const tempFile = path.join(tmpdir(), 'test-file.txt');
        fs.writeFileSync(tempFile, 'test content');

        try {
            try {
                analyzeDirectory(tempFile);
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.equal(
                    (error as Error).message,
                    `Path is not a directory: ${tempFile}`
                );
            }
        } finally {
            fs.unlinkSync(tempFile);
        }
    });

    test('should analyze empty directory', () => {
        const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'test-'));

        try {
            const report = analyzeDirectory(tempDir);

            assert.equal(report.totalFiles, 0);
            assert.equal(report.totalSize, 0);
            assert.equal(report.totalGzipSize, 0);
            assert.equal(report.compressionRatio, 0);
            assert.deepEqual(report.files, []);
            assert.deepEqual(report.byExtension, {});
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('should analyze directory with files', () => {
        const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'test-'));

        try {
            const jsContent = 'console.log("hello world");'.repeat(100);
            const cssContent = 'body { color: red; }'.repeat(50);
            const jsonContent = JSON.stringify({ test: 'data' });

            fs.writeFileSync(path.join(tempDir, 'test.js'), jsContent);
            fs.writeFileSync(path.join(tempDir, 'style.css'), cssContent);
            fs.writeFileSync(path.join(tempDir, 'data.json'), jsonContent);

            const subDir = path.join(tempDir, 'subdir');
            fs.mkdirSync(subDir);
            fs.writeFileSync(path.join(subDir, 'nested.js'), jsContent);

            const report = analyzeDirectory(tempDir);

            assert.equal(report.totalFiles, 4);
            assert.ok(report.totalSize > 0);
            assert.ok(report.totalGzipSize > 0);
            assert.ok(report.compressionRatio >= 0);

            assert.ok(report.byExtension['.js']);
            assert.ok(report.byExtension['.css']);
            assert.ok(report.byExtension['.json']);

            assert.equal(report.byExtension['.js'].count, 2);
            assert.equal(report.byExtension['.css'].count, 1);
            assert.equal(report.byExtension['.json'].count, 1);

            assert.equal(report.files.length, 4);

            const sizes = report.files.map((f) => f.size);
            assert.deepEqual(
                sizes,
                [...sizes].sort((a, b) => b - a)
            );
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
});

describe('generateTextReport', () => {
    test('should generate text report', () => {
        const report = {
            totalFiles: 2,
            totalSize: 2048,
            totalGzipSize: 1024,
            compressionRatio: 50,
            files: [
                {
                    path: '/test/large.js',
                    relativePath: 'large.js',
                    size: 1536,
                    gzipSize: 768,
                    ext: '.js'
                },
                {
                    path: '/test/small.css',
                    relativePath: 'small.css',
                    size: 512,
                    gzipSize: 256,
                    ext: '.css'
                }
            ],
            byExtension: {
                '.js': {
                    count: 1,
                    totalSize: 1536,
                    totalGzipSize: 768,
                    avgSize: 1536,
                    avgGzipSize: 768
                },
                '.css': {
                    count: 1,
                    totalSize: 512,
                    totalGzipSize: 256,
                    avgSize: 512,
                    avgGzipSize: 256
                }
            }
        };

        const text = generateTextReport(report);

        assert.ok(text.includes('📊 Bundle Analysis'));
        assert.ok(text.includes('large.js'));
        assert.ok(text.includes('small.css'));
        assert.ok(text.includes('Total: 2 files'));
    });
});

describe('generateSizeReport', () => {
    test('should generate report with text and json properties', () => {
        const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'test-'));

        try {
            fs.writeFileSync(
                path.join(tempDir, 'test.js'),
                'console.log("test");'
            );

            const report = generateSizeReport(tempDir);

            assert.ok(typeof report === 'object');
            assert.ok(typeof report.text === 'string');
            assert.ok(typeof report.json === 'object');
            assert.ok(report.text.includes('📊 Bundle Analysis'));
            assert.ok(!report.text.startsWith('{'));
            assert.ok(report.json.totalFiles !== undefined);
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('should generate report with pattern filter', () => {
        const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'test-'));

        try {
            fs.writeFileSync(
                path.join(tempDir, 'test.js'),
                'console.log("test");'
            );
            fs.writeFileSync(
                path.join(tempDir, 'test.css'),
                'body { color: red; }'
            );

            // Test with pattern that only matches .js files
            const report = generateSizeReport(tempDir, '*.js');

            assert.ok(typeof report === 'object');
            assert.ok(report.json.totalFiles === 1);
            assert.ok(report.json.files[0].ext === '.js');
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
