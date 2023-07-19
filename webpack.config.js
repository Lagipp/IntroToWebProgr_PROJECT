/* https://stackoverflow.com/q/71602863 */
/* https://www.youtube.com/watch?v=5IG4UmULyoA */

const path = require('path')

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'compiled.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'auto',
    },

    devServer: {
        port: 9000,
        static: {
            directory: path.join(__dirname, '/')
        }
    }
}