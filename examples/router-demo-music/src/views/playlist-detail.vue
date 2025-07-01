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
        
        <div class="tracks-list">
            <div class="tracks-header">
                <div class="track-number">#</div>
                <div class="track-title">Title</div>
                <div class="track-album">Album</div>
                <div class="track-duration">Duration</div>
            </div>
            
            <div v-for="(track, index) in playlist?.tracks" :key="track.id" 
                 class="track-item" 
                 @click="playTrack(track)">
                <div class="track-number">{{ index + 1 }}</div>
                <div class="track-info">
                    <img :src="track.cover" :alt="track.title" class="track-cover" />
                    <div class="track-details">
                        <div class="track-title">{{ track.title }}</div>
                        <div class="track-artist">{{ track.artist }}</div>
                    </div>
                </div>
                <div class="track-album">{{ track.album }}</div>
                <div class="track-duration">{{ formatTime(track.duration) }}</div>
                <div class="track-actions">
                    <button class="track-action-btn">❤</button>
                    <button class="track-action-btn">...</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from '@esmx/router-vue';
import { computed } from 'vue';
import { type Song, mockPlaylists, musicStore } from '../store/music-store';

const route = useRoute();
const playlistId = computed(() => Number(route.params.id));
const playlist = computed(() =>
    mockPlaylists.find((p) => p.id === playlistId.value)
);

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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
    max-width: 1200px;
    margin: 0 auto;
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

.tracks-list {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
    overflow: hidden;
}

.tracks-header {
    display: grid;
    grid-template-columns: 60px 1fr 200px 100px 60px;
    gap: var(--spacing-4);
    padding: var(--spacing-4) var(--spacing-6);
    background: var(--bg-secondary);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.track-item {
    display: grid;
    grid-template-columns: 60px 1fr 200px 100px 60px;
    gap: var(--spacing-4);
    padding: var(--spacing-3) var(--spacing-6);
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
    font-weight: 500;
}

.track-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    min-width: 0;
}

.track-cover {
    width: 40px;
    height: 40px;
    border-radius: var(--border-radius);
    object-fit: cover;
}

.track-details {
    min-width: 0;
}

.track-title {
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-artist {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-album {
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-duration {
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
}

.track-actions {
    display: flex;
    gap: var(--spacing-1);
}

.track-action-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    transition: all var(--duration-fast);
}

.track-action-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
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
    
    .tracks-header {
        grid-template-columns: 40px 1fr 80px;
        gap: var(--spacing-2);
    }
    
    .track-item {
        grid-template-columns: 40px 1fr 80px;
        gap: var(--spacing-2);
    }
    
    .track-album,
    .track-actions {
        display: none;
    }
}
</style>
