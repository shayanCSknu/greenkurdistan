const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        { from: 'css', to: 'css' },
        { from: 'js/vendor', to: 'js/vendor' },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'icon.png', to: 'icon.png' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
        { from: 'weather.html', to: 'weather.html' },
        { from: 'climate.html', to: 'climate.html' },
        { from: 'actions.html', to: 'actions.html' },
        { from: 'toolkit.html', to: 'toolkit.html' },
        { from: 'impact.html', to: 'impact.html' },
        { from: 'reports.html', to: 'reports.html' },
        { from: 'js/reports.js', to: 'js/reports.js' },
        { from: 'js/community-ui.js', to: 'js/community-ui.js' },
        { from: 'js/report-translations.js', to: 'js/report-translations.js' },
        { from: 'js/climate-history.js', to: 'js/climate-history.js' },
        { from: 'js/site-runtime.js', to: 'js/site-runtime.js' },
        { from: 'js/site-translations.js', to: 'js/site-translations.js' },
        { from: 'js/site-i18n.js', to: 'js/site-i18n.js' },
        { from: 'js/map.js', to: 'js/map.js' },
        { from: 'js/report-map.js', to: 'js/report-map.js' },
        { from: 'sw.js', to: 'sw.js' },
      ],
    }),
  ],
});
