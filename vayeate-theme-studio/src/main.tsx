/*
 * main.tsx
 * 
 * Copyright (c) 2026 DangerDan9631. All rights reserved.
 * Licensed under the MIT License.
 * See https://opensource.org/licenses/MIT for full license information.
 */
import React from 'react';
    import './style.css';

    const app = document.querySelector<HTMLDivElement>('#app');

    if (app) {
      app.innerHTML = '<h1>hello world</h1>';
    }
