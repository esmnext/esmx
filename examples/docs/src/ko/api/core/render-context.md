---
titleSuffix: Esmx 프레임워크 렌더링 컨텍스트 API 참조
description: Esmx 프레임워크의 RenderContext 핵심 클래스에 대해 자세히 설명합니다. 렌더링 제어, 리소스 관리, 상태 동기화 및 라우팅 제어 등의 기능을 포함하여 개발자가 효율적인 서버 사이드 렌더링(SSR)을 구현할 수 있도록 도와줍니다.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, 서버 사이드 렌더링, 렌더링 컨텍스트, 상태 동기화, 리소스 관리, 웹 애플리케이션 프레임워크
---

# RenderContext

RenderContext는 Esmx 프레임워크의 핵심 클래스로, 서버 사이드 렌더링(SSR)의 전체 생명주기를 관리합니다. 이 클래스는 렌더링 컨텍스트, 리소스 관리, 상태 동기화 등의 주요 작업을 처리하기 위한 완전한 API를 제공합니다:

- **렌더링 제어**: 서버 사이드 렌더링 프로세스를 관리하며, 다중 엔트리 렌더링, 조건부 렌더링 등의 시나리오를 지원합니다.
- **리소스 관리**: JS, CSS 등의 정적 리소스를 지능적으로 수집하고 주입하여 로딩 성능을 최적화합니다.
- **상태 동기화**: 서버 상태를 직렬화하여 클라이언트에서 올바르게 활성화(hydration)되도록 합니다.
- **라우팅 제어**: 서버 리디렉션, 상태 코드 설정 등의 고급 기능을 지원합니다.

## 타입 정의

### ServerRenderHandle

서버 사이드 렌더링 처리 함수의 타입 정의입니다.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

서버 사이드 렌더링 처리 함수는 RenderContext 인스턴스를 매개변수로 받는 비동기 또는 동기 함수로, 서버 사이드 렌더링 로직을 처리하는 데 사용됩니다.

```ts title="entry.node.ts"
// 1. 비동기 처리 함수
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. 동기 처리 함수
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

렌더링 과정에서 수집된 리소스 파일 목록의 타입 정의입니다.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: JavaScript 파일 목록
- **css**: 스타일시트 파일 목록
- **modulepreload**: 미리 로드해야 할 ESM 모듈 목록
- **resources**: 기타 리소스 파일 목록 (이미지, 폰트 등)

```ts
// 리소스 파일 목록 예시
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

importmap의 생성 모드를 정의합니다.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: importmap 내용을 HTML에 직접 인라인으로 삽입합니다. 다음 시나리오에 적합합니다:
  - HTTP 요청 수를 줄여야 할 때
  - importmap 내용이 작을 때
  - 초기 로딩 성능이 중요할 때
- `js`: importmap 내용을 별도의 JS 파일로 생성합니다. 다음 시나리오에 적합합니다:
  - importmap 내용이 클 때
  - 브라우저 캐시 메커니즘을 활용해야 할 때
  - 여러 페이지가 동일한 importmap을 공유할 때

렌더링 컨텍스트 클래스는 서버 사이드 렌더링(SSR) 과정에서 리소스 관리와 HTML 생성을 담당합니다.
## 인스턴스 옵션

렌더링 컨텍스트의 구성 옵션을 정의합니다.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **타입**: `string`
- **기본값**: `''`

정적 리소스의 기본 경로입니다.
- 모든 정적 리소스(JS, CSS, 이미지 등)는 이 경로를 기반으로 로드됩니다.
- 런타임에 동적으로 설정할 수 있으며, 재빌드가 필요하지 않습니다.
- 다국어 사이트, 마이크로 프론트엔드 애플리케이션 등에 자주 사용됩니다.

#### entryName

- **타입**: `string`
- **기본값**: `'default'`

서버 사이드 렌더링 엔트리 함수 이름입니다. 하나의 모듈이 여러 렌더링 함수를 내보낼 때 사용할 엔트리 함수를 지정합니다.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // 모바일 렌더링 로직
};

export const desktop = async (rc: RenderContext) => {
  // 데스크톱 렌더링 로직
};
```

#### params

- **타입**: `Record<string, any>`
- **기본값**: `{}`

렌더링 매개변수입니다. 렌더링 함수에 임의의 타입의 매개변수를 전달할 수 있으며, 주로 요청 정보(URL, 쿼리 매개변수 등)를 전달하는 데 사용됩니다.

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **타입**: `'inline' | 'js'`
- **기본값**: `'inline'`

임포트 맵(Import Map)의 생성 모드입니다:
- `inline`: importmap 내용을 HTML에 직접 인라인으로 삽입합니다.
- `js`: importmap 내용을 별도의 JS 파일로 생성합니다.


## 인스턴스 속성

### esmx

- **타입**: `Esmx`
- **읽기 전용**: `true`

Esmx 인스턴스 참조입니다. 프레임워크의 핵심 기능과 구성 정보에 접근하는 데 사용됩니다.

### redirect

- **타입**: `string | null`
- **기본값**: `null`

리디렉션 주소입니다. 설정하면 서버는 이 값을 기반으로 HTTP 리디렉션을 수행할 수 있으며, 주로 로그인 검증, 권한 제어 등에 사용됩니다.

```ts title="entry.node.ts"
// 로그인 검증 예시
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // 페이지 렌더링 계속...
};

// 권한 제어 예시
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // 페이지 렌더링 계속...
};
```

### status

- **타입**: `number | null`
- **기본값**: `null`

HTTP 응답 상태 코드입니다. 유효한 HTTP 상태 코드를 설정할 수 있으며, 주로 오류 처리, 리디렉션 등에 사용됩니다.

```ts title="entry.node.ts"
// 404 오류 처리 예시
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // 404 페이지 렌더링...
    return;
  }
  // 페이지 렌더링 계속...
};

// 임시 리디렉션 예시
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // 임시 리디렉션, 요청 메서드 유지
    return;
  }
  // 페이지 렌더링 계속...
};
```

### html

- **타입**: `string`
- **기본값**: `''`

HTML 내용입니다. 최종 생성된 HTML 내용을 설정하고 가져오는 데 사용되며, 설정 시 기본 경로 플레이스홀더를 자동으로 처리합니다.

```ts title="entry.node.ts"
// 기본 사용법
export default async (rc: RenderContext) => {
  // HTML 내용 설정
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// 동적 기본 경로
const rc = await esmx.render({
  base: '/app',  // 기본 경로 설정
  params: { url: req.url }
});

// HTML의 플레이스홀더는 자동으로 교체됩니다:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// 교체 후:
// /app/your-app-name/css/style.css
```

### base

- **타입**: `string`
- **읽기 전용**: `true`
- **기본값**: `''`

정적 리소스의 기본 경로입니다. 모든 정적 리소스(JS, CSS, 이미지 등)는 이 경로를 기반으로 로드되며, 런타임에 동적으로 설정할 수 있습니다.

```ts
// 기본 사용법
const rc = await esmx.render({
  base: '/esmx',  // 기본 경로 설정
  params: { url: req.url }
});

// 다국어 사이트 예시
const rc = await esmx.render({
  base: '/cn',  // 중국어 사이트
  params: { lang: 'zh-CN' }
});

// 마이크로 프론트엔드 애플리케이션 예시
const rc = await esmx.render({
  base: '/app1',  // 서브 애플리케이션1
  params: { appId: 1 }
});
```

### entryName

- **타입**: `string`
- **읽기 전용**: `true`
- **기본값**: `'default'`

서버 사이드 렌더링 엔트리 함수 이름입니다. entry.server.ts에서 사용할 렌더링 함수를 선택하는 데 사용됩니다.

```ts title="entry.node.ts"
// 기본 엔트리 함수
export default async (rc: RenderContext) => {
  // 기본 렌더링 로직
};

// 여러 엔트리 함수
export const mobile = async (rc: RenderContext) => {
  // 모바일 렌더링 로직
};

export const desktop = async (rc: RenderContext) => {
  // 데스크톱 렌더링 로직
};

// 디바이스 타입에 따라 엔트리 함수 선택
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **타입**: `Record<string, any>`
- **읽기 전용**: `true`
- **기본값**: `{}`

렌더링 매개변수입니다. 서버 사이드 렌더링 과정에서 매개변수를 전달하고 접근할 수 있으며, 주로 요청 정보, 페이지 설정 등을 전달하는 데 사용됩니다.

```ts
// 기본 사용법 - URL 및 언어 설정 전달
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// 페이지 설정 - 테마 및 레이아웃 설정
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// 환경 설정 - API 주소 주입
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **타입**: `Set<ImportMeta>`

모듈 의존성 수집 집합입니다. 컴포넌트 렌더링 과정에서 모듈 의존성을 자동으로 추적하고 기록하며, 현재 페이지 렌더링 시 실제로 사용된 리소스만 수집합니다.

```ts
// 기본 사용법
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // 렌더링 과정에서 모듈 의존성을 자동으로 수집
  // 프레임워크는 컴포넌트 렌더링 시 context.importMetaSet.add(import.meta)를 자동으로 호출
  // 개발자는 의존성 수집을 수동으로 처리할 필요가 없음
  return '<div id="app">Hello World</div>';
};

// 사용 예시
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **타입**: `RenderFiles`

리소스 파일 목록:
- js: JavaScript 파일 목록
- css: 스타일시트 파일 목록
- modulepreload: 미리 로드해야 할 ESM 모듈 목록
- resources: 기타 리소스 파일 목록 (이미지, 폰트 등)

```ts
// 리소스 수집
await rc.commit();

// 리소스 주입
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- 리소스 미리 로드 -->
    ${rc.preload()}
    <!-- 스타일시트 주입 -->
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
```

### importmapMode

- **타입**: `'inline' | 'js'`
- **기본값**: `'inline'`

임포트 맵의 생성 모드:
- `inline`: importmap 내용을 HTML에 직접 인라인으로 삽입합니다.
- `js`: importmap 내용을 별도의 JS 파일로 생성합니다.


## 인스턴스 메서드

### serialize()

- **매개변수**: 
  - `input: any` - 직렬화할 데이터
  - `options?: serialize.SerializeJSOptions` - 직렬화 옵션
- **반환값**: `string`

JavaScript 객체를 문자열로 직렬화합니다. 서버 사이드 렌더링 과정에서 상태 데이터를 직렬화하여 HTML에 안전하게 삽입할 수 있도록 합니다.

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **매개변수**: 
  - `varName: string` - 변수명
  - `data: Record<string, any>` - 상태 데이터
- **반환값**: `string`

상태 데이터를 직렬화하여 HTML에 주입합니다. 안전한 직렬화 방법을 사용하여 복잡한 데이터 구조를 지원합니다.

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **반환값**: `Promise<void>`

의존성 수집을 제출하고 리소스 목록을 업데이트합니다. importMetaSet에서 사용된 모든 모듈을 수집하고, manifest 파일을 기반으로 각 모듈의 구체적인 리소스를 해석합니다.

```ts
// 렌더링 및 의존성 제출
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// 의존성 수집 제출
await rc.commit();
```

### preload()

- **반환값**: `string`

리소스 미리 로드 태그를 생성합니다. CSS 및 JavaScript 리소스를 미리 로드하며, 우선순위 설정을 지원하고 기본 경로를 자동으로 처리합니다.

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- 스타일시트 주입 -->
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### css()

- **반환값**: `string`

CSS 스타일시트 태그를 생성합니다. 수집된 CSS 파일을 주입하여 스타일시트가 올바른 순서로 로드되도록 합니다.

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- 수집된 모든 스타일시트 주입 -->
  </head>
`;
```

### importmap()

- **반환값**: `string`

임포트 맵 태그를 생성