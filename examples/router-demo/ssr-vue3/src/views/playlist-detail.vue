<template>
    <div class="playlist-detail">
        <div class="playlist-header">
            <img :src="playlist?.cover" :alt="playlist?.title" class="playlist-cover" />
            <div class="playlist-info">
                <div class="playlist-type">Playlist</div>
                <h1 class="playlist-title">{{ playlist?.title }}</h1>
                <p class="playlist-description">{{ playlist?.description }}</p>
                <div class="playlist-meta">
                    <span>{{ playlist?.creator }}</span>
                    <span>·</span>
                    <span>{{ playlist?.tracks.length }} songs</span>
                </div>
                <div class="playlist-actions">
                    <button @click="playAll" class="play-all-btn">
                        ▶ Play All
                    </button>
                    <button class="shuffle-btn">
                        🔀 Shuffle Play
                    </button>
                </div>
            </div>
        </div>
        <TracksList
            v-if="playlist?.tracks"
            :tracks="playlist.tracks"
            @playTrack="playTrack"
        />
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from '@esmx/router-vue';
import { TracksList } from 'ssr-vue-base/src/components';
import {
    type Song,
    mockPlaylists,
    musicStore
} from 'ssr-vue-base/src/store/music-store';
import { computed } from 'vue';

const route = useRoute();
const playlistId = computed(() => Number(route.params.id));
const playlist = computed(() =>
    mockPlaylists.find((p) => p.id === playlistId.value)
);

const playAll = () => {
    if (playlist.value && playlist.value.tracks.length > 0) {
        musicStore.playSong(playlist.value.tracks[0], playlist.value.tracks);
    }
};

const playTrack = (track: Song) => {
    if (playlist.value) {
        musicStore.playSong(track, playlist.value.tracks);
    }
};
</script>

<style scoped>
.playlist-detail {
    padding: var(--spacing-6);
}

.playlist-header {
    display: flex;
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-8);
    padding: var(--spacing-8);
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
}

.playlist-cover {
    width: 240px;
    height: 240px;
    border-radius: var(--border-radius-lg);
    object-fit: cover;
    box-shadow: var(--shadow-lg);
}

.playlist-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: var(--spacing-2);
}

.playlist-type {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.playlist-title {
    font-size: var(--font-size-4xl);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.1;
}

.playlist-description {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
}

.playlist-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    font-size: var(--font-size-sm);
    color: var(--text-tertiary);
    margin: var(--spacing-2) 0;
}

.playlist-actions {
    display: flex;
    gap: var(--spacing-3);
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

.shuffle-btn {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--duration-normal);
}

.shuffle-btn:hover {
    background: var(--bg-secondary);
    border-color: var(--music-primary);
}

@media (max-width: 768px) {
    .playlist-header {
        flex-direction: column;
        text-align: center;
        padding: var(--spacing-6) var(--spacing-4);
    }
    
    .playlist-cover {
        width: 200px;
        height: 200px;
        margin: 0 auto;
    }
    
    .playlist-title {
        font-size: var(--font-size-3xl);
    }
}
</style>
