import crypto from 'node:crypto';
import type { Esmx, ManifestJson } from '@esmx/core';
import Arborist from '@npmcli/arborist';
import pacote from 'pacote';

export async function pack(esmx: Esmx): Promise<boolean> {
    const { packConfig } = esmx;

    const pkgJson = await packConfig.packageJson(
        esmx,
        await buildPackageJson(esmx)
    );
    esmx.writeSync(
        esmx.resolvePath('dist/package.json'),
        JSON.stringify(pkgJson, null, 4)
    );

    if (!packConfig.enable) {
        return true;
    }

    await packConfig.onBefore(esmx, pkgJson);

    const data = await pacote.tarball(esmx.resolvePath('dist'), {
        Arborist
    });
    const hash = contentHash(data);
    packConfig.outputs.forEach((file) => {
        const tgz = esmx.resolvePath('./', file);
        const txt = tgz.replace(/\.tgz$/, '.txt');
        esmx.writeSync(tgz, data);
        esmx.writeSync(txt, hash);
    });

    await packConfig.onAfter(esmx, pkgJson, data);
    return true;
}

export interface GenerateExportsOptions {
    client: ManifestJson['exports'];
    server: ManifestJson['exports'];
    base?: Record<string, unknown>;
}

export function generateExports(
    options: GenerateExportsOptions
): Record<string, unknown> {
    const { client, server, base = {} } = options;
    const exports: Record<string, unknown> = { ...base };

    const set = new Set([...Object.keys(client), ...Object.keys(server)]);

    set.forEach((name) => {
        const clientExport = client[name];
        const serverExport = server[name];
        const exportName = name === 'index' ? '.' : `./${name}`;

        if (clientExport && serverExport) {
            exports[exportName] = {
                default: `./server/${serverExport.file}`,
                browser: `./client/${clientExport.file}`
            };
        } else if (clientExport) {
            exports[exportName] = `./client/${clientExport.file}`;
        } else if (serverExport) {
            exports[exportName] = `./server/${serverExport.file}`;
        }
    });

    return exports;
}

async function buildPackageJson(esmx: Esmx): Promise<Record<string, any>> {
    const [clientJson, serverJson, curJson] = await Promise.all([
        esmx.readJson<ManifestJson>(
            esmx.resolvePath('dist/client/manifest.json')
        ),
        esmx.readJson<ManifestJson>(
            esmx.resolvePath('dist/server/manifest.json')
        ),
        esmx.readJson(esmx.resolvePath('package.json'))
    ]);

    const exports = generateExports({
        client: clientJson.exports,
        server: serverJson.exports,
        base: curJson?.exports
    });

    const buildJson: Record<string, any> = {
        ...curJson,
        exports
    };
    return buildJson;
}

export function contentHash(buffer: Buffer, algorithm = 'sha256') {
    const hash = crypto.createHash(algorithm);
    hash.update(buffer);
    return `${algorithm}-${hash.digest('hex')}`;
}
