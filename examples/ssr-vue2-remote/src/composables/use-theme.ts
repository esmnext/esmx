import { type Ref, ref, watchEffect } from 'vue';

// 主题配置接口
export interface Theme {
    colorPrimary: string;
    colorPrimaryDark: string;
    colorSecondary: string;
    colorSecondaryDark: string;
    colorSuccess: string;
    colorSuccessDark: string;
    colorWarning: string;
    colorWarningDark: string;
    colorDanger: string;
    colorDangerDark: string;
    colorTextPrimary: string;
    colorTextSecondary: string;
    colorBackground: string;
    colorBorder: string;
}

// 主题选项接口
export interface ThemeOptions {
    defaultTheme?: Partial<Theme>;
}

// 默认主题
export const defaultTheme: Theme = {
    colorPrimary: '#3b82f6',
    colorPrimaryDark: '#2563eb',
    colorSecondary: '#6b7280',
    colorSecondaryDark: '#4b5563',
    colorSuccess: '#10b981',
    colorSuccessDark: '#059669',
    colorWarning: '#f59e0b',
    colorWarningDark: '#d97706',
    colorDanger: '#ef4444',
    colorDangerDark: '#dc2626',
    colorTextPrimary: '#111827',
    colorTextSecondary: '#6b7280',
    colorBackground: '#ffffff',
    colorBorder: '#e5e7eb'
};

// 组合函数返回值类型
export interface UseThemeReturn {
    theme: Ref<Theme>;
    updateTheme: (newTheme: Partial<Theme>) => void;
}

// 创建一个样式标签
function createStyleElement(): HTMLStyleElement {
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', 'esmx-theme-style');
    document.head.appendChild(style);
    return style;
}

// 生成 CSS 变量
function generateCSSVariables(theme: Theme): string {
    return `:root {
    ${Object.entries(theme)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `--${cssKey}: ${value};`;
        })
        .join('\n    ')}
  }`;
}

// 主题组合函数
export function useTheme(initialTheme: Partial<Theme> = {}): UseThemeReturn {
    const theme = ref<Theme>({ ...defaultTheme, ...initialTheme });
    let styleElement: HTMLStyleElement | null = null;

    // 更新主题样式
    const updateStyles = () => {
        if (typeof window === 'undefined') return;

        if (!styleElement) {
            const existingStyle = document.getElementById('esmx-theme-style');
            styleElement =
                (existingStyle as HTMLStyleElement) || createStyleElement();
        }

        const cssVariables = generateCSSVariables(theme.value);
        styleElement.textContent = cssVariables;
    };

    // 监听主题变化
    watchEffect(() => {
        updateStyles();
    });

    // 更新主题
    const updateTheme = (newTheme: Partial<Theme>) => {
        theme.value = {
            ...theme.value,
            ...newTheme
        };
    };

    // 如果在客户端，立即更新样式
    if (typeof window !== 'undefined') {
        updateStyles();
    }

    return {
        theme,
        updateTheme
    };
}
