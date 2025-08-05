import { styleText } from 'node:util';
import { type RspackOptions, rspack } from '@rspack/core';

function showError(message: string) {
    console.error(styleText('red', message));
}

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
                        showError(err.message);
                        return resolve(false);
                    }
                    if (stats?.hasErrors()) {
                        stats
                            .toJson({ errors: true })
                            ?.errors?.forEach((err) => {
                                showError(err.message);
                            });
                        return resolve(false);
                    }
                    multiCompiler.close((err) => {
                        if (err) {
                            showError(err.message);
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
                    console.log(styleText('red', err.message));
                    return;
                }
                if (stats?.hasErrors()) {
                    stats.toJson({ errors: true })?.errors?.forEach((err) => {
                        console.log(styleText('red', err.message));
                    });
                }
            });

            // Listen to process signals to ensure graceful shutdown
            const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'] satisfies string[];
            signals.forEach((signal) => {
                process.on(signal, () => {
                    watching.close(() => {
                        process.exit();
                    });
                });
            });

            // Listen to uncaught exceptions and Promise rejections
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
