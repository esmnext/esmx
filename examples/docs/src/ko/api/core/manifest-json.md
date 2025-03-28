---
titleSuffix: Esmx 프레임워크 빌드 매니페스트 파일 참조
description: Esmx 프레임워크의 빌드 매니페스트 파일(manifest.json) 구조를 상세히 설명하며, 빌드 산출물 관리, 파일 매핑 및 리소스 통계 기능을 통해 개발자가 빌드 시스템을 이해하고 사용할 수 있도록 돕습니다.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, 빌드 매니페스트, 리소스 관리, 빌드 산출물, 파일 매핑, API
---

# ManifestJson

`manifest.json`은 Esmx 프레임워크가 빌드 과정에서 생성하는 매니페스트 파일로, 서비스 빌드의 산출물 정보를 기록합니다. 이 파일은 빌드 산출물, 내보내기 파일 및 리소스 크기 통계를 관리하기 위한 통합 인터페이스를 제공합니다.

```json title="dist/client/manifest.json"
{
  "name": "your-app-name",
  "exports": {
    "src/entry.client": "src/entry.client.8537e1c3.final.js",
    "src/title/index": "src/title/index.2d79c0c2.final.js"
  },
  "buildFiles": [
    "src/entry.client.2e0a89bc.final.css",
    "images/cat.ed79ef6b.final.jpeg",
    "chunks/830.63b8fd4f.final.css",
    "images/running-dog.76197e20.final.gif",
    "chunks/473.42c1ae75.final.js",
    "images/starry.d914a632.final.jpg",
    "images/sun.429a7bc5.final.png",
    "chunks/473.63b8fd4f.final.css",
    "images/logo.3923d727.final.svg",
    "chunks/534.63b8fd4f.final.css",
    "src/title/index.2d79c0c2.final.js",
    "src/entry.client.8537e1c3.final.js",
    "chunks/534.e85c5440.final.js",
    "chunks/830.cdbdf067.final.js"
  ],
  "chunks": {
    "your-app-name@src/views/home.ts": {
      "js": "chunks/534.e85c5440.final.js",
      "css": ["chunks/534.63b8fd4f.final.css"],
      "resources": [
        "images/cat.ed79ef6b.final.jpeg",
        "images/logo.3923d727.final.svg",
        "images/running-dog.76197e20.final.gif",
        "images/starry.d914a632.final.jpg",
        "images/sun.429a7bc5.final.png"
      ],
      "sizes": {
        "js": 7976,
        "css": 5739,
        "resource": 796974
      }
    }
  }
}
```

## 타입 정의
### ManifestJson

```ts
interface ManifestJson {
  name: string;
  exports: Record<string, string>;
  buildFiles: string[];
  chunks: Record<string, ManifestJsonChunks>;
}
```

#### name

- **타입**: `string`

서비스 이름으로, EsmxOptions.name 설정에서 가져옵니다.

#### exports

- **타입**: `Record<string, string>`

외부로 내보내는 파일의 매핑 관계로, key는 소스 파일 경로이고 value는 빌드된 파일 경로입니다.

#### buildFiles

- **타입**: `string[]`

빌드 산출물의 전체 파일 목록으로, 생성된 모든 파일 경로를 포함합니다.

#### chunks

- **타입**: `Record<string, ManifestJsonChunks>`

소스 파일과 컴파일된 산출물의 대응 관계로, key는 소스 파일 경로이고 value는 컴파일 정보입니다.

### ManifestJsonChunks

```ts
interface ManifestJsonChunks {
  js: string;
  css: string[];
  resources: string[];
  sizes: ManifestJsonChunkSizes;
}
```

#### js

- **타입**: `string`

현재 소스 파일이 컴파일된 JS 파일 경로입니다.

#### css

- **타입**: `string[]`

현재 소스 파일과 연결된 CSS 파일 경로 목록입니다.

#### resources

- **타입**: `string[]`

현재 소스 파일과 연결된 기타 리소스 파일 경로 목록입니다.

#### sizes

- **타입**: `ManifestJsonChunkSizes`

빌드 산출물의 크기 통계 정보입니다.

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **타입**: `number`

JS 파일 크기(바이트)입니다.

#### css

- **타입**: `number`

CSS 파일 크기(바이트)입니다.

#### resource

- **타입**: `number`

리소스 파일 크기(바이트)입니다.