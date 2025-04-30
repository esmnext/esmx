import path from 'node:path';

import { pathWithoutIndex } from './path-without-index';

import type { ImportMap, ScopesMap, SpecifierMap } from '@esmx/import';
import type { ManifestJson } from '../manifest-json';

/**
 * 获取导入映射对象
 */
export async function getImportMap(
    manifests: readonly ManifestJson[],
    rootMap: Record<string, string>
): Promise<ImportMap> {
    const imports: SpecifierMap = {};
    const scopes: ScopesMap = {};
    for (const manifest of Object.values(manifests)) {
        for (const exportItem of Object.values(manifest.exports)) {
            const root = path.join(rootMap[manifest.name], '/');
            if (!root) {
                throw new Error(`Cannot find root for ${manifest.name}`);
            }
            if (exportItem.rewrite) {
                imports[exportItem.identifier] = path.resolve(
                    root,
                    exportItem.file
                );
            } else {
                scopes[root] = scopes[root] ?? {};
                scopes[root][exportItem.identifier] = path.resolve(
                    root,
                    exportItem.file
                );
            }
        }
    }
    pathWithoutIndex(imports);
    return { scopes, imports };
}
