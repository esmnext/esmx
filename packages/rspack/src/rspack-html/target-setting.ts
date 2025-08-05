import type { BuildTarget } from '../rspack/build-target';

export type TargetPreset = 'compatible' | 'modern';

export type TargetSpec = TargetPreset | string[];

export type TargetSetting =
    | TargetSpec
    | Partial<Record<BuildTarget, TargetSpec>>;

export const PRESET_TARGETS = {
    compatible: {
        client: ['chrome>=64', 'edge>=79', 'firefox>=67', 'safari>=11.1'],
        server: ['node>=24'],
        node: ['node>=24']
    },
    modern: {
        client: ['chrome>=89', 'edge>=89', 'firefox>=108', 'safari>=16.4'],
        server: ['node>=24'],
        node: ['node>=24']
    }
} as const;

function resolveTargetSpec(
    spec: TargetSpec,
    buildTarget: BuildTarget
): string[] {
    if (typeof spec === 'string') {
        return [...PRESET_TARGETS[spec][buildTarget]];
    }
    return spec;
}

export function getTargetSetting(
    setting: TargetSetting | undefined,
    buildTarget: BuildTarget
): string[] {
    if (!setting) {
        return [...PRESET_TARGETS.compatible[buildTarget]];
    }

    if (typeof setting === 'string' || Array.isArray(setting)) {
        return resolveTargetSpec(setting, buildTarget);
    }

    const targetSpec = setting[buildTarget];
    if (!targetSpec) {
        return [...PRESET_TARGETS.compatible[buildTarget]];
    }

    return resolveTargetSpec(targetSpec, buildTarget);
}
