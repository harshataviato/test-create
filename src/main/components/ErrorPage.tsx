import React from 'react';
import { useTranslation } from 'react-i18next'; // Assuming a react-i18next setup
import { Layout } from './Layout'; // Assuming Layout component from fragments/layout.html

interface ErrorPageProps {
  status?: number;
  message?: string;
}

/**
 * Conceptual React component for error.html.
 * This component displays status-specific error messages and an exception message,
 * leveraging internationalization and a shared layout.
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({ status, message }) => {
  const { t } = useTranslation();

  let errorMessageKey: string;
  switch (status) {
    case 404:
      errorMessageKey = 'error.404';
      break;
    case 500:
      errorMessageKey = 'error.500';
      break;
    default:
      errorMessageKey = 'error.general';
      break;
  }

  return (
    // Mimics th:replace="~{fragments/layout :: layout (~{::body},'error')}"
    <Layout activeMenu="error">
      {/* Mimics th:src="@{/resources/images/pets.png}" */}
      <div className="text-center mb-4">
        <img src="/resources/images/pets.png" alt="Pets" className="img-responsive" />
      </div>

      {/* Mimics th:text="#{somethingHappened}" */}
      <h2 className="text-center" dangerouslySetInnerHTML={{ __html: t('somethingHappened') }} />

      {/* Mimics conditional error message based on status */}
      <p className="text-center">
        {t(errorMessageKey)}
      </p>

      {/* Mimics th:text="${message}" for exception details */}
      {message && (
        <div className="alert alert-danger mt-4" role="alert">
          <strong>{t('error')}:</strong> {message}
        </div>
      )}
    </Layout>
  );
};

// Example usage (e.g., in a router's error boundary or generic error page)
// <ErrorPage status={500} message="Database connection failed." />
