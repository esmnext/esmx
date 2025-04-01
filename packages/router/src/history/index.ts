import { type RouterInstance, RouterMode } from '../types';
import { AbstractHistory } from './abstract';
import { HtmlHistory } from './html';

export function createHistory({
    router,
    mode
}: {
    router: RouterInstance;
    mode: RouterMode;
}) {
    switch (mode) {
        case RouterMode.HISTORY:
            return new HtmlHistory(router);
        case RouterMode.ABSTRACT:
            return new AbstractHistory(router);
        default:
            throw new Error('not support mode');
    }
}
