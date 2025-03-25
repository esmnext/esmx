<template>
  <nav class="app-nav">
    <div class="container">
      <div class="nav-content">
        <div class="nav-brand">
          <img src="https://www.esmnext.com/logo.svg" alt="Gez Logo" class="nav-logo" />
          <span class="nav-title">Gez</span>
        </div>
        <div class="nav-links">
          <a href="https://www.esmnext.com/" class="nav-link" :class="{ active: current === 'home' }">首页</a>
          <a href="https://www.esmnext.com/ssr-vue2-remote/" class="nav-link" :class="{ active: current === 'remote' }">Remote</a>
          <a href="https://www.esmnext.com/ssr-vue2-host/" class="nav-link" :class="{ active: current === 'host' }">Host</a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
    current: 'home' | 'remote' | 'host';
}>();
</script>

<style scoped>
.app-nav {
  height: var(--nav-height);
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 960px) {
  .container {
    max-width: 100%;
    padding: 0 1rem;
  }
}

.nav-content {
  height: var(--nav-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.nav-logo {
  height: 1.5rem;
  width: auto;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.nav-links {
  display: flex;
  gap: var(--spacing-4);
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) ease;
}

.nav-link:hover {
  color: var(--color-primary-dark);
  background-color: var(--color-bg-secondary);
}

.nav-link.active {
  color: var(--color-primary-dark);
  background-color: var(--color-bg-secondary);
  font-weight: 600;
}
</style>
