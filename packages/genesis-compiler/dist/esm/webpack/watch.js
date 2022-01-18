import chalk from 'chalk';
import { Volume } from 'memfs';
import Webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import { InstallPlugin } from '../plugins/install';
import { BaseGenesis } from '../utils';
import { ClientConfig, ServerConfig } from '../webpack';
const error = chalk.bold.red;
const warning = chalk.keyword('orange');
export class WatchClientConfig extends ClientConfig {
    constructor(ssr) {
        super(ssr);
        this.config
            .entry('app')
            .add(`webpack-hot-middleware/client?path=/__webpack__${ssr.publicPath}hot-middleware&timeout=2000&overlay=false`);
        this.config
            .plugin('webpack-hot-replacement')
            .use(Webpack.HotModuleReplacementPlugin);
    }
}
const readFile = (fs, file) => {
    try {
        return fs.readFileSync(file, 'utf-8');
    }
    catch (e) {
        return null;
    }
};
export class Watch extends BaseGenesis {
    constructor(ssr) {
        super(ssr);
        this.mfs = Volume.fromJSON({});
        this.watchData = {};
        ssr.plugin.unshift(InstallPlugin);
    }
    get renderer() {
        if (!this._renderer) {
            throw TypeError(`Please execute 'await new Watch(ssr).start()'`);
        }
        return this._renderer;
    }
    set renderer(renderer) {
        this._renderer = renderer;
    }
    async start() {
        let ready;
        let clientDone = false;
        let serverDone = false;
        let promise = new Promise((resolve) => {
            ready = resolve;
        });
        const onReady = () => {
            if (clientDone && serverDone) {
                ready && ready();
                promise = null;
                ready = null;
            }
        };
        await this.ssr.plugin.callHook('beforeCompiler', 'watch');
        const [clientConfig, serverConfig] = await Promise.all([
            new WatchClientConfig(this.ssr).toConfig(),
            new ServerConfig(this.ssr).toConfig()
        ]);
        const clientCompiler = Webpack(clientConfig);
        const serverCompiler = Webpack(serverConfig);
        serverCompiler.outputFileSystem = this.mfs;
        clientCompiler.outputFileSystem = this.mfs;
        this.devMiddleware = WebpackDevMiddleware(clientCompiler, {
            outputFileSystem: this.mfs,
            publicPath: this.ssr.publicPath,
            index: false
        });
        this.hotMiddleware = WebpackHotMiddleware(clientCompiler, {
            heartbeat: 5000,
            path: `/__webpack__${this.ssr.publicPath}hot-middleware`
        });
        const watchOptions = {
            aggregateTimeout: 300,
            poll: 1000
        };
        const clientOnDone = (stats) => {
            const jsonStats = stats.toJson();
            if (stats.hasErrors()) {
                jsonStats.errors.forEach((err) => console.log(error(err.message)));
            }
            if (stats.hasWarnings()) {
                jsonStats.warnings.forEach((err) => console.log(warning(err.message)));
            }
            if (stats.hasErrors())
                return;
            this.watchData.client = {
                fs: this.mfs,
                data: JSON.parse(readFile(this.mfs, this.ssr.outputClientManifestFile))
            };
            this.notify();
            clientDone = true;
            onReady();
        };
        const serverOnWatch = () => {
            const data = JSON.parse(readFile(serverCompiler.outputFileSystem, this.ssr.outputServerBundleFile));
            this.watchData.server = {
                fs: serverCompiler.outputFileSystem,
                data
            };
            this.notify();
            serverDone = true;
            onReady();
        };
        clientCompiler.hooks.done.tap('build done', clientOnDone);
        serverCompiler.watch(watchOptions, serverOnWatch);
        return promise.then(async () => {
            await this.ssr.plugin.callHook('afterCompiler', 'watch');
        });
    }
    // 这里应该提供销毁实例的方法
    destroy() { }
    async notify() {
        const { client, server } = this.watchData;
        if (!client || !server)
            return;
        const { ssr } = this;
        if (this._renderer) {
            this._renderer.hotUpdate({ client, server });
        }
        else {
            this._renderer = new ssr.Renderer(ssr, { client, server });
        }
    }
}
