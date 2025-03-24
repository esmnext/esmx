---
titleSuffix: Gez 프레임워크 모듈 설정 API 참조
description: Gez 프레임워크의 ModuleConfig 설정 인터페이스에 대해 자세히 설명합니다. 모듈 가져오기 및 내보내기 규칙, 별칭 설정, 외부 종속성 관리 등을 포함하여 프레임워크의 모듈화 시스템을 깊이 이해할 수 있도록 도와줍니다.
head:
  - - meta
    - property: keywords
      content: Gez, ModuleConfig, 모듈 설정, 모듈 가져오기 내보내기, 외부 종속성, 별칭 설정, 종속성 관리, 웹 애플리케이션 프레임워크
---

# ModuleConfig

ModuleConfig는 Gez 프레임워크의 모듈 설정 기능을 제공하며, 모듈의 가져오기 및 내보내기 규칙, 별칭 설정, 외부 종속성 등을 정의하는 데 사용됩니다.

## 타입 정의

### PathType

- **타입 정의**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

모듈 경로 타입 열거형:
- `npm`: node_modules의 종속성을 나타냄
- `root`: 프로젝트 루트 디렉토리의 파일을 나타냄

### ModuleConfig

- **타입 정의**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

모듈 설정 인터페이스로, 서비스의 내보내기, 가져오기 및 외부 종속성 설정을 정의하는 데 사용됩니다.

#### exports

내보내기 설정 목록으로, 서비스의 특정 코드 단위(예: 컴포넌트, 유틸리티 함수 등)를 ESM 형식으로 외부에 노출합니다.

두 가지 타입을 지원합니다:
- `root:*`: 소스 코드 파일을 내보냄, 예: `root:src/components/button.vue`
- `npm:*`: 서드파티 종속성을 내보냄, 예: `npm:vue`

각 내보내기 항목은 다음 속성을 포함합니다:
- `name`: 원본 내보내기 경로, 예: `npm:vue` 또는 `root:src/components`
- `type`: 경로 타입(`npm` 또는 `root`)
- `importName`: 가져오기 이름, 형식: `${serviceName}/${type}/${path}`
- `exportName`: 내보내기 경로, 서비스 루트 디렉토리 기준
- `exportPath`: 실제 파일 경로
- `externalName`: 외부 종속성 이름, 다른 서비스가 이 모듈을 가져올 때 사용하는 식별자

#### links

서비스 종속성 설정 매핑으로, 현재 서비스가 의존하는 다른 서비스(로컬 또는 원격)와 그 로컬 경로를 설정합니다. 각 설정 항목의 키는 서비스 이름이고, 값은 해당 서비스의 로컬 경로입니다.

설치 방식에 따라 설정이 다릅니다:
- 소스 코드 설치(Workspace, Git): dist 디렉토리를 가리켜야 함, 빌드된 파일을 사용해야 하기 때문
- 패키지 설치(Link, 정적 서버, 프라이빗 미러, File): 패키지 디렉토리를 직접 가리킴, 패키지에 이미 빌드된 파일이 포함되어 있기 때문

#### imports

외부 종속성 매핑으로, 사용할 외부 종속성을 설정합니다. 일반적으로 원격 모듈의 종속성을 사용합니다.

각 종속성 항목은 다음 속성을 포함합니다:
- `match`: 가져오기 문을 매칭하는 정규 표현식
- `import`: 실제 모듈 경로

**예제**:
```ts title="entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
  modules: {
    // 내보내기 설정
    exports: [
      'root:src/components/button.vue',  // 소스 코드 파일 내보내기
      'root:src/utils/format.ts',
      'npm:vue',  // 서드파티 종속성 내보내기
      'npm:vue-router'
    ],

    // 가져오기 설정
    links: {
      // 소스 코드 설치 방식: dist 디렉토리를 가리킴
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // 패키지 설치 방식: 패키지 디렉토리를 직접 가리킴
      'other-remote': 'root:./node_modules/other-remote'
    },

    // 외부 종속성 설정
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies GezOptions;
```

### ParsedModuleConfig

- **타입 정의**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * 패키지 이름
     */
    name: string
    /**
     * 패키지 루트 디렉토리
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

파싱된 모듈 설정으로, 원본 모듈 설정을 표준화된 내부 형식으로 변환합니다:

#### name
현재 서비스의 이름
- 모듈 식별 및 가져오기 경로 생성에 사용

#### root
현재 서비스의 루트 디렉토리 경로
- 상대 경로 해석 및 빌드 산출물 저장에 사용

#### exports
내보내기 설정 목록
- `name`: 원본 내보내기 경로, 예: 'npm:vue' 또는 'root:src/components'
- `type`: 경로 타입(npm 또는 root)
- `importName`: 가져오기 이름, 형식: '${serviceName}/${type}/${path}'
- `exportName`: 내보내기 경로, 서비스 루트 디렉토리 기준
- `exportPath`: 실제 파일 경로
- `externalName`: 외부 종속성 이름, 다른 서비스가 이 모듈을 가져올 때 사용하는 식별자

#### links
가져오기 설정 목록
- `name`: 패키지 이름
- `root`: 패키지 루트 디렉토리

#### imports
외부 종속성 매핑
- 모듈의 가져오기 경로를 실제 모듈 위치로 매핑
- `match`: 가져오기 문을 매칭하는 정규 표현식
- `import`: 실제 모듈 경로
```