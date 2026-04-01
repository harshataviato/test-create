/**
 * @file src/validators/pet.validator.js
 * @description Custom validation logic for Pet entities.
 * This directly translates `PetValidator.java` and incorporates business rules.
 */

const moment = require('moment'); // For date validation

/**
 * @function validate
 * @description Validates a Pet object based on business rules.
 * This is a custom validator to mimic `PetValidator.java` and handle complex logic
 * like duplicate pet names for an owner and future birth dates.
 * @param {object} petData - The pet data to validate (from req.body).
 * @param {object} owner - The owner object to which the pet belongs (from res.locals.owner).
 * @param {function} __ - The i18n translation function.
 * @returns {Array<object>} An array of validation error objects (each with `param`, `msg`, `value`).
 */
function validate(petData, owner, __) {
  const errors = [];

  // Name validation
  if (!petData.name || petData.name.trim().length === 0) {
    errors.push({ param: 'name', msg: __('required'), value: petData.name });
  } else {
    // Duplicate name validation: check if another pet with the same name exists for the same owner
    // This logic mimics `owner.getPet(pet.getName(), true)` in Java to ignore new unsaved pets.
    // If updating, it should ignore the pet being updated.
    if (owner && owner.pets) {
      const existingPetWithSameName = owner.pets.find(p =>
        p.name && p.name.toLowerCase() === petData.name.toLowerCase() && p.id !== petData.id
      );
      if (existingPetWithSameName) {
        errors.push({ param: 'name', msg: __('duplicate'), value: petData.name });
      }
    }
  }

  // Type validation (for new pets only, type is always required on creation)
  // petData.type usually contains the ID of the pet type selected from the dropdown
  // Check if it's new and type is missing
  if (petData.isNew() && (!petData.type || petData.type.trim().length === 0)) {
    errors.push({ param: 'type', msg: __('required'), value: petData.type });
  }

  // Birth date validation
  if (!petData.birthDate || petData.birthDate.trim().length === 0) {
    errors.push({ param: 'birthDate', msg: __('required'), value: petData.birthDate });
  } else {
    const parsedBirthDate = moment(petData.birthDate, 'YYYY-MM-DD', true); // Strict parsing
    if (!parsedBirthDate.isValid()) {
      errors.push({ param: 'birthDate', msg: __('typeMismatch.date'), value: petData.birthDate });
    } else if (parsedBirthDate.isAfter(moment())) {
      errors.push({ param: 'birthDate', msg: __('typeMismatch.birthDate'), value: petData.birthDate });
    }
  }

  return errors;
}

module.exports = {
  validate
};
