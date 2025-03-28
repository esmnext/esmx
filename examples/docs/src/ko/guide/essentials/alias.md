---
titleSuffix: Esmx 프레임워크 모듈 임포트 경로 매핑 가이드
description: Esmx 프레임워크의 경로 별칭(Path Alias) 메커니즘에 대해 자세히 설명합니다. 이는 임포트 경로 단순화, 깊은 중첩 방지, 타입 안전성, 모듈 해석 최적화 등의 기능을 포함하며, 개발자가 코드 유지보수성을 향상시키는 데 도움을 줍니다.
head:
  - - meta
    - property: keywords
      content: Esmx, 경로 별칭, Path Alias, TypeScript, 모듈 임포트, 경로 매핑, 코드 유지보수성
---

# 경로 별칭

경로 별칭(Path Alias)은 모듈 임포트 경로 매핑 메커니즘으로, 개발자가 완전한 모듈 경로 대신 짧고 의미 있는 식별자를 사용할 수 있게 해줍니다. Esmx에서 경로 별칭 메커니즘은 다음과 같은 장점을 제공합니다:

- **임포트 경로 단순화**: 의미 있는 별칭을 사용하여 긴 상대 경로를 대체함으로써 코드 가독성을 높입니다.
- **깊은 중첩 방지**: `../../../../`와 같은 다중 디렉토리 참조로 인한 유지보수 어려움을 해결합니다.
- **타입 안전성**: TypeScript의 타입 시스템과 완전히 통합되어 코드 완성 및 타입 검사를 제공합니다.
- **모듈 해석 최적화**: 미리 정의된 경로 매핑을 통해 모듈 해석 성능을 향상시킵니다.

## 기본 별칭 메커니즘

Esmx는 서비스 이름(Service Name) 기반의 자동 별칭 메커니즘을 사용하며, 이는 설정보다 규약을 우선하는 설계로 다음과 같은 특징을 가집니다:

- **자동 구성**: `package.json`의 `name` 필드를 기반으로 별칭이 자동 생성되며, 수동 설정이 필요 없습니다.
- **통일된 규범**: 모든 서비스 모듈이 일관된 명명 및 참조 규칙을 따르도록 보장합니다.
- **타입 지원**: `npm run build:dts` 명령어와 함께 사용하여 타입 선언 파일을 자동 생성함으로써, 서비스 간 타입 추론을 가능하게 합니다.
- **예측 가능성**: 서비스 이름을 통해 모듈 참조 경로를 추론할 수 있어 유지보수 비용을 줄입니다.

## 설정 설명

### package.json 설정

`package.json`에서 `name` 필드를 통해 서비스 이름을 정의하며, 이 이름은 서비스의 기본 별칭 접두사로 사용됩니다:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### tsconfig.json 설정

TypeScript가 별칭 경로를 올바르게 해석할 수 있도록 `tsconfig.json`에서 `paths` 매핑을 설정해야 합니다:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## 사용 예제

### 서비스 내부 모듈 임포트

```ts
// 별칭을 사용하여 임포트
import { MyComponent } from 'your-app-name/src/components';

// 상대 경로를 사용한 동등한 임포트
import { MyComponent } from '../components';
```

### 다른 서비스 모듈 임포트

```ts
// 다른 서비스의 컴포넌트 임포트
import { SharedComponent } from 'other-service/src/components';

// 다른 서비스의 유틸리티 함수 임포트
import { utils } from 'other-service/src/utils';
```

::: tip 최적의 실천 방법
- 상대 경로보다 별칭 경로를 우선적으로 사용합니다.
- 별칭 경로의 의미와 일관성을 유지합니다.
- 별칭 경로에서 너무 많은 디렉토리 계층을 사용하지 않습니다.

:::

``` ts
// 컴포넌트 임포트
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// 유틸리티 함수 임포트
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// 타입 정의 임포트
import type { UserInfo } from 'your-app-name/src/types';
```

### 서비스 간 임포트

모듈 링크(Module Link)가 구성된 경우, 동일한 방식으로 다른 서비스의 모듈을 임포트할 수 있습니다:

```ts
// 원격 서비스의 컴포넌트 임포트
import { Header } from 'remote-service/src/components';

// 원격 서비스의 유틸리티 함수 임포트
import { logger } from 'remote-service/src/utils';
```

### 사용자 정의 별칭

서드파티 패키지나 특수한 상황을 위해 Esmx 설정 파일을 통해 사용자 정의 별칭을 설정할 수 있습니다:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Vue에 특정 빌드 버전을 구성
                        'vue$': 'vue/dist/vue.esm.js',
                        // 자주 사용하는 디렉토리에 짧은 별칭 구성
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning 주의 사항
1. 비즈니스 모듈의 경우, 프로젝트의 일관성을 유지하기 위해 기본 별칭 메커니즘을 항상 사용하는 것이 좋습니다.
2. 사용자 정의 별칭은 주로 서드파티 패키지의 특수 요구 사항이나 개발 경험을 최적화하는 데 사용됩니다.
3. 사용자 정의 별칭을 과도하게 사용하면 코드의 유지보수성과 빌드 최적화에 영향을 미칠 수 있습니다.

:::