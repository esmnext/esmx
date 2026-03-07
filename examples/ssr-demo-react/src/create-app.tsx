/**
 * @file React app instance creation
 * @description Responsible for creating and configuring React application instance
 */

import App from './app';

export function createApp() {
    return {
        app: <App />
    };
}
