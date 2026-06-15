/**
 * Minimal semver-range satisfaction used by the declaration resolver.
 *
 * Supports the subset the RFC validation needs: exact versions, `^`, `~`,
 * comparators (`>=`, `>`, `<=`, `<`, `=`), `*`, x-ranges (`1.x`, `1.2.x`,
 * `1`, `1.2`), space-separated AND clauses and `||` OR clauses. Anything
 * else (workspace:, file:, link:, npm aliases, hyphen ranges) is reported
 * as unparsable so callers can skip the gate per RFC §11.
 */
export interface SemverVersion {
    major: number;
    minor: number;
    patch: number;
    prerelease: string[];
}

const VERSION_RE =
    /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

export function parseSemver(input: string): SemverVersion | null {
    const match = VERSION_RE.exec(input.trim());
    if (!match) {
        return null;
    }
    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        prerelease: match[4] ? match[4].split('.') : []
    };
}

function comparePrerelease(a: string[], b: string[]): number {
    if (a.length === 0 && b.length === 0) {
        return 0;
    }
    // A version without prerelease is greater than the same triple with one.
    if (a.length === 0) {
        return 1;
    }
    if (b.length === 0) {
        return -1;
    }
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i++) {
        const idA = a[i];
        const idB = b[i];
        if (idA === undefined) {
            return -1;
        }
        if (idB === undefined) {
            return 1;
        }
        const numA = /^\d+$/.test(idA) ? Number(idA) : null;
        const numB = /^\d+$/.test(idB) ? Number(idB) : null;
        if (numA !== null && numB !== null) {
            if (numA !== numB) {
                return numA < numB ? -1 : 1;
            }
        } else if (numA !== null) {
            // Numeric identifiers sort before alphanumeric ones.
            return -1;
        } else if (numB !== null) {
            return 1;
        } else if (idA !== idB) {
            return idA < idB ? -1 : 1;
        }
    }
    return 0;
}

export function compareSemver(a: SemverVersion, b: SemverVersion): number {
    if (a.major !== b.major) {
        return a.major < b.major ? -1 : 1;
    }
    if (a.minor !== b.minor) {
        return a.minor < b.minor ? -1 : 1;
    }
    if (a.patch !== b.patch) {
        return a.patch < b.patch ? -1 : 1;
    }
    return comparePrerelease(a.prerelease, b.prerelease);
}

interface PartialVersion {
    major: number | null;
    minor: number | null;
    patch: number | null;
    prerelease: string[];
}

function parsePartial(input: string): PartialVersion | null {
    const trimmed = input.trim().replace(/^v/, '');
    if (trimmed === '' || trimmed === '*' || /^x$/i.test(trimmed)) {
        return { major: null, minor: null, patch: null, prerelease: [] };
    }
    const exact = parseSemver(trimmed);
    if (exact) {
        return exact;
    }
    const segments = trimmed.split('.');
    if (segments.length > 3) {
        return null;
    }
    const parsed: Array<number | null> = [];
    for (const segment of segments) {
        if (segment === '*' || /^x$/i.test(segment)) {
            parsed.push(null);
        } else if (/^\d+$/.test(segment)) {
            parsed.push(Number(segment));
        } else {
            return null;
        }
    }
    return {
        major: parsed[0] ?? null,
        minor: parsed[1] ?? null,
        patch: parsed[2] ?? null,
        prerelease: []
    };
}

function lowerBound(partial: PartialVersion): SemverVersion {
    return {
        major: partial.major ?? 0,
        minor: partial.minor ?? 0,
        patch: partial.patch ?? 0,
        prerelease: partial.prerelease
    };
}

/** Exclusive upper bound for an x-range, or null when unbounded. */
function xRangeUpperBound(partial: PartialVersion): SemverVersion | null {
    if (partial.major === null) {
        return null;
    }
    if (partial.minor === null) {
        return { major: partial.major + 1, minor: 0, patch: 0, prerelease: [] };
    }
    if (partial.patch === null) {
        return {
            major: partial.major,
            minor: partial.minor + 1,
            patch: 0,
            prerelease: []
        };
    }
    return null;
}

function caretUpperBound(partial: PartialVersion): SemverVersion | null {
    if (partial.major === null) {
        return null;
    }
    if (partial.major > 0) {
        return { major: partial.major + 1, minor: 0, patch: 0, prerelease: [] };
    }
    if (partial.minor === null) {
        return { major: 1, minor: 0, patch: 0, prerelease: [] };
    }
    if (partial.minor > 0) {
        return { major: 0, minor: partial.minor + 1, patch: 0, prerelease: [] };
    }
    if (partial.patch === null) {
        return { major: 0, minor: partial.minor + 1, patch: 0, prerelease: [] };
    }
    return { major: 0, minor: 0, patch: partial.patch + 1, prerelease: [] };
}

function tildeUpperBound(partial: PartialVersion): SemverVersion | null {
    if (partial.major === null) {
        return null;
    }
    if (partial.minor === null) {
        return { major: partial.major + 1, minor: 0, patch: 0, prerelease: [] };
    }
    return {
        major: partial.major,
        minor: partial.minor + 1,
        patch: 0,
        prerelease: []
    };
}

function satisfiesComparator(
    version: SemverVersion,
    comparator: string
): boolean | null {
    const match = /^(\^|~|>=|<=|>|<|=)?\s*(.*)$/.exec(comparator.trim());
    if (!match) {
        return null;
    }
    const operator = match[1] ?? '';
    const partial = parsePartial(match[2]);
    if (!partial) {
        return null;
    }
    const lower = lowerBound(partial);
    switch (operator) {
        case '>=':
            return compareSemver(version, lower) >= 0;
        case '>':
            return compareSemver(version, lower) > 0;
        case '<=':
            return compareSemver(version, lower) <= 0;
        case '<':
            return compareSemver(version, lower) < 0;
        case '^': {
            if (compareSemver(version, lower) < 0) {
                return false;
            }
            const upper = caretUpperBound(partial);
            return upper === null || compareSemver(version, upper) < 0;
        }
        case '~': {
            if (compareSemver(version, lower) < 0) {
                return false;
            }
            const upper = tildeUpperBound(partial);
            return upper === null || compareSemver(version, upper) < 0;
        }
        default: {
            // '=' or bare version / x-range.
            if (
                partial.major !== null &&
                partial.minor !== null &&
                partial.patch !== null
            ) {
                return compareSemver(version, lower) === 0;
            }
            if (compareSemver(version, lower) < 0) {
                return false;
            }
            const upper = xRangeUpperBound(partial);
            return upper === null || compareSemver(version, upper) < 0;
        }
    }
}

/**
 * Returns true/false when both version and range are understood,
 * null when either is unparsable (caller skips the gate, RFC §11).
 */
export function satisfiesRange(version: string, range: string): boolean | null {
    const parsedVersion = parseSemver(version);
    if (!parsedVersion) {
        return null;
    }
    const trimmed = range.trim();
    if (trimmed === '' || trimmed === '*' || /^x$/i.test(trimmed)) {
        return true;
    }
    for (const clause of trimmed.split('||')) {
        const comparators = clause.trim().split(/\s+/).filter(Boolean);
        if (comparators.length === 0) {
            return null;
        }
        let clauseResult: boolean | null = true;
        for (const comparator of comparators) {
            const result = satisfiesComparator(parsedVersion, comparator);
            if (result === null) {
                clauseResult = null;
                break;
            }
            if (!result) {
                clauseResult = false;
                break;
            }
        }
        if (clauseResult === null) {
            return null;
        }
        if (clauseResult) {
            return true;
        }
    }
    return false;
}
