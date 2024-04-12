const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');

const clientConfig = {
  entry: './src/client/index.js',
  output: {
    clean: true,
    path: path.resolve(__dirname, 'public'),
    filename: 'index.js'
  },
  // 避免react、react-dom打包（通过cdn方式引入）
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};

module.exports = merge(baseConfig, clientConfig);