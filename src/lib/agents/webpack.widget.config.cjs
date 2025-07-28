const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './widget.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'altan-widget.js',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      // Use the same React instance to avoid conflicts
      'react': path.resolve(__dirname, '../../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../../node_modules/react-dom'),
    },
  },
  externals: {
    // Don't bundle React if it's already on the page (optional)
    // react: 'React',
    // 'react-dom': 'ReactDOM',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.BannerPlugin({
      banner: `
Altan AI Widget v1.0.0
One-line integration for any website
https://altan.ai

Usage:
<script 
  src="https://altan.ai/sdk/altan-widget.js"
  data-account-id="your-account-id"
  data-agent-id="your-agent-id"
></script>
      `,
      raw: false,
    }),
  ],
  optimization: {
    minimize: true,
    splitChunks: false, // Bundle everything into one file
  },
  performance: {
    maxAssetSize: 1000000, // 1MB limit warning
    maxEntrypointSize: 1000000,
  },
}; 