<script setup lang="ts">
import { ref } from 'vue';
import HelloWorld from './components/hello-world.vue';

const title = ref<string>('Vue2 SSR Demo');
</script>

<template>
	<div id="app" class="container">
		<div class="logo-container">
			<a href="https://www.esmnext.com" target="_blank" class="logo-link">
				<div class="logo-wrapper esmx">
					<img src="https://www.esmnext.com/logo.svg" class="logo" alt="Esmx logo" />
				</div>
			</a>
			<a href="https://vuejs.org/" target="_blank" class="logo-link">
				<div class="logo-wrapper vue">
					<img src="https://vuejs.org/logo.svg" class="logo" alt="Vue logo" />
				</div>
			</a>
		</div>
		<HelloWorld :msg="title" />
	</div>
</template>

<style>
:root {
	--esmx-primary: #001137;
	--esmx-secondary: #273498;
	--esmx-accent: #0074C2;
	--esmx-light: #00ABE7;
	--esmx-sun-core: #FFA000;
	--esmx-sun-rays: #FFC107;
	--vue-color: #42b883;
	--vue-dark: #33a06f;
	--border-color: rgba(0, 17, 55, 0.12);
	--shadow-color: rgba(0, 17, 55, 0.05);
	--text-primary: #213547;
	--text-secondary: #666;
	--bg-card: #fcfcfc;
	--bg-hover: rgba(255, 250, 240, 0.8);
	--font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

body {
	margin: 0;
	font-family: var(--font-family);
	color: var(--text-primary);
	background-color: white;
	line-height: 1.6;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
</style>

<style scoped>
.container {
	max-width: 1280px;
	margin: 0 auto;
	padding: 2rem;
	text-align: center;
	font-family: var(--font-family);
}

.logo-container {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 3.5rem;
	margin-bottom: 3rem;
}

.logo-link {
	text-decoration: none;
	position: relative;
}

.logo-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 6.5em;
	height: 6.5em;
	border-radius: 12px;
	background-color: var(--bg-card);
	padding: 1em;
	box-shadow: 0 2px 12px var(--shadow-color);
	border: 1px solid var(--border-color);
	transition: all 0.3s ease;
}

.logo-wrapper:hover {
	transform: translateY(-5px);
	box-shadow: 0 5px 15px var(--shadow-color);
}

.logo {
	height: 100%;
	width: auto;
	transition: transform 0.3s ease;
}

.logo-wrapper:hover .logo {
	transform: scale(1.1);
}

.logo-wrapper.esmx:hover {
	background-color: rgba(255, 192, 7, 0.1);
	border-color: var(--esmx-sun-rays);
}

.logo-wrapper.vue:hover {
	background-color: rgba(66, 184, 131, 0.1);
	border-color: var(--vue-color);
}

@media (max-width: 768px) {
	.logo-container {
		gap: 2rem;
	}
	
	.logo-wrapper {
		width: 5em;
		height: 5em;
	}
}
</style>
