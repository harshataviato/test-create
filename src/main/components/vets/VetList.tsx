import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // For navigation (conceptual router)
import { Layout } from '../Layout';
import { Vet, Specialty } from '../../types/models'; // Assuming these interfaces exist

interface VetListProps {
  listVets: Vet[];
  currentPage: number;
  totalPages: number;
  // `message` and `error` could be passed if server-side processing returns them (flash attributes)
  message?: string;
  error?: string;
}

/**
 * Conceptual React component for vets/vetList.html.
 * Displays a list of veterinarians, their specialties, and includes pagination controls.
 */
export const VetList: React.FC<VetListProps> = ({
  listVets,
  currentPage,
  totalPages,
  message,
  error,
}) => {
  const { t } = useTranslation();

  // Helper to generate pagination links
  const getPageLink = (pageNumber: number) => `/vets.html?page=${pageNumber}`;

  return (
    // Mimics th:replace="~{fragments/layout :: layout (~{::body},'vets')}"
    <Layout activeMenu="vets">
      {/* Flash messages from server (conceptual) */}
      {message && (
        <div className="alert alert-success" id="success-message">
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" id="error-message">
          <span>{error}</span>
        </div>
      )}

      <h2 className="mb-4">{t('vets')}</h2>

      <table id="vets" className="table table-striped">
        <thead>
          <tr>
            <th className="w-25">{t('name')}</th>
            <th className="w-75">{t('specialties')}</th>
          </tr>
        </thead>
        <tbody>
          {/* Mimics <tr th:each="vet : ${listVets}"> */}
          {listVets.length > 0 ? (
            listVets.map((vet) => (
              <tr key={vet.id}>
                <td>{vet.firstName} {vet.lastName}</td>
                <td>
                  {/* Mimics <span th:each="specialty : ${vet.specialties}" th:text="${specialty.name + ' '}" /> */}
                  {vet.specialties && vet.specialties.length > 0 ? (
                    vet.specialties.map((specialty, idx) => (
                      <span key={idx}>{specialty.name} </span>
                    ))
                  ) : (
                    // Mimics <span th:if="${vet.nrOfSpecialties == 0}" th:text="#{none}">none</span>
                    <span>{t('none')}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="text-center">{t('notFound')}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mimics pagination block th:if="${totalPages > 1}" */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center">
          <span className="me-2">{t('pages')}:</span>
          <span className="me-2">[</span>
          {/* Mimics <span th:each="i: ${#numbers.sequence(1, totalPages)}"> */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <span key={pageNumber} className="mx-1">
              {/* Mimics <a th:if="${currentPage != i}" th:href="@{'/vets.html?page=__${i}__'}">[[${i}]]</a> */}
              {/* Mimics <span th:unless="${currentPage != i}">[[${i}]]</span> */}
              {currentPage !== pageNumber ? (
                <Link to={getPageLink(pageNumber)}>{pageNumber}</Link>
              ) : (
                <b className="text-primary">{pageNumber}</b> // Highlight current page
              )}
            </span>
          ))}
          <span className="ms-2">]&nbsp;</span>

          {/* First page link */}
          <span className="mx-1">
            {currentPage > 1 ? (
              <Link to={getPageLink(1)} title={t('first')} className="fa fa-fast-backward"></Link>
            ) : (
              <span title={t('first')} className="fa fa-fast-backward text-muted"></span>
            )}
          </span>

          {/* Previous page link */}
          <span className="mx-1">
            {currentPage > 1 ? (
              <Link to={getPageLink(currentPage - 1)} title={t('previous')} className="fa fa-step-backward"></Link>
            ) : (
              <span title={t('previous')} className="fa fa-step-backward text-muted"></span>
            )}
          </span>

          {/* Next page link */}
          <span className="mx-1">
            {currentPage < totalPages ? (
              <Link to={getPageLink(currentPage + 1)} title={t('next')} className="fa fa-step-forward"></Link>
            ) : (
              <span title={t('next')} className="fa fa-step-forward text-muted"></span>
            )}
          </span>

          {/* Last page link */}
          <span className="mx-1">
            {currentPage < totalPages ? (
              <Link to={getPageLink(totalPages)} title={t('last')} className="fa fa-fast-forward"></Link>
            ) : (
              <span title={t('last')} className="fa fa-fast-forward text-muted"></span>
            )}
          </span>
        </div>
      )}
    </Layout>
  );
};
