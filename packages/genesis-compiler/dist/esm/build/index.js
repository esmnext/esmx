import chalk from 'chalk';
import webpack from 'webpack';
import { AnalyzerPlugin } from '../plugins/analyzer';
import { InstallPlugin } from '../plugins/install';
import { deleteFolder } from '../utils/index';
import { ClientConfig, ServerConfig } from '../webpack/index';
const error = chalk.bold.red;
const warning = chalk.keyword('orange');
export class Build {
    constructor(ssr, options = {}) {
        this.ssr = ssr;
        ssr.plugin.unshift(InstallPlugin);
        if (options.analyzer) {
            ssr.plugin.use(AnalyzerPlugin);
        }
    }
    async start() {
        const { ssr } = this;
        const build = (type, config) => {
            return new Promise((resolve, reject) => {
                const compiler = webpack(config);
                compiler.run((err, stats) => {
                    if (err) {
                        chalk.red(`${type} errors`);
                        console.log(error(err.stack || err.message));
                        return;
                    }
                    const jsonStats = stats.toJson();
                    if (stats.hasErrors()) {
                        chalk.red(`${type} errors`);
                        jsonStats.errors.forEach((err) => console.log(error(err.message)));
                        return resolve(false);
                    }
                    if (stats.hasWarnings()) {
                        chalk.yellow(`${type} warnings`);
                        jsonStats.warnings.forEach((err) => console.log(warning(err.message)));
                    }
                    resolve(true);
                });
            });
        };
        deleteFolder(ssr.outputDir);
        await ssr.plugin.callHook('beforeCompiler', 'build');
        const values = await Promise.all([
            build(`${ssr.name} build client`, await new ClientConfig(ssr).toConfig()),
            build(`${ssr.name} build server`, await new ServerConfig(ssr).toConfig())
        ]);
        await ssr.plugin.callHook('afterCompiler', 'build');
        if (values[0] === false || values[1] === false) {
            console.log(error(`[@fmfe/genesis-compiler] ${ssr.name} Compilation failed, please check the code error`));
            process.exitCode = 1;
        }
        return values;
    }
}
