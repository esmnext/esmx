// Pure JS so tsc doesn't try to resolve `.css` modules.
// rspack/rsbuild/vite all handle these via their CSS loaders.
import './tokens.css';
import './components.css';
