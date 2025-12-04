import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // For navigation (conceptual router)
import { format } from 'date-fns'; // For date formatting
import { Layout } from '../Layout';
import { Owner, Pet, Visit } from '../../types/models'; // Assuming these interfaces exist

interface OwnerDetailsProps {
  owner: Owner;
  // `message` and `error` could be passed if server-side processing returns them (flash attributes)
  message?: string;
  error?: string;
}

/**
 * Conceptual React component for owners/ownerDetails.html.
 * Displays detailed information about an owner, their pets, and their visits.
 * Provides links to edit owner/pet details or add new pets/visits.
 */
export const OwnerDetails: React.FC<OwnerDetailsProps> = ({ owner, message, error }) => {
  const { t } = useTranslation();

  // Mimics the inline JavaScript to hide messages
  React.useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        // In a real app, you'd manage these messages via state
        // For this conceptual component, we just log/display briefly.
        console.log('Hiding messages.');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

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

      <h2 className="mb-4">{t('ownerInformation')}</h2>

      {/* Mimics <table class="table table-striped" th:object="${owner}"> */}
      <table className="table table-striped">
        <tbody>
          <tr>
            <th className="w-25">{t('name')}</th>
            <td><b>{owner.firstName} {owner.lastName}</b></td>
          </tr>
          <tr>
            <th className="w-25">{t('address')}</th>
            <td>{owner.address}</td>
          </tr>
          <tr>
            <th className="w-25">{t('city')}</th>
            <td>{owner.city}</td>
          </tr>
          <tr>
            <th className="w-25">{t('telephone')}</th>
            <td>{owner.telephone}</td>
          </tr>
        </tbody>
      </table>

      {/* Action buttons */}
      <div className="d-flex justify-content-start mb-4">
        {/* Mimics <a th:href="@{__${owner.id}__/edit}" ...> */}
        <Link to={`/${owner.id}/edit`} className="btn btn-primary me-2">
          {t('editOwner')}
        </Link>
        {/* Mimics <a th:href="@{__${owner.id}__/pets/new}" ...> */}
        <Link to={`/${owner.id}/pets/new`} className="btn btn-primary">
          {t('addNewPet')}
        </Link>
      </div>

      <h2 className="mb-4">{t('petsAndVisits')}</h2>

      {/* Mimics <table class="table table-striped"> */}
      <table className="table table-striped">
        <tbody>
          {/* Mimics <tr th:each="pet : ${owner.pets}"> */}
          {owner.pets && owner.pets.length > 0 ? (
            owner.pets.map((pet) => (
              <tr key={pet.id}>
                <td className="w-50" style={{ verticalAlign: 'top' }}>
                  <dl className="dl-horizontal">
                    <dt>{t('name')}</dt>
                    <dd>{pet.name}</dd>
                    <dt>{t('birthDate')}</dt>
                    <dd>{pet.birthDate ? format(new Date(pet.birthDate), 'yyyy-MM-dd') : ''}</dd>
                    <dt>{t('type')}</dt>
                    <dd>{pet.type?.name}</dd>
                  </dl>
                </td>
                <td className="w-50" style={{ verticalAlign: 'top' }}>
                  <table className="table-condensed">
                    <thead>
                      <tr>
                        <th className="w-25">{t('visitDate')}</th>
                        <th className="w-75">{t('description')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Mimics <tr th:each="visit : ${pet.visits}"> */}
                      {pet.visits && pet.visits.length > 0 ? (
                        pet.visits.map((visit, idx) => (
                          <tr key={idx}>
                            <td>{visit.date ? format(new Date(visit.date), 'yyyy-MM-dd') : ''}</td>
                            <td>{visit.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center">{t('none')}</td> {/* If no visits */}
                        </tr>
                      )}
                      <tr>
                        {/* Mimics <a th:href="@{__${owner.id}__/pets/__${pet.id}__/edit}" ...> */}
                        <td>
                          <Link to={`/${owner.id}/pets/${pet.id}/edit`} className="btn btn-sm btn-info">
                            {t('editPet')}
                          </Link>
                        </td>
                        {/* Mimics <a th:href="@{__${owner.id}__/pets/__${pet.id}__/visits/new}" ...> */}
                        <td>
                          <Link to={`/${owner.id}/pets/${pet.id}/visits/new`} className="btn btn-sm btn-success">
                            {t('addVisit')}
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="text-center">{t('noPetsFound')}</td> {/* If no pets */}
            </tr>
          )}
        </tbody>
      </table>
    </Layout>
  );
};
