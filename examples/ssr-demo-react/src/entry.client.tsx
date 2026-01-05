/**
 * @file Client entry file
 * @description Responsible for client-side interaction logic and dynamic updates
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createApp } from './create-app';

// Create React app instance
const { app } = createApp();

// Mount React app to DOM
const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(app);
} else {
    console.error('Container element #app not found');
}

