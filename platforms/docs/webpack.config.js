/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const portfinder = require('portfinder');
const { merge } = require('webpack-merge');

const packageResolve = (packageName) => path.join(__dirname, '../../packages', packageName, 'src');

const isProd = process.env.NODE_ENV === 'production';

const imageInlineSizeLimit = 10000;

const publicPath = isProd ? '/' : '/';

const envsDefinitions = {
  PUBLIC_PATH: publicPath,
  NODE_ENV: isProd ? 'production' : 'development',
};

const envs = {};

Object.keys(envsDefinitions).forEach((key) => {
  const newKey = `process.env.${key}`;
  envs[newKey] = JSON.stringify(envsDefinitions[key]);
});

const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        shippedProposals: true,
        modules: false,
        targets: {
          // esmodules: true,
          // browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 11'],
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: false,
        // useESModules: true,
      },
    ],
    '@babel/plugin-syntax-dynamic-import',
    !isProd && require.resolve('react-refresh/babel'),
  ].filter(Boolean),
};

const getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    !isProd
      ? 'style-loader'
      : {
          loader: MiniCssExtractPlugin.loader,
          options: {},
        },
    {
      loader: 'css-loader',
      options: { sourceMap: true, ...cssOptions },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    const options = {
      sourceMap: true,
    };
    if (preProcessor === 'sass-loader') {
      options.implementation = require('dart-sass');
      options.sassOptions = {
        fiber: require('fibers'),
      };
    }
    loaders.push({
      loader: preProcessor,
      options,
    });
  }
  return loaders;
};

const getStyleRules = (test, moduleTest, cssOptions, preProcessor) => {
  const rule1 = {
    test: moduleTest,
    use: getStyleLoaders(
      {
        esModule: true,
        ...cssOptions,
        modules: {
          localIdentName: !isProd ? '[local]__[hash:base64]' : '[hash:base64]',
        },
        // 支持驼峰导入
        localsConvention: 'camelCase',
      },
      preProcessor,
    ),
  };
  const rule2 = {
    test,
    exclude: moduleTest,
    use: getStyleLoaders(
      {
        esModule: true,
        ...cssOptions,
        modules: false,
      },
      preProcessor,
    ),
    sideEffects: true,
  };
  return [rule1, rule2];
};

const defaultConfig = {
  mode: isProd ? 'production' : 'development',
  bail: isProd,
  devtool: isProd ? 'source-map' : 'cheap-module-source-map',
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: isProd ? path.resolve(__dirname, 'dist') : undefined,
    pathinfo: !isProd,
    filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
    chunkFilename: isProd
      ? 'static/js/[name].[contenthash:8].chunk.js'
      : 'static/js/[name].chunk.js',
    publicPath,
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.mdx'],
    alias: {
      'react-native': 'react-native-web',
      react: require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      '@mdx-js/react': require.resolve('@mdx-js/react'),
      'styled-components': require.resolve('styled-components'),
      // 'react-dom$': 'react-dom'
      '@xl-vision/utils': packageResolve('utils'),
      '@xl-vision/styled-engine': packageResolve('styled-engine'),
      '@xl-vision/icons': packageResolve('icons'),
      '@xl-vision/react': packageResolve('react'),
      '@xl-vision/editor': packageResolve('editor'),
    },
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
            annotation: true,
          },
        },
      }),
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          // Added for profiling in devtools
          // keep_classnames: true,
          // keep_fnames: true,
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        parallel: true,
      }),
    ],
    // Keep the runtime chunk separated to enable long term caching
    // https://twitter.com/wSokra/status/969679223278505985
    // https://github.com/facebook/create-react-app/issues/5358
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: imageInlineSizeLimit,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            test: [/\.jsx?$/, /\.tsx?$/],
            loader: require.resolve('babel-loader'),
            exclude: '/node_modules/',
            options: {
              babelrc: false,
              configFile: false,
              compact: false,
              cacheDirectory: true,
              ...babelConfig,
            },
          },
          {
            test: [/\.mdx?$/],
            exclude: '/node_modules/',
            use: [
              {
                loader: require.resolve('babel-loader'),
                options: {
                  babelrc: false,
                  configFile: false,
                  compact: false,
                  cacheDirectory: true,
                  ...babelConfig,
                },
              },
              {
                loader: require.resolve('./mdLoader'),
              },
            ],
          },
          ...getStyleRules(/\.css$/, /\.module\.css$/, {
            importLoaders: 1,
          }),
          ...getStyleRules(
            /\.(scss|sass)$/,
            /\.module\.(scss|sass)$/,
            {
              importLoaders: 2,
            },
            'sass-loader',
          ),
          ...getStyleRules(
            /\.less$/,
            /\.module\.less$/,
            {
              importLoaders: 2,
            },
            'less-loader',
          ),
          ...getStyleRules(
            /\.styl$/,
            /\.module\.styl$/,
            {
              importLoaders: 2,
            },
            'stylus-loader',
          ),
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin(envs),
    new HtmlWebpackPlugin({
      inject: true,
      template: 'template/index.html',
      ...envsDefinitions,
      ...(isProd
        ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
        : undefined),
    }),
    new ForkTsCheckerWebpackPlugin({
      async: !isProd,
      typescript: {
        mode: 'write-references',
        diagnosticOptions: {
          syntactic: true,
        },
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: isProd ? 'public' : '/public',
        },
      ],
    }),
    !isProd && new ReactRefreshWebpackPlugin(),
    !isProd && new CaseSensitivePathsPlugin(),
    isProd &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
  ].filter(Boolean),
  devServer: {
    compress: true,
    historyApiFallback: true,
    host: 'localhost',
    hot: true,
  },
};

module.exports = async () => {
  const port = await portfinder.getPortPromise();
  return merge(defaultConfig, {
    devServer: {
      port,
    },
  });
};
