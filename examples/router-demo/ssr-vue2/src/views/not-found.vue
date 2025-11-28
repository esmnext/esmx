<template>
    <div class="not-found">
        <div class="error-content">
            <div class="error-icon">♫</div>
            <h1 class="error-title">Page Not Found</h1>
            <p class="error-message">Sorry, the page you are looking for does not exist</p>
            <div class="error-actions">
                <RouterLink to="/" class="home-btn">Go Home</RouterLink>
                <button @click="$router.back()" class="back-btn">Go Back</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RouterLink, useRouter } from '@esmx/router-vue';

const $router = useRouter();
</script>

<style scoped>
.not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--spacing-6);
    background: linear-gradient(135deg, var(--music-primary) 0%, var(--music-secondary) 100%);
}

.error-content {
    text-align: center;
    background: var(--bg-primary);
    backdrop-filter: blur(20px);
    border-radius: var(--border-radius-2xl);
    padding: var(--spacing-12) var(--spacing-8);
    box-shadow: var(--shadow-xl);
    max-width: 500px;
    width: 100%;
}

.error-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-6);
    opacity: 0.8;
}

.error-title {
    font-size: var(--font-size-3xl);
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-4);
}

.error-message {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-8);
    line-height: 1.6;
}

.error-actions {
    display: flex;
    gap: var(--spacing-4);
    justify-content: center;
    flex-wrap: wrap;
}

.home-btn,
.back-btn {
    padding: var(--spacing-3) var(--spacing-6);
    border-radius: var(--border-radius-full);
    font-size: var(--font-size-base);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all var(--duration-normal);
    border: none;
}

.home-btn {
    background: var(--music-primary);
    color: white;
}

.home-btn:hover {
    background: var(--primary-dark);
    transform: scale(1.05);
}

.back-btn {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-medium);
}

.back-btn:hover {
    background: var(--bg-secondary);
    border-color: var(--music-primary);
}

@media (max-width: 768px) {
    .error-content {
        padding: var(--spacing-8) var(--spacing-6);
    }
    
    .error-title {
        font-size: var(--font-size-2xl);
    }
    
    .error-message {
        font-size: var(--font-size-base);
    }
    
    .error-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .home-btn,
    .back-btn {
        width: 100%;
        max-width: 200px;
    }
}
</style>
