<template>
    <div class="home-container">
        <!-- 艺术家区域 -->
        <div class="artists-section">
            <h2 class="section-title">Popular Artists</h2>
            <div class="artists-grid">
                <RouterLink v-for="artist in mockArtists.slice(0, 5)" :key="artist.id" :to="`/artist/${artist.id}`" class="artist-card">
                    <img :src="artist.avatar" :alt="artist.name" class="artist-avatar" />
                    <div class="artist-info">
                        <div class="artist-name">{{ artist.name }}</div>
                        <div class="artist-followers">{{ formatFollowers(artist.followers) }} followers</div>
                        <div class="artist-bio">{{ artist.bio }}</div>
                    </div>
                    <div class="artist-link-text">
                        View Profile →
                    </div>
                </RouterLink>
            </div>
        </div>
        <!-- 播放列表区域 -->
        <div class="playlists-section">
            <h2 class="section-title">Featured Playlists</h2>
            <div class="playlists-grid">
                <RouterLink v-for="playlist in mockPlaylists" :key="playlist.id" :to="`/playlist/${playlist.id}`" class="playlist-card">
                    <img :src="playlist.cover" :alt="playlist.title" class="playlist-cover" />
                    <div class="playlist-info">
                        <div class="playlist-title">{{ playlist.title }}</div>
                        <div class="playlist-desc">{{ playlist.description }}</div>
                        <div class="playlist-meta">{{ playlist.tracks.length }} songs · {{ playlist.creator }}</div>
                    </div>
                    <div class="playlist-actions">
                        <button @click.prevent="playPlaylist(playlist)" class="play-btn">
                            ▶ Play
                        </button>
                        <div class="detail-link-text">
                            View Details →
                        </div>
                    </div>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink, useRouter } from '@esmx/router-vue';
import { type Playlist, mockArtists, mockPlaylists } from 'ssr-share/src/store';
import { useMusicStore } from '../store/music-store';

const musicStore = useMusicStore();

const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
        musicStore.playSong(playlist.tracks[0], playlist.tracks);
    }
};

const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
};
</script>

<style scoped>
.home-container {
    padding: var(--spacing-6);
}

.playlists-section {
    margin-top: var(--spacing-8);
}

/* 章节标题 */
.section-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-6);
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
}

.section-title::before {
    content: '';
    width: 4px;
    height: 24px;
    background: var(--music-gradient);
    border-radius: var(--border-radius-full);
}

/* 播放列表网格 */
.playlists-grid {
    display: flex;
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-8);
    flex-wrap: wrap;
    max-width: 100%;
}

.playlist-card {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
    overflow: hidden;
    transition: all var(--duration-normal);
    cursor: pointer;
    width: 450px;
    text-decoration: none;
    color: inherit;
    display: block;
}

.playlist-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
    text-decoration: none;
    color: inherit;
    border-color: var(--music-primary);
}

.playlist-cover {
    width: 100%;
    height: 160px;
    object-fit: cover;
}

.playlist-info {
    padding: var(--spacing-4);
}

.playlist-title {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-2);
    font-size: var(--font-size-lg);
}

.playlist-desc {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-2);
    line-height: 1.5;
}

.playlist-meta {
    color: var(--text-tertiary);
    font-size: var(--font-size-xs);
    margin-bottom: var(--spacing-4);
}

.playlist-actions {
    padding: 0 var(--spacing-4) var(--spacing-4);
    display: flex;
    gap: var(--spacing-3);
    align-items: center;
}

.playlist-actions .play-btn {
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

.playlist-actions .play-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.05);
}

.detail-link-text {
    color: var(--music-primary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: color var(--duration-fast);
}

.playlist-card:hover .detail-link-text {
    color: var(--primary-dark);
}

/* 艺术家网格 */
.artists-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-6);
}

.artist-card {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
    padding: var(--spacing-6);
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
    transition: all var(--duration-normal);
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    width: 450px;
}

.artist-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    text-decoration: none;
    color: inherit;
    border-color: var(--music-primary);
}

.artist-avatar {
    width: 80px;
    height: 80px;
    border-radius: var(--border-radius-full);
    object-fit: cover;
    flex-shrink: 0;
}

.artist-info {
    flex: 1;
}

.artist-name {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-1);
    font-size: var(--font-size-lg);
}

.artist-followers {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-2);
}

.artist-bio {
    color: var(--text-tertiary);
    font-size: var(--font-size-sm);
    line-height: 1.4;
}

.artist-link-text {
    color: var(--music-primary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    white-space: nowrap;
    transition: color var(--duration-fast);
}

.artist-card:hover .artist-link-text {
    color: var(--primary-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .home-container {
        padding: var(--spacing-4);
    }
    
    .playlists-grid,
    .artists-grid {
        grid-template-columns: 1fr;
    }
    
    .artist-card {
        flex-direction: column;
        text-align: center;
    }
    
    .artist-avatar {
        width: 100px;
        height: 100px;
    }
}
</style>
