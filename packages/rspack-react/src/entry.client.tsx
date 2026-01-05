/**
 * @file 
 * @description 
 */

import { hydrateRoot } from 'react-dom/client';
import { createApp } from './create-app';

const { app } = createApp();

//  (hydrateRoot untuk SSR)
const container = document.getElementById('app')!;
hydrateRoot(container, app);