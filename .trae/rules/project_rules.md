# Emsx 框架

LOGO: https://www.esmnext.com/logo.svg
主题色: #FFC107
介绍: Esmx 是基于原生 ESM 的下一代微前端框架，无沙盒无运行时，支持多框架混合开发，并提供高性能服务端渲染能力。

## JS 编码规范

- **ECMAScript Modules (ESM)**
  - **核心规则**: 使用 `import`/`export` (ESM) 进行模块管理。
  - **避免**: 使用 `require`/`module.exports` (CommonJS)。
  - **示例**:
    ```javascript
    // 正确: 使用 ESM
    import fs from 'node:fs';
    import path from 'node:path';

    export const myFunctionName = (filePath) => {
      return fs.readFileSync(filePath, 'utf-8');
    };

    export const anotherVar = path.join(__dirname, 'file.txt');

    // 避免: 使用 CommonJS
    // const fs = require('fs');
    // const path = require('path');
    // exports.myFunctionName = (filePath) => { ... };
    // module.exports.anotherVar = ...;
    ```

- **Node.js 内置模块前缀**
  - **核心规则**: 导入 Node.js 内置模块时，始终添加 `node:` 前缀。
  - **目的**: 明确区分内置模块和第三方模块，提高代码可读性。
  - **示例**:
    ```javascript
    // 正确: 使用 'node:' 前缀
    import fs from 'node:fs';
    import path from 'node:path';

    // 避免: 不使用 'node:' 前缀
    // import fs from 'fs';
    // import path from 'path';
    ```