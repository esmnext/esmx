// 响应式包装器接口
interface ReactiveRef<T> {
    value: T;
}

// 响应式工厂函数类型
type ReactiveFactory = <T>(initialValue: T) => ReactiveRef<T>;

// 事件监听器类型
type ChangeListener<T> = (newValue: T, oldValue: T) => void;

// 自定义响应式实现（不依赖 Vue 框架）
class SimpleReactive<T> implements ReactiveRef<T> {
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
export function createSimpleRef<T>(initialValue: T): ReactiveRef<T> {
    return new SimpleReactive(initialValue);
}

export interface Song {
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: number;
    cover: string;
    audioUrl?: string;
}

export interface Album {
    id: number;
    title: string;
    artist: string;
    year: number;
    cover: string;
    tracks: Song[];
}

export interface Artist {
    id: number;
    name: string;
    avatar: string;
    bio: string;
    followers: number;
    albums: Album[];
}

export interface Playlist {
    id: number;
    title: string;
    description: string;
    cover: string;
    tracks: Song[];
    creator: string;
}

// 模拟数据
export const mockSongs: Song[] = [
    // Michael Jackson
    {
        id: 1,
        title: 'Billie Jean',
        artist: 'Michael Jackson',
        album: 'Thriller',
        duration: 294,
        cover: 'https://picsum.photos/200/200?random=1'
    },
    {
        id: 2,
        title: 'Beat It',
        artist: 'Michael Jackson',
        album: 'Thriller',
        duration: 258,
        cover: 'https://picsum.photos/200/200?random=2'
    },
    {
        id: 3,
        title: 'Smooth Criminal',
        artist: 'Michael Jackson',
        album: 'Bad',
        duration: 249,
        cover: 'https://picsum.photos/200/200?random=3'
    },
    {
        id: 4,
        title: 'Black or White',
        artist: 'Michael Jackson',
        album: 'Dangerous',
        duration: 239,
        cover: 'https://picsum.photos/200/200?random=4'
    },
    // Queen
    {
        id: 5,
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: 355,
        cover: 'https://picsum.photos/200/200?random=5'
    },
    {
        id: 6,
        title: 'We Will Rock You',
        artist: 'Queen',
        album: 'News of the World',
        duration: 122,
        cover: 'https://picsum.photos/200/200?random=6'
    },
    {
        id: 7,
        title: 'We Are the Champions',
        artist: 'Queen',
        album: 'News of the World',
        duration: 179,
        cover: 'https://picsum.photos/200/200?random=7'
    },
    {
        id: 8,
        title: "Don't Stop Me Now",
        artist: 'Queen',
        album: 'Jazz',
        duration: 209,
        cover: 'https://picsum.photos/200/200?random=8'
    },
    // Led Zeppelin
    {
        id: 9,
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin IV',
        duration: 482,
        cover: 'https://picsum.photos/200/200?random=9'
    },
    {
        id: 10,
        title: 'Black Dog',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin IV',
        duration: 296,
        cover: 'https://picsum.photos/200/200?random=10'
    },
    {
        id: 11,
        title: 'Kashmir',
        artist: 'Led Zeppelin',
        album: 'Physical Graffiti',
        duration: 516,
        cover: 'https://picsum.photos/200/200?random=11'
    },
    {
        id: 12,
        title: 'Whole Lotta Love',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin II',
        duration: 334,
        cover: 'https://picsum.photos/200/200?random=12'
    },
    // The Beatles
    {
        id: 13,
        title: 'Hey Jude',
        artist: 'The Beatles',
        album: 'The Beatles 1967-1970',
        duration: 431,
        cover: 'https://picsum.photos/200/200?random=13'
    },
    {
        id: 14,
        title: 'Yesterday',
        artist: 'The Beatles',
        album: 'Help!',
        duration: 125,
        cover: 'https://picsum.photos/200/200?random=14'
    },
    {
        id: 15,
        title: 'Let It Be',
        artist: 'The Beatles',
        album: 'Let It Be',
        duration: 243,
        cover: 'https://picsum.photos/200/200?random=15'
    },
    {
        id: 16,
        title: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        duration: 259,
        cover: 'https://picsum.photos/200/200?random=16'
    },
    // Eagles
    {
        id: 17,
        title: 'Hotel California',
        artist: 'Eagles',
        album: 'Hotel California',
        duration: 391,
        cover: 'https://picsum.photos/200/200?random=17'
    },
    {
        id: 18,
        title: 'Take It Easy',
        artist: 'Eagles',
        album: 'Eagles',
        duration: 212,
        cover: 'https://picsum.photos/200/200?random=18'
    },
    {
        id: 19,
        title: 'Desperado',
        artist: 'Eagles',
        album: 'Desperado',
        duration: 215,
        cover: 'https://picsum.photos/200/200?random=19'
    },
    // Pink Floyd
    {
        id: 20,
        title: 'Another Brick in the Wall',
        artist: 'Pink Floyd',
        album: 'The Wall',
        duration: 399,
        cover: 'https://picsum.photos/200/200?random=20'
    },
    {
        id: 21,
        title: 'Comfortably Numb',
        artist: 'Pink Floyd',
        album: 'The Wall',
        duration: 382,
        cover: 'https://picsum.photos/200/200?random=21'
    },
    {
        id: 22,
        title: 'Wish You Were Here',
        artist: 'Pink Floyd',
        album: 'Wish You Were Here',
        duration: 334,
        cover: 'https://picsum.photos/200/200?random=22'
    },
    // AC/DC
    {
        id: 23,
        title: 'Back in Black',
        artist: 'AC/DC',
        album: 'Back in Black',
        duration: 255,
        cover: 'https://picsum.photos/200/200?random=23'
    },
    {
        id: 24,
        title: 'Highway to Hell',
        artist: 'AC/DC',
        album: 'Highway to Hell',
        duration: 208,
        cover: 'https://picsum.photos/200/200?random=24'
    },
    {
        id: 25,
        title: 'Thunderstruck',
        artist: 'AC/DC',
        album: 'The Razors Edge',
        duration: 292,
        cover: 'https://picsum.photos/200/200?random=25'
    },
    // Bob Dylan
    {
        id: 26,
        title: 'Like a Rolling Stone',
        artist: 'Bob Dylan',
        album: 'Highway 61 Revisited',
        duration: 369,
        cover: 'https://picsum.photos/200/200?random=26'
    },
    {
        id: 27,
        title: "Blowin' in the Wind",
        artist: 'Bob Dylan',
        album: "The Freewheelin' Bob Dylan",
        duration: 168,
        cover: 'https://picsum.photos/200/200?random=27'
    },
    // Elvis Presley
    {
        id: 28,
        title: "Can't Help Falling in Love",
        artist: 'Elvis Presley',
        album: 'Blue Hawaii',
        duration: 187,
        cover: 'https://picsum.photos/200/200?random=28'
    },
    {
        id: 29,
        title: 'Jailhouse Rock',
        artist: 'Elvis Presley',
        album: 'Jailhouse Rock',
        duration: 146,
        cover: 'https://picsum.photos/200/200?random=29'
    },
    // David Bowie
    {
        id: 30,
        title: 'Space Oddity',
        artist: 'David Bowie',
        album: 'David Bowie',
        duration: 314,
        cover: 'https://picsum.photos/200/200?random=30'
    }
];

export const mockPlaylists: Playlist[] = [
    {
        id: 1,
        title: 'Rock Classics',
        description: 'Greatest rock songs of all time',
        cover: 'https://picsum.photos/300/300?random=201',
        tracks: mockSongs.slice(4, 12), // Queen and Led Zeppelin songs
        creator: 'Music Fan'
    },
    {
        id: 2,
        title: 'Pop Legends',
        description: 'Iconic pop hits from legendary artists',
        cover: 'https://picsum.photos/300/300?random=202',
        tracks: mockSongs.slice(0, 8), // Michael Jackson and Queen
        creator: 'PopMaster'
    },
    {
        id: 3,
        title: '60s & 70s Hits',
        description: 'Classic hits from the golden era',
        cover: 'https://picsum.photos/300/300?random=203',
        tracks: [
            mockSongs[12],
            mockSongs[13],
            mockSongs[14],
            mockSongs[25],
            mockSongs[26]
        ], // Beatles and Bob Dylan
        creator: 'Vintage Vibes'
    },
    {
        id: 4,
        title: 'Hard Rock Anthems',
        description: 'Heavy rock and metal classics',
        cover: 'https://picsum.photos/300/300?random=204',
        tracks: mockSongs.slice(22, 25), // AC/DC songs
        creator: 'RockHead'
    }
];

export const mockArtists: Artist[] = [
    {
        id: 1,
        name: 'Michael Jackson',
        avatar: 'https://picsum.photos/200/200?random=101',
        bio: 'The King of Pop, legendary performer and songwriter',
        followers: 45000000,
        albums: []
    },
    {
        id: 2,
        name: 'Queen',
        avatar: 'https://picsum.photos/200/200?random=102',
        bio: 'British rock band formed in London in 1970',
        followers: 38000000,
        albums: []
    },
    {
        id: 3,
        name: 'Led Zeppelin',
        avatar: 'https://picsum.photos/200/200?random=103',
        bio: 'English rock band formed in London in 1968',
        followers: 25000000,
        albums: []
    },
    {
        id: 4,
        name: 'The Beatles',
        avatar: 'https://picsum.photos/200/200?random=104',
        bio: 'English rock band formed in Liverpool in 1960',
        followers: 52000000,
        albums: []
    },
    {
        id: 5,
        name: 'Eagles',
        avatar: 'https://picsum.photos/200/200?random=105',
        bio: 'American rock band formed in Los Angeles in 1971',
        followers: 18000000,
        albums: []
    },
    {
        id: 6,
        name: 'Pink Floyd',
        avatar: 'https://picsum.photos/200/200?random=106',
        bio: 'English rock band formed in London in 1965',
        followers: 22000000,
        albums: []
    },
    {
        id: 7,
        name: 'AC/DC',
        avatar: 'https://picsum.photos/200/200?random=107',
        bio: 'Australian rock band formed in Sydney in 1973',
        followers: 28000000,
        albums: []
    },
    {
        id: 8,
        name: 'Bob Dylan',
        avatar: 'https://picsum.photos/200/200?random=108',
        bio: 'American singer-songwriter and cultural icon',
        followers: 15000000,
        albums: []
    },
    {
        id: 9,
        name: 'Elvis Presley',
        avatar: 'https://picsum.photos/200/200?random=109',
        bio: 'The King of Rock and Roll',
        followers: 35000000,
        albums: []
    },
    {
        id: 10,
        name: 'David Bowie',
        avatar: 'https://picsum.photos/200/200?random=110',
        bio: 'English singer-songwriter and actor',
        followers: 20000000,
        albums: []
    }
];

// 基础数据 Store（非响应式）
class BaseMusicStore {
    currentSong: Song | null = null;
    isPlaying = false;
    currentTime = 0;
    duration = 0;
    volume = 0.8;
    playlist: Song[] = [];
    currentIndex = 0;
    isShuffled = false;
    repeatMode: 'none' | 'one' | 'all' = 'none';

    playSong(song: Song, playlist: Song[] = []) {
        this.currentSong = song;
        this.playlist = playlist.length > 0 ? playlist : [song];
        this.currentIndex = this.playlist.findIndex(
            (s: Song) => s.id === song.id
        );
        this.isPlaying = true;
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
    }

    nextSong() {
        if (this.playlist.length === 0) return;

        let nextIndex: number;
        if (this.isShuffled) {
            nextIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            nextIndex = (this.currentIndex + 1) % this.playlist.length;
        }

        this.currentIndex = nextIndex;
        this.currentSong = this.playlist[nextIndex];
        this.isPlaying = true;
    }

    previousSong() {
        if (this.playlist.length === 0) return;

        let prevIndex: number;
        if (this.isShuffled) {
            prevIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            prevIndex =
                this.currentIndex === 0
                    ? this.playlist.length - 1
                    : this.currentIndex - 1;
        }

        this.currentIndex = prevIndex;
        this.currentSong = this.playlist[prevIndex];
        this.isPlaying = true;
    }

    setCurrentTime(time: number) {
        this.currentTime = time;
    }

    setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
    }

    cycleRepeatMode() {
        const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
    }
}

// 响应式 Store 包装器
export class MusicStore {
    currentSong: ReactiveRef<Song | null>;
    isPlaying: ReactiveRef<boolean>;
    currentTime: ReactiveRef<number>;
    duration: ReactiveRef<number>;
    volume: ReactiveRef<number>;
    playlist: ReactiveRef<Song[]>;
    currentIndex: ReactiveRef<number>;
    isShuffled: ReactiveRef<boolean>;
    repeatMode: ReactiveRef<'none' | 'one' | 'all'>;

    private baseStore: BaseMusicStore;

    constructor(refFactory: ReactiveFactory) {
        this.baseStore = new BaseMusicStore();

        // 创建响应式引用
        this.currentSong = refFactory(this.baseStore.currentSong);
        this.isPlaying = refFactory(this.baseStore.isPlaying);
        this.currentTime = refFactory(this.baseStore.currentTime);
        this.duration = refFactory(this.baseStore.duration);
        this.volume = refFactory(this.baseStore.volume);
        this.playlist = refFactory(this.baseStore.playlist);
        this.currentIndex = refFactory(this.baseStore.currentIndex);
        this.isShuffled = refFactory(this.baseStore.isShuffled);
        this.repeatMode = refFactory(this.baseStore.repeatMode);
    }

    playSong(song: Song, playlist: Song[] = []) {
        this.baseStore.playSong(song, playlist);
        this.syncToReactive();
    }

    togglePlay() {
        this.baseStore.togglePlay();
        this.isPlaying.value = this.baseStore.isPlaying;
    }

    nextSong() {
        this.baseStore.nextSong();
        this.syncToReactive();
    }

    previousSong() {
        this.baseStore.previousSong();
        this.syncToReactive();
    }

    setCurrentTime(time: number) {
        this.baseStore.setCurrentTime(time);
        this.currentTime.value = this.baseStore.currentTime;
    }

    setVolume(vol: number) {
        this.baseStore.setVolume(vol);
        this.volume.value = this.baseStore.volume;
    }

    toggleShuffle() {
        this.baseStore.toggleShuffle();
        this.isShuffled.value = this.baseStore.isShuffled;
    }

    cycleRepeatMode() {
        this.baseStore.cycleRepeatMode();
        this.repeatMode.value = this.baseStore.repeatMode;
    }

    // 同步基础 store 到响应式引用
    private syncToReactive() {
        this.currentSong.value = this.baseStore.currentSong;
        this.isPlaying.value = this.baseStore.isPlaying;
        this.currentTime.value = this.baseStore.currentTime;
        this.duration.value = this.baseStore.duration;
        this.volume.value = this.baseStore.volume;
        this.playlist.value = [...this.baseStore.playlist]; // 创建新数组确保响应式更新
        this.currentIndex.value = this.baseStore.currentIndex;
        this.isShuffled.value = this.baseStore.isShuffled;
        this.repeatMode.value = this.baseStore.repeatMode;
    }

    // 获取原始数据（用于序列化等场景）
    getRawData() {
        return {
            currentSong: this.baseStore.currentSong,
            isPlaying: this.baseStore.isPlaying,
            currentTime: this.baseStore.currentTime,
            duration: this.baseStore.duration,
            volume: this.baseStore.volume,
            playlist: this.baseStore.playlist,
            currentIndex: this.baseStore.currentIndex,
            isShuffled: this.baseStore.isShuffled,
            repeatMode: this.baseStore.repeatMode
        };
    }
}

let singletonStore: MusicStore | null = null;

// 主要的 useMusicStore 函数 - 必须传入 ref 函数
export function useMusicStore(refFactory: ReactiveFactory): MusicStore {
    if (!singletonStore) singletonStore = new MusicStore(refFactory);
    return singletonStore;
}
