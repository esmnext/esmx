/**
 * Build target environment type
 * @description Defines the build target environment for the application, used to configure specific optimizations and features during the build process
 * - node: Build code to run in Node.js environment
 * - client: Build code to run in browser environment
 * - server: Build code to run in server environment
 */
export type BuildTarget = 'node' | 'client' | 'server';
