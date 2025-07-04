# 通用音乐 Store

这个音乐 Store 设计为同时支持 Vue 2 和 Vue 3，并且在没有 Vue 框架的环境中也能正常工作。

## 特性

- ✅ Vue 3 原生支持
- ✅ Vue 2 + Composition API 支持
- ✅ 自定义响应式实现（无框架依赖）
- ✅ 显式依赖注入（使用方传入 ref 函数）
- ✅ 单例模式
- ✅ TypeScript 支持

## 使用方法

### Vue 3

```typescript
import { ref } from 'vue';
import { useMusicStore } from './music-store';

// 传入 Vue 3 的 ref 函数
const musicStore = useMusicStore(ref);

// 使用 store
musicStore.playSong(song, playlist);
musicStore.togglePlay();
```

### Vue 2 + Composition API

```typescript
import { ref } from '@vue/composition-api';
import { useMusicStore } from './music-store';

// 传入 Vue 2 Composition API 的 ref 函数
const musicStore = useMusicStore(ref);
```

### 无框架环境（使用自定义响应式）

```typescript
import { useMusicStore, createSimpleRef } from './music-store';

// 使用内置的简单响应式实现
const musicStore = useMusicStore(createSimpleRef);
```

### 在组件中统一获取 Store

你可以创建一个工具函数来简化在组件中的使用：

```typescript
// utils/store.ts
import { ref } from 'vue'; // 根据项目使用的 Vue 版本调整
import { useMusicStore } from '../store/music-store';

export function useAppMusicStore() {
    return useMusicStore(ref);
}
```

然后在组件中：

```typescript
import { useAppMusicStore } from '../utils/store';

const musicStore = useAppMusicStore();
```

## 组件中的使用

### Vue 3 Composition API

```vue
<template>
  <div>
    <h3>{{ musicStore.currentSong.value?.title }}</h3>
    <button @click="musicStore.togglePlay()">
      {{ musicStore.isPlaying.value ? '暂停' : '播放' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMusicStore } from '../store/music-store';

const musicStore = useMusicStore(ref);
</script>
```

### Vue 2 + Composition API

```vue
<template>
  <div>
    <h3>{{ musicStore.currentSong.value && musicStore.currentSong.value.title }}</h3>
    <button @click="musicStore.togglePlay()">
      {{ musicStore.isPlaying.value ? '暂停' : '播放' }}
    </button>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api';
import { useMusicStore } from '../store/music-store';

export default {
  setup() {
    const musicStore = useMusicStore(ref);
    
    return {
      musicStore
    };
  }
};
</script>
```

### Vue 2 Options API

```vue
<template>
  <div>
    <h3>{{ currentSong && currentSong.title }}</h3>
    <button @click="togglePlay">
      {{ isPlaying ? '暂停' : '播放' }}
    </button>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api';
import { useMusicStore } from '../store/music-store';

export default {
  data() {
    return {
      musicStore: null
    };
  },
  computed: {
    currentSong() {
      return this.musicStore?.currentSong.value;
    },
    isPlaying() {
      return this.musicStore?.isPlaying.value;
    }
  },
  methods: {
    togglePlay() {
      this.musicStore?.togglePlay();
    }
  },
  created() {
    this.musicStore = useMusicStore(ref);
  }
};
</script>
```

## API 说明

### 属性

- `currentSong`: 当前播放的歌曲
- `isPlaying`: 是否正在播放
- `currentTime`: 当前播放时间
- `duration`: 歌曲总时长
- `volume`: 音量（0-1）
- `playlist`: 播放列表
- `currentIndex`: 当前歌曲在播放列表中的索引
- `isShuffled`: 是否随机播放
- `repeatMode`: 重复模式（'none' | 'one' | 'all'）

### 方法

- `playSong(song, playlist?)`: 播放指定歌曲
- `togglePlay()`: 切换播放/暂停状态
- `nextSong()`: 下一首歌
- `previousSong()`: 上一首歌
- `setCurrentTime(time)`: 设置当前播放时间
- `setVolume(volume)`: 设置音量
- `toggleShuffle()`: 切换随机播放
- `cycleRepeatMode()`: 循环切换重复模式
- `getRawData()`: 获取原始数据（非响应式）

### 响应式函数

- `createSimpleRef<T>(initialValue: T)`: 创建自定义响应式引用

## 架构说明

这个 store 采用了分层架构：

1. **BaseMusicStore**: 基础数据层，不依赖任何框架，纯 JavaScript 逻辑
2. **MusicStore**: 响应式包装层，将基础数据包装为响应式引用
3. **ReactiveFactory**: 响应式工厂接口，由使用方提供具体实现
4. **依赖注入**: 通过参数显式传入响应式函数，避免自动检测的复杂性

这种设计确保了：
- 框架无关性
- 明确的依赖关系
- 简单的 API
- 类型安全
- 性能优化
- 易于测试

## 优势

1. **显式依赖**: 使用方明确传入 ref 函数，避免运行时检测的不确定性
2. **简单明了**: 移除了复杂的自动检测逻辑，API 更加清晰
3. **灵活性**: 支持任何兼容的响应式实现
4. **可控性**: 使用方完全控制使用哪种响应式系统
5. **轻量级**: 核心代码更加精简
