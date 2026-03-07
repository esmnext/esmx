/**
 * @file Main React application component
 * @description Root component of the React application
 */

import { useState } from 'react';

export default function App() {
    const [count, setCount] = useState(0);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Hello from React + Esmx!</h1>
            <p>Rspack React integration is working! 🎉</p>

            <div style={{ marginTop: '20px' }}>
                <p>Counter: {count}</p>
                <button
                    type="button"
                    onClick={() => setCount(count + 1)}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Increment
                </button>
            </div>

            <div
                style={{
                    marginTop: '30px',
                    padding: '15px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px'
                }}
            >
                <h2>Features Tested:</h2>
                <ul>
                    <li>✅ React 18+ with JSX/TSX support</li>
                    <li>✅ Hot Module Replacement (HMR)</li>
                    <li>✅ React Refresh (state preservation)</li>
                    <li>✅ Server-Side Rendering (SSR)</li>
                    <li>✅ Client-side hydration</li>
                    <li>✅ TypeScript support</li>
                </ul>
            </div>
        </div>
    );
}
