import { describe, expect, it } from 'vitest';
import type { BuildTarget } from '../rspack';
import type { TargetSetting } from './target-setting';
import { getTargetSetting, PRESET_TARGETS } from './target-setting';

describe('getTargetSetting', () => {
    const buildTargets: BuildTarget[] = ['client', 'server', 'node'];

    describe('when setting is undefined', () => {
        it('should return compatible preset for all build targets', () => {
            buildTargets.forEach((buildTarget) => {
                const result = getTargetSetting(undefined, buildTarget);
                expect(result).toEqual(PRESET_TARGETS.compatible[buildTarget]);
            });
        });
    });

    describe('when setting is a string preset', () => {
        it('should return compatible preset for all build targets', () => {
            buildTargets.forEach((buildTarget) => {
                const result = getTargetSetting('compatible', buildTarget);
                expect(result).toEqual(PRESET_TARGETS.compatible[buildTarget]);
            });
        });

        it('should return modern preset for all build targets', () => {
            buildTargets.forEach((buildTarget) => {
                const result = getTargetSetting('modern', buildTarget);
                expect(result).toEqual(PRESET_TARGETS.modern[buildTarget]);
            });
        });
    });

    describe('when setting is a custom array', () => {
        const customTargets = ['chrome>=90', 'firefox>=80', 'safari>=14'];

        it('should return the custom array for all build targets', () => {
            buildTargets.forEach((buildTarget) => {
                const result = getTargetSetting(customTargets, buildTarget);
                expect(result).toEqual(customTargets);
            });
        });
    });

    describe('when setting is an object with specific build targets', () => {
        it('should return specified preset for configured build targets', () => {
            const setting: TargetSetting = {
                client: 'modern',
                server: 'compatible'
            };

            expect(getTargetSetting(setting, 'client')).toEqual(
                PRESET_TARGETS.modern.client
            );
            expect(getTargetSetting(setting, 'server')).toEqual(
                PRESET_TARGETS.compatible.server
            );
        });

        it('should return compatible preset for unconfigured build targets', () => {
            const setting: TargetSetting = {
                client: 'modern'
            };

            expect(getTargetSetting(setting, 'client')).toEqual(
                PRESET_TARGETS.modern.client
            );
            expect(getTargetSetting(setting, 'server')).toEqual(
                PRESET_TARGETS.compatible.server
            );
            expect(getTargetSetting(setting, 'node')).toEqual(
                PRESET_TARGETS.compatible.node
            );
        });

        it('should return custom array for configured build targets', () => {
            const customClientTargets = ['chrome>=90', 'firefox>=80'];
            const customServerTargets = ['node>=18'];
            const setting: TargetSetting = {
                client: customClientTargets,
                server: customServerTargets
            };

            expect(getTargetSetting(setting, 'client')).toEqual(
                customClientTargets
            );
            expect(getTargetSetting(setting, 'server')).toEqual(
                customServerTargets
            );
            expect(getTargetSetting(setting, 'node')).toEqual(
                PRESET_TARGETS.compatible.node
            );
        });

        it('should handle mixed preset and custom configurations', () => {
            const setting: TargetSetting = {
                client: 'modern',
                server: ['node>=18'],
                node: 'compatible'
            };

            expect(getTargetSetting(setting, 'client')).toEqual(
                PRESET_TARGETS.modern.client
            );
            expect(getTargetSetting(setting, 'server')).toEqual(['node>=18']);
            expect(getTargetSetting(setting, 'node')).toEqual(
                PRESET_TARGETS.compatible.node
            );
        });
    });

    describe('edge cases', () => {
        it('should handle empty custom array', () => {
            const result = getTargetSetting([], 'client');
            expect(result).toEqual([]);
        });

        it('should handle single item custom array', () => {
            const result = getTargetSetting(['chrome>=90'], 'client');
            expect(result).toEqual(['chrome>=90']);
        });
    });
});
