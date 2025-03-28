---
titleSuffix: Esmx 프레임워크 HTML SSR 애플리케이션 예제
description: Esmx 기반의 HTML SSR 애플리케이션을 처음부터 구축하는 방법을 보여주는 예제입니다. 프로젝트 초기화, HTML 설정 및 진입 파일 설정을 포함한 프레임워크의 기본 사용법을 다룹니다.
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, SSR 애플리케이션, TypeScript 설정, 프로젝트 초기화, 서버 사이드 렌더링, 클라이언트 상호작용
---

# HTML

이 튜토리얼은 Esmx 기반의 HTML SSR 애플리케이션을 처음부터 구축하는 방법을 안내합니다. Esmx 프레임워크를 사용하여 서버 사이드 렌더링 애플리케이션을 만드는 방법을 완전한 예제를 통해 보여드리겠습니다.

## 프로젝트 구조

먼저, 프로젝트의 기본 구조를 살펴보겠습니다:

```bash
.
├── package.json         # 프로젝트 설정 파일, 의존성 및 스크립트 명령어 정의
├── tsconfig.json        # TypeScript 설정 파일, 컴파일 옵션 설정
└── src                  # 소스 코드 디렉토리
    ├── app.ts           # 메인 애플리케이션 컴포넌트, 페이지 구조 및 상호작용 로직 정의
    ├── create-app.ts    # 애플리케이션 인스턴스 생성 팩토리, 애플리케이션 초기화 담당
    ├── entry.client.ts  # 클라이언트 진입 파일, 브라우저 측 렌더링 처리
    ├── entry.node.ts    # Node.js 서버 진입 파일, 개발 환경 설정 및 서버 시작 담당
    └── entry.server.ts  # 서버 진입 파일, SSR 렌더링 로직 처리
```

## 프로젝트 설정

### package.json

`package.json` 파일을 생성하여 프로젝트 의존성 및 스크립트를 설정합니다:

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
  }
}
```

`package.json` 파일을 생성한 후, 프로젝트 의존성을 설치해야 합니다. 다음 명령어 중 하나를 사용하여 설치할 수 있습니다:
```bash
pnpm install
# 또는
yarn install
# 또는
npm install
```

이 명령어는 TypeScript 및 SSR 관련 의존성을 포함한 모든 필수 패키지를 설치합니다.

### tsconfig.json

`tsconfig.json` 파일을 생성하여 TypeScript 컴파일 옵션을 설정합니다:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## 소스 코드 구조

### app.ts

메인 애플리케이션 컴포넌트 `src/app.ts`를 생성하여 페이지 구조 및 상호작용 로직을 구현합니다:

```ts title="src/app.ts"
/**
 * @file 예제 컴포넌트
 * @description Esmx 프레임워크의 기본 기능을 보여주기 위해 자동으로 업데이트되는 시간을 표시하는 페이지 제목을 보여줍니다.
 */

export default class App {
    /**
     * 현재 시간, ISO 형식 사용
     * @type {string}
     */
    public time = '';

    /**
     * 애플리케이션 인스턴스 생성
     * @param {SsrContext} [ssrContext] - 서버 사이드 컨텍스트, 가져오기 메타데이터 집합 포함
     */
    public constructor(public ssrContext?: SsrContext) {
        // 생성자에서 추가 초기화가 필요하지 않음
    }

    /**
     * 페이지 내용 렌더링
     * @returns {string} 페이지 HTML 구조 반환
     */
    public render(): string {
        // 서버 사이드 환경에서 가져오기 메타데이터를 올바르게 수집
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx 빠른 시작</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * 클라이언트 초기화
     * @throws {Error} 시간 표시 요소를 찾을 수 없을 때 오류 발생
     */
    public onClient(): void {
        // 시간 표시 요소 가져오기
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('시간 표시 요소를 찾을 수 없습니다');
        }

        // 1초마다 시간 업데이트
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * 서버 초기화
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * 서버 사이드 컨텍스트 인터페이스
 * @interface
 */
export interface SsrContext {
    /**
     * 가져오기 메타데이터 집합
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

`src/create-app.ts` 파일을 생성하여 애플리케이션 인스턴스를 생성합니다:

```ts title="src/create-app.ts"
/**
 * @file 애플리케이션 인스턴스 생성
 * @description 애플리케이션 인스턴스 생성 및 설정 담당
 */

import App from './app';

export function createApp() {
    const app = new App();
    return {
        app
    };
}
```

### entry.client.ts

클라이언트 진입 파일 `src/entry.client.ts`를 생성합니다:

```ts title="src/entry.client.ts"
/**
 * @file 클라이언트 진입 파일
 * @description 클라이언트 상호작용 로직 및 동적 업데이트 담당
 */

import { createApp } from './create-app';

// 애플리케이션 인스턴스 생성 및 초기화
const { app } = createApp();
app.onClient();
```

### entry.node.ts

`entry.node.ts` 파일을 생성하여 개발 환경 설정 및 서버 시작을 구성합니다:

```ts title="src/entry.node.ts"
/**
 * @file Node.js 서버 진입 파일
 * @description 개발 환경 설정 및 서버 시작 담당, SSR 런타임 환경 제공
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * 개발 환경 애플리케이션 생성기 구성
     * @description Rspack 애플리케이션 인스턴스 생성 및 구성, 개발 환경 빌드 및 핫 리로드 지원
     * @param esmx Esmx 프레임워크 인스턴스, 핵심 기능 및 설정 인터페이스 제공
     * @returns HMR 및 실시간 미리보기를 지원하는 구성된 Rspack 애플리케이션 인스턴스 반환
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // 여기서 Rspack 컴파일 설정을 사용자 정의
                }
            })
        );
    },

    /**
     * HTTP 서버 구성 및 시작
     * @description HTTP 서버 인스턴스 생성, Esmx 미들웨어 통합, SSR 요청 처리
     * @param esmx Esmx 프레임워크 인스턴스, 미들웨어 및 렌더링 기능 제공
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Esmx 미들웨어를 사용하여 요청 처리
            esmx.middleware(req, res, async () => {
                // 서버 사이드 렌더링 실행
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('서버 시작: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

이 파일은 개발 환경 설정 및 서버 시작을 위한 진입 파일로, 두 가지 핵심 기능을 포함합니다:

1. `devApp` 함수: 개발 환경의 Rspack 애플리케이션 인스턴스를 생성 및 구성하며, 핫 리로드 및 실시간 미리보기 기능을 지원합니다.
2. `server` 함수: HTTP 서버를 생성 및 구성하고, Esmx 미들웨어를 통합하여 SSR 요청을 처리합니다.

### entry.server.ts

서버 사이드 렌더링 진입 파일 `src/entry.server.ts`를 생성합니다:

```ts title="src/entry.server.ts"
/**
 * @file 서버 사이드 렌더링 진입 파일
 * @description 서버 사이드 렌더링 프로세스, HTML 생성 및 리소스 주입 담당
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// 페이지 내용 생성 로직 캡슐화
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // 서버 사이드 렌더링 컨텍스트를 애플리케이션 인스턴스에 주입
    app.ssrContext = ssrContext;
    // 서버 초기화
    app.onServer();

    // 페이지 내용 생성
    return app.render();
};

export default async (rc: RenderContext) => {
    // 애플리케이션 인스턴스 생성, app 인스턴스를 포함한 객체 반환
    const { app } = createApp();
    // renderToString을 사용하여 페이지 내용 생성
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // 의존성 수집 제출, 모든 필수 리소스가 로드되도록 보장
    await rc.commit();

    // 완전한 HTML 구조 생성
    rc.html = `<!DOCTYPE html>
<html lang="ko">
<head>
    ${rc.preload()}
    <title>Esmx 빠른 시작</title>
    ${rc.css()}
</head>
<body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

## 프로젝트 실행

위의 파일 설정을 완료한 후, 다음 명령어를 사용하여 프로젝트를 실행할 수 있습니다:

1. 개발 모드:
```bash
npm run dev
```

2. 프로젝트 빌드:
```bash
npm run build
```

3. 프로덕션 환경 실행:
```bash
npm run start
```

이제 Esmx 기반의 HTML SSR 애플리케이션을 성공적으로 생성했습니다! http://localhost:3000 에 접속하여 결과를 확인할 수 있습니다.