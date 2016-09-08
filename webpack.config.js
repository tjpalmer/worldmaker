module.exports = {
  entry: "./src/main.ts",
  output: {filename: "app.js"},
  externals: {
    three: "THREE",
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style!css",
      }, {
        test: /\.json$/,
        loader: 'json',
      }, {
        test: /\.ts$/,
        loader: 'awesome-typescript',
      },
    ],
    preLoaders: [
      {
        test: /\.ts$/,
        loader: "tslint",
      },
    ],
  },
  resolve: {
    extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
  },
  tslint: {
    configuration: {
      rules: {
        curly: true,
        indent: [true, 'spaces'],
        'no-constructor-vars': true,
        'no-var-keyword': true,
        quotemark: [true, 'single', 'avoid-escape'],
      },
    },
  },
};
