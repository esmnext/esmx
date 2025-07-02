<template>
    <div class="search-music">
        <div class="search-header">
            <h1 class="search-title">Search Music</h1>
            <div class="search-box">
                <input 
                    v-model="searchQuery" 
                    @input="performSearch"
                    placeholder="Search songs, artists, albums..."
                    class="search-input"
                />
                <button class="search-btn">🔍</button>
            </div>
        </div>
        
        <div class="search-results" v-if="searchQuery">
            <h2 class="results-title">Search Results: {{ searchQuery }}</h2>
            
            <div class="results-section" v-if="filteredSongs.length > 0">
                <h3 class="section-title">Songs</h3>
                <div class="songs-list">
                    <div v-for="song in filteredSongs" :key="song.id" 
                         class="song-item" 
                         @click="playSong(song)">
                        <img :src="song.cover" :alt="song.title" class="song-cover" />
                        <div class="song-info">
                            <div class="song-title">{{ song.title }}</div>
                            <div class="song-artist">{{ song.artist }} · {{ song.album }}</div>
                        </div>
                        <div class="song-duration">{{ formatTime(song.duration) }}</div>
                        <button class="play-btn">▶</button>
                    </div>
                </div>
            </div>
            
            <div class="results-section" v-if="filteredArtists.length > 0">
                <h3 class="section-title">Artists</h3>
                <div class="artists-list">
                    <div v-for="artist in filteredArtists" :key="artist.id" 
                         class="artist-item">
                        <img :src="artist.avatar" :alt="artist.name" class="artist-avatar" />
                        <div class="artist-info">
                            <div class="artist-name">{{ artist.name }}</div>
                            <div class="artist-followers">{{ formatFollowers(artist.followers) }} followers</div>
                        </div>
                        <RouterLink :to="`/artist/${artist.id}`" class="artist-link">
                            View Profile
                        </RouterLink>
                    </div>
                </div>
            </div>
            
            <div class="results-section" v-if="filteredPlaylists.length > 0">
                <h3 class="section-title">Playlists</h3>
                <div class="playlists-list">
                    <div v-for="playlist in filteredPlaylists" :key="playlist.id" 
                         class="playlist-item">
                        <img :src="playlist.cover" :alt="playlist.title" class="playlist-cover" />
                        <div class="playlist-info">
                            <div class="playlist-title">{{ playlist.title }}</div>
                            <div class="playlist-meta">{{ playlist.tracks.length }} songs · {{ playlist.creator }}</div>
                        </div>
                        <RouterLink :to="`/playlist/${playlist.id}`" class="playlist-link">
                            View Details
                        </RouterLink>
                    </div>
                </div>
            </div>
            
            <div v-if="filteredSongs.length === 0 && filteredArtists.length === 0 && filteredPlaylists.length === 0" 
                 class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try searching with different keywords</p>
            </div>
        </div>
        
        <div class="search-suggestions" v-else>
            <h2 class="suggestions-title">Popular Searches</h2>
            <div class="suggestions-list">
                <button v-for="suggestion in suggestions" 
                        :key="suggestion" 
                        @click="searchQuery = suggestion; performSearch()"
                        class="suggestion-tag">
                    {{ suggestion }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from '@esmx/router-vue';
import { RouterLink } from '@esmx/router-vue';
import { computed, ref } from 'vue';
import {
    type Song,
    mockArtists,
    mockPlaylists,
    mockSongs,
    musicStore
} from '../store/music-store';
import { formatTime } from '../utils/time';

const route = useRoute();
const searchQuery = ref((route.params.query as string) || '');

const suggestions = [
    'Jay Chou',
    'Joker Xue',
    'Chinese Classics',
    'Nocturne',
    'Blue and White Porcelain',
    'Pop',
    'Folk'
];

const filteredSongs = computed(() => {
    if (!searchQuery.value) return [];
    const query = searchQuery.value.toLowerCase();
    return mockSongs.filter(
        (song) =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            song.album.toLowerCase().includes(query)
    );
});

const filteredArtists = computed(() => {
    if (!searchQuery.value) return [];
    const query = searchQuery.value.toLowerCase();
    return mockArtists.filter(
        (artist) =>
            artist.name.toLowerCase().includes(query) ||
            artist.bio.toLowerCase().includes(query)
    );
});

const filteredPlaylists = computed(() => {
    if (!searchQuery.value) return [];
    const query = searchQuery.value.toLowerCase();
    return mockPlaylists.filter(
        (playlist) =>
            playlist.title.toLowerCase().includes(query) ||
            playlist.description.toLowerCase().includes(query) ||
            playlist.creator.toLowerCase().includes(query)
    );
});

const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
};

const performSearch = () => {
    // 这里可以添加搜索历史记录等功能
};

const playSong = (song: Song) => {
    musicStore.playSong(song, filteredSongs.value);
};
</script>

<style scoped>
.search-music {
    padding: var(--spacing-6);
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
}

.search-header {
    margin-bottom: var(--spacing-8);
}

.search-title {
    font-size: var(--font-size-3xl);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-6);
    text-align: center;
}

.search-box {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    background: var(--card-color);
    border: 2px solid var(--border-light);
    border-radius: var(--border-radius-full);
    padding: var(--spacing-2);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-normal);
}

.search-box:focus-within {
    border-color: var(--music-primary);
    box-shadow: var(--shadow-md);
}

.search-input {
    flex: 1;
    border: none;
    outline: none;
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-base);
    background: transparent;
    color: var(--text-primary);
}

.search-input::placeholder {
    color: var(--text-tertiary);
}

.search-btn {
    width: 48px;
    height: 48px;
    border: none;
    background: var(--music-primary);
    color: white;
    border-radius: var(--border-radius-full);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
    transition: all var(--duration-normal);
}

.search-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.05);
}

.search-results {
    margin-bottom: var(--spacing-8);
}

.results-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-6);
}

.results-section {
    margin-bottom: var(--spacing-8);
}

.section-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-4);
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
}

.section-title::before {
    content: '';
    width: 3px;
    height: 20px;
    background: var(--music-gradient);
    border-radius: var(--border-radius-full);
}

.songs-list,
.artists-list,
.playlists-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
}

.song-item,
.artist-item,
.playlist-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
    padding: var(--spacing-4);
    background: var(--card-color);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-lg);
    cursor: pointer;
    transition: all var(--duration-normal);
}

.song-item:hover,
.artist-item:hover,
.playlist-item:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--music-primary);
}

.song-cover,
.artist-avatar,
.playlist-cover {
    width: 60px;
    height: 60px;
    border-radius: var(--border-radius);
    object-fit: cover;
}

.artist-avatar {
    border-radius: var(--border-radius-full);
}

.song-info,
.artist-info,
.playlist-info {
    flex: 1;
    min-width: 0;
}

.song-title,
.artist-name,
.playlist-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-artist,
.artist-followers,
.playlist-meta {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-duration {
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
    font-size: var(--font-size-sm);
    margin-right: var(--spacing-2);
}

.play-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: var(--music-primary);
    color: white;
    border-radius: var(--border-radius-full);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    transition: all var(--duration-normal);
}

.play-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.1);
}

.artist-link,
.playlist-link {
    color: var(--music-primary);
    text-decoration: none;
    font-size: var(--font-size-sm);
    font-weight: 500;
    padding: var(--spacing-2) var(--spacing-4);
    border: 1px solid var(--music-primary);
    border-radius: var(--border-radius);
    transition: all var(--duration-normal);
    white-space: nowrap;
}

.artist-link:hover,
.playlist-link:hover {
    background: var(--music-primary);
    color: white;
}

.no-results {
    text-align: center;
    padding: var(--spacing-12) var(--spacing-6);
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
}

.no-results-icon {
    font-size: var(--font-size-4xl);
    opacity: 0.5;
    margin-bottom: var(--spacing-4);
}

.no-results h3 {
    font-size: var(--font-size-xl);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-2);
}

.no-results p {
    color: var(--text-secondary);
    margin: 0;
}

.search-suggestions {
    text-align: center;
}

.suggestions-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-6);
}

.suggestions-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-3);
    justify-content: center;
}

.suggestion-tag {
    background: var(--card-color);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--border-radius-full);
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: all var(--duration-normal);
}

.suggestion-tag:hover {
    background: var(--music-primary);
    color: white;
    border-color: var(--music-primary);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .search-music {
        padding: var(--spacing-4);
    }
    
    .search-title {
        font-size: var(--font-size-2xl);
    }
    
    .song-item,
    .artist-item,
    .playlist-item {
        padding: var(--spacing-3);
        gap: var(--spacing-3);
    }
    
    .song-cover,
    .artist-avatar,
    .playlist-cover {
        width: 50px;
        height: 50px;
    }
    
    .song-duration {
        display: none;
    }
    
    .suggestions-list {
        gap: var(--spacing-2);
    }
}
</style>
