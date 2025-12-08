/**
 * Internationalization (i18n) configuration settings.
 * @returns An object containing i18n configuration.
 */
export default () => ({
  fallbackLanguage: process.env.I18N_FALLBACK_LANGUAGE || 'en', // Default fallback language to English
  // Add other i18n specific settings here
});
