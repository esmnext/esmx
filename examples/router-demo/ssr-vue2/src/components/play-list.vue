<template>
    <TracksList 
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
    </TracksList>
</template>

<script lang="ts" setup>
import { useRouter } from '@esmx/router-vue';
import {
    type MusicStore,
    type Song,
    useMusicStore
} from 'ssr-vue-base/src/store/music-store';
import { computed, ref } from 'vue';
import TracksList from './tracks-list.vue';

const $router = useRouter();
const musicStore =
    ($router.parsedOptions.context.musicStore as MusicStore) ||
    useMusicStore(ref);

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
