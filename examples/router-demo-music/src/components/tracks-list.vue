<template>
    <div class="tracks-list">
        <slot></slot>
        <div v-if="tracks.length === 0" class="empty-tracks">
            <slot name="empty">
                <div class="empty-icon"><slot name="empty-icon">♬</slot></div>
                <div class="empty-message"><slot name="empty-msg">No tracks available</slot></div>
            </slot>
        </div>
        <div class="song-list" v-else>
            <div class="tracks-header">
                <div class="track-number">#</div>
                <div class="track-title">Title</div>
                <div class="track-album">Album</div>
                <div class="track-duration">Duration</div>
            </div>
            
            <div v-for="(track, index) in tracks" :key="track.id" 
                class="track-item" 
                :class="{ 'active': track.id === currentSong?.id }"
                @click="$emit('playTrack', track)"
            >
                <div class="track-number">{{ index + 1 }}</div>
                <div class="track-info">
                    <img :src="track.cover" :alt="track.title" class="track-cover" />
                    <div class="track-details">
                        <div class="track-title">{{ track.title }}</div>
                        <div class="track-artist">{{ track.artist }}</div>
                    </div>
                </div>
                <RouterLink :to="`/album/${track.id}`" class="track-album" @click.stop>{{
                    track.album
                }}</RouterLink>
                <div class="track-duration">{{ formatTime(track.duration) }}</div>
                <div class="track-actions">
                    <button class="track-action-btn" @click.stop>❤</button>
                    <button class="track-action-btn" @click.stop>⋯</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink } from '@esmx/router-vue';
import { computed } from 'vue';
import { type Song, musicStore } from '../store/music-store';
import { formatTime } from '../utils/time';

defineProps<{
    tracks: Song[];
}>();

defineEmits<{
    playTrack: [track: Song];
}>();

const currentSong = computed(() => musicStore.currentSong.value);
</script>

<style scoped>
.tracks-list {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
    overflow: hidden;
}

.empty-tracks {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-12) var(--spacing-6);
    text-align: center;
}

.empty-icon {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-4);
    opacity: 0.5;
}

.empty-message {
    color: var(--text-secondary);
    font-size: var(--font-size-base);
    font-weight: 500;
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
    background: var(--bg-primary);
}

.track-item.active {
    background: var(--music-primary);
    color: #fff;
}

.track-item.active .track-title,
.track-item.active .track-artist,
.track-item.active .track-album {
    color: #fff;
}

.track-item.active .track-duration,
.track-item.active .track-number,
.track-item.active .track-action-btn {
    color: #fffa;
}

.track-item.active .track-action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
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

a.track-album {
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: color var(--duration-fast);
}

a.track-album:hover {
    color: var(--music-primary);
    text-decoration: underline;
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
    font-weight: bolder;
}

@media (max-width: 768px) {
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
