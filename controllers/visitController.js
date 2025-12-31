/**
 * @module controllers/visitController
 * @description Controller for managing Pet Visit entities (add).
 * Visits are nested under pets and owners.
 */

const { validationResult } = require('express-validator');
const db = require('../config/database');
const moment = require('moment'); // For date handling and formatting

/**
 * @function showCreateVisitForm
 * @description Renders the form to add a new visit for a specific pet.
 * @param {import('express').Request} req - The Express request object, includes `ownerId` and `petId` in params.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.showCreateVisitForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;

  try {
    const owner = await db.Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }

    const pet = await db.Pet.findByPk(petId, {
      include: [{ model: db.PetType, as: 'type' }]
    });

    if (!pet || pet.ownerId !== owner.id) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('pet.notFoundById', { petId }) });
    }

    res.render('pets/createOrUpdateVisitForm', {
      owner,
      pet,
      visit: { visitDate: moment().format('YYYY-MM-DD') }, // Pre-fill current date for visitDate
      title: res.__('visit.newVisitTitle', { petName: pet.name }),
      errors: {}
    });
  } catch (error) {
    console.error(`Error fetching data for new visit form for pet ID ${petId}:`, error);
    next(error);
  }
};

/**
 * @function processCreateVisitForm
 * @description Processes the form submission to add a new visit for a pet.
 * Validates input and creates the visit record.
 * @param {import('express').Request} req - The Express request object, includes `ownerId` and `petId` in params.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.processCreateVisitForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;
  const errors = validationResult(req); // Get validation errors from express-validator

  try {
    const owner = await db.Owner.findByPk(ownerId);
    if (!owner) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('owner.notFoundById', { ownerId }) });
    }

    const pet = await db.Pet.findByPk(petId, {
      include: [{ model: db.PetType, as: 'type' }]
    });

    if (!pet || pet.ownerId !== owner.id) {
      return res.status(404).render('error', { title: res.__('common.error'), message: res.__('pet.notFoundById', { petId }) });
    }

    // Attach petId from params to the request body before validation/creation
    req.body.petId = pet.id;

    if (!errors.isEmpty()) {
      return res.status(400).render('pets/createOrUpdateVisitForm', {
        owner,
        pet,
        visit: req.body, // Pass submitted data back to form
        title: res.__('visit.newVisitTitle', { petName: pet.name }),
        errors: errors.mapped()
      });
    }

    await db.Visit.create(req.body);
    res.redirect(`/owners/${owner.id}`); // Redirect to the owner's details page to see new visit

  } catch (error) {
    console.error(`Error creating new visit for pet ID ${petId} (owner ID ${ownerId}):`, error);
    if (error.name === 'SequelizeValidationError') {
      const formattedErrors = {};
      error.errors.forEach(err => {
        formattedErrors[err.path] = { msg: err.message };
      });
      return res.status(400).render('pets/createOrUpdateVisitForm', {
        owner: await db.Owner.findByPk(ownerId), // Ensure owner object is fully loaded
        pet: await db.Pet.findByPk(petId, { include: [{ model: db.PetType, as: 'type' }] }), // Ensure pet object is fully loaded
        visit: req.body,
        title: res.__('visit.newVisitTitle', { petName: (await db.Pet.findByPk(petId)).name }),
        errors: formattedErrors
      });
    }
    next(error);
  }
};
