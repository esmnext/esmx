import { chmodSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
for (const file of [
    'packages/core/dist/cli/index.mjs',
    'packages/create-esmx/dist/create.mjs'
]) {
    chmodSync(resolve(root, file), 0o755);
    console.log(`✅ 已设置可执行权限：${file}`);
}
