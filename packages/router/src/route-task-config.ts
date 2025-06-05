import { RouteTaskType } from './route-task';
import { RouteType } from './types';

export const BEFORE_TASKS: Record<RouteType, RouteTaskType[]> = {
    [RouteType.push]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.asyncComponent,
        RouteTaskType.beforeEach,
        RouteTaskType.push
    ],
    [RouteType.replace]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.asyncComponent,
        RouteTaskType.beforeEach,
        RouteTaskType.replace
    ],
    [RouteType.pushWindow]: [
        RouteTaskType.location,
        RouteTaskType.asyncComponent,
        RouteTaskType.env,
        RouteTaskType.beforeEach,
        RouteTaskType.pushWindow
    ],
    [RouteType.replaceWindow]: [
        RouteTaskType.location,
        RouteTaskType.beforeEach,
        RouteTaskType.replaceWindow
    ],
    [RouteType.reload]: [
        RouteTaskType.location,
        RouteTaskType.asyncComponent,
        RouteTaskType.beforeEach,
        RouteTaskType.popstate
    ],
    [RouteType.back]: [
        RouteTaskType.asyncComponent,
        RouteTaskType.beforeEach,
        RouteTaskType.popstate
    ],
    [RouteType.go]: [
        RouteTaskType.asyncComponent,
        RouteTaskType.beforeEach,
        RouteTaskType.popstate
    ],
    [RouteType.forward]: [
        RouteTaskType.asyncComponent,
        RouteTaskType.beforeEach,
        RouteTaskType.popstate
    ],
    [RouteType.none]: [
        RouteTaskType.asyncComponent,
        RouteTaskType.beforeEach,
        RouteTaskType.popstate
    ]
};
export const AFTER_TASKS: Record<RouteType, RouteTaskType[]> = {
    [RouteType.push]: [RouteTaskType.afterEach],
    [RouteType.replace]: [RouteTaskType.afterEach],
    [RouteType.pushWindow]: [RouteTaskType.afterEach],
    [RouteType.replaceWindow]: [RouteTaskType.afterEach],
    [RouteType.reload]: [RouteTaskType.afterEach],
    [RouteType.back]: [RouteTaskType.afterEach],
    [RouteType.go]: [RouteTaskType.afterEach],
    [RouteType.forward]: [RouteTaskType.afterEach],
    [RouteType.none]: [RouteTaskType.afterEach]
};
