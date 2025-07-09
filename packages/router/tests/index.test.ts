import { describe, expect, it } from 'vitest';
import { Router as IndexRouter } from '../src/index';
import { Router } from '../src/router';

describe('index exports', () => {
    it('should export Router correctly', () => {
        expect(IndexRouter).toBe(Router);
    });
});
