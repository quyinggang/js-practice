const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');
const nodeExternals = require('webpack-node-externals');

const serverConfig = {
  entry: './src/server/index.js',
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    /**
     * publicPath：设置公共路径，实质上输出到output.path目录的每个文件，都将从output.publicPath位置引用，包括分割出去的chunk等
     * globalObject：全局对象，当输出为umd时此选项决定使用哪个全局对象来挂载library，类web目标默认是self，为了在浏览器和Node中均可用可设置为this
     * 服务端渲染如果存在异步加载组件，需要设置否则报错
     */
    publicPath: '/dist/',
    globalObject: 'this'
  },
  // node环境程序不需要将内置模块以及第三方Node框架打包到输出文件中
  externalsPresets: { node: true },
  externals: [nodeExternals()]
};

module.exports = merge(baseConfig, serverConfig);