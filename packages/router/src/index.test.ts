import { describe, expect, it } from 'vitest';
import { Router as IndexRouter } from './index';
import { Router } from './router';

describe('index exports', () => {
    it('should export Router correctly', () => {
        expect(IndexRouter).toBe(Router);
    });
});
