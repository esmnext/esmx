<script setup lang="ts">
import { ref } from 'vue';

const count = ref<number>(0);

const sourceSnippet = `<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
${'</scr' + 'ipt>'}

<template>
  <p>Count: {{ count }}</p>
  <button @click="count++">+</button>
  <button @click="count--">−</button>
</template>`;
</script>

<template>
    <h1 class="demo__title">Vue 3 SSR</h1>
    <p class="demo__message">
        Server-rendered by Esmx on Rsbuild, then hydrated by Vue 3 in
        place. The counter below works after hydration.
    </p>
    <div class="demo__code"><pre>{{ sourceSnippet }}</pre></div>
    <div class="demo__stat">
        <div class="demo__stat-label">Count</div>
        <div class="demo__stat-value">{{ count }}</div>
    </div>
    <div class="demo__actions">
        <button type="button" class="demo__btn demo__btn--primary" @click="count++">+</button>
        <button type="button" class="demo__btn" @click="count--">−</button>
    </div>
    <div class="demo__tags">
        <span class="demo__badge demo__badge--vue">
            <span class="demo__dot demo__dot--vue" aria-hidden="true"></span>
            Vue 3
        </span>
        <span class="demo__badge">Rsbuild</span>
        <span class="demo__badge">SSR</span>
    </div>
</template>
