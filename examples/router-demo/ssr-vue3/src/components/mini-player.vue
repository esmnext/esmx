<template>
    <div class="mini-player" v-if="currentSong">
        <TwoCol class="two-col">
            <div class="left">
                <RouterLink class="song-info" type="pushLayer" :to="{
                    path: '/player',
                    layer: {
                        push: true,
                        autoPush: true,
                        shouldClose: (to, from) => from?.layer !== null && to.fullPath === from?.fullPath,
                        routerOptions: {
                            rootStyle: {
                                position: 'absolute',
                            },
                            context: {
                                layerType: 'drawer',
                                layerSlideDir: 'up',
                            }
                        }
                    }
                }">
                    <img :src="currentSong.cover" :alt="currentSong.title" class="song-cover" />
                    <div class="song-details">
                        <div class="song-title">{{ currentSong.title }}</div>
                        <div class="song-artist">{{ currentSong.artist }}</div>
                    </div>
                </RouterLink>
                
                <div class="player-controls">
                    <button @click="musicStore.previousSong()" class="control-btn">
                        ⏮
                    </button>
                    <button @click="musicStore.togglePlay()" class="control-btn play-btn">
                        {{ isPlaying ? '⏸' : '▶' }}
                    </button>
                    <button @click="musicStore.nextSong()" class="control-btn">
                        ⏭
                    </button>
                </div>
            </div>
            <div class="right">
                <div class="player-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                    </div>
                    <div class="time-info">
                        <span>{{ formatTime(currentTime) }}</span>
                        <span>{{ formatTime(currentSong.duration) }}</span>
                    </div>
                </div>
                
                <div class="player-actions">
                    <button @click="togglePlaylist" class="expand-btn">
                        ≡
                    </button>
                    <button @click="musicStore.setVolume(volume === 0 ? 0.8 : 0)" class="volume-btn">
                        {{ volume === 0 ? '🔇' : '🔊' }}
                    </button>
                </div>
            </div>
        </TwoCol>
        
        <!-- 播放列表弹层 -->
        <div v-if="showPlaylist" class="playlist-overlay" @click="closePlaylist">
            <div class="playlist-popup" @click.stop>
                <!-- <div class="playlist-content"> -->
                    <PlayList @track-selected="closePlaylist">
                        <template #header>
                            <button @click="closePlaylist" class="close-btn">✕</button>
                        </template>
                    </PlayList>
                <!-- </div> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink, useRouter } from '@esmx/router-vue';
import {
    type MusicStore,
    useMusicStore
} from 'ssr-vue-base/src/store/music-store';
import { formatTime } from 'ssr-vue-base/src/utils/time';
import { computed, ref, watch } from 'vue';
import TwoCol from '../layout/two-col.vue';
import PlayList from './play-list.vue';

const $router = useRouter();
const musicStore =
    ($router.parsedOptions.context.musicStore as MusicStore) ||
    useMusicStore(ref);

const currentSong = computed(() => musicStore.currentSong.value);
const isPlaying = computed(() => musicStore.isPlaying.value);
const currentTime = computed(() => musicStore.currentTime.value);
const volume = computed(() => musicStore.volume.value);

const showPlaylist = ref(false);

const togglePlaylist = () => {
    showPlaylist.value = !showPlaylist.value;
};

const closePlaylist = () => {
    showPlaylist.value = false;
};

const progressPercent = computed(() => {
    if (!currentSong.value || currentSong.value.duration === 0) return 0;
    return (currentTime.value / currentSong.value.duration) * 100;
});

// 模拟播放进度更新
let progressTimer: number | null = null;

watch(isPlaying, (playing) => {
    if (playing) {
        progressTimer = window.setInterval(() => {
            if (
                currentSong.value &&
                currentTime.value < currentSong.value.duration
            ) {
                musicStore.setCurrentTime(currentTime.value + 1);
            } else if (currentSong.value) {
                // 歌曲结束，播放下一首
                musicStore.nextSong();
            }
        }, 1000);
    } else {
        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }
    }
});
</script>

<style scoped>
.mini-player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--player-height);
    background: var(--card-color);
    border-top: 1px solid var(--border-light);
    z-index: var(--z-fixed);
    backdrop-filter: blur(8px);
}

.two-col {
    align-items: center;
    padding: 0 var(--spacing-4);
}
.left, .right {
    display: flex;
    align-items: center;
    padding: var(--spacing-3) var(--spacing-6);
    height: 100%;
    gap: var(--spacing-4);
}
.left {
    justify-content: flex-end;
}

.song-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-7);
    flex: 0 0 auto;
    min-width: 200px;
    flex-direction: row-reverse;
}

.song-cover {
    width: 50px;
    height: 50px;
    border-radius: var(--border-radius);
    object-fit: cover;
}

.song-details {
    overflow: hidden;
    text-align: end;
}

.song-title {
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-sm);
}

.song-artist {
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--font-size-xs);
}

.player-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    flex: 0 0 auto;
}

.control-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
    transition: all var(--duration-fast);
}

.control-btn:hover {
    background: var(--bg-secondary);
}

.play-btn {
    background: var(--music-primary);
    color: white;
}

.play-btn:hover {
    background: var(--primary-dark);
}

.player-progress {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
    min-width: 0;
}

.progress-bar {
    height: 4px;
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

.time-info {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
}

.player-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    flex: 0 0 auto;
}

.expand-btn,
.volume-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-base);
    transition: all var(--duration-fast);
}

.expand-btn:hover,
.volume-btn:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.playlist-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #0002;
    z-index: var(--z-modal);
    display: flex;
    align-items: flex-end;
    backdrop-filter: blur(4px);
}

.playlist-popup {
    width: 100%;
    max-width: 38.2vw;
    height: 61.8vh;
    margin-bottom: var(--player-height);
    margin-left: calc(38.2% + var(--spacing-1));
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

:deep(.tracks-list) {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-bottom: 0;
    box-shadow: var(--shadow-xl);
}

:deep(.song-list) {
    overflow-y: auto;
    height: calc(100% - 32px - var(--spacing-4) * 2 - var(--spacing-6) - 1px);
    padding-bottom: var(--spacing-6);
}

:deep(.playlist-header) {
    border-bottom: 1px solid var(--border-light);
    padding-bottom: var(--spacing-4);
    margin-bottom: var(--spacing-4);
}

.close-btn {
    width: 32px;
    height: 32px;
    line-height: 32px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
    transition: all var(--duration-fast);
}

.close-btn:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
}

@media (max-width: 768px) {
    .playlist-popup {
        max-height: 70vh;
        border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
    }
    
    .song-info {
        min-width: 150px;
    }
    
    .song-cover {
        width: 40px;
        height: 40px;
    }
    
    .time-info {
        display: none;
    }
}
</style>
