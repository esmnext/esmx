import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/** Test-only helpers building fake package trees in temp directories. */
export interface FixturePackage {
    /** Directory relative to the fixture root. */
    dir: string;
    packageJson: Record<string, unknown>;
    /** Write a dist/client/manifest.json stub (marks the module as built). */
    built?: boolean;
    /** Manifest content for the stub; implies `built`. */
    manifest?: Record<string, unknown>;
}

export async function createFixtureRoot(): Promise<string> {
    const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'esmx-declaration-'));
    // realpath once: macOS tmpdirs are symlinked (/var → /private/var).
    return fs.realpathSync(dir);
}

export function writeFixturePackage(
    rootDir: string,
    pkg: FixturePackage
): string {
    const dir = path.join(rootDir, pkg.dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify(pkg.packageJson, null, 4)
    );
    if (pkg.built || pkg.manifest) {
        const clientDir = path.join(dir, 'dist/client');
        fs.mkdirSync(clientDir, { recursive: true });
        fs.writeFileSync(
            path.join(clientDir, 'manifest.json'),
            JSON.stringify(pkg.manifest ?? {})
        );
    }
    return dir;
}

export async function removeFixtureRoot(rootDir: string): Promise<void> {
    await fsp.rm(rootDir, { recursive: true, force: true });
}
