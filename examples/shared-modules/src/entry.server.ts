import type { RenderContext } from '@esmx/core';
import { version as vueVersion } from './vue';
import { version as vue2Version } from './vue2';

export default async (rc: RenderContext) => {
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Esmx Shared Modules - A comprehensive micro-frontend solution for sharing modules across multiple framework versions, built on native ESM technology with zero runtime overhead">
    <meta name="keywords" content="Esmx,Shared Modules,Module Sharing,Micro-frontend,ESM Modules,JavaScript Modules,TypeScript,Rspack,Multi-framework,Vue2,Vue3,Code Reuse,Frontend Architecture">
    <meta name="generator" content="Esmx Framework">
    <link rel="icon" href="https://esmx.dev/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>Esmx Shared Modules - Multi-version Module Sharing Solution</title>
    ${rc.css()}
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        header {
            text-align: center;
            margin-bottom: 3rem;
            color: white;
        }

        header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .version-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .version-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .version-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }

        .version-card.vue3 {
            border-top: 4px solid #42b883;
        }

        .version-card.vue2 {
            border-top: 4px solid #42b883;
        }

        .version-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .version-info {
            margin-bottom: 1rem;
        }

        .version-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }

        .version-row:last-child {
            border-bottom: none;
        }

        .version-label {
            font-weight: 600;
            color: #666;
        }

        .version-value {
            font-family: 'Courier New', monospace;
            background: #f8f9fa;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.9rem;
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 1rem;
        }

        .status-consistent {
            background: #d4edda;
            color: #155724;
        }

        .status-inconsistent {
            background: #f8d7da;
            color: #721c24;
        }

        .status-checking {
            background: #fff3cd;
            color: #856404;
        }

        .icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }

        .icon.success {
            background: #28a745;
            color: white;
        }

        .icon.error {
            background: #dc3545;
            color: white;
        }

        .icon.loading {
            background: #ffc107;
            color: white;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }


        .tech-info {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .tech-info h2 {
            color: #333;
            margin-bottom: 1rem;
        }

        .tech-info ul {
            list-style: none;
            padding-left: 0;
        }

        .tech-info li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }

        .tech-info li:last-child {
            border-bottom: none;
        }

        .tech-info li:before {
            content: "✓";
            color: #42b883;
            font-weight: bold;
            margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            header h1 {
                font-size: 2rem;
            }
            
            .version-cards {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Esmx Shared Modules</h1>
            <p>Multi-version module sharing solution for micro-frontend architecture</p>
        </header>

        <div class="version-cards">
            <div class="version-card vue3" id="vue3-card">
                <h3>
                    <span style="color: #42b883;">●</span>
                    Vue 3 Module
                </h3>
                <div class="version-info">
                    <div class="version-row">
                        <span class="version-label">Server Version:</span>
                        <span class="version-value" id="vue3-server-version">${vueVersion}</span>
                    </div>
                    <div class="version-row">
                        <span class="version-label">Client Version:</span>
                        <span class="version-value" id="vue3-client-version">Detecting...</span>
                    </div>
                </div>
                <div class="status-indicator status-checking" id="vue3-status">
                    <span class="icon loading">⟳</span>
                    <span>Verifying version consistency...</span>
                </div>
            </div>

            <div class="version-card vue2" id="vue2-card">
                <h3>
                    <span style="color: #42b883;">●</span>
                    Vue 2 Module
                </h3>
                <div class="version-info">
                    <div class="version-row">
                        <span class="version-label">Server Version:</span>
                        <span class="version-value" id="vue2-server-version">${vue2Version}</span>
                    </div>
                    <div class="version-row">
                        <span class="version-label">Client Version:</span>
                        <span class="version-value" id="vue2-client-version">Detecting...</span>
                    </div>
                </div>
                <div class="status-indicator status-checking" id="vue2-status">
                    <span class="icon loading">⟳</span>
                    <span>Verifying version consistency...</span>
                </div>
            </div>
        </div>

            <div class="tech-info">
                <h2>Shared Modules Features</h2>
                <ul>
                    <li>📦 Shared module system across different framework versions</li>
                    <li>⚡ Zero runtime overhead, based on native ESM + ImportMap</li>
                    <li>🚀 High-performance build and module sharing, powered by Rspack</li>
                    <li>🔄 Complete SSR support with shared module consistency</li>
                    <li>📝 Standard ESM syntax, no framework-specific APIs required</li>
                    <li>🔧 Multi-framework module sharing: Vue2, Vue3, React, Preact, etc.</li>
                </ul>
            </div>
    </div>
    <script async src="https://ga.jspm.io/npm:es-module-shims@2.6.2/dist/es-module-shims.js"></script>
    ${rc.importmap()}
    ${rc.moduleEntry()}
</body>
</html>
`;
};
