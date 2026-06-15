import HelloWorld from './components/hello-world';
import './app.css';

export default function App() {
    return (
        <main className="demo">
            <article className="demo__card">
                <HelloWorld />
                <p className="demo__source">
                    source · <code>examples/ssr-vite-react/src/app.tsx</code>
                </p>
            </article>
        </main>
    );
}
