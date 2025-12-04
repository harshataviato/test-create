import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form'; // Assuming react-hook-form for form management

interface SelectFieldProps {
  label: string;
  name: string;
  items: string[]; // Array of strings for select options (e.g., pet types)
  // You might add additional props for default values etc.
}

/**
 * Conceptual React component for fragments/selectField.html.
 * This component provides a reusable select input field with label,
 * dynamic validation styling, and error messages, integrated with react-hook-form.
 */
export const SelectField: React.FC<SelectFieldProps> = ({ label, name, items }) => {
  const { t } = useTranslation();
  const { register, formState: { errors } } = useFormContext();

  // Mimics th:with="valid=${!#fields.hasErrors(name)}"
  const hasError = !!errors[name];
  const isValid = !hasError;

  // Mimics th:class="${'form-group' + (valid ? '' : ' has-error')}"
  const formGroupClass = `form-group ${isValid ? '' : 'has-error'}`;

  return (
    <div className={formGroupClass}>
      {/* Mimics <label th:for="${name}" th:text="${label}" ...> */}
      <label htmlFor={name} className="col-sm-2 control-label">
        {label}
      </label>
      <div className="col-sm-10">
        {/* Mimics <select th:field="*{__${name}__}"> and <option th:each="item : ${items}" ...> */}
        <select className="form-control" id={name} {...register(name)}>
          {items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Mimics validation feedback icons. Font Awesome class names kept for consistency */}
        {isValid && (
          <span className="fa fa-ok form-control-feedback" aria-hidden="true"></span>
        )}
        {hasError && (
          <>
            <span className="fa fa-remove form-control-feedback" aria-hidden="true"></span>
            {/* Mimics <span th:errors="*{__${name}__}" th:text="#{error}">Error</span> */}
            <span className="help-inline text-danger"> {/* Added text-danger for visual cue */}
              {errors[name]?.message ? errors[name]?.message?.toString() : t('error')}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// Example usage within a form (similar to InputField, wrapped in FormProvider):
/*
import { useForm, FormProvider } from 'react-hook-form';
import { SelectField } from './SelectField'; // Adjust path

const PetForm = () => {
  const methods = useForm({
    defaultValues: {
      petType: 'cat',
    },
  });
  const onSubmit = (data: any) => console.log(data);
  const petTypes = ['cat', 'dog', 'hamster']; // Example list

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SelectField label="Pet Type" name="petType" items={petTypes} />
        <button type="submit" className="btn btn-primary">Save Pet</button>
      </form>
    </FormProvider>
  );
};
*/
