<template>
    <div class="view-page">
        <TwoCol class="nav">
            <h1><RouterLink to="/">🎶&ensp;Music Player</RouterLink></h1>
            <div>
                <div class="btns">
                    <button @click="$router.back()" class="back">&lt;</button
                    ><button @click="$router.forward()" class="forward">&gt;</button>
                </div>
                <span>Explore Esmx Router's Music World</span>
                <RouterLink to="/search" class="search-btn" activeClass="active">🔍</RouterLink>
                <ToggleThemeBtn class="toggle-theme-btn"/>
                <button class="info" title="Current Route" @click="showRouteInfo = true">ℹ</button>
            </div>
        </TwoCol>
        <TwoCol>
            <aside>
                <div class="quick-play-section">
                    <h2 class="section-title">Your Favorites</h2>
                    <div class="songs-grid">
                        <div v-for="song in featuredSongs" :key="song.id" class="song-card">
                            <img :src="song.cover" :alt="song.title" class="song-cover" />
                            <div class="song-info">
                                <div class="song-title">{{ song.title }}</div>
                                <div class="song-artist">{{ song.artist }}</div>
                                <div class="song-album">{{ song.album }}</div>
                            </div>
                            <div class="song-actions">
                                <button @click="playSong(song)" class="play-btn">
                                    ▶ Play
                                </button>
                                <RouterLink
                                    :to="`/album/${song.id}`"
                                    type="pushLayer"
                                    class="detail-btn"
                                    :layerOptions="{
                                        shouldClose,
                                        push: true,
                                        autoPush: true,
                                        routerOptions: {
                                            rootStyle: {
                                                position: 'absolute',
                                            },
                                        }
                                    }"
                                >
                                    Details
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <router-view class="main" />
        </TwoCol>
        
        <!-- Route Info Modal -->
        <RouteInfoModal :show="showRouteInfo" @close="showRouteInfo = false" />
    </div>
</template>

<script lang="ts" setup>
import { RouteVerifyHook } from '@esmx/router';
import { RouterLink, useRouter } from '@esmx/router-vue';
import { type Song, mockSongs } from 'ssr-share/src/store';
import { computed, ref } from 'vue';
import { RouteInfoModal, ToggleThemeBtn } from '../components';
import { TwoCol } from '../layout';
import { useMusicStore } from '../store/music-store';

const musicStore = useMusicStore();

const $router = useRouter();

const shouldClose: RouteVerifyHook = (to, from, router) => {
    return to.fullPath === from?.fullPath;
};

const showRouteInfo = ref(false);

// 选择精选歌曲用于侧边栏显示
const featuredSongs = computed(() => {
    // 随机选择8首歌曲用于侧边栏显示
    // const shuffled = [...mockSongs].sort(() => Math.random() - 0.5);
    const shuffled = [...mockSongs];
    return shuffled.slice(0, 8);
});

const playSong = (song: Song) => {
    musicStore.playSong(song, mockSongs);
};
</script>

<style scoped>
.view-page {
    min-height: 100vh;
    min-height: -webkit-fill-available;
}
.view-page > * {
    padding: var(--spacing-4);
}

.nav {
    margin-bottom: var(--spacing-4);
    background: var(--music-gradient);
    align-items: center;
    justify-content: flex-start;
    text-align: center;
    color: white;
    overflow: hidden;
    position: relative;
}

.nav > * {
    z-index: 1;
}

.nav::before, .nav::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('./images/sine-wave-notes.svg');
    background-size: auto 100%;
    background-repeat: repeat-x;
    background-position: 0 20%;
    animation: svg-wave-flow 400s linear infinite;
    pointer-events: none;
    opacity: .05;
    z-index: 0;
}
.nav::after {
    background-size: auto 80%;
    background-position: 0 70%;
    animation: svg-wave-flow 500s linear infinite reverse;
    opacity: .1;
}

h1 {
    font-family: var(--font-family-display);
    font-size: var(--font-size-4xl);
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    display: inline-block;
    text-align: end;
    padding-right: var(--spacing-6);
}

.btns {
    display: inline-flex;
    margin-left: var(--spacing-4);
}
button {
    border: 1px solid #fff5;
    border-radius: var(--border-radius-full);
    padding: 0 var(--spacing-4);
    font-weight: bold;
    background: #fff3;
    height: 44px;
}
button:hover {
    background: #fff4;
    border-color: #fff8;
}

.back {
    border-right: 0;
    border-radius: var(--border-radius-full) 0 0 var(--border-radius-full);
}
.forward {
    border-radius: 0 var(--border-radius-full) var(--border-radius-full) 0;
}
.back:hover + .forward {
    border-left-color: #fff8;
}
.toggle-theme-btn {
    margin-left: auto;
}
.nav > *:last-child {
    margin-right: var(--spacing-6);
}

.search-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--border-radius-full);
    background: #fff3;
    border: 1px solid #fff5;
    font-size: var(--font-size-lg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--duration-fast);
}
.search-btn:hover {
    background: #fff4;
    border-color: #fff8;
}
.search-btn.active {
    display: none;
}

.nav > div {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
}

span {
    font-size: var(--font-size-lg);
    font-weight: 400;
    opacity: .9;
    margin: 0;
    max-width: 600px;
}

@keyframes svg-wave-flow {
    to {
        background-position-x: 100%;
    }
}

/* 快速播放区域样式 */
aside {
    width: calc(38.2% - var(--spacing-4) * 2);
}

.main {
    flex: 1;
}

.quick-play-section {
    padding: var(--spacing-6);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.section-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-6);
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    flex-direction: row-reverse;
}

.section-title::before {
    content: '';
    width: 4px;
    height: 24px;
    background: var(--music-gradient);
    border-radius: var(--border-radius-full);
}

.songs-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
    max-width: 400px;
}

.song-card {
    background: var(--card-color);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-light);
    padding: var(--spacing-4);
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    transition: all var(--duration-normal);
    cursor: pointer;
}

.song-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--music-primary);
}

.song-cover {
    width: 60px;
    height: 60px;
    border-radius: var(--border-radius);
    object-fit: cover;
    flex-shrink: 0;
}

.song-info {
    flex: 1;
    min-width: 0;
}

.song-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-artist {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-1);
}

.song-album {
    color: var(--text-tertiary);
    font-size: var(--font-size-xs);
}

.song-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
}

.play-btn {
    background: var(--music-primary);
    color: white;
    border: none;
    padding: var(--spacing-2) var(--spacing-3);
    border-radius: var(--border-radius);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--duration-fast);
    white-space: nowrap;
}

.play-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.05);
}

.detail-btn {
    background: transparent;
    color: var(--music-primary);
    border: 1px solid var(--music-primary);
    padding: var(--spacing-1) var(--spacing-3);
    border-radius: var(--border-radius);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all var(--duration-fast);
    white-space: nowrap;
    text-align: center;
    text-decoration: none;
}

.detail-btn:hover {
    background: var(--music-primary);
    color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
    h1 {
        font-size: var(--font-size-3xl);
    }
    
    .quick-play-section {
        padding: 0 var(--spacing-4) var(--spacing-4);
    }
    
    .songs-grid {
        grid-template-columns: 1fr;
    }
    
    .song-card {
        padding: var(--spacing-3);
    }
    
    .song-actions {
        flex-direction: row;
    }
}
</style>
