import React from 'react';
import { useTranslation } from 'react-i18next'; // Assuming a react-i18next setup

interface LayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
}

// Conceptual MenuItem component
interface MenuItemProps {
  link: string;
  active: boolean;
  title: string;
  glyph: string; // Font Awesome icon name
  text: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ link, active, title, glyph, text }) => {
  const itemClass = active ? 'nav-link active' : 'nav-link';
  return (
    <li className="nav-item">
      <a className={itemClass} href={link} title={title}>
        {/* Mimics <span th:class="'fa fa-'+${glyph}" ...> */}
        <span className={`fa fa-${glyph}`} aria-hidden="true"></span>
        <span className="ms-2">{text}</span> {/* Added margin for spacing */}
      </a>
    </li>
  );
};

/**
 * Conceptual React component for fragments/layout.html.
 * This component defines the overall page structure, including header, navigation,
 * and a content area where child components are rendered. It uses i18n for text.
 */
export const Layout: React.FC<LayoutProps> = ({ children, activeMenu }) => {
  const { t } = useTranslation();

  return (
    <html lang={i18n.language || 'en'}> {/* Dynamically set language */}
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Mimics th:href="@{/resources/images/favicon.png}" */}
        <link rel="shortcut icon" type="image/x-icon" href="/resources/images/favicon.png" />
        {/* Mimics th:text="#{layoutTitle}" */}
        <title>{t('layoutTitle')}</title>
        {/* Mimics webjars for Font Awesome */}
        <link href="/webjars/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
        {/* Mimics th:href="@{/resources/css/petclinic.css}" */}
        <link rel="stylesheet" href="/resources/css/petclinic.css" />
      </head>
      <body>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark" role="navigation"> {/* Added bg-dark for navbar-dark to work */}
          <div className="container-fluid">
            {/* Mimics <a class="navbar-brand" th:href="@{/}"><span></span></a> */}
            <a className="navbar-brand" href="/"><span></span></a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-navbar">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="main-navbar">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {/* Mimics th:replace="~{::menuItem (...)}", passing props */}
                <MenuItem
                  link="/"
                  active={activeMenu === 'home'}
                  title={t('home page')}
                  glyph="home"
                  text={t('home')}
                />
                <MenuItem
                  link="/owners/find"
                  active={activeMenu === 'owners'}
                  title={t('find owners')}
                  glyph="search"
                  text={t('findOwners')}
                />
                <MenuItem
                  link="/vets.html"
                  active={activeMenu === 'vets'}
                  title={t('veterinarians')}
                  glyph="th-list"
                  text={t('vets')}
                />
                <MenuItem
                  link="/oups"
                  active={activeMenu === 'error'}
                  title={t('trigger a RuntimeException to see how it is handled')}
                  glyph="exclamation-triangle"
                  text={t('error')}
                />
              </ul>
            </div>
          </div>
        </nav>
        <div className="container-fluid">
          <div className="container xd-container">
            {/* Mimics <th:block th:insert="${template}" /> */}
            {children} {/* Renders the content passed as children */}

            <br />
            <br />
            <div className="container">
              <div className="row">
                <div className="col-12 text-center">
                  {/* Mimics th:src="@{/resources/images/spring-logo.svg}" */}
                  <img src="/resources/images/spring-logo.svg" alt="VMware Tanzu Logo" className="logo" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mimics <script th:src="@{/webjars/bootstrap/dist/js/bootstrap.bundle.min.js}"></script> */}
        <script src="/webjars/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
        {/*
          In a real React app, Bootstrap JS functionality (like togglers, collapses)
          would often be re-implemented using React-specific libraries (e.g., react-bootstrap)
          or plain React state/hooks to avoid direct DOM manipulation conflicts.
          For a simple conversion, keeping the script for conceptual completeness.
        */}
      </body>
    </html>
  );
};

// To make i18n work with React, you'd typically have a setup file like `src/i18n.ts`:
/*
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation JSON files
import enTranslation from '../main/resources/messages/messages.json'; // Default
import deTranslation from '../main/resources/messages/messages_de.json';
import koTranslation from '../main/resources/messages/messages_ko.json';
// ... other languages

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: enTranslation },
      de: { translation: deTranslation },
      ko: { translation: koTranslation },
      // ...
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
*/
// And then wrap your app with <I18nextProvider i18n={i18n}>
