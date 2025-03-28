---
titleSuffix: Esmx 프레임워크 프로젝트 구조 및 규범 가이드
description: Esmx 프레임워크의 표준 프로젝트 구조, 진입 파일 규범 및 설정 파일 규범을 상세히 설명하여 개발자가 표준화되고 유지보수 가능한 SSR 애플리케이션을 구축할 수 있도록 돕습니다.
head:
  - - meta
    - property: keywords
      content: Esmx, 프로젝트 구조, 진입 파일, 설정 규범, SSR 프레임워크, TypeScript, 프로젝트 규범, 개발 표준
---

# 표준 규범

Esmx는 현대적인 SSR 프레임워크로, 표준화된 프로젝트 구조와 경로 해석 메커니즘을 채택하여 개발 및 프로덕션 환경에서의 일관성과 유지보수성을 보장합니다.

## 프로젝트 구조 규범

### 표준 디렉토리 구조

```txt
root
│─ dist                  # 컴파일 출력 디렉토리
│  ├─ package.json       # 컴파일 출력 후의 패키지 설정
│  ├─ server             # 서버 측 컴파일 출력
│  │  └─ manifest.json   # 컴파일 매니페스트 출력, importmap 생성에 사용
│  ├─ node               # Node 서버 프로그램 컴파일 출력
│  ├─ client             # 클라이언트 측 컴파일 출력
│  │  ├─ versions        # 버전 저장 디렉토리
│  │  │  └─ latest.tgz   # dist 디렉토리를 아카이브하여 외부에 패키지 배포 제공
│  │  └─ manifest.json   # 컴파일 매니페스트 출력, importmap 생성에 사용
│  └─ src                # tsc로 생성된 파일 유형
├─ src
│  ├─ entry.server.ts    # 서버 애플리케이션 진입점
│  ├─ entry.client.ts    # 클라이언트 애플리케이션 진입점
│  └─ entry.node.ts      # Node 서버 애플리케이션 진입점
├─ tsconfig.json         # TypeScript 설정
└─ package.json          # 패키지 설정
```

::: tip 확장 지식
- `esmx.name`은 `package.json`의 `name` 필드에서 유래
- `dist/package.json`은 루트 디렉토리의 `package.json`에서 유래
- `packs.enable`을 `true`로 설정할 경우에만 `dist` 디렉토리를 아카이브

:::

## 진입 파일 규범

### entry.client.ts
클라이언트 진입 파일은 다음을 담당합니다:
- **애플리케이션 초기화**: 클라이언트 애플리케이션의 기본 설정 구성
- **라우팅 관리**: 클라이언트 라우팅 및 네비게이션 처리
- **상태 관리**: 클라이언트 상태 저장 및 업데이트 구현
- **상호작용 처리**: 사용자 이벤트 및 인터페이스 상호작용 관리

### entry.server.ts
서버 진입 파일은 다음을 담당합니다:
- **서버 측 렌더링**: SSR 렌더링 프로세스 실행
- **HTML 생성**: 초기 페이지 구조 구축
- **데이터 프리페치**: 서버 측 데이터 가져오기 처리
- **상태 주입**: 서버 상태를 클라이언트에 전달
- **SEO 최적화**: 페이지의 검색 엔진 최적화 보장

### entry.node.ts
Node.js 서버 진입 파일은 다음을 담당합니다:
- **서버 설정**: HTTP 서버 매개변수 설정
- **라우팅 처리**: 서버 측 라우팅 규칙 관리
- **미들웨어 통합**: 서버 미들웨어 설정
- **환경 관리**: 환경 변수 및 설정 처리
- **요청 응답**: HTTP 요청 및 응답 처리

## 설정 파일 규범

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```