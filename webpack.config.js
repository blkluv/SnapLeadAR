// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";

    return {
        mode: isProduction ? "production" : "development",
        entry: "./src/index.js",
        output: {
            path: path.resolve(__dirname, "build"),
            filename: isProduction
                ? "js/[name].[contenthash].js"
                : "js/[name].js",
            publicPath: "/",
        },
        resolve: {
            extensions: [".js", ".jsx", ".json"],
            alias: {
                "@": path.resolve(__dirname, "src"),
                "@components": path.resolve(__dirname, "src/components"),
                "@pages": path.resolve(__dirname, "src/pages"),
            },
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-env",
                                "@babel/preset-react",
                            ],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction
                            ? MiniCssExtractPlugin.loader
                            : "style-loader",
                        "css-loader",
                        "postcss-loader",
                    ],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./public/index.html",
            }),
            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash].css",
            }),
            new Dotenv(),
        ],
        devServer: {
            port: 3000,
            historyApiFallback: true,
            proxy: {
                "/api": "http://localhost:8016",
            },
        },
    };
};
