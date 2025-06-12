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
    [RouteType.back]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.popstate
    ],
    [RouteType.go]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.popstate
    ],
    [RouteType.forward]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.popstate
    ],
    [RouteType.none]: []
};

export const AFTER_TASKS: Record<RouteType, RouteTaskType[]> = {
    [RouteType.push]: [],
    [RouteType.replace]: [],
    [RouteType.pushWindow]: [],
    [RouteType.replaceWindow]: [],
    [RouteType.restartApp]: [],
    [RouteType.back]: [],
    [RouteType.go]: [],
    [RouteType.forward]: [],
    [RouteType.none]: []
};
