import { describe, expect, it } from 'vitest';

import { compareSemver, parseSemver, satisfiesRange } from './semver';

describe('parseSemver', () => {
    it('should parse a plain version', () => {
        const result = parseSemver('3.4.21');

        expect(result).toEqual({
            major: 3,
            minor: 4,
            patch: 21,
            prerelease: []
        });
    });

    it('should parse a prerelease version with build metadata', () => {
        const result = parseSemver('1.2.3-beta.1+build.5');

        expect(result).toEqual({
            major: 1,
            minor: 2,
            patch: 3,
            prerelease: ['beta', '1']
        });
    });

    it('should return null for non-version input', () => {
        expect(parseSemver('workspace:*')).toBeNull();
        expect(parseSemver('not-a-version')).toBeNull();
        expect(parseSemver('1.2')).toBeNull();
    });
});

describe('compareSemver', () => {
    it('should order versions by triple then prerelease', () => {
        const v340 = parseSemver('3.4.0');
        const v352 = parseSemver('3.5.2');
        const v352beta = parseSemver('3.5.2-beta.1');
        if (!v340 || !v352 || !v352beta) {
            throw new Error('fixture versions must parse');
        }

        expect(compareSemver(v340, v352)).toBe(-1);
        expect(compareSemver(v352, v340)).toBe(1);
        expect(compareSemver(v352, v352)).toBe(0);
        expect(compareSemver(v352beta, v352)).toBe(-1);
    });
});

describe('satisfiesRange', () => {
    it('should handle caret ranges', () => {
        expect(satisfiesRange('3.5.2', '^3.4.0')).toBe(true);
        expect(satisfiesRange('4.0.0', '^3.4.0')).toBe(false);
        expect(satisfiesRange('3.3.9', '^3.4.0')).toBe(false);
        expect(satisfiesRange('0.2.5', '^0.2.3')).toBe(true);
        expect(satisfiesRange('0.3.0', '^0.2.3')).toBe(false);
        expect(satisfiesRange('0.0.3', '^0.0.3')).toBe(true);
        expect(satisfiesRange('0.0.4', '^0.0.3')).toBe(false);
    });

    it('should handle tilde ranges', () => {
        expect(satisfiesRange('1.2.9', '~1.2.3')).toBe(true);
        expect(satisfiesRange('1.3.0', '~1.2.3')).toBe(false);
        expect(satisfiesRange('1.5.0', '~1')).toBe(true);
        expect(satisfiesRange('2.0.0', '~1')).toBe(false);
    });

    it('should handle comparator ranges', () => {
        expect(satisfiesRange('3.4.0', '>=3.4.0')).toBe(true);
        expect(satisfiesRange('3.3.9', '>=3.4.0')).toBe(false);
        expect(satisfiesRange('3.4.0', '>3.4.0')).toBe(false);
        expect(satisfiesRange('3.4.0', '<=3.4.0')).toBe(true);
        expect(satisfiesRange('3.4.0', '<3.4.0')).toBe(false);
        expect(satisfiesRange('3.4.0', '=3.4.0')).toBe(true);
    });

    it('should handle exact versions, star and x-ranges', () => {
        expect(satisfiesRange('3.4.21', '3.4.21')).toBe(true);
        expect(satisfiesRange('3.4.22', '3.4.21')).toBe(false);
        expect(satisfiesRange('9.9.9', '*')).toBe(true);
        expect(satisfiesRange('1.7.0', '1.x')).toBe(true);
        expect(satisfiesRange('2.0.0', '1.x')).toBe(false);
        expect(satisfiesRange('1.2.9', '1.2.x')).toBe(true);
        expect(satisfiesRange('1.3.0', '1.2.x')).toBe(false);
        expect(satisfiesRange('1.5.0', '1')).toBe(true);
    });

    it('should handle compound AND and OR clauses', () => {
        expect(satisfiesRange('1.5.0', '>=1.2.0 <2.0.0')).toBe(true);
        expect(satisfiesRange('2.1.0', '>=1.2.0 <2.0.0')).toBe(false);
        expect(satisfiesRange('2.1.0', '^1.0.0 || ^2.0.0')).toBe(true);
        expect(satisfiesRange('3.0.0', '^1.0.0 || ^2.0.0')).toBe(false);
    });

    it('should return null for unparsable ranges or versions', () => {
        expect(satisfiesRange('1.0.0', 'workspace:*')).toBeNull();
        expect(satisfiesRange('1.0.0', 'npm:vue@^3.0.0')).toBeNull();
        expect(satisfiesRange('not-a-version', '^1.0.0')).toBeNull();
    });
});
