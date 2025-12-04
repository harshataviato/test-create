import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'; // For Yup validation
import * as yup from 'yup'; // For schema definition
import { Layout } from '../Layout';
import { InputField } from '../InputField';
import { Owner } from '../../types/models'; // Assuming Owner interface exists

interface CreateOrUpdateOwnerFormProps {
  isNew: boolean;
  owner: Partial<Owner>; // Can be a new empty owner or an existing one
  onSubmit: (data: OwnerFormData) => void;
  // `message` and `error` could be passed if server-side processing returns them (flash attributes)
  message?: string;
  error?: string;
}

// Define form data structure for validation, matching the fields
interface OwnerFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
}

/**
 * Conceptual React component for owners/createOrUpdateOwnerForm.html.
 * Allows creating a new owner or updating an existing one.
 * Includes form fields for owner details with validation.
 */
export const CreateOrUpdateOwnerForm: React.FC<CreateOrUpdateOwnerFormProps> = ({
  isNew,
  owner,
  onSubmit,
  message,
  error,
}) => {
  const { t } = useTranslation();

  // Yup validation schema, mimicking Spring's validation rules
  const validationSchema = yup.object().shape({
    firstName: yup.string().trim().required(t('required')),
    lastName: yup.string().trim().required(t('required')),
    address: yup.string().trim().required(t('required')),
    city: yup.string().trim().required(t('required')),
    telephone: yup
      .string()
      .trim()
      .required(t('required'))
      .matches(/^\d{10,}$/, t('telephone.invalid')), // Mimics 10-digit numeric validation
  });

  const methods = useForm<OwnerFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: owner.firstName || '',
      lastName: owner.lastName || '',
      address: owner.address || '',
      city: owner.city || '',
      telephone: owner.telephone || '',
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

      <h2 className="mb-4">{t('owner')}</h2>

      {/* Mimics <form th:object="${owner}" class="form-horizontal" id="add-owner-form" method="post"> */}
      <FormProvider {...methods}>
        <form className="form-horizontal" id="add-owner-form" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="form-group has-feedback">
            {/* Mimics <input th:replace="~{fragments/inputField :: input (#{firstName}, 'firstName', 'text')}" /> */}
            <InputField label={t('firstName')} name="firstName" type="text" />
            <InputField label={t('lastName')} name="lastName" type="text" />
            <InputField label={t('address')} name="address" type="text" />
            <InputField label={t('city')} name="city" type="text" />
            <InputField label={t('telephone')} name="telephone" type="text" />
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              {/* Mimics conditional button text and submit type */}
              <button className="btn btn-primary" type="submit">
                {isNew ? t('addOwner') : t('updateOwner')}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Layout>
  );
};
