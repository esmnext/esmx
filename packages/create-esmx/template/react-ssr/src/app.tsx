import React from 'react';
import HelloWorld from './components/hello-world';
import './app.css';

export default function App() {
    const title = 'React SSR Demo';

    return (
        <div id="app" className="container">
            <div className="logo-container">
                <a href="https://esmx.dev" target="_blank" rel="noopener noreferrer" className="logo-link">
                    <div className="logo-wrapper esmx">
                        <img src="https://esmx.dev/logo.svg" className="logo" alt="Esmx logo" />
                    </div>
                </a>
                <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="logo-link">
                    <div className="logo-wrapper react">
                        <img src="https://react.dev/favicon-192x192.png" className="logo" alt="React logo" />
                    </div>
                </a>
            </div>
            <HelloWorld msg={title} />
        </div>
    );
}

