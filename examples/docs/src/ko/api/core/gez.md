---
titleSuffix: 프레임워크 코어 클래스 API 참조
description: Esmx 프레임워크의 코어 클래스 API에 대해 자세히 설명합니다. 애플리케이션 생명주기 관리, 정적 리소스 처리 및 서버 사이드 렌더링 기능을 포함하여 개발자가 프레임워크의 핵심 기능을 깊이 이해할 수 있도록 돕습니다.
head:
  - - meta
    - property: keywords
      content: Esmx, API, 생명주기 관리, 정적 리소스, 서버 사이드 렌더링, Rspack, 웹 애플리케이션 프레임워크
---

# Esmx

## 소개

Esmx는 Rspack 기반의 고성능 웹 애플리케이션 프레임워크로, 완전한 애플리케이션 생명주기 관리, 정적 리소스 처리 및 서버 사이드 렌더링 기능을 제공합니다.

## 타입 정의

### RuntimeTarget

- **타입 정의**:
```ts
type RuntimeTarget = 'client' | 'server'
```

애플리케이션 런타임 환경 타입:
- `client`: 브라우저 환경에서 실행되며, DOM 조작 및 브라우저 API를 지원합니다.
- `server`: Node.js 환경에서 실행되며, 파일 시스템 및 서버 사이드 기능을 지원합니다.

### ImportMap

- **타입 정의**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES 모듈 임포트 맵 타입.

#### SpecifierMap

- **타입 정의**:
```ts
type SpecifierMap = Record<string, string>
```

모듈 식별자 맵 타입으로, 모듈 임포트 경로의 매핑 관계를 정의합니다.

#### ScopesMap

- **타입 정의**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

스코프 맵 타입으로, 특정 스코프 내의 모듈 임포트 매핑 관계를 정의합니다.

### COMMAND

- **타입 정의**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

명령어 타입 열거형:
- `dev`: 개발 환경 명령어로, 개발 서버를 시작하고 핫 리로드를 지원합니다.
- `build`: 빌드 명령어로, 프로덕션 환경의 빌드 결과물을 생성합니다.
- `preview`: 미리보기 명령어로, 로컬 미리보기 서버를 시작합니다.
- `start`: 시작 명령어로, 프로덕션 환경 서버를 실행합니다.

## 인스턴스 옵션

Esmx 프레임워크의 핵심 설정 옵션을 정의합니다.

```ts
interface EsmxOptions {
  root?: string
  isProd?: boolean
  basePathPlaceholder?: string | false
  modules?: ModuleConfig
  packs?: PackConfig
  devApp?: (esmx: Esmx) => Promise<App>
  server?: (esmx: Esmx) => Promise<void>
  postBuild?: (esmx: Esmx) => Promise<void>
}
```

#### root

- **타입**: `string`
- **기본값**: `process.cwd()`

프로젝트 �트 디렉토리 경로. 절대 경로 또는 상대 경로를 사용할 수 있으며, 상대 경로는 현재 작업 디렉토리를 기준으로 해석됩니다.

#### isProd

- **타입**: `boolean`
- **기본값**: `process.env.NODE_ENV === 'production'`

환경 식별자.
- `true`: 프로덕션 환경
- `false`: 개발 환경

#### basePathPlaceholder

- **타입**: `string | false`
- **기본값**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

기본 경로 플레이스홀더 설정. 런타임에 리소스의 기본 경로를 동적으로 대체하는 데 사용됩니다. `false`로 설정하면 이 기능을 비활성화할 수 있습니다.

#### modules

- **타입**: `ModuleConfig`

모듈 설정 옵션. 프로젝트의 모듈 해석 규칙을 구성하며, 모듈 별칭, 외부 종속성 등의 설정을 포함합니다.

#### packs

- **타입**: `PackConfig`

패키징 설정 옵션. 빌드 결과물을 표준 npm .tgz 형식의 소프트웨어 패키지로 패키징합니다.

#### devApp

- **타입**: `(esmx: Esmx) => Promise<App>`

개발 환경 애플리케이션 생성 함수. 개발 환경에서만 사용되며, 개발 서버의 애플리케이션 인스턴스를 생성합니다.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Rspack 설정 커스터마이징
        }
      })
    )
  }
}
```

#### server

- **타입**: `(esmx: Esmx) => Promise<void>`

서버 시작 설정 함수. HTTP 서버를 구성하고 시작하는 데 사용되며, 개발 환경 및 프로덕션 환경에서 모두 사용할 수 있습니다.

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000);
  }
}
```

#### postBuild

- **타입**: `(esmx: Esmx) => Promise<void>`

빌드 후 처리 함수. 프로젝트 빌드가 완료된 후 실행되며, 다음 작업에 사용할 수 있습니다:
- 추가 리소스 처리
- 배포 작업
- 정적 파일 생성
- 빌드 알림 전송

## 인스턴스 속성

### name

- **타입**: `string`
- **읽기 전용**: `true`

현재 모듈의 이름으로, 모듈 설정에서 가져옵니다.

### varName

- **타입**: `string`
- **읽기 전용**: `true`

모듈 이름을 기반으로 생성된 유효한 JavaScript 변수 이름.

### root

- **타입**: `string`
- **읽기 전용**: `true`

프로젝트 루트 디렉토리의 절대 경로. `root`가 상대 경로로 설정된 경우 현재 작업 디렉토리를 기준으로 해석됩니다.

### isProd

- **타입**: `boolean`
- **읽기 전용**: `true`

현재가 프로덕션 환경인지 여부를 판단합니다. 설정 항목의 `isProd`를 우선 사용하며, 설정되지 않은 경우 `process.env.NODE_ENV`를 기준으로 판단합니다.

### basePath

- **타입**: `string`
- **읽기 전용**: `true`
- **예외**: `NotReadyError` - 프레임워크가 초기화되지 않은 경우

슬래시로 시작하고 끝나는 모듈 기본 경로를 가져옵니다. 반환 형식은 `/${name}/`이며, 여기서 name은 모듈 설정에서 가져옵니다.

### basePathPlaceholder

- **타입**: `string`
- **읽기 전용**: `true`

런타임에 동적으로 대체되는 기본 경로 플레이스홀더를 가져옵니다. 설정을 통해 비활성화할 수 있습니다.

### middleware

- **타입**: `Middleware`
- **읽기 전용**: `true`

정적 리소스 처리 미들웨어를 가져옵니다. 환경에 따라 다른 구현을 제공합니다:
- 개발 환경: 소스 코드 실시간 컴파일 및 핫 리로드 지원
- 프로덕션 환경: 정적 리소스의 장기 캐싱 지원

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **타입**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **읽기 전용**: `true`

서버 사이드 렌더링 함수를 가져옵니다. 환경에 따라 다른 구현을 제공합니다:
- 개발 환경: 핫 리로드 및 실시간 미리보기 지원
- 프로덕션 환경: 최적화된 렌더링 성능 제공

```ts
// 기본 사용법
const rc = await esmx.render({
  params: { url: req.url }
});

// 고급 설정
const rc = await esmx.render({
  base: '',                    // 기본 경로
  importmapMode: 'inline',     // 임포트 맵 모드
  entryName: 'default',        // 렌더링 엔트리
  params: {
    url: req.url,
    state: { user: 'admin' }   // 상태 데이터
  }
});
```

### COMMAND

- **타입**: `typeof COMMAND`
- **읽기 전용**: `true`

명령어 열거형 타입 정의를 가져옵니다.

### moduleConfig

- **타입**: `ParsedModuleConfig`
- **읽기 전용**: `true`
- **예외**: `NotReadyError` - 프레임워크가 초기화되지 않은 경우

현재 모듈의 완전한 설정 정보를 가져옵니다. 모듈 해석 규칙, 별칭 설정 등을 포함합니다.

### packConfig

- **타입**: `ParsedPackConfig`
- **읽기 전용**: `true`
- **예외**: `NotReadyError` - 프레임워크가 초기화되지 않은 경우

현재 모듈의 패키징 관련 설정을 가져옵니다. 출력 경로, package.json 처리 등을 포함합니다.

## 인스턴스 메서드

### constructor()

- **매개변수**: 
  - `options?: EsmxOptions` - 프레임워크 설정 옵션
- **반환값**: `Esmx`

Esmx 프레임워크 인스턴스를 생성합니다.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **매개변수**: `command: COMMAND`
- **반환값**: `Promise<boolean>`
- **예외**:
  - `Error`: 중복 초기화 시
  - `NotReadyError`: 초기화되지 않은 인스턴스에 접근 시

Esmx 프레임워크 인스턴스를 초기화합니다. 다음 핵심 초기화 프로세스를 실행합니다:

1. 프로젝트 설정 해석 (package.json, 모듈 설정, 패키징 설정 등)
2. 애플리케이션 인스턴스 생성 (개발 환경 또는 프로덕션 환경)
3. 명령어에 따라 해당 생명주기 메서드 실행

::: warning 주의
- 중복 초기화 시 오류가 발생합니다.
- 초기화되지 않은 인스턴스에 접근 시 `NotReadyError`가 발생합니다.

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **반환값**: `Promise<boolean>`

Esmx 프레임워크 인스턴스를 파괴하고, 리소스 정리 및 연결 종료 등의 작업을 수행합니다. 주로 다음 작업에 사용됩니다:
- 개발 서버 종료
- 임시 파일 및 캐시 정리
- 시스템 리소스 해제

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **반환값**: `Promise<boolean>`

애플리케이션의 빌드 프로세스를 실행하며, 다음 작업을 포함합니다:
- 소스 코드 컴파일
- 프로덕션 환경의 빌드 결과물 생성
- 코드 최적화 및 압축
- 리소스 매니페스트 생성

::: warning 주의
프레임워크 인스턴스가 초기화되지 않은 상태에서 호출 시 `NotReadyError`가 발생합니다.
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // 빌드 완료 후 정적 HTML 생성
    const render = await esmx.render({
      params: { url: '/' }
    });
    esmx.writeSync(
      esmx.resolvePath('dist/client', 'index.html'),
      render.html
    );
  }
}
```

### server()

- **반환값**: `Promise<void>`
- **예외**: `NotReadyError` - 프레임워크가 초기화되지 않은 경우

HTTP 서버 및 설정 서버 인스턴스를 시작합니다. 다음 생명주기에서 호출됩니다:
- 개발 환경 (dev): 개발 서버를 시작하고 핫 리로드를 제공합니다.
- 프로덕션 환경 (start): 프로덕션 서버를 시작하고 프로덕션 수준의 성능을 제공합니다.

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // 정적 리소스 처리
      esmx.middleware(req, res, async () => {
        // 서버 사이드 렌더링
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  }
}
```

### postBuild()

- **반환값**: `Promise<boolean>`

빌드 후 처리 로직을 실행하며, 다음 작업에 사용됩니다:
- 정적 HTML 파일 생성
- 빌드 결과물 처리
- 배포 작업 실행
- 빌드 알림 전송

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // 여러 페이지의 정적 HTML 생성
    const pages = ['/', '/about', '/404'];

    for (const url of pages) {
      const render = await esmx.render({
        params: { url }
      });

      await esmx.write(
        esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
        render.html
      );
    }
  }
}
```

### resolvePath

프로젝트 경로를 해석하여 상대 경로를 절대 경로로 변환합니다.

- **매개변수**:
  - `projectPath: ProjectPath` - 프로젝트 경로 타입
  - `...args: string[]` - 경로 조각
- **반환값**: `string` - 해석된 절대 경로

- **예제**:
```ts
// 정적 리소스 경로 해석
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

파일 내용을 동기적으로 작성합니다.

- **매개변수**:
  - `filepath`: `string` - 파일의 절대 경로
  - `data`: `any` - 작성할 데이터로, 문자열, Buffer 또는 객체일 수 있습니다.
- **반환값**: `boolean` - 작성 성공 여부

- **예제**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

JSON 파일을 동기적으로 읽고 해석합니다.

- **매개변수**:
  - `filename`: `string` - JSON 파일의 절대 경로

- **반환값**: `any` - 해석된 JSON 객체
- **예외**: 파일이 존재하지 않거나 JSON 형식이 잘못된 경우 예외가 발생합니다.

- **예제**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // manifest 객체 사용
}
```

### readJson()

JSON 파일을 비동기적으로 읽고 해석합니다.

- **매개변수**:
  - `filename`: `string` - JSON 파일의 절대 경로

- **반환값**: `Promise<any>` - 해석된 JSON 객체
- **예외**: 파일이 존재하지 않거나 JSON 형식이 잘못된 경우 예외가 발생합니다.

- **예제**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // manifest 객체 사용
}
```

### getManifestList()

빌드 매니페스트 목록을 가져옵니다.

- **매개변수**:
  - `target`: `RuntimeTarget` - 대상 환경 타입
    - `'client'`: 클라이언트 환경
    - `'server'`: 서버 환경

- **반환값**: `Promise<readonly ManifestJson[]>` - 읽기 전용 빌드 매니페스트 목록
- **예외**: 프레임워크 인스턴스가 초기화되지 않은 경우 `NotReadyError`가 발생합니다.

이 메서드는 지정된 대상 환경의 빌드 매니페