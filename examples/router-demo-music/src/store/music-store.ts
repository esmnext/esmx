import { reactive, ref } from 'vue';

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

// 音乐播放状态管理
class MusicStore {
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

        let nextIndex;
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

        let prevIndex;
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
