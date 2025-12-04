import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'; // For Yup validation
import * as yup from 'yup'; // For schema definition
import { useNavigate } from 'react-router-dom'; // For navigation after search
import { Layout } from '../Layout';
import { InputField } from '../InputField';
import { Owner } from '../../types/models'; // Assuming Owner interface exists

interface FindOwnersProps {
  // `owner` is usually an empty object for the form, but can hold pre-filled search criteria
  owner: Partial<Owner>;
  // `error` could be passed if server-side processing returns a "not found" error
  error?: string; // Corresponds to `model().attributeHasFieldErrorCode("owner", "lastName", "notFound")`
}

// Define form data structure for search
interface SearchOwnerFormData {
  lastName: string;
}

/**
 * Conceptual React component for owners/findOwners.html.
 * Provides a form to search for owners by last name.
 */
export const FindOwners: React.FC<FindOwnersProps> = ({ owner, error }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Validation schema for the search form
  const validationSchema = yup.object().shape({
    lastName: yup.string().trim().optional(), // Last name is optional for broad search
  });

  const methods = useForm<SearchOwnerFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      lastName: owner.lastName || '',
    },
  });

  // Mimics th:action="@{/owners}" method="get"
  const onSubmit = (data: SearchOwnerFormData) => {
    const queryParams = new URLSearchParams();
    if (data.lastName) {
      queryParams.append('lastName', data.lastName);
    }
    // Navigate to the owners list page with search parameters
    navigate(`/owners?${queryParams.toString()}`);
  };

  return (
    // Mimics th:replace="~{fragments/layout :: layout (~{::body},'owners')}"
    <Layout activeMenu="owners">
      <h2 className="mb-4">{t('findOwners')}</h2>

      {/* Mimics <form th:object="${owner}" th:action="@{/owners}" method="get" class="form-horizontal" id="search-owner-form"> */}
      <FormProvider {...methods}>
        <form className="form-horizontal" id="search-owner-form" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="form-group">
            <div className="control-group" id="lastNameGroup">
              {/* Mimics <label th:text="#{lastName}">Last name</label> */}
              <label className="col-sm-2 control-label">{t('lastName')}</label>
              <div className="col-sm-10">
                {/* Mimics <input th:field="*{lastName}" ... /> */}
                <input className="form-control" {...methods.register('lastName')} size={30} maxLength={80} />
                <span className="help-inline text-danger">
                  {/* Mimics th:if="${#fields.hasAnyErrors()}" and th:each="err : ${#fields.allErrors()}" */}
                  {/* For this specific error, we check `error` prop which would be passed from server/parent component */}
                  {error === 'notFound' && (
                    <p>{t('notFound')}</p> // Example of mapping `notFound` error code
                  )}
                  {methods.formState.errors.lastName && (
                    <p>{methods.formState.errors.lastName.message}</p>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              {/* Mimics <button type="submit" class="btn btn-primary" th:text="#{findOwner}">Find Owner</button> */}
              <button type="submit" className="btn btn-primary me-2">
                {t('findOwner')}
              </button>
              {/* Mimics <a class="btn btn-primary" th:href="@{/owners/new}" th:text="#{addOwner}">Add Owner</a> */}
              <Link to="/owners/new" className="btn btn-primary">
                {t('addOwner')}
              </Link>
            </div>
          </div>
        </form>
      </FormProvider>
    </Layout>
  );
};
