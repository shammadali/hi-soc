const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const WebpackCleanupPlugin = require("webpack-cleanup-plugin");

const alias = {
    "@frontend/app-state": path.resolve("./frontend/app-state"),
    "@frontend/attribute-tree": path.resolve("./frontend/ui/chord/attribute-tree"),
    "@backend/api": path.resolve("./backend/business/interfaces")
};

module.exports = [
    /** Backend */
    {
        context: path.join(__dirname, "/backend"),
        entry: "./app.ts",
        externals: [nodeExternals()],
        module: {
            rules: [
                {
                    test: /[.][tj]sx?$/,
                    use: "ts-loader"
                }
            ]
        },
        output: {
            path: path.join(__dirname, "/dist"),
            filename: "app.js"
        },
        resolve: {
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
        },
        target: "node",
        plugins: [
            new webpack.SourceMapDevToolPlugin({
                test: /[.]js$/,
                filename: "[file].map",
                moduleFilenameTemplate: "[absolute-resource-path]",
                sourceRoot: path.join(__dirname, "backend"),
                noSources: true
            })
        ],
        node: {
            __dirname: true
        }
    },
    /** Frontend */
    {
        context: path.join(__dirname, "/frontend"),
        entry: [
            "core-js",
            "./app.scss",
            "./app.tsx"
        ],
        devtool: "source-maps",
        module: {
            rules: [
                {
                    test: /[.]tsx?$/,
                    use: "ts-loader"
                },
                {
                    test: /[.]scss$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        {
                            loader: "sass-loader",
                            options: {
                                includePaths: [
                                    path.resolve(__dirname, "node_modules/bootstrap-sass/assets/stylesheets")
                                ]
                            }
                        }
                    ]
                },
                {
                    test: /[.]woff([?]v=\d[.]\d[.]\d)?$/,
                    use: {
                        loader: "url-loader",
                        options: {
                            limit: 10000,
                            minetype: "application/font-woff"
                        }
                    }
                },
                {
                    test: /[.](ttf|eot|svg)([?]v=\d[.]\d[.]\d)?$/,
                    use: "file-loader"
                }
            ]
        },
        node: {
            __dirname: false
        },
        output: {
            path: path.join(__dirname, "/dist/assets"),
            filename: "app.[hash].js"
        },
        resolve: {
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
            alias
        },
        target: "web",
        plugins: [
            new HtmlWebpackPlugin({
                title: "PerSoN VIS",
                inject: true,
                template: "index.html"
            }),
            new ExtractTextPlugin("app.[hash].css"),
            new WebpackCleanupPlugin({
                exclude: ["index.html"]
            })
            // new webpack.DefinePlugin({
            //     'process.env': {
            //         NODE_ENV: JSON.stringify("production")
            //     }
            // }),
            // new webpack.optimize.UglifyJsPlugin()
        ]
    }
];