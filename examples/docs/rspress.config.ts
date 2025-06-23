import path from 'node:path';
import sitemap from 'rspress-plugin-sitemap';
import { defineConfig } from 'rspress/config';

export default defineConfig({
    root: path.join(__dirname, 'src'),
    outDir:
        process.env.NODE_ENV === 'production'
            ? path.join(__dirname, 'dist/client')
            : undefined,
    globalStyles: path.join(__dirname, 'src/styles/index.css'),
    lang: 'en',
    locales: [
        {
            lang: 'zh',
            label: '简体中文',
            title: 'Esmx'
        },
        {
            lang: 'en',
            label: 'English',
            title: 'Esmx'
        }
    ],
    icon: '/logo.svg',
    base: '/',
    logo: '/logo.svg',
    builderConfig: {
        html: {
            template: './src/index.html'
        }
    },
    themeConfig: {
        lastUpdated: true,
        socialLinks: [
            {
                icon: 'github',
                mode: 'link',
                content:
                    'https://github.com/esmnext/esmx?utm_source=www.esmnext.com'
            }
        ]
    },
    markdown: {
        showLineNumbers: true
    },
    plugins: [
        sitemap({
            domain: 'https://www.esmnext.com',
            defaultChangeFreq: 'monthly',
            defaultPriority: '0.5'
        })
    ]
});
