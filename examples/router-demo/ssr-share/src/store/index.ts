export type { Song, Playlist, Artist } from './types';
export { mockSongs, mockPlaylists, mockArtists } from './mock-data';
export type {
    Ref,
    ChangeListener,
    MusicStore
} from './music-store';
export { Reactive, ref, musicStore } from './music-store';

// // Vue 2 Store 插件
// export type { Vue2MusicStoreType } from './vue2-music-store';
// export { Vue2MusicStore, vue2MusicStore } from './vue2-music-store';

// // Vue 3 Store 插件
// export type { Vue3MusicStoreType } from './vue3-music-store';
// export { Vue3MusicStore, Vue3MusicStorePlugin, vue3MusicStore, useMusicStore } from './vue3-music-store';
