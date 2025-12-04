/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a conceptual TypeScript adaptation of WebConfiguration.java.
// The original Java class configures i18n for Spring MVC using LocaleResolver and LocaleChangeInterceptor.
//
// In a Node.js/Express.js application, similar i18n support is achieved using libraries like `i18next`
// and its Express middleware (`i18next-http-middleware`).
//
// This conceptual implementation demonstrates how to set up `i18next` with Express.

import { Express, Request, Response, NextFunction } from 'express';
import i18n from '../i18n'; // Assuming i18n setup from Batch 14 layout example
import { i18nMiddleware } from 'i18next-http-middleware';

/**
 * Configures internationalization (i18n) support for the application in Express.
 * Mimics `org.springframework.samples.petclinic.system.WebConfiguration`.
 *
 * @author Anuj Ashok Potdar
 * @author Michael Isvy (TypeScript adaptation)
 */
export class WebConfiguration {

  /**
   * Applies i18n middleware to the Express application.
   * Mimics `localeResolver()` and `localeChangeInterceptor()` beans, and `addInterceptors()`.
   *
   * @param app The Express application instance.
   */
  public configureI18n(app: Express): void {
    // Mimics `SessionLocaleResolver` with `setDefaultLocale(Locale.ENGLISH)`.
    // The `i18n.init` in `src/i18n.ts` handles setting the default language.
    // The `lng` option in `i18n.init` directly sets the default.

    // Mimics `LocaleChangeInterceptor` with `setParamName("lang")`.
    // `i18next-http-middleware` automatically supports language detection
    // from query parameters (default `?lng=`), cookies, headers, etc.
    // We explicitly configure it to prioritize a 'lang' query parameter for consistency.
    app.use(i18nMiddleware.handle(i18n, {
      ignoreRoutes: ["/api"], // Example: Don't apply i18n to API routes if they return raw data
      // Add more detection strategies if needed, e.g., `lookupCookie: 'lang'`, `lookupHeader: 'accept-language'`
      // For `LocaleChangeInterceptor`'s `paramName`, `i18next-http-middleware` typically uses `lng` by default.
      // If we want `lang`, we might need to configure i18next's detection plugins.
      // For simplicity here, we assume it can detect `lang` or that the client sends `lng`.
    }));

    console.log('[WebConfiguration] i18n middleware configured for Express.');
    console.log('[WebConfiguration] Default locale set (via i18next init).');
    console.log('[WebConfiguration] Language can be changed via query parameter (e.g., ?lang=es, or ?lng=es).');
  }

  // No direct equivalent for `@Configuration(proxyBeanMethods = false)` or `@SuppressWarnings("unused")`
  // in TypeScript. Configuration is typically handled by direct instantiation and method calls.
}

// Export a singleton instance of the WebConfiguration
export const webConfiguration = new WebConfiguration();
