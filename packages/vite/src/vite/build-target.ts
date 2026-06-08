/**
 * Build target environment type.
 * - node: Node.js entry build (server bootstrap)
 * - client: Browser build
 * - server: Server-side rendering build
 */
export type BuildTarget = 'node' | 'client' | 'server';
