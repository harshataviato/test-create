import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form'; // For form management
import { format } from 'date-fns'; // For date formatting
import { Layout } from '../Layout';
import { InputField } from '../InputField';
import { Pet, Owner, Visit } from '../../types/models'; // Assuming these interfaces exist

interface CreateOrUpdateVisitFormProps {
  isNew: boolean;
  pet: Pet;
  owner: Owner;
  visit: Partial<Visit>; // Can be a new empty visit or an existing one
  onSubmit: (data: VisitFormData) => void;
  // `message` and `error` could be passed if server-side processing returns them (flash attributes)
  message?: string;
  error?: string;
}

// Define form data structure for validation
interface VisitFormData {
  date: string; // yyyy-MM-dd
  description: string;
  petId: number; // Hidden field
}

/**
 * Conceptual React component for pets/createOrUpdateVisitForm.html.
 * Allows creating a new visit or (conceptually, though not fully implemented here) updating one.
 * Displays pet and owner information, and includes a form for visit details.
 */
export const CreateOrUpdateVisitForm: React.FC<CreateOrUpdateVisitFormProps> = ({
  isNew,
  pet,
  owner,
  visit,
  onSubmit,
  message,
  error,
}) => {
  const { t } = useTranslation();
  const methods = useForm<VisitFormData>({
    defaultValues: {
      date: visit.date || format(new Date(), 'yyyy-MM-dd'),
      description: visit.description || '',
      petId: pet.id,
    },
  });

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

      <h2>
        {/* Mimics th:block th:if="${visit['new']}" th:text="#{new}" */}
        {isNew ? t('new') : ''} {t('Visit')}
      </h2>

      <b className="mb-2 d-block">{t('pet')}</b>
      <table className="table table-striped">
        <thead>
          <tr>
            <th className="w-25">{t('name')}</th>
            <th className="w-25">{t('birthDate')}</th>
            <th className="w-25">{t('type')}</th>
            <th className="w-25">{t('owner')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{pet.name}</td>
            <td>{pet.birthDate ? format(new Date(pet.birthDate), 'yyyy-MM-dd') : ''}</td>
            <td>{pet.type?.name}</td>
            <td>{owner?.firstName} {owner?.lastName}</td>
          </tr>
        </tbody>
      </table>

      {/* Mimics <form th:object="${visit}" class="form-horizontal" method="post"> */}
      <FormProvider {...methods}>
        <form className="form-horizontal" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="form-group has-feedback">
            {/* Mimics <input th:replace="~{fragments/inputField :: input ('Date', 'date', 'date')}" /> */}
            <InputField label={t('date')} name="date" type="date" />
            {/* Mimics <input th:replace="~{fragments/inputField :: input ('Description', 'description', 'text')}" /> */}
            <InputField label={t('description')} name="description" type="text" />
          </div>

          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              {/* Mimics <input type="hidden" name="petId" th:value="${pet.id}" /> */}
              <input type="hidden" {...methods.register('petId')} value={pet.id} />
              {/* Mimics <button class="btn btn-primary" type="submit" th:text="#{addVisit}">Add Visit</button> */}
              <button className="btn btn-primary" type="submit">
                {t('addVisit')}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>

      <br />
      <b className="mb-2 d-block">{t('previousVisits')}</b>
      <table className="table table-striped">
        <thead>
          <tr>
            <th className="w-25">{t('date')}</th>
            <th className="w-75">{t('description')}</th>
          </tr>
        </thead>
        <tbody>
          {/* Mimics <tr th:if="${!visit['new']}" th:each="visit : ${pet.visits}"> */}
          {!isNew && pet.visits && pet.visits.length > 0 ? (
            pet.visits.map((prevVisit, index) => (
              <tr key={index}>
                <td>{prevVisit.date ? format(new Date(prevVisit.date), 'yyyy-MM-dd') : ''}</td>
                <td>{prevVisit.description}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="text-center">{t('none')}</td> {/* If no previous visits */}
            </tr>
          )}
        </tbody>
      </table>
    </Layout>
  );
};
