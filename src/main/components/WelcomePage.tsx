import React from 'react';
import { useTranslation } from 'react-i18next'; // Assuming a react-i18next setup
import { Layout } from './Layout'; // Assuming Layout component from fragments/layout.html

/**
 * Conceptual React component for welcome.html.
 * This component would display a welcome message and an image,
 * leveraging internationalization and a shared layout.
 */
export const WelcomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    // Mimics th:replace="~{fragments/layout :: layout (~{::body},'home')}"
    <Layout activeMenu="home">
      <h2 className="text-center" dangerouslySetInnerHTML={{ __html: t('welcome') }} />
      {/*
        Using dangerouslySetInnerHTML because the original th:text="#{welcome}"
        could potentially contain HTML, though it's typically plain text.
        For plain text, just `t('welcome')` inside JSX is safer.
      */}
      <div className="row">
        <div className="col-md-12 text-center"> {/* Added text-center for consistency if image is smaller */}
          {/*
            Mimics th:src="@{/resources/images/pets.png}".
            In a modern build, static assets from `src/main/resources/static`
            are typically served from the root `/` or `/assets`.
          */}
          <img className="img-responsive" src="/resources/images/pets.png" alt="Pets" />
        </div>
      </div>
    </Layout>
  );
};

// Example usage (e.g., in App.tsx or a routing setup)
// <WelcomePage />
