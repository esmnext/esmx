<template>
    <TracksListComponent 
        :tracks="playlist"
        @playTrack="playTrack"
    >
        <div class="playlist-header">
            <h3 class="playlist-title">Play Queue</h3>
            <slot name="header"></slot>
        </div>
        <template #empty-msg>
            No playlist
        </template>
    </TracksListComponent>
</template>

<script lang="ts" setup>
import type { Song } from 'ssr-share/src/store';
import { computed } from 'vue';
import { useMusicStore } from '../store/music-store';
import TracksListComponent from './tracks-list.vue';

const musicStore = useMusicStore();

const emit = defineEmits<(e: 'trackSelected', track: Song) => void>();

const playlist = computed(() => musicStore.playlist.value);

const playTrack = (track: Song) => {
    musicStore.playSong(track, playlist.value);
    emit('trackSelected', track);
};
</script>

<style scoped>
.playlist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4);
    padding: var(--spacing-6);
    padding-bottom: 0;
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
</style>
