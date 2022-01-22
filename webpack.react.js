const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/renderer.tsx',
    target: 'electron-renderer',
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist/main.js'),
        compress: true,
        port: 9000
    },
    resolve: {
        alias: {
            ['@']: path.resolve(__dirname, 'src')
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                include: /src/,
                use: [{ loader: 'ts-loader' }]
            },
            {
                test: /\.(sass|css|scss)$/,
                use: ['style-loader', 'css-loader', 'sass-loader',  ]
            }
        ]
    },
    output: {
        path: __dirname + '/dist',
        filename: 'main.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new CopyPlugin({
            patterns: [
                { from: "src/data", to: "data" },
            ],
        }),
    ]
};
