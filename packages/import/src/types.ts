export type SpecifierMap = Record<string, string>;

export type ScopesMap = Record<string, SpecifierMap>;

export interface ImportMap {
    imports?: SpecifierMap;
    scopes?: ScopesMap;
}

export type ImportMapResolver = (
    specifier: string,
    parent: string
) => string | null;
