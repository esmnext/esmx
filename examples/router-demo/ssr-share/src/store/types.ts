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
