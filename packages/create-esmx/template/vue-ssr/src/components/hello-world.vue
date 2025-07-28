<script setup lang="ts">
import { ref } from 'vue';

defineProps({
    msg: {
        type: String
    }
});
const count = ref<number>(0);
</script>

<template>
	<div>
		<h1>{{ msg }}</h1>

		<div class="card">
			<button type="button" @click="count++">Counter: {{ count }}</button>
			<p>
				Edit
				<code>components/HelloWorld.vue</code> to test HMR
			</p>
		</div>

		<p>Experience Vue3 with server-side rendering powered by Esmx framework</p>
	</div>
</template>

<style scoped>
.card {
	padding: 2em;
	border-radius: 12px;
	margin: 2.5em 0;
	background-color: var(--bg-card);
}

button {
	border-radius: 8px;
	border: 1px solid transparent;
	padding: 0.6em 1.2em;
	font-size: 1em;
	font-weight: 600;
	font-family: inherit;
	background-color: var(--esmx-sun-rays);
	color: #fff;
	cursor: pointer;
	margin-bottom: 1em;
	transition: all 0.25s ease;
}

button:hover {
	background-color: var(--esmx-sun-core);
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(255, 160, 0, 0.25);
}

h1 {
	font-size: 3.2em;
	line-height: 1.1;
	margin-bottom: 1em;
	color: var(--esmx-primary);
	font-weight: 700;
}

p {
	line-height: 1.6;
	margin: 0.5em 0;
	color: var(--text-primary);
}

code {
	background-color: rgba(0, 116, 194, 0.1);
	padding: 0.2em 0.4em;
	border-radius: 4px;
	font-family: monospace;
	font-size: 0.9em;
}
</style>
