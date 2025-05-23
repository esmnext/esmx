import { assert, test } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { isImmutableFile, mergeMiddlewares } from './middleware';

test('should identify immutable files with .final. extension', () => {
    assert.equal(isImmutableFile('script.final.js'), true);
    assert.equal(isImmutableFile('style.final.css'), true);
    assert.equal(isImmutableFile('app.final.mjs'), true);
    assert.equal(isImmutableFile('chunk.final.123abc.js'), false);
});

test('should return false for non-immutable files', () => {
    assert.equal(isImmutableFile('script.js'), false);
    assert.equal(isImmutableFile('style.css'), false);
    assert.equal(isImmutableFile('app.mjs'), false);
    assert.equal(isImmutableFile('.final'), false);
    assert.equal(isImmutableFile('final.js'), false);
    assert.equal(isImmutableFile('test.finally.js'), false);
});

test('should handle paths with directories', () => {
    assert.equal(isImmutableFile('/dist/js/main.final.js'), true);
    assert.equal(isImmutableFile('src/components/index.final.mjs'), true);
    assert.equal(isImmutableFile('src/styles/main.final.css'), true);
});

test('middleware chain should execute in order', () => {
    const executed: string[] = [];
    const middleware1 = (
        _req: IncomingMessage,
        _res: ServerResponse,
        next: Function
    ) => {
        executed.push('middleware1');
        next();
    };
    const middleware2 = (
        _req: IncomingMessage,
        _res: ServerResponse,
        next: Function
    ) => {
        executed.push('middleware2');
        next();
    };
    const middleware3 = (
        _req: IncomingMessage,
        _res: ServerResponse,
        next: Function
    ) => {
        executed.push('middleware3');
        next();
    };

    const merged = mergeMiddlewares([middleware1, middleware2, middleware3]);
    merged({} as IncomingMessage, {} as ServerResponse, () => {
        executed.push('final');
    });

    assert.deepEqual(executed, [
        'middleware1',
        'middleware2',
        'middleware3',
        'final'
    ]);
});

test('middleware chain should stop if next is not called', () => {
    const executed: string[] = [];
    const middleware1 = (
        _req: IncomingMessage,
        _res: ServerResponse,
        next: Function
    ) => {
        executed.push('middleware1');
        next();
    };
    const middleware2 = (
        _req: IncomingMessage,
        _res: ServerResponse,
        _next: Function
    ) => {
        executed.push('middleware2');
        // 不调用 next
    };
    const middleware3 = (
        _req: IncomingMessage,
        _res: ServerResponse,
        next: Function
    ) => {
        executed.push('middleware3');
        next();
    };

    const merged = mergeMiddlewares([middleware1, middleware2, middleware3]);
    merged({} as IncomingMessage, {} as ServerResponse, () => {
        executed.push('final');
    });

    assert.deepEqual(executed, ['middleware1', 'middleware2']);
});

test('empty middleware array should call final next', () => {
    const executed: string[] = [];
    const merged = mergeMiddlewares([]);

    merged({} as IncomingMessage, {} as ServerResponse, () => {
        executed.push('final');
    });

    assert.deepEqual(executed, ['final']);
});

test('middleware should receive correct request and response objects', () => {
    const req = { url: '/test' } as IncomingMessage;
    const res = { statusCode: 200 } as ServerResponse;
    let passedReq: IncomingMessage | undefined;
    let passedRes: ServerResponse | undefined;

    const middleware = (
        req: IncomingMessage,
        res: ServerResponse,
        next: Function
    ) => {
        passedReq = req;
        passedRes = res;
        next();
    };

    const merged = mergeMiddlewares([middleware]);
    merged(req, res, () => {});

    assert.equal(passedReq, req);
    assert.equal(passedRes, res);
});

// Test error handling in middleware chain
test('should handle errors in middleware chain', () => {
    const executed: string[] = [];
    const errorMiddleware = (
        _req: IncomingMessage,
        _res: ServerResponse,
        _next: Function
    ) => {
        executed.push('error');
        throw new Error('Test error');
    };

    const nextMiddleware = (
        _req: IncomingMessage,
        _res: ServerResponse,
        next: Function
    ) => {
        executed.push('next');
        next();
    };

    const merged = mergeMiddlewares([errorMiddleware, nextMiddleware]);

    try {
        merged({} as IncomingMessage, {} as ServerResponse, () => {
            executed.push('final');
        });
    } catch (err) {
        executed.push('caught');
    }

    assert.deepEqual(executed, ['error', 'caught']);
});
