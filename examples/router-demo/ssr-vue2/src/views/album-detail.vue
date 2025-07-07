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
        
        <TracksList
            v-if="albumTracks.length > 0"
            :tracks="albumTracks"
            @playTrack="playTrack"
        />
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from '@esmx/router-vue';
import {
    type MusicStore,
    type Song,
    mockArtists,
    mockSongs,
    useMusicStore
} from 'ssr-share/src/store/music-store';
import { computed, ref } from 'vue';
import TracksList from '../components/tracks-list.vue';

const $route = useRoute();
const $router = useRouter();

const musicStore =
    ($router.parsedOptions.context.musicStore as MusicStore) ||
    useMusicStore(ref);

const songId = computed(() => Number($route.params.id));
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
            $router.push(`/artist/${artist.id}`);
        }
    }
};
</script>

<style scoped>
.album-detail {
    padding: var(--spacing-6);
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
