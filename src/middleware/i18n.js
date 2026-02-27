const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

/**
 * Multilingual Support (i18n)
 * Configures i18next to handle English, German, Spanish, and Russian.
 */
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'de', 'es', 'ru'],
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}.json')
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      caches: ['cookie']
    }
  });

module.exports = middleware.handle(i18next);
