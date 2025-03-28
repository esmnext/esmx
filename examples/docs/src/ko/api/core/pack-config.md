---
titleSuffix: Esmx 프레임워크 패키징 설정 API 참조
description: Esmx 프레임워크의 PackConfig 설정 인터페이스에 대해 자세히 설명합니다. 소프트웨어 패키지 패키징 규칙, 출력 설정 및 라이프사이클 훅을 포함하여 개발자가 표준화된 빌드 프로세스를 구현할 수 있도록 도와줍니다.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, 소프트웨어 패키지 패키징, 빌드 설정, 라이프사이클 훅, 패키징 설정, 웹 애플리케이션 프레임워크
---

# PackConfig

`PackConfig`는 소프트웨어 패키지 패키징 설정 인터페이스로, 서비스의 빌드 결과물을 표준 npm .tgz 형식의 소프트웨어 패키지로 패키징하는 데 사용됩니다.

- **표준화**: npm 표준 .tgz 패키징 형식 사용
- **완전성**: 모듈의 소스 코드, 타입 선언 및 설정 파일 등 모든 필요한 파일 포함
- **호환성**: npm 생태계와 완벽하게 호환되며, 표준 패키지 관리 워크플로우 지원

## 타입 정의

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

패키징 기능을 활성화할지 여부. 활성화하면 빌드 결과물을 표준 npm .tgz 형식의 소프트웨어 패키지로 패키징합니다.

- 타입: `boolean`
- 기본값: `false`

#### outputs

출력할 소프트웨어 패키지 파일 경로를 지정합니다. 다음 설정 방식을 지원합니다:
- `string`: 단일 출력 경로, 예: 'dist/versions/my-app.tgz'
- `string[]`: 여러 출력 경로, 여러 버전을 동시에 생성할 때 사용
- `boolean`: true일 때 기본 경로 'dist/client/versions/latest.tgz' 사용

#### packageJson

package.json 내용을 사용자 정의하는 콜백 함수. 패키징 전에 호출되며, package.json 내용을 사용자 정의하는 데 사용됩니다.

- 매개변수:
  - `esmx: Esmx` - Esmx 인스턴스
  - `pkg: any` - 원본 package.json 내용
- 반환값: `Promise<any>` - 수정된 package.json 내용

일반적인 용도:
- 패키지 이름 및 버전 번호 수정
- 의존성 추가 또는 업데이트
- 사용자 정의 필드 추가
- 릴리스 관련 정보 설정

예제:
```ts
packageJson: async (esmx, pkg) => {
  // 패키지 정보 설정
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = '내 애플리케이션';

  // 의존성 추가
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // 릴리스 설정 추가
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

패키징 전 준비 작업을 위한 콜백 함수.

- 매개변수:
  - `esmx: Esmx` - Esmx 인스턴스
  - `pkg: Record<string, any>` - package.json 내용
- 반환값: `Promise<void>`

일반적인 용도:
- 추가 파일 추가 (README, LICENSE 등)
- 테스트 또는 빌드 검증 실행
- 문서 또는 메타데이터 생성
- 임시 파일 정리

예제:
```ts
onBefore: async (esmx, pkg) => {
  // 문서 추가
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // 테스트 실행
  await runTests();

  // 문서 생성
  await generateDocs();

  // 임시 파일 정리
  await cleanupTempFiles();
}
```

#### onAfter

패키징 완료 후 처리 작업을 위한 콜백 함수. .tgz 파일 생성 후 호출되며, 패키징 결과물을 처리하는 데 사용됩니다.

- 매개변수:
  - `esmx: Esmx` - Esmx 인스턴스
  - `pkg: Record<string, any>` - package.json 내용
  - `file: Buffer` - 패키징된 파일 내용
- 반환값: `Promise<void>`

일반적인 용도:
- npm 저장소에 릴리스 (공개 또는 개인)
- 정적 리소스 서버에 업로드
- 버전 관리 실행
- CI/CD 프로세스 트리거

예제:
```ts
onAfter: async (esmx, pkg, file) => {
  // npm 개인 저장소에 릴리스
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // 정적 리소스 서버에 업로드
  await uploadToServer(file, 'https://assets.example.com/packages');

  // 버전 태그 생성
  await createGitTag(pkg.version);

  // 배포 프로세스 트리거
  await triggerDeploy(pkg.version);
}
```

## 사용 예제

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // 내보낼 모듈 설정
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // 패키징 설정
  pack: {
    // 패키징 기능 활성화
    enable: true,

    // 여러 버전 동시 출력
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // package.json 사용자 정의
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // 패키징 전 준비
    onBefore: async (esmx, pkg) => {
      // 필요한 파일 추가
      await fs.writeFile('dist/README.md', '# Your App\n\n모듈 내보내기 설명...');
      // 타입 검사 실행
      await runTypeCheck();
    },

    // 패키징 후 처리
    onAfter: async (esmx, pkg, file) => {
      // 개인 npm 미러에 릴리스
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // 또는 정적 서버에 배포
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```