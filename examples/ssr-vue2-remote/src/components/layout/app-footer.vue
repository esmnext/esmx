<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-brand">
            <img src="https://www.esmnext.com/logo.svg" alt="Esmx Logo" class="footer-logo" />
            <span class="footer-title">Esmx</span>
          </div>
          <div class="source-links">
            <a href="https://github.com/js-esm/esmx/tree/master/examples/ssr-vue2-host" class="source-link" target="_blank" rel="noopener">
              <span class="source-label">Host Source</span>
              <span class="source-path">/examples/ssr-vue2-host</span>
            </a>
            <a href="https://github.com/js-esm/esmx/tree/master/examples/ssr-vue2-remote" class="source-link" target="_blank" rel="noopener">
              <span class="source-label">Remote Source</span>
              <span class="source-path">/examples/ssr-vue2-remote</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--color-bg-primary);
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-6) 0;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-info {
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
}

.footer-logo {
  height: 2rem;
  width: auto;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.source-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.source-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.2s ease-in-out;
}

.source-link:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-hover);
}

.source-label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.source-path {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .source-link {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }
}
</style>
