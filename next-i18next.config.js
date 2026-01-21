// next-i18next.config.js
module.exports = {
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'vi'],
    },
  };
  
  // next.config.js
  const { i18n } = require('./next-i18next.config');
  
  module.exports = {
    i18n,
  };