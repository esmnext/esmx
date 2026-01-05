import React, { useState } from 'react';
import './hello-world.css';

interface HelloWorldProps {
    msg: string;
}

export default function HelloWorld({ msg }: HelloWorldProps) {
    const [count, setCount] = useState<number>(0);

    return (
        <div>
            <h1>{msg}</h1>

            <div className="card">
                <button type="button" onClick={() => setCount(count + 1)}>
                    Counter: {count}
                </button>
                <p>
                    Edit
                    <code>components/HelloWorld.tsx</code> to test HMR
                </p>
            </div>

            <p>Experience React with server-side rendering powered by Esmx framework</p>
        </div>
    );
}

