import path from 'node:path/posix';
import { pathWithoutIndex } from './path-without-index';

import type { ImportMap, ScopesMap, SpecifierMap } from '@esmx/import';
import type { BuildSsrTarget } from '../core';
import type { ManifestJson } from '../manifest-json';
import type { ParsedModuleConfig } from '../module-config';

/**
 * 获取导入映射对象
 */
export async function getImportMap(
    target: BuildSsrTarget,
    manifests: readonly ManifestJson[],
    moduleConfig: ParsedModuleConfig
): Promise<ImportMap> {
    const imports: SpecifierMap = {};
    const scopes: ScopesMap = {};

    const rootMap: Record<string, string> = {};
    Object.values(moduleConfig.links).forEach((link) => {
        rootMap[link.name] = link[target];
    });

    // console.log('getImportMap target: %o, moduleConfig.links: %o', target, moduleConfig.links);

    for (const manifest of manifests) {
        for (const exportItem of Object.values(manifest.exports)) {
            if (!(manifest.name in rootMap)) {
                throw new Error(
                    `'${manifest.name}'(${target}) did not find module config`
                );
            }
            const pathPrefix =
                target === 'server'
                    ? path.join(path.resolve(rootMap[manifest.name]), '/')
                    : path.join('/', manifest.name, '/');
            if (exportItem.rewrite) {
                imports[exportItem.identifier] = path.join(
                    pathPrefix,
                    exportItem.file
                );
            } else {
                scopes[pathPrefix] ??= {};
                scopes[pathPrefix][exportItem.identifier] = path.join(
                    pathPrefix,
                    exportItem.file
                );
            }
        }
    }

    // TODO: scopes 相同库变量提升

    // console.log('manifests.exports: %o, rootMap: %o, scopes: %o, imports: %o\n', manifests.map(m => m.exports), rootMap, scopes, imports);

    pathWithoutIndex(imports);
    return { scopes, imports };
}
