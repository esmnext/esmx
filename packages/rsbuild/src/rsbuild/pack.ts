import type { Esmx, ManifestJson } from '@esmx/core';

/**
 * Write a minimal dist/package.json describing the built module's export map,
 * mirroring the subset of @esmx/rspack's pack() that runs with tarball
 * packaging disabled (the default).
 */
export function writeDistPackageJson(esmx: Esmx): void {
    const readManifest = (env: 'client' | 'server'): ManifestJson | null => {
        try {
            return esmx.readJsonSync<ManifestJson>(
                esmx.resolvePath(`dist/${env}`, 'manifest.json')
            );
        } catch {
            return null;
        }
    };

    const client = readManifest('client');
    const server = readManifest('server');

    const exportsField: Record<string, unknown> = {};
    const names = new Set<string>([
        ...Object.keys(client?.exports ?? {}),
        ...Object.keys(server?.exports ?? {})
    ]);
    for (const name of names) {
        const clientExport = client?.exports[name];
        const serverExport = server?.exports[name];
        const key = name === 'index' ? '.' : `./${name}`;
        const entry: Record<string, string> = {};
        if (serverExport) entry.default = `./server/${serverExport.file}`;
        if (clientExport) entry.browser = `./client/${clientExport.file}`;
        if (Object.keys(entry).length > 0) exportsField[key] = entry;
    }

    esmx.writeSync(
        esmx.resolvePath('dist/package.json'),
        JSON.stringify(
            {
                name: esmx.name,
                version: '1.0.0',
                type: 'module',
                exports: exportsField
            },
            null,
            4
        )
    );
}
