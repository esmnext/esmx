---
titleSuffix: Esmx 프레임워크 클라이언트 사이드 렌더링 구현 가이드
description: Esmx 프레임워크의 클라이언트 사이드 렌더링 메커니즘을 상세히 설명하며, 정적 빌드, 배포 전략 및 모범 사례를 포함하여 서버리스 환경에서 효율적인 프론트엔드 렌더링을 구현하는 방법을 안내합니다.
head:
  - - meta
    - property: keywords
      content: Esmx, 클라이언트 사이드 렌더링, CSR, 정적 빌드, 프론트엔드 렌더링, 서버리스 배포, 성능 최적화
---

# 클라이언트 사이드 렌더링

클라이언트 사이드 렌더링(Client-Side Rendering, CSR)은 브라우저에서 페이지 렌더링을 수행하는 기술입니다. Esmx에서 Node.js 서버 인스턴스를 배포할 수 없는 경우, 빌드 단계에서 정적 `index.html` 파일을 생성하여 순수 클라이언트 사이드 렌더링을 구현할 수 있습니다.

## 사용 시나리오

다음과 같은 시나리오에서 클라이언트 사이드 렌더링을 사용하는 것이 권장됩니다:

- **정적 호스팅 환경**: GitHub Pages, CDN 등 서버 사이드 렌더링을 지원하지 않는 호스팅 서비스
- **단순 애플리케이션**: 초기 로딩 속도와 SEO 요구사항이 높지 않은 소규모 애플리케이션
- **개발 환경**: 개발 단계에서 애플리케이션을 빠르게 미리보기 및 디버깅

## 설정 설명

### HTML 템플릿 설정

클라이언트 사이드 렌더링 모드에서는 범용 HTML 템플릿을 설정해야 합니다. 이 템플릿은 애플리케이션의 컨테이너 역할을 하며, 필요한 리소스 참조와 마운트 포인트를 포함합니다.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // 의존성 수집 제출
    await rc.commit();
    
    // HTML 템플릿 설정
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // 리소스 프리로드
    <title>Esmx</title>
    ${rc.css()}               // 스타일 주입
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // 임포트 맵
    ${rc.moduleEntry()}       // 엔트리 모듈
    ${rc.modulePreload()}     // 모듈 프리로드
</body>
</html>
`;
};
```

### 정적 HTML 생성

프로덕션 환경에서 클라이언트 사이드 렌더링을 사용하려면 빌드 단계에서 정적 HTML 파일을 생성해야 합니다. Esmx는 `postBuild` 훅 함수를 제공하여 이 기능을 구현합니다:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // 정적 HTML 파일 생성
        const rc = await esmx.render();
        // HTML 파일 작성
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```