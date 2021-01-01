// vue.config.js
module.exports = {
    publicPath :process.env.NODE_ENV === 'production'
    ? '/lunarcalendar/'
    : '/',
    configureWebpack: {
      devtool: 'source-map'
    }
  }