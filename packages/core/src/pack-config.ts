import type { Esmx } from './core';

/**
 * Package configuration interface.
 * Used to package build artifacts into standard npm .tgz format packages.
 *
 * Features:
 * - **Standardization**: Uses npm standard .tgz packaging format
 * - **Completeness**: Contains all necessary files including module source code, type declarations, and configuration files
 * - **Compatibility**: Fully compatible with npm ecosystem, supporting standard package management workflows
 *
 * Use Cases:
 * - Module packaging and publishing
 * - Version release management
 * - CI/CD process integration
 *
 * @example
 * ```ts
 * // entry.node.ts
 * import type { EsmxOptions } from '@esmx/core';
 *
 * export default {
 *   modules: {
 *     // Configure modules to export
 *     exports: [
 *       'root:src/components/button.vue',
 *       'root:src/utils/format.ts',
 *       'pkg:vue',
 *       'pkg:vue-router'
 *     ]
 *   },
 *   // Packaging configuration
 *   pack: {
 *     // Enable packaging functionality
 *     enable: true,
 *
 *     // Output multiple versions simultaneously
 *     outputs: [
 *       'dist/versions/latest.tgz',
 *       'dist/versions/1.0.0.tgz'
 *     ],
 *
 *     // Customize package.json
 *     packageJson: async (esmx, pkg) => {
 *       pkg.name = '@your-scope/your-app';
 *       pkg.version = '1.0.0';
 *       // Add build scripts
 *       pkg.scripts = {
 *         "prepare": "npm run build",
 *         "build": "npm run build:dts && npm run build:ssr",
 *         "build:ssr": "esmx build",
 *         "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
 *       };
 *       return pkg;
 *     },
 *
 *     // Pre-packaging preparation
 *     onBefore: async (esmx, pkg) => {
 *       // Add necessary files
 *       await fs.writeFile('dist/README.md', '# Your App\n\nModule export description...');
 *       // Execute type checking
 *       await runTypeCheck();
 *     },
 *
 *     // Post-packaging processing
 *     onAfter: async (esmx, pkg, file) => {
 *       // Publish to private npm registry
 *       await publishToRegistry(file, {
 *         registry: 'https://npm.your-registry.com/'
 *       });
 *       // Or deploy to static server
 *       await uploadToServer(file, 'https://static.example.com/packages');
 *     }
 *   }
 * } satisfies EsmxOptions;
 * ```
 */
export interface PackConfig {
    /**
     * Whether to enable packaging functionality.
     * When enabled, build artifacts will be packaged into standard npm .tgz format packages.
     * @default false
     */
    enable?: boolean;

    /**
     * Specify the output package file path.
     * Supports the following configuration methods:
     * - string: Single output path, e.g., 'dist/versions/my-app.tgz'
     * - string[]: Multiple output paths for generating multiple versions simultaneously
     * - boolean: When true, uses default path 'dist/client/versions/latest.tgz'
     *
     * @example
     * ```ts
     * // Single output
     * outputs: 'dist/app.tgz'
     *
     * // Multiple versions
     * outputs: [
     *   'dist/versions/latest.tgz',
     *   'dist/versions/1.0.0.tgz'
     * ]
     *
     * // Use default path
     * outputs: true
     * ```
     *
     * @default 'dist/client/versions/latest.tgz'
     */
    outputs?: string | string[] | boolean;

    /**
     * package.json processing function.
     * Called before packaging to customize the content of package.json.
     *
     * Common use cases:
     * - Modify package name and version
     * - Add or update dependencies
     * - Add custom fields
     * - Configure publishing related information
     *
     * @param esmx - Esmx instance
     * @param pkgJson - Original package.json content
     * @returns Processed package.json content
     *
     * @example
     * ```ts
     * packageJson: async (esmx, pkg) => {
     *   // Set package information
     *   pkg.name = 'my-app';
     *   pkg.version = '1.0.0';
     *   pkg.description = 'My Application';
     *
     *   // Add dependencies
     *   pkg.dependencies = {
     *     'vue': '^3.0.0',
     *     'express': '^4.17.1'
     *   };
     *
     *   // Add publishing configuration
     *   pkg.publishConfig = {
     *     registry: 'https://registry.example.com'
     *   };
     *
     *   return pkg;
     * }
     * ```
     */
    packageJson?: (
        esmx: Esmx,
        pkgJson: Record<string, any>
    ) => Promise<Record<string, any>>;

    /**
     * Pre-packaging hook function.
     * Called before generating .tgz file to execute preparation work.
     *
     * Common use cases:
     * - Add additional files (README, LICENSE, etc.)
     * - Execute tests or build validation
     * - Generate documentation or metadata
     * - Clean up temporary files
     *
     * @param esmx - Esmx instance
     * @param pkgJson - Processed package.json content
     *
     * @example
     * ```ts
     * onBefore: async (esmx, pkg) => {
     *   // Add documentation
     *   await fs.writeFile('dist/README.md', '# My App');
     *   await fs.writeFile('dist/LICENSE', 'MIT License');
     *
     *   // Execute tests
     *   await runTests();
     *
     *   // Generate documentation
     *   await generateDocs();
     * }
     * ```
     */
    onBefore?: (esmx: Esmx, pkgJson: Record<string, any>) => Promise<void>;

    /**
     * Post-packaging hook function.
     * Called after .tgz file is generated to handle packaging artifacts.
     *
     * Common use cases:
     * - Publish to npm registry (public or private)
     * - Upload to static asset server
     * - Execute version management
     * - Trigger CI/CD processes
     *
     * @param esmx - Esmx instance
     * @param pkgJson - Final package.json content
     * @param file - Generated .tgz file content
     *
     * @example
     * ```ts
     * onAfter: async (esmx, pkg, file) => {
     *   // Publish to npm private registry
     *   await publishToRegistry(file, {
     *     registry: 'https://registry.example.com'
     *   });
     *
     *   // Upload to static asset server
     *   await uploadToServer(file, 'https://assets.example.com/packages');
     *
     *   // Create version tag
     *   await createGitTag(pkg.version);
     *
     *   // Trigger deployment process
     *   await triggerDeploy(pkg.version);
     * }
     * ```
     */
    onAfter?: (
        esmx: Esmx,
        pkgJson: Record<string, any>,
        file: Buffer
    ) => Promise<void>;
}

/**
 * Internal interface after PackConfig configuration is parsed.
 * Standardizes user configuration, sets default values, for internal framework use.
 *
 * Main processing:
 * - Ensure all optional fields have default values
 * - Unify output path format
 * - Standardize callback functions
 */
export interface ParsedPackConfig {
    /**
     * Whether to enable packaging functionality.
     * Always has a definite boolean value after parsing.
     * @default false
     */
    enable: boolean;

    /**
     * Parsed output file path list.
     * Converts all output formats uniformly to string arrays:
     * - Boolean true → ['dist/client/versions/latest.tgz']
     * - String → [input string]
     * - String array → remains unchanged
     */
    outputs: string[];

    /**
     * Standardized package.json processing function.
     * Uses default function when not configured, keeping original content unchanged.
     */
    packageJson: (
        esmx: Esmx,
        pkgJson: Record<string, any>
    ) => Promise<Record<string, any>>;

    /**
     * Standardized pre-packaging hook function.
     * Uses empty function when not configured.
     */
    onBefore: (esmx: Esmx, pkgJson: Record<string, any>) => Promise<void>;

    /**
     * Standardized post-packaging hook function.
     * Uses empty function when not configured.
     */
    onAfter: (
        esmx: Esmx,
        pkgJson: Record<string, any>,
        file: Buffer
    ) => Promise<void>;
}

export function parsePackConfig(config: PackConfig = {}): ParsedPackConfig {
    const outputs: string[] = [];
    if (typeof config.outputs === 'string') {
        outputs.push(config.outputs);
    } else if (Array.isArray(config.outputs)) {
        outputs.push(...config.outputs);
    } else if (config.outputs !== false) {
        outputs.push('dist/client/versions/latest.tgz');
    }
    return {
        enable: config.enable ?? false,
        outputs,
        async packageJson(esmx, pkgJson) {
            if (config.packageJson) {
                pkgJson = await config.packageJson(esmx, pkgJson);
            }
            return pkgJson;
        },
        async onBefore(esmx, pkgJson: Record<string, any>) {
            await config.onBefore?.(esmx, pkgJson);
        },
        async onAfter(esmx, pkgJson, file) {
            await config.onAfter?.(esmx, pkgJson, file);
        }
    };
}
