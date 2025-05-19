import App from './app.vue';
import Home from './components/home.vue';
import Test from './components/test.vue';

export const routes = [
    {
        appType: 'vue2',
        path: '/',
        component: App,
        children: [
            {
                path: '/',
                component: Home
            },
            {
                path: '/test',
                component: Test
            },
            {
                path: '/test1',
                asyncComponent: () => import('./components/test1.vue')
            },
            {
                path: '(.*)*',
                asyncComponent: () => import('./components/page-404.vue')
            }
        ]
    }
];
