export type SpecifierMap = Record<string, string>;

export type ScopesMap = Record<string, SpecifierMap>;

export type IntegrityMap = Record<string, string>;

export interface ImportMap {
    imports?: SpecifierMap;
    scopes?: ScopesMap;
    /**
     * Subresource Integrity metadata, mapping module URLs to integrity hashes.
     * Part of the Import Maps specification; ignored by browsers that do not
     * support it.
     */
    integrity?: IntegrityMap;
}

export type ImportMapResolver = (
    specifier: string,
    parent: string
) => string | null;
