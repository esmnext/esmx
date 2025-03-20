import { styleText } from 'node:util';
import { type Compiler, type RspackOptions, rspack } from '@rspack/core';

export function createRsBuild(options: RspackOptions[]) {
    const multiCompiler = rspack(options);
    return {
        get compilers() {
            return multiCompiler.compilers;
        },
        build() {
            return new Promise<boolean>((resolve) => {
                multiCompiler.run((err, stats) => {
                    if (err) {
                        return resolve(false);
                    }
                    if (stats?.hasErrors()) {
                        stats
                            .toJson({ errors: true })
                            ?.errors?.forEach((err) => {
                                console.log(styleText('red', err.message));
                            });
                        return resolve(false);
                    }
                    multiCompiler.close((err) => {
                        if (err) {
                            console.log(styleText('red', err.message));
                            return resolve(false);
                        }
                        process.nextTick(() => {
                            resolve(true);
                        });
                    });
                });
            });
        },
        watch() {
            const watching = multiCompiler.watch({}, (err, stats) => {
                if (err) {
                    console.error(err);
                    return;
                }
                if (stats?.hasErrors()) {
                    stats.toJson({ errors: true })?.errors?.forEach((err) => {
                        console.log(styleText('red', err.message));
                    });
                }
            });

            // 监听进程信号，确保优雅退出
            const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'] satisfies string[];
            signals.forEach((signal) => {
                process.on(signal, () => {
                    watching.close(() => {
                        process.exit();
                    });
                });
            });

            // 监听未捕获的异常和 Promise 拒绝
            process.on('uncaughtException', handleExit);
            process.on('unhandledRejection', handleExit);

            function handleExit(err: Error) {
                console.error(err);
                watching.close(() => {
                    process.exit(1);
                });
            }
        }
    };
}

export class RsBuild {
    private compiler: Compiler;
    public constructor(options: RspackOptions) {
        this.compiler = rspack(options);
    }
    public async build() {
        return new Promise<boolean>((resolve) => {
            this.compiler.run((err, stats) => {
                if (err) {
                    return resolve(false);
                }
                if (stats?.hasErrors()) {
                    stats.toJson({ errors: true })?.errors?.forEach((err) => {
                        console.error(err);
                    });
                    return resolve(false);
                }
                this.compiler.close((err) => {
                    if (err) {
                        console.error(err);
                        return resolve(false);
                    }
                    process.nextTick(() => {
                        resolve(true);
                    });
                });
            });
        });
    }
    public watch() {
        const watching = this.compiler.watch({}, () => {});
    }
}
