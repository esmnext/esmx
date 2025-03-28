import crypto from 'node:crypto';
import type { Esmx } from '@esmx/core';
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

async function buildPackageJson(esmx: Esmx): Promise<Record<string, any>> {
    const [clientJson, serverJson, curJson] = await Promise.all([
        esmx.readJson(esmx.resolvePath('dist/client/manifest.json')),
        esmx.readJson(esmx.resolvePath('dist/server/manifest.json')),
        esmx.readJson(esmx.resolvePath('package.json'))
    ]);
    const exports: Record<string, any> = {
        ...curJson?.exports
    };
    const set = new Set([
        ...Object.keys(clientJson.exports),
        ...Object.keys(serverJson.exports)
    ]);
    set.forEach((name) => {
        const client = clientJson.exports[name];
        const server = serverJson.exports[name];
        const exportName = `./${name}`;
        if (client && server) {
            exports[exportName] = {
                default: `./server/${server}`,
                browser: `./client/${client}`
            };
        } else if (client) {
            exports[exportName] = `./client/${client}`;
        } else if (server) {
            exports[exportName] = `./server/${server}`;
        }
    });

    const buildJson: Record<string, any> = {
        ...curJson,
        exports
    };
    return buildJson;
}

function contentHash(buffer: Buffer, algorithm = 'sha256') {
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return `${algorithm}-${hash.digest('hex')}`;
}
