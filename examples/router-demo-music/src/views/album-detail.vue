<template>
    <div class="album-detail">
        <div class="album-header">
            <img :src="mockSongs[0]?.cover" :alt="albumTitle" class="album-cover" />
            <div class="album-info">
                <div class="album-type">Album</div>
                <h1 class="album-title">{{ albumTitle }}</h1>
                <p class="album-artist" @click="goToArtist">{{ albumArtist }}</p>
                <div class="album-meta">
                    <span>2023</span>
                    <span>·</span>
                    <span>{{ albumTracks.length }} songs</span>
                </div>
                <div class="album-actions">
                    <button @click="playAll" class="play-all-btn">
                        ▶ Play All
                    </button>
                </div>
            </div>
        </div>
        
        <div class="tracks-list">
            <div v-for="(track, index) in albumTracks" :key="track.id" 
                 class="track-item" 
                 @click="playTrack(track)">
                <div class="track-number">{{ index + 1 }}</div>
                <div class="track-info">
                    <div class="track-title">{{ track.title }}</div>
                    <div class="track-artist">{{ track.artist }}</div>
                </div>
                <div class="track-duration">{{ formatTime(track.duration) }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from '@esmx/router-vue';
import { computed } from 'vue';
import {
    type Song,
    mockArtists,
    mockSongs,
    musicStore
} from '../store/music-store';

const route = useRoute();
const router = useRouter();
const songId = computed(() => Number(route.params.id));
const selectedSong = computed(() =>
    mockSongs.find((s) => s.id === songId.value)
);

const albumTitle = computed(() => selectedSong.value?.album || 'Unknown Album');
const albumArtist = computed(
    () => selectedSong.value?.artist || 'Unknown Artist'
);

// 模拟同专辑的歌曲
const albumTracks = computed(() => {
    if (selectedSong.value) {
        return mockSongs.filter(
            (song) => song.album === selectedSong.value?.album
        );
    }
    return [];
});

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const playAll = () => {
    if (albumTracks.value.length > 0) {
        musicStore.playSong(albumTracks.value[0], albumTracks.value);
    }
};

const playTrack = (track: Song) => {
    musicStore.playSong(track, albumTracks.value);
};

const goToArtist = () => {
    if (selectedSong.value) {
        const artist = mockArtists.find(
            (a) => a.name === selectedSong.value?.artist
        );
        if (artist) {
            router.push(`/artist/${artist.id}`);
        }
    }
};
</script>

<style scoped>
.album-detail {
    padding: var(--spacing-6);
    max-width: 800px;
    margin: 0 auto;
}

.album-header {
    display: flex;
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-8);
    padding: var(--spacing-8);
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
}

.album-cover {
    width: 200px;
    height: 200px;
    border-radius: var(--border-radius-lg);
    object-fit: cover;
    box-shadow: var(--shadow-lg);
}

.album-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: var(--spacing-2);
}

.album-type {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.album-title {
    font-size: var(--font-size-3xl);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.1;
}

.album-artist {
    font-size: var(--font-size-xl);
    color: var(--text-secondary);
    margin: 0;
    font-weight: 600;
    cursor: pointer;
    transition: color var(--duration-fast);
}

.album-artist:hover {
    color: var(--music-primary);
    text-decoration: underline;
}

.album-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    font-size: var(--font-size-sm);
    color: var(--text-tertiary);
    margin: var(--spacing-2) 0;
}

.album-actions {
    margin-top: var(--spacing-4);
}

.play-all-btn {
    background: var(--music-primary);
    color: white;
    border: none;
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-normal);
}

.play-all-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.05);
}

.tracks-list {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
    overflow: hidden;
}

.track-item {
    display: grid;
    grid-template-columns: 40px 1fr 80px;
    gap: var(--spacing-4);
    padding: var(--spacing-4) var(--spacing-6);
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
    transition: all var(--duration-fast);
    align-items: center;
}

.track-item:hover {
    background: var(--bg-secondary);
}

.track-item:last-child {
    border-bottom: none;
}

.track-number {
    color: var(--text-tertiary);
    text-align: center;
    font-weight: 600;
}

.track-info {
    min-width: 0;
}

.track-title {
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: var(--spacing-1);
}

.track-artist {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-duration {
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
    text-align: right;
}

@media (max-width: 768px) {
    .album-header {
        flex-direction: column;
        text-align: center;
        padding: var(--spacing-6) var(--spacing-4);
    }
    
    .album-cover {
        width: 180px;
        height: 180px;
        margin: 0 auto;
    }
    
    .album-title {
        font-size: var(--font-size-2xl);
    }
}
</style>
