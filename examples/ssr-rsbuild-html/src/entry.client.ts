import { message } from './message';

const app = document.getElementById('app');
if (app) {
    app.textContent = message('client');
}
