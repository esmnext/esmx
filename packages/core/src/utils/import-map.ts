import path from 'node:path';

import { pathWithoutIndex } from './path-without-index';

import type { ImportMap, SpecifierMap } from '@esmx/import';
import type { RuntimeTarget } from '../esmx';
import type { ManifestJson } from '../manifest-json';
import type { ParsedModuleConfig } from '../module-config';

/**
 * 获取导入映射对象
 */
export async function getImportMap(
    target: RuntimeTarget,
    manifests: readonly ManifestJson[],
    moduleConfig: ParsedModuleConfig
): Promise<ImportMap> {
    const imports: SpecifierMap = {};
    if (target === 'client') {
        for (const manifest of manifests) {
            for (const [name, value] of Object.entries(manifest.exports)) {
                imports[`${manifest.name}/${name}`] =
                    `/${manifest.name}/${value}`;
            }
        }
    } else {
        for (const manifest of manifests) {
            const link = moduleConfig.links.find(
                (item) => item.name === manifest.name
            );
            if (!link) {
                throw new Error(
                    `'${manifest.name}' service did not find module config`
                );
            }
            for (const [name, value] of Object.entries(manifest.exports)) {
                imports[`${manifest.name}/${name}`] = path.resolve(
                    link.root,
                    'server',
                    value.name
                );
            }
        }
    }
    pathWithoutIndex(imports);
    return { imports };
}
