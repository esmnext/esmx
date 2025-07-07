import type { Song } from './types';

// 响应式包装器接口
export interface Ref<T> {
    value: T;
}

// 事件监听器类型
export type ChangeListener<T> = (newValue: T, oldValue: T) => void;

// 自定义响应式实现（不依赖 Vue 框架）
export class Reactive<T> implements Ref<T> {
    private _value: T;
    private listeners: Set<ChangeListener<T>> = new Set();

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    get value(): T {
        return this._value;
    }

    set value(newValue: T) {
        const oldValue = this._value;
        this._value = newValue;
        this.listeners.forEach((listener) => listener(newValue, oldValue));
    }

    addListener(listener: ChangeListener<T>): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

// 创建简单响应式引用
export function ref<T>(initialValue: T): Ref<T> {
    return new Reactive(initialValue);
}

export class MusicStore {
    currentSong = ref<Song | null>(null);
    isPlaying = ref(false);
    currentTime = ref(0);
    duration = ref(0);
    volume = ref(0.8);
    playlist = ref<Song[]>([]);
    currentIndex = ref(0);
    isShuffled = ref(false);
    repeatMode = ref<'none' | 'one' | 'all'>('none');

    playSong(song: Song, playlist: Song[] = []) {
        this.currentSong.value = song;
        this.playlist.value = playlist.length > 0 ? playlist : [song];
        this.currentIndex.value = this.playlist.value.findIndex(
            (s) => s.id === song.id
        );
        this.isPlaying.value = true;
    }

    togglePlay() {
        this.isPlaying.value = !this.isPlaying.value;
    }

    nextSong() {
        if (this.playlist.value.length === 0) return;

        let nextIndex: number;
        if (this.isShuffled.value) {
            nextIndex = Math.floor(Math.random() * this.playlist.value.length);
        } else {
            nextIndex =
                (this.currentIndex.value + 1) % this.playlist.value.length;
        }

        this.currentIndex.value = nextIndex;
        this.currentSong.value = this.playlist.value[nextIndex];
        this.isPlaying.value = true;
    }

    previousSong() {
        if (this.playlist.value.length === 0) return;

        let prevIndex: number;
        if (this.isShuffled.value) {
            prevIndex = Math.floor(Math.random() * this.playlist.value.length);
        } else {
            prevIndex =
                this.currentIndex.value === 0
                    ? this.playlist.value.length - 1
                    : this.currentIndex.value - 1;
        }

        this.currentIndex.value = prevIndex;
        this.currentSong.value = this.playlist.value[prevIndex];
        this.isPlaying.value = true;
    }

    setCurrentTime(time: number) {
        this.currentTime.value = time;
    }

    setVolume(vol: number) {
        this.volume.value = Math.max(0, Math.min(1, vol));
    }

    toggleShuffle() {
        this.isShuffled.value = !this.isShuffled.value;
    }

    cycleRepeatMode() {
        const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode.value);
        this.repeatMode.value = modes[(currentIndex + 1) % modes.length];
    }
}

export const musicStore = new MusicStore();
