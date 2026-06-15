import { useState } from 'react';

const SOURCE_SNIPPET = `import { useState } from 'react'

export default function HelloWorld() {
  const [count, setCount] = useState(0)
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>−</button>
    </>
  )
}`;

export default function HelloWorld() {
    const [count, setCount] = useState<number>(0);

    return (
        <>
            <h1 className="demo__title">React 19 SSR</h1>
            <p className="demo__message">
                Server-rendered by Esmx on Rsbuild, then hydrated by React 19 in
                place. The counter below works after hydration.
            </p>
            <div className="demo__code">
                <pre>{SOURCE_SNIPPET}</pre>
            </div>
            <div className="demo__stat">
                <div className="demo__stat-label">Count</div>
                <div className="demo__stat-value">{count}</div>
            </div>
            <div className="demo__actions">
                <button
                    type="button"
                    className="demo__btn demo__btn--primary"
                    onClick={() => setCount((c) => c + 1)}
                >
                    +
                </button>
                <button
                    type="button"
                    className="demo__btn"
                    onClick={() => setCount((c) => c - 1)}
                >
                    −
                </button>
            </div>
            <div className="demo__tags">
                <span className="demo__badge demo__badge--react">
                    <span
                        className="demo__dot demo__dot--react"
                        aria-hidden="true"
                    />
                    React 19
                </span>
                <span className="demo__badge">Rsbuild</span>
                <span className="demo__badge">SSR</span>
            </div>
        </>
    );
}
