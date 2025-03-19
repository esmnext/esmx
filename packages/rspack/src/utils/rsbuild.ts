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
            multiCompiler.watch({}, (err, stats) => {});
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
