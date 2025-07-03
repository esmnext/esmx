<template>
    <div class="now-playing">
        <TwoCol class="player-container">
            <BubbleBg class="song-header">
                <div class="album-art-wrapper">
                    <img :src="currentSong?.cover" :alt="currentSong?.title" class="album-art" />
                    <div class="vinyl-overlay" :class="{ spinning: isPlaying }"></div>
                </div>
                <div class="player-info">
                    <div class="song-type">Now Playing</div>
                    <h1 class="song-title">{{ currentSong?.title || 'No song playing' }}</h1>
                    <RouterLink v-if="currentSong" :to="`/artist/${currentSong.id}`" class="song-artist">
                        {{ currentSong.artist || 'Unknown Artist' }}
                    </RouterLink>
                    <span v-else class="song-artist">Unknown Artist</span>
                    <RouterLink v-if="currentSong" :to="`/album/${currentSong.id}`" class="song-album">
                        {{ currentSong.album || 'Unknown Album' }}
                    </RouterLink>
                    <span v-else class="song-album">Unknown Album</span>
                </div>
            </BubbleBg>

            <div class="player-controls">
                <div class="control-buttons">
                    <button @click="musicStore.toggleShuffle()" 
                            class="control-btn" 
                            :class="{ active: isShuffled }">
                        🔀
                    </button>
                    <button @click="musicStore.previousSong()" class="control-btn">
                        ⏮
                    </button>
                    <button @click="musicStore.togglePlay()" class="play-btn">
                        {{ isPlaying ? '⏸' : '▶' }}
                    </button>
                    <button @click="musicStore.nextSong()" class="control-btn">
                        ⏭
                    </button>
                    <button @click="musicStore.cycleRepeatMode()" 
                            class="control-btn" 
                            :class="{ active: repeatMode !== 'none' }">
                        {{ repeatMode === 'one' ? '🔂' : '🔁' }}
                    </button>
                </div>
                
                <div class="progress-section">
                    <div class="time-display">
                        <span>{{ formatTime(currentTime) }}</span>
                        <span>{{ formatTime(currentSong?.duration || 0) }}</span>
                    </div>
                    <div class="progress-bar" @click="seekToPosition">
                        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                        <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
                    </div>
                </div>
                
                <div class="volume-section">
                    <span class="volume-icon">🔊</span>
                    <div class="volume-bar" @click="setVolumeFromClick">
                        <div class="volume-fill" :style="{ width: (volume * 100) + '%' }"></div>
                    </div>
                </div>
            </div>
        </TwoCol>
        <PlayList />
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import BubbleBg from '../components/bubble-bg.vue';
import PlayList from '../components/play-list.vue';
import TwoCol from '../components/two-col.vue';
import { type Song, musicStore } from '../store/music-store';
import { formatTime } from '../utils/time';

const currentSong = computed(() => musicStore.currentSong.value);
const isPlaying = computed(() => musicStore.isPlaying.value);
const currentTime = computed(() => musicStore.currentTime.value);
const volume = computed(() => musicStore.volume.value);
const isShuffled = computed(() => musicStore.isShuffled.value);
const repeatMode = computed(() => musicStore.repeatMode.value);

const progressPercent = computed(() => {
    if (!currentSong.value || currentSong.value.duration === 0) return 0;
    return (currentTime.value / currentSong.value.duration) * 100;
});

const seekToPosition = (event: MouseEvent) => {
    if (!currentSong.value) return;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const newTime = percent * currentSong.value.duration;
    musicStore.setCurrentTime(newTime);
};

const setVolumeFromClick = (event: MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    musicStore.setVolume(percent);
};
</script>

<style scoped>
.now-playing {
    padding: var(--spacing-6);
    min-height: 100vh;
    background: var(--bg-primary);
}

.player-container {
    width: 100%;
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
    overflow: hidden;
    margin-bottom: var(--spacing-6);
}

.song-header {
    display: flex;
    gap: var(--spacing-6);
    padding: var(--spacing-8);
    border-radius: var(--border-radius-xl);
    overflow: hidden;
    align-items: end;
    --left-width: 50%;
}

.album-art-wrapper {
    position: relative;
    width: 200px;
    height: 200px;
    flex-shrink: 0;
    z-index: 1;
}

.album-art {
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius-lg);
    object-fit: cover;
    box-shadow: var(--shadow-xl);
}

.vinyl-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    background: #0008;
    border-radius: var(--border-radius-full);
    transform: translate(-50%, -50%);
    transition: transform var(--duration-slow);
    display: flex;
    align-items: center;
    justify-content: center;
}
.vinyl-overlay::after {
    content: '📀';
    font-size: 30px;
    line-height: 30px;
    transform: rotate(0deg);
}
.vinyl-overlay.spinning::after {
    animation: spin 3s linear infinite;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}

.player-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: var(--spacing-2);
    position: relative;
    z-index: 1;
}

.song-type {
    font-size: var(--font-size-sm);
    opacity: 0.9;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: white;
}

.song-title {
    font-size: var(--font-size-4xl);
    font-weight: 800;
    margin: 0;
    color: white;
    line-height: 1.1;
}

.song-artist {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: white;
    margin: 0;
}

a.song-artist {
    opacity: 0.9;
    text-decoration: none;
    cursor: pointer;
    transition: opacity var(--duration-fast);
}

a.song-artist:hover {
    opacity: 1;
    text-decoration: underline;
}

.song-album {
    font-size: var(--font-size-base);
    color: white;
    margin: 0;
}

a.song-album {
    opacity: 0.8;
    text-decoration: none;
    transition: opacity var(--duration-fast);
    cursor: pointer;
}

a.song-album:hover {
    opacity: 1;
    text-decoration: underline;
}

.player-controls {
    padding: var(--spacing-6);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.control-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-4);
    margin-bottom: var(--spacing-6);
}

.control-btn {
    width: 48px;
    height: 48px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    transition: all var(--duration-normal);
}

.control-btn:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.control-btn.active {
    color: var(--music-primary);
    background: var(--bg-secondary);
}

.play-btn {
    width: 64px;
    height: 64px;
    border: none;
    background: var(--music-primary);
    color: white;
    cursor: pointer;
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-2xl);
    transition: all var(--duration-normal);
    box-shadow: var(--shadow-md);
}

.play-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.05);
}

.progress-section {
    margin-bottom: var(--spacing-6);
}

.time-display {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-sm);
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-2);
    font-variant-numeric: tabular-nums;
}

.progress-bar {
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: var(--border-radius-full);
    position: relative;
    cursor: pointer;
}

.progress-fill {
    height: 100%;
    background: var(--music-gradient);
    border-radius: var(--border-radius-full);
    transition: width var(--duration-fast);
}

.progress-thumb {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    background: white;
    border: 2px solid var(--music-primary);
    border-radius: var(--border-radius-full);
    transform: translate(-50%, -50%);
    box-shadow: var(--shadow-sm);
}

.volume-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    justify-content: center;
}

.volume-icon {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
}

.volume-bar {
    width: 100px;
    height: 4px;
    background: var(--bg-secondary);
    border-radius: var(--border-radius-full);
    position: relative;
    cursor: pointer;
}

.volume-fill {
    height: 100%;
    background: var(--music-gradient);
    border-radius: var(--border-radius-full);
    transition: width var(--duration-fast);
}

@media (max-width: 768px) {
    .song-header {
        flex-direction: column;
        text-align: center;
        padding: var(--spacing-6) var(--spacing-4);
        align-items: center;
    }
    
    .album-art-wrapper {
        width: 180px;
        height: 180px;
        margin: 0 auto;
    }
    
    .player-info {
        align-items: center;
    }
    
    .song-title {
        font-size: var(--font-size-3xl);
    }
    
    .song-artist {
        font-size: var(--font-size-lg);
    }
    
    .control-buttons {
        gap: var(--spacing-3);
    }
    
    .control-btn {
        width: 40px;
        height: 40px;
        font-size: var(--font-size-lg);
    }
    
    .play-btn {
        width: 56px;
        height: 56px;
        font-size: var(--font-size-xl);
    }
}
</style>
