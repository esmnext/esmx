import Vue, { defineAsyncComponent } from 'vue';

const App = defineAsyncComponent(() =>
    import('./app.vue').then((m) => m.default)
);

export function createApp() {
    const app = new Vue({
        render(h) {
            return h(App);
        }
    });
    return {
        app
    };
}
