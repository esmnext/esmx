---
titleSuffix: Esmx 프레임워크 서버 사이드 렌더링 핵심 메커니즘
description: Esmx 프레임워크의 렌더링 컨텍스트(RenderContext) 메커니즘에 대해 자세히 설명합니다. 리소스 관리, HTML 생성 및 ESM 모듈 시스템을 포함하여 개발자가 서버 사이드 렌더링(SSR) 기능을 이해하고 사용할 수 있도록 돕습니다.
head:
  - - meta
    - property: keywords
      content: Esmx, 렌더링 컨텍스트, RenderContext, SSR, 서버 사이드 렌더링, ESM, 리소스 관리
---

# 렌더링 컨텍스트

RenderContext는 Esmx 프레임워크의 핵심 클래스로, 서버 사이드 렌더링(SSR) 과정에서 리소스 관리와 HTML 생성을 주로 담당합니다. 이 클래스는 다음과 같은 핵심 특징을 가지고 있습니다:

1. **ESM 기반 모듈 시스템**
   - 현대적인 ECMAScript Modules 표준을 채택
   - 네이티브 모듈 임포트/익스포트 지원
   - 더 나은 코드 분할과 필요 시 로딩 구현

2. **스마트 의존성 수집**
   - 실제 렌더링 경로를 기반으로 동적으로 의존성 수집
   - 불필요한 리소스 로딩 방지
   - 비동기 컴포넌트와 동적 임포트 지원

3. **정확한 리소스 주입**
   - 리소스 로딩 순서를 엄격히 제어
   - 초기 로딩 성능 최적화
   - 클라이언트 측 활성화(Hydration)의 신뢰성 보장

4. **유연한 설정 메커니즘**
   - 동적 베이스 경로 설정 지원
   - 다양한 임포트 매핑 모드 제공
   - 다양한 배포 시나리오에 적응 가능

## 사용 방법

Esmx 프레임워크에서 개발자는 일반적으로 RenderContext 인스턴스를 직접 생성하지 않고, `esmx.render()` 메서드를 통해 인스턴스를 얻습니다:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // 정적 파일 처리
        esmx.middleware(req, res, async () => {
            // esmx.render()를 통해 RenderContext 인스턴스 획득
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // HTML 내용 응답
            res.end(rc.html);
        });
    });
}
```

## 주요 기능

### 의존성 수집

RenderContext는 스마트 의존성 수집 메커니즘을 구현하여, 실제 렌더링되는 컴포넌트를 기반으로 동적으로 의존성을 수집합니다:

#### 필요 시 수집
- 컴포넌트가 실제로 렌더링되는 과정에서 모듈 의존성을 자동으로 추적 및 기록
- 현재 페이지 렌더링 시 실제로 사용되는 CSS, JavaScript 등의 리소스만 수집
- `importMetaSet`을 통해 각 컴포넌트의 모듈 의존 관계를 정확히 기록
- 비동기 컴포넌트와 동적 임포트의 의존성 수집 지원

#### 자동화 처리
- 개발자가 수동으로 의존성 수집 과정을 관리할 필요 없음
- 프레임워크가 컴포넌트 렌더링 시 자동으로 의존성 정보 수집
- `commit()` 메서드를 통해 수집된 모든 리소스를 통합 처리
- 순환 의존성과 중복 의존성 문제 자동 처리

#### 성능 최적화
- 사용되지 않는 모듈 로딩 방지로 초기 로딩 시간 단축
- 리소스 로딩 순서를 정확히 제어하여 페이지 렌더링 성능 최적화
- 최적의 임포트 매핑(Import Map) 자동 생성
- 리소스 프리로드 및 필요 시 로딩 전략 지원

### 리소스 주입

RenderContext는 다양한 유형의 리소스를 주입하기 위한 여러 메서드를 제공하며, 각 메서드는 리소스 로딩 성능을 최적화하기 위해 설계되었습니다:

- `preload()`: CSS 및 JS 리소스 프리로드, 우선순위 설정 지원
- `css()`: 초기 스타일시트 주입, 핵심 CSS 추출 지원
- `importmap()`: 모듈 임포트 매핑 주입, 동적 경로 해석 지원
- `moduleEntry()`: 클라이언트 측 진입 모듈 주입, 다중 진입점 설정 지원
- `modulePreload()`: 모듈 의존성 프리로드, 필요 시 로딩 전략 지원

### 리소스 주입 순서

RenderContext는 리소스 주입 순서를 엄격히 제어하며, 이 순서는 브라우저의 작동 원리와 성능 최적화를 고려하여 설계되었습니다:

1. head 부분:
   - `preload()`: CSS 및 JS 리소스 프리로드, 브라우저가 가능한 한 빨리 이러한 리소스를 발견하고 로딩 시작
   - `css()`: 초기 스타일시트 주입, 콘텐츠 렌더링 시 스타일이 준비되도록 보장

2. body 부분:
   - `importmap()`: 모듈 임포트 매핑 주입, ESM 모듈의 경로 해석 규칙 정의
   - `moduleEntry()`: 클라이언트 측 진입 모듈 주입, importmap 이후에 실행되어야 함
   - `modulePreload()`: 모듈 의존성 프리로드, importmap 이후에 실행되어야 함

## 전체 렌더링 프로세스

일반적인 RenderContext 사용 프로세스는 다음과 같습니다:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. 페이지 콘텐츠 렌더링 및 의존성 수집
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. 의존성 수집 완료
    await rc.commit();
    
    // 3. 완전한 HTML 생성
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
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

## 고급 기능

### 베이스 경로 설정

RenderContext는 유연한 동적 베이스 경로 설정 메커니즘을 제공하며, 런타임에 정적 리소스의 베이스 경로를 동적으로 설정할 수 있습니다:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // 베이스 경로 설정
    params: {
        url: req.url
    }
});
```

이 메커니즘은 다음과 같은 시나리오에 특히 유용합니다:

1. **다국어 사이트 배포**
   ```
   메인도메인.com      → 기본 언어
   메인도메인.com/cn/  → 중국어 사이트
   메인도메인.com/en/  → 영어 사이트
   ```

2. **마이크로 프론트엔드 애플리케이션**
   - 서브 애플리케이션을 다양한 경로에 유연하게 배포 지원
   - 다른 메인 애플리케이션에 통합하기 용이

### 임포트 매핑 모드

RenderContext는 두 가지 임포트 매핑(Import Map) 모드를 제공합니다:

1. **Inline 모드** (기본값)
   - 임포트 매핑을 HTML에 직접 인라인으로 포함
   - 소형 애플리케이션에 적합, 추가 네트워크 요청 감소
   - 페이지 로딩 시 즉시 사용 가능

2. **JS 모드**
   - 외부 JavaScript 파일을 통해 임포트 매핑 로딩
   - 대형 애플리케이션에 적합, 브라우저 캐시 메커니즘 활용 가능
   - 매핑 내용 동적 업데이트 지원

설정을 통해 적절한 모드를 선택할 수 있습니다:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### 진입 함수 설정

RenderContext는 `entryName` 설정을 통해 서버 사이드 렌더링의 진입 함수를 지정할 수 있습니다:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // 모바일 진입 함수 사용 지정
    params: {
        url: req.url
    }
});
```

이 메커니즘은 다음과 같은 시나리오에 특히 유용합니다:

1. **다중 템플릿 렌더링**
   ```ts title="src/entry.server.ts"
   // 모바일 진입 함수
   export const mobile = async (rc: RenderContext) => {
       // 모바일 전용 렌더링 로직
   };

   // 데스크톱 진입 함수
   export const desktop = async (rc: RenderContext) => {
       // 데스크톱 전용 렌더링 로직
   };
   ```

2. **A/B 테스트**
   - 동일 페이지에 다른 렌더링 로직 사용 지원
   - 사용자 경험 실험에 용이
   - 다양한 렌더링 전략 유연하게 전환

3. **특수 렌더링 요구사항**
   - 특정 페이지에 맞춤형 렌더링 프로세스 사용 지원
   - 다양한 시나리오의 성능 최적화 요구사항에 적응
   - 더 세밀한 렌더링 제어 구현

## 모범 사례

1. **RenderContext 인스턴스 획득**
   - 항상 `esmx.render()` 메서드를 통해 인스턴스 획득
   - 필요에 따라 적절한 매개변수 전달
   - 수동으로 인스턴스 생성하지 않기

2. **의존성 수집**
   - 모든 모듈이 `importMetaSet.add(import.meta)`를 올바르게 호출하도록 보장
   - 렌더링 완료 후 즉시 `commit()` 메서드 호출
   - 비동기 컴포넌트와 동적 임포트를 적절히 사용하여 초기 로딩 최적화

3. **리소스 주입**
   - 리소스 주입 순서를 엄격히 준수
   - body 부분에 CSS를 주입하지 않기
   - importmap이 moduleEntry보다 먼저 실행되도록 보장

4. **성능 최적화**
   - preload를 사용하여 핵심 리소스 프리로드
   - modulePreload를 적절히 사용하여 모듈 로딩 최적화
   - 불필요한 리소스 로딩 방지
   - 브라우저 캐시 메커니즘 활용하여 로딩 성능 최적화