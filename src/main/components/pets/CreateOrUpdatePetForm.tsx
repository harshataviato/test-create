import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'; // For Yup validation
import * as yup from 'yup'; // For schema definition
import { Layout } from '../Layout';
import { InputField } from '../InputField';
import { SelectField } from '../SelectField';
import { Pet, Owner, PetType } from '../../types/models'; // Assuming these interfaces exist

interface CreateOrUpdatePetFormProps {
  isNew: boolean;
  owner: Owner;
  pet: Partial<Pet>; // Can be a new empty pet or an existing one
  petTypes: PetType[]; // List of available pet types
  onSubmit: (data: PetFormData) => void;
  // `message` and `error` could be passed if server-side processing returns them (flash attributes)
  message?: string;
  error?: string;
}

// Define form data structure for validation, matching the fields
interface PetFormData {
  id?: number;
  name: string;
  birthDate: string; // yyyy-MM-dd format
  type: string; // Name of the selected pet type
}

/**
 * Conceptual React component for pets/createOrUpdatePetForm.html.
 * Allows creating a new pet or updating an existing one for a given owner.
 * Includes form fields for name, birth date, and type, with validation.
 */
export const CreateOrUpdatePetForm: React.FC<CreateOrUpdatePetFormProps> = ({
  isNew,
  owner,
  pet,
  petTypes,
  onSubmit,
  message,
  error,
}) => {
  const { t } = useTranslation();

  // Yup validation schema, mimicking Spring's validation rules
  // This would correspond to PetValidatorTests logic and `typeMismatch` messages.
  const validationSchema = yup.object().shape({
    id: yup.number().optional(),
    name: yup
      .string()
      .trim()
      .required(t('required')) // Mimics `required` error code
      // Simulate `duplicate` error: In a real app, this would be an async validation
      // or handled on the server. For frontend validation, a basic check might be possible
      // if `owner.pets` is passed to the schema.
      .test('unique-pet-name', t('duplicate'), (value) => {
        if (!value) return true; // Handled by required
        const existingPet = owner.pets.find(p => p.name.toLowerCase() === value.toLowerCase());
        // If updating, allow original name
        return !existingPet || (pet.id && existingPet.id === pet.id);
      }),
    birthDate: yup
      .string()
      .required(t('required'))
      .test('is-date', t('typeMismatch.birthDate'), (value) => {
        // Basic date format check (yyyy-MM-dd)
        return /^\d{4}-\d{2}-\d{2}$/.test(value || '');
      })
      .test('past-date', t('typeMismatch.birthDate'), (value) => { // Using same key as original
        if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return true; // Handled by previous validation
        const date = new Date(value);
        return date < new Date(); // Date must be in the past
      }),
    type: yup
      .string()
      .required(t('required')) // Mimics `required` for type
      .oneOf(petTypes.map(type => type.name), t('required')), // Ensure it's one of the valid types
  });

  const methods = useForm<PetFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      id: pet.id,
      name: pet.name || '',
      // Format date to 'yyyy-MM-dd' for HTML date input
      birthDate: pet.birthDate ? format(new Date(pet.birthDate), 'yyyy-MM-dd') : '',
      type: pet.type?.name || '',
    },
  });

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
        {/* Mimics th:block th:if="${pet['new']}" th:text="#{new}" */}
        {isNew ? t('new') : ''} <span dangerouslySetInnerHTML={{ __html: t('pet') }} />
      </h2>

      {/* Mimics <form th:object="${pet}" class="form-horizontal" method="post"> */}
      <FormProvider {...methods}>
        <form className="form-horizontal" onSubmit={methods.handleSubmit(onSubmit)}>
          {/* Mimics <input type="hidden" name="id" th:value="*{id}" /> */}
          <input type="hidden" {...methods.register('id')} />

          <div className="form-group has-feedback">
            <div className="form-group">
              {/* Mimics <label class="col-sm-2 control-label" th:text="#{owner}">Owner</label> */}
              <label className="col-sm-2 control-label">{t('owner')}</label>
              <div className="col-sm-10">
                {/* Mimics <span th:text="${owner?.firstName + ' ' + owner?.lastName}" /> */}
                <span className="form-control-plaintext">{owner?.firstName} {owner?.lastName}</span>
              </div>
            </div>
            {/* Mimics <input th:replace="~{fragments/inputField :: input ('Name', 'name', 'text')}" /> */}
            <InputField label={t('name')} name="name" type="text" />
            {/* Mimics <input th:replace="~{fragments/inputField :: input ('Birth Date', 'birthDate', 'date')}" /> */}
            <InputField label={t('birthDate')} name="birthDate" type="date" />
            {/* Mimics <input th:replace="~{fragments/selectField :: select ('Type', 'type', ${types})}" /> */}
            <SelectField label={t('type')} name="type" items={petTypes.map(type => type.name)} />
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              {/* Mimics conditional button text and submit type */}
              <button className="btn btn-primary" type="submit">
                {isNew ? t('addPet') : t('updatePet')}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Layout>
  );
};
