import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // For navigation
import { Layout } from '../Layout';
import { Owner, Pet } from '../../types/models'; // Assuming these interfaces exist

interface OwnersListProps {
  listOwners: Owner[];
  currentPage: number;
  totalPages: number;
  // `message` and `error` could be passed if server-side processing returns them (flash attributes)
  message?: string;
  error?: string;
}

/**
 * Conceptual React component for owners/ownersList.html.
 * Displays a paginated list of owners with their details and pets,
 * and includes pagination controls.
 */
export const OwnersList: React.FC<OwnersListProps> = ({
  listOwners,
  currentPage,
  totalPages,
  message,
  error,
}) => {
  const { t } = useTranslation();

  // Helper to format pet names, mimicking `th:text="${#strings.listJoin(owner.pets, ', ')}"`
  const formatPetNames = (pets: Pet[] | undefined): string => {
    return pets && pets.length > 0
      ? pets.map((pet) => pet.name).join(', ')
      : t('none'); // Or an empty string, depending on desired UI
  };

  // Helper to generate pagination links
  const getPageLink = (pageNumber: number) => `/owners?page=${pageNumber}`;

  return (
    // Mimics th:replace="~{fragments/layout :: layout (~{::body},'owners')}"
    <Layout activeMenu="owners">
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

      <h2 className="mb-4">{t('owners')}</h2>

      <table id="owners" className="table table-striped">
        <thead>
          <tr>
            <th className="w-150px">{t('name')}</th> {/* Use dynamic class or inline style */}
            <th className="w-200px">{t('address')}</th>
            <th>{t('city')}</th>
            <th className="w-120px">{t('telephone')}</th>
            <th>{t('pets')}</th>
          </tr>
        </thead>
        <tbody>
          {/* Mimics <tr th:each="owner : ${listOwners}"> */}
          {listOwners.length > 0 ? (
            listOwners.map((owner) => (
              <tr key={owner.id}>
                <td>
                  {/* Mimics <a th:href="@{/owners/__${owner.id}__}" th:text="${owner.firstName + ' ' + owner.lastName}" /></a> */}
                  <Link to={`/owners/${owner.id}`}>
                    {owner.firstName} {owner.lastName}
                  </Link>
                </td>
                <td>{owner.address}</td>
                <td>{owner.city}</td>
                <td>{owner.telephone}</td>
                <td>{formatPetNames(owner.pets)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">{t('notFound')}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mimics pagination block th:if="${totalPages > 1}" */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <span className="me-2">{t('pages')}:</span>
          <span className="me-2">[</span>
          {/* Mimics <span th:each="i: ${#numbers.sequence(1, totalPages)}"> */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <span key={pageNumber} className="mx-1">
              {currentPage !== pageNumber ? (
                <Link to={getPageLink(pageNumber)}>{pageNumber}</Link>
              ) : (
                <b className="text-primary">{pageNumber}</b>
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
