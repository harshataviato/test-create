const { body } = require('express-validator');

/**
 * Shared validation rules.
 * Uses express-validator to replicate Hibernate Validator constraints.
 */
module.exports = {
  ownerValidators: [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('telephone').matches(/^\d{10}$/).withMessage('Telephone must be a 10-digit number')
  ],
  petValidators: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('birthDate').isISO8601().withMessage('Invalid date format'),
    body('type').notEmpty().withMessage('Type is required')
  ],
  visitValidators: [
    body('date').isISO8601().withMessage('Invalid date format'),
    body('description').trim().notEmpty().withMessage('Description is required')
  ]
};
