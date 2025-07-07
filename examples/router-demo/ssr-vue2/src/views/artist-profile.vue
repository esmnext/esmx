<template>
    <div class="artist-profile">
        <BubbleBg class="artist-header">
            <img :src="artist?.avatar" :alt="artist?.name" class="artist-avatar" />
            <div class="artist-info">
                <div class="artist-type">Artist</div>
                <h1 class="artist-name">{{ artist?.name }}</h1>
                <p class="artist-bio">{{ artist?.bio }}</p>
                <div class="artist-stats">
                    <span>{{ formatFollowers(artist?.followers || 0) }} followers</span>
                </div>
                <div class="artist-actions">
                    <button class="follow-btn">+ Follow</button>
                    <button class="shuffle-btn">🔀 Shuffle Play</button>
                </div>
            </div>
        </BubbleBg>
        <TracksList
            v-if="popularSongs.length > 0"
            :tracks="popularSongs"
            @playTrack="playSong"
        >
            <h2 class="section-title">Popular Songs</h2>
        </TracksList>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from '@esmx/router-vue';
import { type Song, mockArtists, mockSongs } from 'ssr-share/src/store';
import { computed } from 'vue';
import BubbleBg from '../components/bubble-bg.vue';
import TracksList from '../components/tracks-list.vue';
import { useMusicStore } from '../store/music-store';

const musicStore = useMusicStore();

const $route = useRoute();
const artistId = computed(() => Number($route.params.id));
const artist = computed(() => mockArtists.find((a) => a.id === artistId.value));

// 模拟该艺术家的热门歌曲
const popularSongs = computed(() => {
    if (artist.value) {
        return mockSongs.filter((song) => song.artist === artist.value?.name);
    }
    return [];
});

const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
};

const playSong = (song: Song) => {
    musicStore.playSong(song, popularSongs.value);
};
</script>

<style scoped>
.artist-profile {
    padding: var(--spacing-6);
}

.artist-header {
    display: flex;
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-8);
    padding: var(--spacing-8);
    border-radius: var(--border-radius-xl);
    overflow: hidden;
}

.artist-avatar {
    width: 200px;
    height: 200px;
    border-radius: var(--border-radius-full);
    object-fit: cover;
    box-shadow: var(--shadow-xl);
    position: relative;
    z-index: 1;
}

.artist-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: var(--spacing-2);
    position: relative;
    z-index: 1;
}

.artist-type {
    font-size: var(--font-size-sm);
    opacity: 0.9;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.artist-name {
    font-size: var(--font-size-4xl);
    font-weight: 800;
    margin: 0;
    line-height: 1.1;
}

.artist-bio {
    font-size: var(--font-size-base);
    opacity: 0.9;
    margin: 0;
    line-height: 1.6;
}

.artist-stats {
    font-size: var(--font-size-base);
    font-weight: 500;
    margin: var(--spacing-2) 0;
}

.artist-actions {
    display: flex;
    gap: var(--spacing-3);
    margin-top: var(--spacing-4);
}

.follow-btn {
    background: white;
    color: var(--music-primary);
    border: none;
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-normal);
}

.follow-btn:hover {
    background: var(--bg-secondary);
    transform: scale(1.05);
}

.shuffle-btn {
    background: #fff3;
    color: white;
    border: 1px solid #fff5;
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--duration-normal);
    backdrop-filter: blur(8px);
}

.shuffle-btn:hover {
    background: #fff4;
    border-color: #fff8;
}

.section-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-6);
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-6);
    padding-bottom: 0;
}

.section-title::before {
    content: '';
    width: 4px;
    height: 24px;
    background: var(--music-gradient);
    border-radius: var(--border-radius-full);
}

@media (max-width: 768px) {
    .artist-header {
        flex-direction: column;
        text-align: center;
        padding: var(--spacing-6) var(--spacing-4);
    }
    
    .artist-avatar {
        width: 150px;
        height: 150px;
        margin: 0 auto;
    }
    
    .artist-name {
        font-size: var(--font-size-3xl);
    }
}
</style>
