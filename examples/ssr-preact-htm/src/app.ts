import { html } from 'htm/preact';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import './styles.css';

// 计数器组件
const Counter = () => {
    const [count, setCount] = useState(0);

    return html`
        <div class="card">
            <h2>计数器</h2>
            <div class="counter">
                <span>${count}</span>
                <button onClick=${() => setCount(count + 1)}>+1</button>
            </div>
        </div>
    `;
};

// 表单组件
const Form = () => {
    const [text, setText] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (text.trim()) {
            setSubmitted(true);
            setTimeout(() => {
                setText('');
                setSubmitted(false);
            }, 3000);
        }
    };

    return html`
        <div class="card">
            <h2>表单</h2>
            <form onSubmit=${handleSubmit}>
                <div class="form-group">
                    <input
                        type="text"
                        value=${text}
                        onInput=${(e: JSX.TargetedEvent<HTMLInputElement>) => setText(e.currentTarget.value)}
                        placeholder="请输入内容..."
                        disabled=${submitted}
                    />
                    <button type="submit" disabled=${!text.trim() || submitted}>
                        ${submitted ? '已发送！' : '发送'}
                    </button>
                </div>
                ${
                    submitted &&
                    html`
                    <div class="success">发送成功：${text}</div>
                `
                }
            </form>
        </div>
    `;
};

// 列表组件
const List = () => {
    const [items, setItems] = useState(['构建工具', '模块加载', '路由系统']);
    const [newItem, setNewItem] = useState('');

    const addItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    return html`
        <div class="card">
            <h2>功能列表</h2>
            <div class="form-group">
                <input
                    type="text"
                    value=${newItem}
                    onInput=${(e: JSX.TargetedEvent<HTMLInputElement>) => setNewItem(e.currentTarget.value)}
                    placeholder="添加新功能..."
                />
                <button onClick=${addItem} disabled=${!newItem.trim()}>
                    添加
                </button>
            </div>
            <ul class="items">
                ${items.map(
                    (item, index) => html`
                    <li key=${index}>
                        <span>${item}</span>
                        <button class="remove" onClick=${() => removeItem(index)}>
                            ✕
                        </button>
                    </li>
                `
                )}
            </ul>
        </div>
    `;
};

// 特性组件
const Features = () => html`
    <div class="card">
        <h2>特性</h2>
        <ul class="features">
            <li>✨ 使用 Preact 构建 UI</li>
            <li>🎨 使用 HTM 编写模板</li>
            <li>🚀 快速服务端渲染</li>
            <li>📦 无需构建步骤</li>
        </ul>
    </div>
`;

// 主应用组件
export const App: () => any = () => html`
    <div class="container">
        <h1>
            <img src="https://esmx.dev/logo.svg" alt="Esmx Logo" class="logo" />
            Esmx + Preact + HTM 示例
        </h1>
        <${Counter} />
        <${Form} />
        <${List} />
        <${Features} />
        <footer>
            <a href="https://github.com/esmnext/esmx" target="_blank" rel="noopener">
                在 GitHub 上查看
            </a>
        </footer>
    </div>
`;
