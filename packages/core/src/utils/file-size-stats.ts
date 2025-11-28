import fs, { globSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

export interface FileInfo {
    path: string;
    relativePath: string;
    size: number;
    gzipSize: number;
    ext: string;
}

export interface SizeStatsReport {
    totalFiles: number;
    totalSize: number;
    totalGzipSize: number;
    compressionRatio: number;
    files: FileInfo[];
    byExtension: Record<
        string,
        {
            count: number;
            totalSize: number;
            totalGzipSize: number;
            avgSize: number;
            avgGzipSize: number;
        }
    >;
}

function getGzipSize(filePath: string): number {
    try {
        const content = fs.readFileSync(filePath);
        const compressed = gzipSync(content, { level: 9 });
        return compressed.length;
    } catch (error) {
        return fs.statSync(filePath).size;
    }
}

function getAllFiles(dirPath: string, pattern = '**/!(.*)'): string[] {
    const files = globSync(pattern, {
        cwd: dirPath
    });

    return files
        .map((relativePath) => path.resolve(dirPath, relativePath))
        .filter((filePath) => fs.statSync(filePath).isFile());
}

export function analyzeDirectory(
    dirPath: string,
    pattern?: string
): SizeStatsReport {
    if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory does not exist: ${dirPath}`);
    }

    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
        throw new Error(`Path is not a directory: ${dirPath}`);
    }

    const files = getAllFiles(dirPath, pattern);
    const fileInfos: FileInfo[] = [];
    const byExtension: Record<
        string,
        {
            count: number;
            totalSize: number;
            totalGzipSize: number;
            avgSize: number;
            avgGzipSize: number;
        }
    > = {};

    let totalSize = 0;
    let totalGzipSize = 0;

    for (const filePath of files) {
        const fileStat = fs.statSync(filePath);
        const size = fileStat.size;
        const gzipSize = getGzipSize(filePath);
        const relativePath = path.relative(process.cwd(), filePath);
        const ext = path.extname(filePath).toLowerCase() || '(no ext)';

        const fileInfo: FileInfo = {
            path: filePath,
            relativePath,
            size,
            gzipSize,
            ext
        };

        fileInfos.push(fileInfo);
        totalSize += size;
        totalGzipSize += gzipSize;

        if (!byExtension[ext]) {
            byExtension[ext] = {
                count: 0,
                totalSize: 0,
                totalGzipSize: 0,
                avgSize: 0,
                avgGzipSize: 0
            };
        }

        byExtension[ext].count++;
        byExtension[ext].totalSize += size;
        byExtension[ext].totalGzipSize += gzipSize;
    }

    Object.values(byExtension).forEach((group) => {
        group.avgSize = Math.round(group.totalSize / group.count);
        group.avgGzipSize = Math.round(group.totalGzipSize / group.count);
    });

    fileInfos.sort((a, b) => b.size - a.size);

    const compressionRatio =
        totalSize > 0 ? ((totalSize - totalGzipSize) / totalSize) * 100 : 0;

    return {
        totalFiles: files.length,
        totalSize,
        totalGzipSize,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        files: fileInfos,
        byExtension
    };
}

export function formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function generateTextReport(report: SizeStatsReport): string {
    const lines: string[] = [];

    lines.push('📊 Bundle Analysis');
    lines.push('='.repeat(50));
    lines.push('');

    const maxPathLength = Math.max(
        ...report.files.map((f) => f.relativePath.length)
    );
    const sizeHeader = 'Size'.padStart(10);
    const gzippedHeader = 'Gzipped'.padStart(10);
    const header = `File${' '.repeat(maxPathLength - 4)}  ${sizeHeader}  ${gzippedHeader}`;
    lines.push(header);
    lines.push('-'.repeat(header.length));

    for (const file of report.files) {
        const paddedPath = file.relativePath.padEnd(maxPathLength);
        const sizeStr = formatSize(file.size).padStart(10);
        const gzipStr = formatSize(file.gzipSize).padStart(10);
        lines.push(`${paddedPath}  ${sizeStr}  ${gzipStr}`);
    }

    lines.push('');
    lines.push(
        `Total: ${report.totalFiles} files, ${formatSize(report.totalSize)} (gzipped: ${formatSize(report.totalGzipSize)})`
    );

    return lines.join('\n');
}

export function generateJsonReport(report: SizeStatsReport): string {
    return JSON.stringify(report, null, 2);
}

export function generateSizeReport(dirPath: string, pattern?: string) {
    const json = analyzeDirectory(dirPath, pattern);

    return {
        text: generateTextReport(json),
        json
    };
}
