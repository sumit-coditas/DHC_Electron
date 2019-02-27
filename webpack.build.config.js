const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const BabiliPlugin = require('babili-webpack-plugin')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = path.resolve(__dirname, 'src/client');
const outputDirectory = 'dist';

module.exports = {
    mode: 'production',
    entry: [
        './src/client/index.js',
        './src/client/styles/main.scss'
    ],
    output: {
        path: path.join(__dirname, outputDirectory),
        publicPath: './',
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
    target: 'electron-renderer',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/client/index.html',
            favicon: './src/client/assets/images/favicon.ico'
        })
    ],
    devtool: 'cheap-source-map',
    devServer: {
        port: 3000,
        proxy: {
            '/api': 'http://localhost:8080',
            '/socket.io': 'http://localhost:8080'
        },
        historyApiFallback: true,
        before() {
            spawn(
                'electron',
                ['.'],
                { shell: true, env: process.env, stdio: 'inherit' }
            )
                .on('close', code => process.exit(0))
                .on('error', spawnError => console.error(spawnError));
        }
    }
};
