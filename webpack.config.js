const HtmlWebpackPlugin = require("html-webpack-plugin");

const env = process.env.NODE_ENV || "development"

module.exports = {
    mode: env,
    entry: "./app/index.js",
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./app/index.html"
        })
    ]
}