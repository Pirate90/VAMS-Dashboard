const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  outputDir: '../backend/public',
  transpileDependencies: true,
  devServer: {
    proxy: {
      '^/data': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '^/doubt': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '^/iuu': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '^/tracing': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '^/tiles': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '^/trenchmap': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '^/districtmap': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '^/shape': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
