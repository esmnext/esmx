---
titleSuffix: Esmx 프레임워크 애플리케이션 추상 인터페이스
description: Esmx 프레임워크의 App 인터페이스에 대해 자세히 설명합니다. 애플리케이션 생명주기 관리, 정적 리소스 처리 및 서버 사이드 렌더링 기능을 포함하여 개발자가 애플리케이션의 핵심 기능을 이해하고 사용할 수 있도록 돕습니다.
head:
  - - meta
    - property: keywords
      content: Esmx, App, 애플리케이션 추상, 생명주기, 정적 리소스, 서버 사이드 렌더링, API
---

# App

`App`은 Esmx 프레임워크의 애플리케이션 추상화로, 애플리케이션의 생명주기, 정적 리소스 및 서버 사이드 렌더링을 관리하기 위한 통합 인터페이스를 제공합니다.

```ts title="entry.node.ts"
export default {
  // 개발 환경 설정
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // Rspack 설정 커스터마이징
        }
      })
    );
  }
}
```

## 타입 정의
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **타입**: `Middleware`

정적 리소스 처리 미들웨어.

개발 환경:
- 소스 코드의 정적 리소스 요청 처리
- 실시간 컴파일 및 핫 리로드 지원
- no-cache 캐시 정책 사용

프로덕션 환경:
- 빌드된 정적 리소스 처리
- 불변 파일의 장기 캐싱 지원 (.final.xxx)
- 최적화된 리소스 로딩 전략

```ts
server.use(esmx.middleware);
```

#### render

- **타입**: `(options?: RenderContextOptions) => Promise<RenderContext>`

서버 사이드 렌더링 함수. 실행 환경에 따라 다른 구현 제공:
- 프로덕션 환경 (start): 빌드된 서버 진입 파일(entry.server) 로드 및 렌더링 실행
- 개발 환경 (dev): 소스 코드의 서버 진입 파일 로드 및 렌더링 실행

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **타입**: `() => Promise<boolean>`

프로덕션 환경 빌드 함수. 리소스 패키징 및 최적화에 사용. 빌드 성공 시 true 반환, 실패 시 false 반환.

#### destroy

- **타입**: `() => Promise<boolean>`

리소스 정리 함수. 서버 종료, 연결 해제 등에 사용. 정리 성공 시 true 반환, 실패 시 false 반환.