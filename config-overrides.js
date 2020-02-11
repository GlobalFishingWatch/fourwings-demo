/* config-overrides.js */

// const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

// module.exports = function override(config, env) {
//   config.plugins = config.plugins.map(plugin => {
//     // allows custom service worker (defined at swSrc, while swDest follows original CRA config)
//     if (plugin.constructor.name === 'GenerateSW') {
//       // return new WorkboxWebpackPlugin.InjectManifest({
//       //   swSrc: './src/sw.js',
//       //   swDest: process.env.NODE_ENV === 'production' ? 'service-worker.js' : 'custom-service-worker.js'
//       // })
//       return null
//     }
//     return plugin
//   })
//   return config

// } 