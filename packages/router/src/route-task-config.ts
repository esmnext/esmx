import { RouteTaskType } from './route-task';
import { RouteType } from './types';

export const BEFORE_TASKS: Record<RouteType, RouteTaskType[]> = {
    [RouteType.push]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.push
    ],
    [RouteType.replace]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.replace
    ],
    [RouteType.pushWindow]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.pushWindow
    ],
    [RouteType.replaceWindow]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.replaceWindow
    ],
    [RouteType.restartApp]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.restartApp
    ],
    [RouteType.back]: [RouteTaskType.popstate],
    [RouteType.go]: [RouteTaskType.popstate],
    [RouteType.forward]: [RouteTaskType.popstate],
    [RouteType.none]: []
};
