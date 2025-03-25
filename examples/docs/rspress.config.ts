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
    lang: 'zh',
    locales: [
        {
            lang: 'zh',
            label: '简体中文',
            title: 'Gez'
        },
        {
            lang: 'en',
            label: 'English',
            title: 'Gez'
        },
        {
            lang: 'es',
            label: 'Español',
            title: 'Gez'
        },
        {
            lang: 'hi',
            label: 'हिन्दी',
            title: 'Gez'
        },
        {
            lang: 'pt',
            label: 'Português',
            title: 'Gez'
        },
        {
            lang: 'ru',
            label: 'Русский',
            title: 'Gez'
        },
        {
            lang: 'ja',
            label: '日本語',
            title: 'Gez'
        },
        {
            lang: 'de',
            label: 'Deutsch',
            title: 'Gez'
        },
        {
            lang: 'fr',
            label: 'Français',
            title: 'Gez'
        },
        {
            lang: 'zh-TW',
            label: '繁體中文',
            title: 'Gez'
        },
        {
            lang: 'it',
            label: 'Italiano',
            title: 'Gez'
        },
        {
            lang: 'ko',
            label: '한국어',
            title: 'Gez'
        },
        {
            lang: 'nl',
            label: 'Nederlands',
            title: 'Gez'
        },
        {
            lang: 'pl',
            label: 'Polski',
            title: 'Gez'
        },
        {
            lang: 'tr',
            label: 'Türkçe',
            title: 'Gez'
        },
        {
            lang: 'th',
            label: 'ไทย',
            title: 'Gez'
        },
        {
            lang: 'vi',
            label: 'Tiếng Việt',
            title: 'Gez'
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
                    'https://github.com/js-esm/gez?utm_source=www.esmnext.com'
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
