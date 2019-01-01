/// <reference path="node_modules/typescript/lib/lib.esnext.d.ts" />
/* eslint-disable no-console, import/max-dependencies */
import * as fs from 'fs';
import * as path from 'path';
import { Configuration, Options, Entry } from 'webpack';
import webpack = require('webpack');

const sourcePath = path.join(__dirname, 'src');
const buildPath = path.join(__dirname, 'dist/output');
const context = __dirname;
const pollInterval = 1000;
process['traceDeprecation'] = false;

const defaultOptions = {
    libs: process.argv.indexOf('--env.libs') !== -1,
    style: process.argv.indexOf('--env.style') !== -1,
    test: false,
    coverage: false,
    prod: process.argv.indexOf('--mode=production') !== -1 || process.argv.indexOf('--env.prod') !== -1,
    get dev(): boolean {
        return !this.prod;
    },
    get hmr(): boolean {
        if (process.argv.indexOf('--no-hmr') !== -1) return false;
        return this.dev;
    },
    get devtool(): string {
        return ('webpack_devtool' in process.env) ? process.env.webpack_devtool : 'cheap-source-map';
    },
    get sourceMap(): boolean {
        const devtool = this.devtool;
        return (!devtool || devtool === '0') ? false : true;
    },
    get mode() {
        return this.prod ? 'production' : 'development';
    }
};

type ConfigOptions = Partial<Record<keyof typeof defaultOptions, any>>;

export = (options: ConfigOptions = {}) => {
    options = { ...defaultOptions, ...options };
    for (const [key, value] of Object.entries(options)) {
        (value === true) ? process.stdout.write(`${key} `) : (process.stdout.write(value ? `${key}:${value} ` : ''));
    }
    const stats: Options.Stats = {
        version: false,
        maxModules: 0,
        children: false,
        warningsFilter: [],
    };
    if (options.test) {
        Object.assign(stats, {
            timings: false,
            hash: false,
            // builtAt: false,
            assets: false,
            entrypoints: false,
        } as Options.Stats);
    }
    const watchOptions = {
        ignored: /node_modules/,
    };
    function transpileTypeScript(file: string) {
        if (file.slice(-4) === '.tsx' || file.slice(-3) === '.ts') return true;
        const result = [
            'pupa',
            `1-liners${path.sep}module`,
        ].find((name: string) => file.indexOf(`node_modules${path.sep}${name}`) !== -1);
        return Boolean(result);
    }

    let config: Configuration = {
        mode: options.mode,
        context,
        entry: (() => {
            const result = ['./src/main.tsx'];
            if (options.hmr) {
                result.unshift('node-hot-loader/lib/HmrClient');
                // result.unshift(`webpack/hot/poll?${pollInterval}`);
            }
            return result;
        })(),
        output: {
            path: buildPath,
            publicPath: '',
            chunkFilename: '[name].js',
            filename: '[name].js',
        },
        devtool: ((): Options.Devtool => {
            if (options.test) return 'inline-source-map';
            if (options.prod) return 'source-map';
            return ('webpack_devtool' in process.env) ? process.env.webpack_devtool as any : 'cheap-source-map';
        })(),
        stats,
        target: 'node',
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            modules: ['node_modules'],
        },
        externals: {
            'libui-node': 'commonjs libui-node',
        },
        watchOptions,
        module: {
            exprContextCritical: false,
            rules: [
                { parser: { amd: false } },
                {
                    test: transpileTypeScript,
                    use: [
                        { loader: 'ts-loader', options: { transpileOnly: true } },
                    ],
                },
                ...(options.coverage ? [
                    {
                        enforce: 'post' as any,
                        test: /\.ts$/,
                        loader: 'istanbul-instrumenter-loader',
                        exclude: [
                            /\.spec\.ts$/,
                            /node_modules/,
                            /src[\\/]app[\\/]mocks/,
                        ]
                    }
                ] : []),
            ],
        },
        optimization: {
        },
        plugins: (() => {
            const result: any[] = [];
            if (options.hmr) {
                result.push(new webpack.HotModuleReplacementPlugin());
                // result.push({
                //     apply(compiler: webpack.Compiler) {
                //         // debugger;
                //         (compiler as any).outputPath = buildPath;
                //         const HmrServer = require('node-hot-loader/lib/HmrServer').default;
                //         const hmrServer = new HmrServer({ compiler, fork: true });
                //         compiler.hooks.done.tap('done', hmrServer.compilerDone.bind(hmrServer));
                //         compiler.hooks.compile.tap('invalid', hmrServer.compilerInvalid.bind(hmrServer));
                //     }
                // });
            }
            if (options.dev) {
                result.push(new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }));
            }
            result.push(new webpack.NamedModulesPlugin());
            if (options.prod) {
                const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
                result.push(
                    new webpack.DefinePlugin({
                        'process.env.NODE_ENV': JSON.stringify('production'),
                    }),
                    new ModuleConcatenationPlugin(),
                    new webpack.LoaderOptionsPlugin({
                        debug: false,
                        options: { context },
                    }),
                );
            }
            const envName = ('env_name' in process.env) ? process.env.env_name : undefined;
            const environmentFile = `src/environment.${envName}.ts`;
            if (options.dev && !options.test && envName && fs.existsSync(environmentFile)) {
                process.stdout.write(`environment: ${envName} `);
                result.push(new webpack.NormalModuleReplacementPlugin(/src[/\\]environment\.ts$/, result => result.resource = path.resolve(environmentFile)));
            }
            return result;
        })(),
    };

    if (options.test) {
        config.entry = false as any;
    }

    return config;
};
