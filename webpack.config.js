const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BugsnagBuildReporterPlugin, BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const outputDirectory = 'dist';

const BUGSNAG_API_KEY = '817ab366d8f0f252b53ca739a4ce6444';

module.exports = {
    entry: [
        './src/client/index.js',
        './src/client/styles/main.scss'
    ],
    output: {
        path: path.join(__dirname, outputDirectory),
        publicPath: '/',
        filename: 'bundle-[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.js$|.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.scss$|.css$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [{ loader: 'url-loader?limit=15000&name=images/[name].[ext]' }]
            },
            {
                test: /\.mp3$/,
                use: [{ loader: 'url-loader?limit=15000&name=media/[hash].[ext]' }]
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{ loader: 'url-loader?limit=15000&name=fonts/[hash].[ext]' }]
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        port: 3000,
        // open: true,
        proxy: {
            '/api': 'http://localhost:8080',
            '/socket.io': 'http://localhost:8080'
        },
        historyApiFallback: true
    },
    plugins: [
        new CleanWebpackPlugin([outputDirectory]),
        new HtmlWebpackPlugin({
            template: './src/client/index.html',
            favicon: './src/client/assets/images/favicon.ico'
        }),
        new ProgressBarPlugin(),
        new BugsnagBuildReporterPlugin({ apiKey: BUGSNAG_API_KEY, appVersion: '1.0.0' }),
        new BugsnagSourceMapUploaderPlugin({ apiKey: BUGSNAG_API_KEY, appVersion: '1.0.0', publicPath: '/', overwrite: true }),
    ],
    optimization: {
        splitChunks: {
            // include all types of chunks
            chunks: 'all'
        }
    }
};
