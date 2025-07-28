import { createApp } from 'vue';
import App from './app.vue';

export function createVueApp() {
    const app = createApp(App);
    return {
        app
    };
}
