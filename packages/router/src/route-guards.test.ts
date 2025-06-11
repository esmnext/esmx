import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Router } from './router';
import { RouterMode } from './types';

describe('Route-Level Navigation Guards', () => {
    let router: Router;
    let executionLog: string[];

    beforeEach(async () => {
        executionLog = [];

        router = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/',
                    component: () => 'Home'
                },
                {
                    path: '/login',
                    component: () => 'Login'
                },
                {
                    path: '/protected',
                    component: () => 'Protected',
                    beforeEnter: async (to, from) => {
                        executionLog.push('beforeEnter-protected');
                        // 模拟权限检查
                        if (to.query.token !== 'valid') {
                            return '/login';
                        }
                    }
                },
                {
                    path: '/blocked',
                    component: () => 'Blocked',
                    beforeEnter: async (to, from) => {
                        executionLog.push('beforeEnter-blocked');
                        // 总是阻止访问
                        return false as const;
                    }
                },
                {
                    path: '/user/:id',
                    component: () => 'User',
                    beforeEnter: async (to, from) => {
                        executionLog.push(`beforeEnter-user-${to.params.id}`);
                        // 显式返回 void
                        return;
                    },
                    beforeUpdate: async (to, from) => {
                        executionLog.push(
                            `beforeUpdate-user-${from?.params.id}-to-${to.params.id}`
                        );
                        // 测试参数变化时的更新守卫
                        if (to.params.id === 'forbidden') {
                            return false;
                        }
                        // 显式返回 void
                        return;
                    },
                    beforeLeave: async (to, from) => {
                        executionLog.push(
                            `beforeLeave-user-${from?.params.id}`
                        );
                        // 测试离开守卫
                        if (from?.query.prevent === 'true') {
                            return false;
                        }
                        // 显式返回 void
                        return;
                    }
                },
                {
                    path: '/settings',
                    component: () => 'Settings',
                    beforeLeave: async (to, from) => {
                        executionLog.push('beforeLeave-settings');
                        // 模拟表单未保存的确认
                        if (from?.query.unsaved === 'true') {
                            return '/confirm-leave';
                        }
                        // 显式返回 void
                        return;
                    }
                },
                {
                    path: '/confirm-leave',
                    component: () => 'ConfirmLeave'
                }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('beforeEnter 守卫', () => {
        test('应该允许通过没有 beforeEnter 的路由', async () => {
            const route = await router.push('/login');

            expect(route.path).toBe('/login');
            expect(router.route.path).toBe('/login');
        });

        test('应该执行 beforeEnter 守卫并允许通过', async () => {
            const route = await router.push('/protected?token=valid');

            expect(route.path).toBe('/protected');
            expect(route.query.token).toBe('valid');
            expect(router.route.path).toBe('/protected');
            expect(executionLog).toEqual(['beforeEnter-protected']);
        });

        test('应该在 beforeEnter 返回重定向路径时进行重定向', async () => {
            const route = await router.push('/protected?token=invalid');

            expect(route.path).toBe('/login');
            expect(router.route.path).toBe('/login');
            expect(executionLog).toEqual(['beforeEnter-protected']);
        });

        test('应该在 beforeEnter 返回 false 时终止导航', async () => {
            const initialPath = router.route.path;
            const route = await router.push('/blocked');

            // 导航应该被阻止，当前路由不变
            expect(router.route.path).toBe(initialPath);
            expect(route.status).toBe('aborted');
            expect(executionLog).toEqual(['beforeEnter-blocked']);
        });
    });

    describe('beforeUpdate 守卫', () => {
        test('应该在同一路由参数变化时执行 beforeUpdate', async () => {
            // 先导航到用户页面
            await router.push('/user/123');
            expect(executionLog).toEqual(['beforeEnter-user-123']);

            // 清空执行日志
            executionLog.length = 0;

            // 改变参数，应该触发 beforeUpdate
            const route = await router.push('/user/456');

            expect(route.path).toBe('/user/456');
            expect(route.params.id).toBe('456');
            expect(router.route.path).toBe('/user/456');
            expect(executionLog).toEqual(['beforeUpdate-user-123-to-456']);
            // beforeUpdate 执行时不应该执行 beforeEnter
            expect(executionLog).not.toContain('beforeEnter-user-456');
        });

        test('应该在 beforeUpdate 返回 false 时终止导航', async () => {
            // 先导航到用户页面
            await router.push('/user/123');
            expect(router.route.params.id).toBe('123');

            // 清空执行日志
            executionLog.length = 0;

            // 尝试导航到被禁止的参数
            const route = await router.push('/user/forbidden');

            // 导航应该被阻止，当前路由不变
            expect(router.route.params.id).toBe('123');
            expect(route.status).toBe('aborted');
            expect(executionLog).toEqual([
                'beforeUpdate-user-123-to-forbidden'
            ]);
        });

        test('应该在查询参数变化时执行 beforeUpdate', async () => {
            // 先导航到用户页面
            await router.push('/user/123');

            // 清空执行日志
            executionLog.length = 0;

            // 只改变查询参数，应该触发 beforeUpdate
            const route = await router.push('/user/123?tab=profile');

            expect(route.params.id).toBe('123');
            expect(route.query.tab).toBe('profile');
            expect(executionLog).toEqual(['beforeUpdate-user-123-to-123']);
        });

        test('不应该在切换到不同路由时执行 beforeUpdate', async () => {
            // 先导航到用户页面
            await router.push('/user/123');

            // 清空执行日志
            executionLog.length = 0;

            // 切换到不同的路由
            await router.push('/settings');

            // 切换到不同路由时会执行 beforeLeave 守卫
            expect(executionLog).not.toContain('beforeUpdate');
            expect(executionLog).toEqual(['beforeLeave-user-123']);
        });
    });

    describe('beforeLeave 守卫', () => {
        test('应该在离开路由时执行 beforeLeave 守卫', async () => {
            // 先导航到用户页面
            await router.push('/user/123');

            // 清空执行日志
            executionLog.length = 0;

            // 离开用户页面
            await router.push('/settings');

            expect(executionLog).toEqual(['beforeLeave-user-123']);
        });

        test('应该在 beforeLeave 返回 false 时终止导航', async () => {
            // 先导航到用户页面，并设置阻止离开的查询参数
            await router.push('/user/123?prevent=true');

            // 清空执行日志
            executionLog.length = 0;

            // 尝试离开，应该被阻止
            const route = await router.push('/settings');

            expect(router.route.path).toBe('/user/123');
            expect(route.status).toBe('aborted');
            expect(executionLog).toEqual(['beforeLeave-user-123']);
        });

        test('应该在 beforeLeave 返回重定向路径时进行重定向', async () => {
            // 先导航到设置页面，并设置未保存状态
            await router.push('/settings?unsaved=true');

            // 清空执行日志
            executionLog.length = 0;

            // 尝试离开，应该被重定向到确认页面
            const route = await router.push('/user/123');

            expect(route.path).toBe('/confirm-leave');
            expect(router.route.path).toBe('/confirm-leave');
            // 重定向场景：先执行 beforeLeave-settings，重定向后再次导航时会执行 beforeLeave-user-123
            expect(executionLog).toEqual([
                'beforeLeave-settings',
                'beforeLeave-user-123'
            ]);
        });

        test('在同一路由参数更新时不应该执行 beforeLeave', async () => {
            // 先导航到用户页面
            await router.push('/user/123');

            // 清空执行日志
            executionLog.length = 0;

            // 在同一路由内改变参数，不应该触发 beforeLeave
            await router.push('/user/456');

            expect(executionLog).toEqual(['beforeUpdate-user-123-to-456']);
            expect(executionLog).not.toContain('beforeLeave');
        });
    });

    describe('守卫执行顺序和综合场景', () => {
        test('应该按正确顺序执行所有相关守卫', async () => {
            // 添加全局守卫来测试执行顺序
            router.beforeEach(async (to, from) => {
                executionLog.push(`global-beforeEach-${to.path}`);
            });

            // 先导航到用户页面
            await router.push('/user/123');
            expect(executionLog).toEqual([
                'global-beforeEach-/user/123',
                'beforeEnter-user-123'
            ]);

            // 清空执行日志
            executionLog.length = 0;

            // 切换到另一个用户，测试完整的守卫链
            await router.push('/user/456');

            expect(executionLog).toEqual([
                'global-beforeEach-/user/456',
                'beforeUpdate-user-123-to-456'
            ]);
        });

        test('守卫异常处理', async () => {
            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            router = new Router({
                mode: RouterMode.abstract,
                base: new URL('http://localhost:3000/'),
                routes: [
                    {
                        path: '/',
                        component: () => 'Home'
                    },
                    {
                        path: '/error',
                        component: () => 'Error',
                        beforeEnter: async () => {
                            throw new Error('Guard error');
                        }
                    }
                ]
            });

            await router.replace('/');

            const route = await router.push('/error');
            expect(route.status).toBe('error');
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        test('复杂嵌套场景：从有守卫的路由切换到另一个有守卫的路由', async () => {
            // 导航到用户页面
            await router.push('/user/123');

            // 清空执行日志
            executionLog.length = 0;

            // 导航到受保护页面
            const route = await router.push('/protected?token=valid');

            expect(route.path).toBe('/protected');
            // beforeLeave 应该在 beforeEnter 之前执行
            expect(executionLog).toEqual([
                'beforeLeave-user-123',
                'beforeEnter-protected'
            ]);
        });
    });

    describe('初次导航场景', () => {
        test('初次导航时应该按照 Vue Router 行为执行守卫', async () => {
            // 创建一个新的路由实例，模拟应用启动
            const newRouter = new Router({
                mode: RouterMode.abstract,
                base: new URL('http://localhost:3000/'),
                routes: [
                    {
                        path: '/user/:id',
                        component: () => 'User',
                        beforeEnter: async (to, from) => {
                            executionLog.push(
                                `init-beforeEnter-user-${to.params.id}-from-${from === null ? 'null' : from.path}`
                            );
                            // 显式返回 void
                            return;
                        },
                        beforeUpdate: async (to, from) => {
                            executionLog.push(
                                `init-beforeUpdate-user-${from?.params.id || 'null'}-to-${to.params.id}`
                            );
                            // 显式返回 void
                            return;
                        },
                        beforeLeave: async (to, from) => {
                            executionLog.push(
                                `init-beforeLeave-user-${from?.params.id || 'null'}`
                            );
                            // 显式返回 void
                            return;
                        }
                    }
                ]
            });

            // 清空执行日志
            executionLog.length = 0;

            // 首次导航到用户页面（from 为 null）
            const route = await newRouter.replace('/user/123');

            expect(route.path).toBe('/user/123');
            expect(route.params.id).toBe('123');

            // 验证守卫执行行为：应该只执行 beforeEnter，其他守卫都不执行
            expect(executionLog).toEqual([
                'init-beforeEnter-user-123-from-null'
            ]);

            // 清理
            newRouter.destroy();
        });
    });
});

describe('嵌套路由守卫行为测试', () => {
    let router: Router;
    let executionLog: string[];

    beforeEach(async () => {
        executionLog = [];

        router = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/user',
                    component: () => 'UserLayout',
                    beforeEnter: (to, from) => {
                        executionLog.push('parent-beforeEnter');
                    },
                    beforeLeave: (to, from) => {
                        executionLog.push('parent-beforeLeave');
                    },
                    beforeUpdate: (to, from) => {
                        executionLog.push('parent-beforeUpdate');
                    },
                    children: [
                        {
                            path: ':id',
                            component: () => 'UserDetail',
                            beforeEnter: (to, from) => {
                                executionLog.push('child-beforeEnter');
                            },
                            beforeLeave: (to, from) => {
                                executionLog.push('child-beforeLeave');
                            },
                            beforeUpdate: (to, from) => {
                                executionLog.push('child-beforeUpdate');
                            },
                            children: [
                                {
                                    path: 'profile',
                                    component: () => 'UserProfile',
                                    beforeEnter: (to, from) => {
                                        executionLog.push(
                                            'grandchild-beforeEnter'
                                        );
                                    },
                                    beforeLeave: (to, from) => {
                                        executionLog.push(
                                            'grandchild-beforeLeave'
                                        );
                                    }
                                }
                            ]
                        },
                        {
                            path: ':id/settings',
                            component: () => 'UserSettings',
                            beforeEnter: (to, from) => {
                                executionLog.push('settings-beforeEnter');
                            },
                            beforeLeave: (to, from) => {
                                executionLog.push('settings-beforeLeave');
                            }
                        }
                    ]
                },
                {
                    path: '/admin',
                    component: () => 'AdminLayout',
                    beforeEnter: (to, from) => {
                        executionLog.push('admin-beforeEnter');
                    },
                    beforeLeave: (to, from) => {
                        executionLog.push('admin-beforeLeave');
                    },
                    children: [
                        {
                            path: 'users',
                            component: () => 'AdminUsers',
                            beforeEnter: (to, from) => {
                                executionLog.push('admin-users-beforeEnter');
                            },
                            beforeLeave: (to, from) => {
                                executionLog.push('admin-users-beforeLeave');
                            }
                        }
                    ]
                }
            ]
        });

        await router.replace('/home');
    });

    afterEach(() => {
        router.destroy();
    });

    test('从根路由导航到嵌套路由时，按父到子顺序执行 beforeEnter', async () => {
        executionLog = []; // 清空日志

        // 导航到深层嵌套路由
        await router.push('/user/123/profile');

        // 应该按照从父到子的顺序执行 beforeEnter
        expect(executionLog).toEqual([
            'parent-beforeEnter',
            'child-beforeEnter',
            'grandchild-beforeEnter'
        ]);
    });

    test('离开嵌套路由时，按子到父顺序执行 beforeLeave', async () => {
        // 先导航到深层嵌套路由
        await router.push('/user/123/profile');
        executionLog = []; // 清空日志

        // 离开到完全不同的路由
        await router.push('/home');

        // 应该按照从子到父的顺序执行 beforeLeave
        expect(executionLog).toEqual([
            'grandchild-beforeLeave',
            'child-beforeLeave',
            'parent-beforeLeave'
        ]);
    });

    test('在同一父路由的子路由间切换时，不执行父路由的守卫', async () => {
        // 导航到第一个子路由
        await router.push('/user/123/profile');
        executionLog = []; // 清空日志

        // 在子路由间切换
        await router.push('/user/123/settings');

        // 注意：'/user/123/profile' 匹配 /user + :id + profile 三层
        // '/user/123/settings' 匹配 /user + :id/settings 两层
        // 这不是同一路由组合，所以会有路由层级的变化
        expect(executionLog).toEqual([
            'grandchild-beforeLeave',
            'child-beforeLeave',
            'settings-beforeEnter'
        ]);
    });

    test('从父路由导航到子路由时，只执行新增路由的 beforeEnter', async () => {
        // 先导航到父路由
        await router.push('/user');
        executionLog = []; // 清空日志

        // 导航到子路由
        await router.push('/user/123');

        // 只应该执行子路由的 beforeEnter，父路由的不应该重复执行
        expect(executionLog).toEqual(['child-beforeEnter']);
    });

    test('在嵌套路由中参数变化时，执行所有匹配路由的 beforeUpdate', async () => {
        // 导航到嵌套路由
        await router.push('/user/123');
        executionLog = []; // 清空日志

        // 参数变化但路由配置相同
        await router.push('/user/456');

        // 应该执行所有匹配路由的 beforeUpdate
        expect(executionLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
        ]);
    });

    test('复杂嵌套路由切换：从一个深层路由切换到另一个深层路由', async () => {
        // 导航到第一个深层路由
        await router.push('/user/123/profile');
        executionLog = []; // 清空日志

        // 切换到另一个完全不同的深层路由
        await router.push('/admin/users');

        // 应该先执行离开的路由的 beforeLeave（从子到父），
        // 然后执行进入的路由的 beforeEnter（从父到子）
        expect(executionLog).toEqual([
            'grandchild-beforeLeave',
            'child-beforeLeave',
            'parent-beforeLeave',
            'admin-beforeEnter',
            'admin-users-beforeEnter'
        ]);
    });

    test('从子路由导航到同父路由的另一个深层子路由', async () => {
        // 导航到一个子路由
        await router.push('/user/123');
        executionLog = []; // 清空日志

        // 导航到同父路由的深层子路由
        await router.push('/user/456/profile');

        // '/user/123' 匹配 /user + :id 两层
        // '/user/456/profile' 匹配 /user + :id + profile 三层
        // :id 参数变化且增加了profile层级，所以只新增 grandchild-beforeEnter
        expect(executionLog).toEqual(['grandchild-beforeEnter']);
    });

    test('初次导航到嵌套路由的正确行为', async () => {
        // 创建新的路由实例来模拟初次导航
        const newRouter = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/user',
                    component: () => 'UserLayout',
                    beforeEnter: (to, from) => {
                        executionLog.push(
                            `parent-beforeEnter-from-${from?.path || 'null'}`
                        );
                    },
                    beforeLeave: (to, from) => {
                        executionLog.push('parent-beforeLeave');
                    },
                    children: [
                        {
                            path: ':id',
                            component: () => 'UserDetail',
                            beforeEnter: (to, from) => {
                                executionLog.push(
                                    `child-beforeEnter-from-${from?.path || 'null'}`
                                );
                            },
                            beforeLeave: (to, from) => {
                                executionLog.push('child-beforeLeave');
                            }
                        }
                    ]
                }
            ]
        });

        executionLog = []; // 清空日志

        // 首次导航到嵌套路由（from 为 null）
        await newRouter.replace('/user/123');

        // 应该执行所有路由的 beforeEnter，但不执行 beforeLeave
        expect(executionLog).toEqual([
            'parent-beforeEnter-from-null',
            'child-beforeEnter-from-null'
        ]);

        newRouter.destroy();
    });

    test('Hash 变化场景：仅 hash 变化时应触发 beforeUpdate', async () => {
        // 导航到带参数的路由
        await router.push('/user/123');
        executionLog = []; // 清空日志

        // 仅改变 hash，路径和参数保持不变
        await router.push('/user/123#section1');

        // hash 变化应该触发 beforeUpdate，因为 fullPath 发生了变化
        expect(executionLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
        ]);
    });

    test('Hash 变化场景：从有 hash 到无 hash 也应触发 beforeUpdate', async () => {
        // 导航到带 hash 的路由
        await router.push('/user/123#section1');
        executionLog = []; // 清空日志

        // 移除 hash
        await router.push('/user/123');

        // hash 的移除也应该触发 beforeUpdate
        expect(executionLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
        ]);
    });

    test('Hash 变化场景：hash 变化配合参数变化', async () => {
        // 导航到带 hash 的路由
        await router.push('/user/123#section1');
        executionLog = []; // 清空日志

        // 同时改变参数和 hash
        await router.push('/user/456#section2');

        // 参数和 hash 都变化，应该触发 beforeUpdate
        expect(executionLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
        ]);
    });
});

describe('守卫链中断场景测试', () => {
    let interruptRouter: Router;
    let interruptLog: string[];

    beforeEach(async () => {
        interruptLog = [];

        interruptRouter = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/parent',
                    component: () => 'Parent',
                    beforeEnter: (to, from) => {
                        interruptLog.push('parent-beforeEnter');
                    },
                    beforeLeave: (to, from) => {
                        interruptLog.push('parent-beforeLeave');
                        // 父路由守卫中断
                        if (to.path.includes('interrupt-parent')) {
                            return false;
                        }
                    },
                    beforeUpdate: (to, from) => {
                        interruptLog.push('parent-beforeUpdate');
                    },
                    children: [
                        {
                            path: 'child',
                            component: () => 'Child',
                            beforeEnter: (to, from) => {
                                interruptLog.push('child-beforeEnter');
                                // 子路由 beforeEnter 中断
                                if (to.query.blockEnter === 'true') {
                                    return false;
                                }
                            },
                            beforeLeave: (to, from) => {
                                interruptLog.push('child-beforeLeave');
                            },
                            beforeUpdate: (to, from) => {
                                interruptLog.push('child-beforeUpdate');
                                // 子路由 beforeUpdate 中断
                                if (to.query.blockUpdate === 'true') {
                                    return false;
                                }
                            }
                        },
                        {
                            path: 'sibling',
                            component: () => 'Sibling',
                            beforeEnter: (to, from) => {
                                interruptLog.push('sibling-beforeEnter');
                            },
                            beforeLeave: (to, from) => {
                                interruptLog.push('sibling-beforeLeave');
                            }
                        }
                    ]
                },
                {
                    path: '/interrupt-parent',
                    component: () => 'InterruptTarget'
                },
                {
                    path: '/multi-level',
                    component: () => 'Level1',
                    beforeEnter: (to, from) => {
                        interruptLog.push('level1-beforeEnter');
                    },
                    beforeLeave: (to, from) => {
                        interruptLog.push('level1-beforeLeave');
                    },
                    children: [
                        {
                            path: 'level2',
                            component: () => 'Level2',
                            beforeEnter: (to, from) => {
                                interruptLog.push('level2-beforeEnter');
                                // 第二层中断，第三层不应执行
                                if (to.query.interrupt === 'true') {
                                    return false;
                                }
                            },
                            beforeLeave: (to, from) => {
                                interruptLog.push('level2-beforeLeave');
                            },
                            children: [
                                {
                                    path: 'level3',
                                    component: () => 'Level3',
                                    beforeEnter: (to, from) => {
                                        interruptLog.push('level3-beforeEnter');
                                    },
                                    beforeLeave: (to, from) => {
                                        interruptLog.push('level3-beforeLeave');
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        await interruptRouter.replace('/home');
    });

    afterEach(() => {
        interruptRouter.destroy();
    });

    test('beforeLeave 中断应阻止后续守卫执行', async () => {
        // 导航到嵌套路由
        await interruptRouter.push('/parent/child');
        interruptLog = []; // 清空日志

        // 尝试导航到会触发父路由 beforeLeave 中断的路径
        const result = await interruptRouter.push('/interrupt-parent');

        // 导航应该被父路由的 beforeLeave 中断
        expect(result.status).toBe('aborted');
        expect(interruptRouter.route.path).toBe('/parent/child');

        // 应该按子到父顺序执行 beforeLeave，但父路由中断后停止
        expect(interruptLog).toEqual([
            'child-beforeLeave',
            'parent-beforeLeave'
            // 没有目标路由的 beforeEnter，因为被父路由的 beforeLeave 中断了
        ]);
    });

    test('beforeEnter 中断应阻止后续同级和子级守卫执行', async () => {
        await interruptRouter.push('/parent');
        interruptLog = []; // 清空日志

        // 尝试导航到会被子路由 beforeEnter 中断的路径
        const result = await interruptRouter.push(
            '/parent/child?blockEnter=true'
        );

        // 导航应该被子路由的 beforeEnter 中断
        expect(result.status).toBe('aborted');
        expect(interruptRouter.route.path).toBe('/parent');

        // beforeEnter 按父到子执行，子路由中断
        expect(interruptLog).toEqual([
            'child-beforeEnter'
            // 子路由 beforeEnter 中断，没有进一步的守卫执行
        ]);
    });

    test('beforeUpdate 中断应阻止后续同级守卫执行', async () => {
        // 导航到嵌套路由
        await interruptRouter.push('/parent/child');
        interruptLog = []; // 清空日志

        // 尝试参数更新但被 beforeUpdate 中断
        const result = await interruptRouter.push(
            '/parent/child?blockUpdate=true'
        );

        // 导航应该被子路由的 beforeUpdate 中断
        expect(result.status).toBe('aborted');
        expect(interruptRouter.route.fullPath).toBe('/parent/child');

        // beforeUpdate 按父到子执行，子路由中断，但父路由已经执行
        expect(interruptLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
            // 子路由 beforeUpdate 中断，没有进一步的守卫执行
        ]);
    });

    test('多层嵌套中间层中断应阻止更深层守卫执行', async () => {
        await interruptRouter.push('/home');
        interruptLog = []; // 清空日志

        // 尝试导航到三层嵌套，但在第二层被中断
        const result = await interruptRouter.push(
            '/multi-level/level2/level3?interrupt=true'
        );

        // 导航应该被第二层的 beforeEnter 中断
        expect(result.status).toBe('aborted');
        expect(interruptRouter.route.path).toBe('/home');

        // beforeEnter 按父到子执行，第二层中断，第三层不执行
        expect(interruptLog).toEqual([
            'level1-beforeEnter',
            'level2-beforeEnter'
            // level2 中断，level3-beforeEnter 不应该执行
        ]);
    });

    test('正常情况下守卫链应完整执行', async () => {
        await interruptRouter.push('/home');
        interruptLog = []; // 清空日志

        // 正常导航到三层嵌套路由
        const result = await interruptRouter.push('/multi-level/level2/level3');

        // 导航应该成功
        expect(result.status).toBe('success');
        expect(interruptRouter.route.path).toBe('/multi-level/level2/level3');

        // 所有 beforeEnter 都应该执行
        expect(interruptLog).toEqual([
            'level1-beforeEnter',
            'level2-beforeEnter',
            'level3-beforeEnter'
        ]);
    });

    test('从嵌套路由离开时的正常守卫执行顺序', async () => {
        // 先导航到三层嵌套路由
        await interruptRouter.push('/multi-level/level2/level3');
        interruptLog = []; // 清空日志

        // 离开到首页
        const result = await interruptRouter.push('/home');

        // 导航应该成功
        expect(result.status).toBe('success');
        expect(interruptRouter.route.path).toBe('/home');

        // 所有 beforeLeave 都应该按子到父顺序执行
        expect(interruptLog).toEqual([
            'level3-beforeLeave',
            'level2-beforeLeave',
            'level1-beforeLeave'
        ]);
    });

    test('嵌套路由间切换的守卫执行和中断', async () => {
        // 导航到子路由
        await interruptRouter.push('/parent/child');
        interruptLog = []; // 清空日志

        // 切换到同级的兄弟路由
        const result = await interruptRouter.push('/parent/sibling');

        // 导航应该成功
        expect(result.status).toBe('success');
        expect(interruptRouter.route.path).toBe('/parent/sibling');

        // 只有离开子路由和进入兄弟路由的守卫应该执行
        expect(interruptLog).toEqual([
            'child-beforeLeave',
            'sibling-beforeEnter'
        ]);
    });
});

describe('并发导航场景测试', () => {
    let concurrentRouter: Router;
    let concurrentLog: string[];

    beforeEach(async () => {
        concurrentLog = [];

        concurrentRouter = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/slow',
                    component: () => 'Slow',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push('slow-beforeEnter-start');
                        // 模拟慢速异步操作
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        concurrentLog.push('slow-beforeEnter-end');
                    }
                },
                {
                    path: '/fast',
                    component: () => 'Fast',
                    beforeEnter: (to, from) => {
                        concurrentLog.push('fast-beforeEnter');
                    }
                },
                {
                    path: '/user/:id',
                    component: () => 'User',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push(
                            `user-beforeEnter-${to.params.id}-start`
                        );
                        // 异步操作
                        await new Promise((resolve) => setTimeout(resolve, 30));
                        concurrentLog.push(
                            `user-beforeEnter-${to.params.id}-end`
                        );
                    },
                    beforeLeave: async (to, from) => {
                        concurrentLog.push(
                            `user-beforeLeave-${from?.params.id}-start`
                        );
                        await new Promise((resolve) => setTimeout(resolve, 20));
                        concurrentLog.push(
                            `user-beforeLeave-${from?.params.id}-end`
                        );
                    }
                },
                {
                    path: '/blocking',
                    component: () => 'Blocking',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push('blocking-beforeEnter-start');
                        await new Promise((resolve) =>
                            setTimeout(resolve, 100)
                        );
                        concurrentLog.push('blocking-beforeEnter-end');
                        // 阻止导航
                        return false;
                    }
                },
                {
                    path: '/redirect-source',
                    component: () => 'RedirectSource',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push('redirect-source-beforeEnter-start');
                        await new Promise((resolve) => setTimeout(resolve, 40));
                        concurrentLog.push('redirect-source-beforeEnter-end');
                        return '/redirect-target';
                    }
                },
                {
                    path: '/redirect-target',
                    component: () => 'RedirectTarget',
                    beforeEnter: (to, from) => {
                        concurrentLog.push('redirect-target-beforeEnter');
                    }
                }
            ]
        });

        await concurrentRouter.replace('/home');
    });

    afterEach(() => {
        concurrentRouter.destroy();
    });

    test('快速连续导航应取消前一个导航', async () => {
        concurrentLog = []; // 清空日志

        // 快速连续发起两个导航
        const slowPromise = concurrentRouter.push('/slow');
        const fastPromise = concurrentRouter.push('/fast');

        // 等待两个导航完成
        const [slowResult, fastResult] = await Promise.all([
            slowPromise,
            fastPromise
        ]);

        // 第一个导航应该被取消
        expect(slowResult.status).toBe('aborted');
        // 第二个导航应该成功
        expect(fastResult.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/fast');

        // 第二个导航的守卫应该正常执行
        expect(concurrentLog).toContain('fast-beforeEnter');
        // 第一个导航可能根本没开始，或者开始了但被中断
        // 由于时机问题，我们只验证最终状态正确即可
    });

    test('异步守卫执行期间发起新导航应取消当前守卫', async () => {
        concurrentLog = []; // 清空日志

        // 开始慢速导航
        const slowPromise = concurrentRouter.push('/user/123');

        // 等待一小段时间确保第一个导航开始
        await new Promise((resolve) => setTimeout(resolve, 10));

        // 在第一个导航的守卫执行期间发起新导航
        const fastPromise = concurrentRouter.push('/fast');

        const [slowResult, fastResult] = await Promise.all([
            slowPromise,
            fastPromise
        ]);

        // 第一个导航应该被取消
        expect(slowResult.status).toBe('aborted');
        expect(fastResult.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/fast');

        // 检查日志，第一个导航应该开始但被中断
        expect(concurrentLog).toContain('user-beforeEnter-123-start');
        expect(concurrentLog).toContain('fast-beforeEnter');
    });

    test('三个并发导航，最后一个应该胜出', async () => {
        concurrentLog = []; // 清空日志

        // 快速连续发起三个导航
        const promise1 = concurrentRouter.push('/user/1');
        const promise2 = concurrentRouter.push('/user/2');
        const promise3 = concurrentRouter.push('/user/3');

        const [result1, result2, result3] = await Promise.all([
            promise1,
            promise2,
            promise3
        ]);

        // 前两个导航应该被取消
        expect(result1.status).toBe('aborted');
        expect(result2.status).toBe('aborted');
        // 最后一个导航应该成功
        expect(result3.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/user/3');
        expect(concurrentRouter.route.params.id).toBe('3');
    });

    test('阻塞导航被并发导航取消', async () => {
        concurrentLog = []; // 清空日志

        // 开始一个会被阻塞的导航
        const blockingPromise = concurrentRouter.push('/blocking');

        // 等待阻塞导航开始执行
        await new Promise((resolve) => setTimeout(resolve, 20));

        // 发起另一个导航
        const fastPromise = concurrentRouter.push('/fast');

        const [blockingResult, fastResult] = await Promise.all([
            blockingPromise,
            fastPromise
        ]);

        // 阻塞导航应该被取消（不是被自己的 return false 阻塞）
        expect(blockingResult.status).toBe('aborted');
        // 快速导航应该成功
        expect(fastResult.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/fast');

        // 阻塞导航应该开始执行
        expect(concurrentLog).toContain('blocking-beforeEnter-start');
        // 由于异步守卫可能在任务取消检查之前完成，所以可能会看到 end
        // 但重要的是导航最终被取消而不是被 return false 阻塞
    });

    test('重定向导航被并发导航取消', async () => {
        concurrentLog = []; // 清空日志

        // 开始重定向导航
        const redirectPromise = concurrentRouter.push('/redirect-source');

        // 等待重定向开始
        await new Promise((resolve) => setTimeout(resolve, 10));

        // 发起另一个导航
        const fastPromise = concurrentRouter.push('/fast');

        const [redirectResult, fastResult] = await Promise.all([
            redirectPromise,
            fastPromise
        ]);

        // 重定向导航应该被取消
        expect(redirectResult.status).toBe('aborted');
        // 快速导航应该成功
        expect(fastResult.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/fast');

        // 重定向守卫应该开始但被中断
        expect(concurrentLog).toContain('redirect-source-beforeEnter-start');
        expect(concurrentLog).not.toContain('redirect-target-beforeEnter');
    });

    test('复杂嵌套路由的并发导航', async () => {
        // 添加嵌套路由配置
        const nestedRouter = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/parent',
                    component: () => 'Parent',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push('parent-beforeEnter-start');
                        await new Promise((resolve) => setTimeout(resolve, 30));
                        concurrentLog.push('parent-beforeEnter-end');
                    },
                    children: [
                        {
                            path: 'child/:id',
                            component: () => 'Child',
                            beforeEnter: async (to, from) => {
                                concurrentLog.push(
                                    `child-beforeEnter-${to.params.id}-start`
                                );
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 20)
                                );
                                concurrentLog.push(
                                    `child-beforeEnter-${to.params.id}-end`
                                );
                            }
                        }
                    ]
                }
            ]
        });

        await nestedRouter.replace('/home');
        concurrentLog = []; // 清空日志

        // 快速连续导航到嵌套路由
        const promise1 = nestedRouter.push('/parent/child/1');
        const promise2 = nestedRouter.push('/parent/child/2');

        const [result1, result2] = await Promise.all([promise1, promise2]);

        // 第一个导航应该被取消
        expect(result1.status).toBe('aborted');
        // 第二个导航应该成功
        expect(result2.status).toBe('success');
        expect(nestedRouter.route.path).toBe('/parent/child/2');

        // 父路由守卫应该至少开始一次
        expect(concurrentLog).toContain('parent-beforeEnter-start');

        nestedRouter.destroy();
    });

    test('并发导航不影响路由状态一致性', async () => {
        concurrentLog = []; // 清空日志

        // 发起多个并发导航到同一目标
        const promises = Array.from({ length: 5 }, (_, i) =>
            concurrentRouter.push(`/user/${i + 1}`)
        );

        const results = await Promise.all(promises);

        // 只有最后一个应该成功，前面的都应该被取消
        const successResults = results.filter((r) => r.status === 'success');
        const abortedResults = results.filter((r) => r.status === 'aborted');

        expect(successResults).toHaveLength(1);
        expect(abortedResults).toHaveLength(4);

        // 路由状态应该是最后一个成功的导航
        const successResult = successResults[0];
        expect(concurrentRouter.route.path).toBe(successResult.path);
        expect(concurrentRouter.route.params.id).toBe(successResult.params.id);
    });

    test('从异步守卫路由离开到另一个异步守卫路由', async () => {
        // 先导航到有异步守卫的路由
        await concurrentRouter.push('/user/initial');
        concurrentLog = []; // 清空日志

        // 发起导航到不同的路由配置，这样会触发 beforeLeave
        const promise1 = concurrentRouter.push('/slow');

        // 在第一个导航执行期间发起第二个导航
        await new Promise((resolve) => setTimeout(resolve, 5));
        const promise2 = concurrentRouter.push('/fast');

        const [result1, result2] = await Promise.all([promise1, promise2]);

        // 检查最终状态
        expect(concurrentRouter.route.path).toBe('/fast');

        // 由于时机问题，第一个导航可能成功或被取消，我们主要验证最终状态正确
        if (result1.status === 'aborted') {
            // 第一个导航被取消，第二个成功
            expect(result2.status).toBe('success');
        } else {
            // 第一个导航成功完成，第二个可能被取消或重定向
            // 但最终路由状态应该正确
            expect(concurrentRouter.route.path).toBe('/fast');
        }

        // beforeLeave 应该至少开始执行（从 /user/initial 离开）
        expect(concurrentLog).toContain('user-beforeLeave-initial-start');
    });
});

describe('Vue Router 官方行为验证测试', () => {
    let officialRouter: Router;
    let officialLog: string[];

    beforeEach(async () => {
        officialLog = [];

        officialRouter = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/users/:id',
                    component: () => 'UserDetail',
                    beforeEnter: (to, from) => {
                        officialLog.push(
                            `beforeEnter-triggered-for-${to.params.id}`
                        );
                    }
                },
                {
                    path: '/posts/:id',
                    component: () => 'PostDetail',
                    beforeEnter: (to, from) => {
                        officialLog.push(
                            `posts-beforeEnter-triggered-for-${to.params.id}`
                        );
                    }
                }
            ]
        });

        await officialRouter.replace('/home');
    });

    afterEach(() => {
        officialRouter.destroy();
    });

    test('beforeEnter 只在进入不同路由时触发，参数变化时不触发', async () => {
        officialLog = []; // 清空日志

        // 首次进入 /users/:id 路由 - 应该触发 beforeEnter
        await officialRouter.push('/users/1');
        expect(officialLog).toEqual(['beforeEnter-triggered-for-1']);

        officialLog = []; // 清空日志

        // 在相同路由内参数变化 - 不应该触发 beforeEnter
        await officialRouter.push('/users/2');
        expect(officialLog).toEqual([]);

        officialLog = []; // 清空日志

        // 导航到不同路由 - 应该触发新路由的 beforeEnter
        await officialRouter.push('/posts/123');
        expect(officialLog).toEqual(['posts-beforeEnter-triggered-for-123']);

        officialLog = []; // 清空日志

        // 回到之前的路由 - 应该触发 beforeEnter
        await officialRouter.push('/users/3');
        expect(officialLog).toEqual(['beforeEnter-triggered-for-3']);
    });

    test('beforeEnter 在查询参数变化时不触发', async () => {
        // 首次进入
        await officialRouter.push('/users/1');
        officialLog = []; // 清空日志

        // 查询参数变化 - 不应该触发 beforeEnter
        await officialRouter.push('/users/1?tab=profile');
        expect(officialLog).toEqual([]);

        // 再次查询参数变化 - 不应该触发 beforeEnter
        await officialRouter.push('/users/1?tab=settings');
        expect(officialLog).toEqual([]);
    });

    test('beforeEnter 在 hash 变化时不触发', async () => {
        // 首次进入
        await officialRouter.push('/users/1');
        officialLog = []; // 清空日志

        // Hash 变化 - 不应该触发 beforeEnter
        await officialRouter.push('/users/1#profile');
        expect(officialLog).toEqual([]);

        // 再次 hash 变化 - 不应该触发 beforeEnter
        await officialRouter.push('/users/1#settings');
        expect(officialLog).toEqual([]);
    });

    test('嵌套路由中父路由的 beforeEnter 行为', async () => {
        // 创建新的路由器用于嵌套测试
        const nestedRouter = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/dashboard',
                    component: () => 'Dashboard',
                    beforeEnter: (to, from) => {
                        officialLog.push('dashboard-beforeEnter');
                    },
                    children: [
                        {
                            path: 'profile',
                            component: () => 'Profile'
                        },
                        {
                            path: 'settings',
                            component: () => 'Settings'
                        }
                    ]
                },
                {
                    path: '/home',
                    component: () => 'Home'
                }
            ]
        });

        await nestedRouter.replace('/home');
        officialLog = []; // 清空日志

        // 首次进入嵌套路由 - 应该触发父路由的 beforeEnter
        await nestedRouter.push('/dashboard/profile');
        expect(officialLog).toEqual(['dashboard-beforeEnter']);

        officialLog = []; // 清空日志

        // 在同一父路由的子路由间切换 - 不应该触发父路由的 beforeEnter
        await nestedRouter.push('/dashboard/settings');
        expect(officialLog).toEqual([]);

        officialLog = []; // 清空日志

        // 离开后再次进入 - 应该触发父路由的 beforeEnter
        await nestedRouter.push('/home');
        await nestedRouter.push('/dashboard/profile');
        expect(officialLog).toEqual(['dashboard-beforeEnter']);

        nestedRouter.destroy();
    });
});

describe('Vue Router 官方导航解析流程验证', () => {
    let flowRouter: Router;
    let flowLog: string[];
    let stepCounter: number;

    beforeEach(async () => {
        flowLog = [];
        stepCounter = 0;

        const logStep = (description: string) => {
            stepCounter++;
            flowLog.push(`${stepCounter}. ${description}`);
        };

        flowRouter = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/from',
                    component: () => 'FromComponent',
                    beforeLeave: (to, from) => {
                        logStep('beforeRouteLeave in deactivated component');
                    }
                },
                {
                    path: '/to/:id',
                    component: () => 'ToComponent',
                    beforeEnter: (to, from) => {
                        logStep('beforeEnter in route config');
                    },
                    beforeUpdate: (to, from) => {
                        logStep('beforeRouteUpdate in reused component');
                    }
                }
            ]
        });

        // 注册全局守卫
        flowRouter.beforeEach((to, from) => {
            logStep('global beforeEach');
        });

        flowRouter.afterEach((to, from) => {
            logStep('global afterEach');
        });

        await flowRouter.replace('/from');
        flowLog = []; // 清空初始导航的日志
        stepCounter = 0;
    });

    afterEach(() => {
        flowRouter.destroy();
    });

    test('导航到新路由的完整流程顺序', async () => {
        // 从 /from 导航到 /to/123 (完全不同的路由)
        await flowRouter.push('/to/123');

        // 根据 Vue Router 官方文档，执行顺序应该是：
        // 1. Navigation triggered
        // 2. Call beforeRouteLeave guards in deactivated components
        // 3. Call global beforeEach guards
        // 4. Call beforeRouteUpdate guards in reused components (此处不适用)
        // 5. Call beforeEnter in route configs
        // 6. Resolve async route components (在我们的实现中已处理)
        // 7. Call beforeRouteEnter in activated components (我们使用 beforeEnter)
        // 8. Call global beforeResolve guards (暂时不支持)
        // 9. Navigation confirmed
        // 10. Call global afterEach hooks

        expect(flowLog).toEqual([
            '1. beforeRouteLeave in deactivated component',
            '2. global beforeEach',
            '3. beforeEnter in route config',
            '4. global afterEach'
        ]);
    });

    test('同一路由参数变化的流程顺序', async () => {
        // 先导航到目标路由
        await flowRouter.push('/to/123');
        flowLog = []; // 清空日志
        stepCounter = 0;

        // 然后在同一路由内参数变化
        await flowRouter.push('/to/456');

        // 参数变化应该触发 beforeUpdate 而不是 beforeEnter
        expect(flowLog).toEqual([
            '1. global beforeEach',
            '2. beforeRouteUpdate in reused component',
            '3. global afterEach'
        ]);
    });

    test('复杂嵌套路由的流程顺序', async () => {
        // 创建复杂嵌套路由场景
        const complexRouter = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/app',
                    component: () => 'App',
                    beforeLeave: (to, from) => {
                        flowLog.push(`${++stepCounter}. App beforeLeave`);
                    },
                    beforeEnter: (to, from) => {
                        flowLog.push(`${++stepCounter}. App beforeEnter`);
                    },
                    children: [
                        {
                            path: 'dashboard',
                            component: () => 'Dashboard',
                            beforeLeave: (to, from) => {
                                flowLog.push(
                                    `${++stepCounter}. Dashboard beforeLeave`
                                );
                            },
                            beforeEnter: (to, from) => {
                                flowLog.push(
                                    `${++stepCounter}. Dashboard beforeEnter`
                                );
                            }
                        },
                        {
                            path: 'profile/:id',
                            component: () => 'Profile',
                            beforeLeave: (to, from) => {
                                flowLog.push(
                                    `${++stepCounter}. Profile beforeLeave`
                                );
                            },
                            beforeEnter: (to, from) => {
                                flowLog.push(
                                    `${++stepCounter}. Profile beforeEnter`
                                );
                            }
                        }
                    ]
                },
                {
                    path: '/home',
                    component: () => 'Home',
                    beforeEnter: (to, from) => {
                        flowLog.push(`${++stepCounter}. Home beforeEnter`);
                    }
                }
            ]
        });

        complexRouter.beforeEach((to, from) => {
            flowLog.push(`${++stepCounter}. global beforeEach`);
        });

        complexRouter.afterEach((to, from) => {
            flowLog.push(`${++stepCounter}. global afterEach`);
        });

        await complexRouter.replace('/home');
        flowLog = []; // 清空日志
        stepCounter = 0;

        // 从 /home 导航到嵌套路由 /app/dashboard
        await complexRouter.push('/app/dashboard');

        // 应该按父到子顺序执行 beforeEnter
        expect(flowLog).toEqual([
            '1. global beforeEach',
            '2. App beforeEnter',
            '3. Dashboard beforeEnter',
            '4. global afterEach'
        ]);

        flowLog = []; // 清空日志
        stepCounter = 0;

        // 从 /app/dashboard 导航到 /app/profile/123
        await complexRouter.push('/app/profile/123');

        // Dashboard 离开，Profile 进入，App 保持不变
        expect(flowLog).toEqual([
            '1. Dashboard beforeLeave',
            '2. global beforeEach',
            '3. Profile beforeEnter',
            '4. global afterEach'
        ]);

        flowLog = []; // 清空日志
        stepCounter = 0;

        // 从 /app/profile/123 导航到 /home（完全离开嵌套结构）
        await complexRouter.push('/home');

        // 应该按子到父顺序执行 beforeLeave
        expect(flowLog).toEqual([
            '1. Profile beforeLeave',
            '2. App beforeLeave',
            '3. global beforeEach',
            '4. Home beforeEnter',
            '5. global afterEach'
        ]);

        complexRouter.destroy();
    });
});
