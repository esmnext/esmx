import React from 'react';
import { createRoot } from 'react-dom/client';
import { createApp } from './create-app';

const { app } = createApp();

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(app);
} else {
    console.error('Container element #app not found');
}

