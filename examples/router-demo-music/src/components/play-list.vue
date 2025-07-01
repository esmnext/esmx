<template>
    <div class="playlist-section asdf">
        <div class="playlist-header" v-if="playlist.length > 0 || $slots.header">
            <h3 class="playlist-title">Play Queue</h3>
            <slot name="header"></slot>
        </div>
        <div v-if="playlist.length === 0" class="empty-playlist">
            No playlist
        </div>
        <div v-else class="playlist-tracks">
            <div v-for="(track, index) in playlist" 
                    :key="track.id" 
                    class="playlist-track"
                    :class="{ active: track.id === currentSong?.id }"
                    @click="playTrack(track)">
                <div class="track-number">{{ index + 1 }}</div>
                <img :src="track.cover" :alt="track.title" class="track-cover" />
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
import { computed } from 'vue';
import { type Song, musicStore } from '../store/music-store';

const emit = defineEmits<{
    trackSelected: [track: Song];
}>();

const currentSong = computed(() => musicStore.currentSong.value);
const playlist = computed(() => musicStore.playlist.value);

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const playTrack = (track: Song) => {
    musicStore.playSong(track, playlist.value);
    emit('trackSelected', track);
};
</script>

<style scoped>
.playlist-section {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
    padding: var(--spacing-6);
    margin: 0 auto;
}

.playlist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4);
}

.playlist-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
}

.playlist-title::before {
    content: '';
    width: 4px;
    height: 20px;
    background: var(--music-gradient);
    border-radius: var(--border-radius-full);
}

.empty-playlist {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-8);
    color: var(--text-secondary);
    font-size: var(--font-size-base);
}

.playlist-track {
    display: grid;
    grid-template-columns: 40px 50px 1fr 60px;
    gap: var(--spacing-3);
    padding: var(--spacing-2);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all var(--duration-fast);
    align-items: center;
}

.playlist-track:hover {
    background: var(--bg-secondary);
}

.playlist-track.active {
    background: var(--music-primary);
    color: white;
}

.playlist-track.active .track-title,
.playlist-track.active .track-artist {
    color: white;
}

.track-number {
    text-align: center;
    color: var(--text-tertiary);
    font-size: var(--font-size-sm);
}

.track-cover {
    width: 40px;
    height: 40px;
    border-radius: var(--border-radius);
    object-fit: cover;
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
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-1);
}

.track-artist {
    color: var(--text-secondary);
    font-size: var(--font-size-xs);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-duration {
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
    font-size: var(--font-size-xs);
    text-align: right;
}
</style>
