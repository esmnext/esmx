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
            title: 'Esmx'
        },
        {
            lang: 'en',
            label: 'English',
            title: 'Esmx'
        },
        {
            lang: 'es',
            label: 'Español',
            title: 'Esmx'
        },
        {
            lang: 'hi',
            label: 'हिन्दी',
            title: 'Esmx'
        },
        {
            lang: 'pt',
            label: 'Português',
            title: 'Esmx'
        },
        {
            lang: 'ru',
            label: 'Русский',
            title: 'Esmx'
        },
        {
            lang: 'ja',
            label: '日本語',
            title: 'Esmx'
        },
        {
            lang: 'de',
            label: 'Deutsch',
            title: 'Esmx'
        },
        {
            lang: 'fr',
            label: 'Français',
            title: 'Esmx'
        },
        {
            lang: 'zh-TW',
            label: '繁體中文',
            title: 'Esmx'
        },
        {
            lang: 'it',
            label: 'Italiano',
            title: 'Esmx'
        },
        {
            lang: 'ko',
            label: '한국어',
            title: 'Esmx'
        },
        {
            lang: 'nl',
            label: 'Nederlands',
            title: 'Esmx'
        },
        {
            lang: 'pl',
            label: 'Polski',
            title: 'Esmx'
        },
        {
            lang: 'tr',
            label: 'Türkçe',
            title: 'Esmx'
        },
        {
            lang: 'th',
            label: 'ไทย',
            title: 'Esmx'
        },
        {
            lang: 'vi',
            label: 'Tiếng Việt',
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
                    'https://github.com/js-esm/esmx?utm_source=www.esmnext.com'
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
