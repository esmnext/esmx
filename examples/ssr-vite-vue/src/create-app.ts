import { createSSRApp } from 'vue';
import App from './app.vue';

export function createVueApp() {
    const app = createSSRApp(App);
    return {
        app
    };
}
