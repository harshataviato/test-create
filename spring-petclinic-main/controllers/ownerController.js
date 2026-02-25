/**
 * @file ownerController.js
 * @description Handles HTTP requests related to Owners, their Pets, and Visits.
 * This file replaces the functionality of OwnerController.java, PetController.java, and VisitController.java.
 * It manages creating, finding, updating owners, adding/updating pets, and adding visits.
 * @author Google Senior Engineer
 */

const { Owner, PetType, Pet, Visit } = require('../models');
const { body, validationResult } = require('express-validator');
const moment = require('moment'); // For date handling
const i18n = require('../utils/i18n'); // i18n instance

// Number of owners to display per page in the owners list
const PAGE_SIZE = 5;

/**
 * @function initCreationForm
 * @description Renders the form to create a new owner.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Renders the 'owners/createOrUpdateOwnerForm' view.
 */
exports.initCreationForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, errors: [] });
};

/**
 * @function processCreationForm
 * @description Processes the submission of the new owner form.
 * Validates input, saves the owner, and redirects to the owner details page or back to the form if errors exist.
 * @param {object} req - Express request object, containing form data in req.body.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Redirects or renders.
 */
exports.processCreationForm = [
  // Validate and sanitize input fields
  body('firstName').trim().notEmpty().withMessage('firstName ' + i18n.__('required')),
  body('lastName').trim().notEmpty().withMessage('lastName ' + i18n.__('required')),
  body('address').trim().notEmpty().withMessage('address ' + i18n.__('required')),
  body('city').trim().notEmpty().withMessage('city ' + i18n.__('required')),
  body('telephone').trim().matches(/^\d{10}$/).withMessage(i18n.__('telephone.invalid')),

  async (req, res, next) => {
    const errors = validationResult(req);
    const ownerData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      city: req.body.city,
      telephone: req.body.telephone,
    };

    if (!errors.isEmpty()) {
      // If there are validation errors, re-render the form with error messages
      req.flash('error', i18n.__('There was an error in creating the owner.'));
      return res.render('owners/createOrUpdateOwnerForm', {
        owner: ownerData,
        errors: errors.array(),
        message: req.flash('message'),
        error: req.flash('error')
      });
    }

    try {
      // Create and save the new owner
      const owner = await Owner.create(ownerData);
      req.flash('message', i18n.__('New Owner Created'));
      res.redirect(`/owners/${owner.id}`);
    } catch (error) {
      console.error('Error creating owner:', error);
      next(error); // Pass error to the error handling middleware
    }
  }
];

/**
 * @function initFindForm
 * @description Renders the form to find owners by last name.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Renders the 'owners/findOwners' view.
 */
exports.initFindForm = (req, res) => {
  res.render('owners/findOwners', { owner: {}, errors: [] });
};

/**
 * @function processFindForm
 * @description Processes the request to find owners based on the last name.
 * If multiple owners are found, it lists them. If one owner is found, it redirects to their details.
 * If no owners are found, it re-renders the find form with an error.
 * Supports pagination.
 * @param {object} req - Express request object, containing query parameter 'lastName' and 'page'.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Redirects or renders.
 */
exports.processFindForm = async (req, res, next) => {
  const lastName = req.query.lastName || '';
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const { count, rows: ownersFound } = await Owner.findAndCountAll({
      where: {
        lastName: {
          [require('sequelize').Op.iLike]: `${lastName}%` // Case-insensitive LIKE search
        }
      },
      limit: PAGE_SIZE,
      offset: offset,
      order: [['lastName', 'ASC']]
    });

    if (count === 0) {
      // No owners found
      const errors = [{ param: 'lastName', msg: i18n.__('lastName') + ' ' + i18n.__('notFound') }];
      return res.render('owners/findOwners', { owner: { lastName }, errors });
    }

    if (count === 1 && !req.query.page) { // Redirect to details if exactly one owner found and not paginating
      res.redirect(`/owners/${ownersFound[0].id}`);
    } else {
      // Multiple owners found or explicit pagination requested, display list
      res.render('owners/ownersList', {
        listOwners: ownersFound,
        currentPage: page,
        totalPages: Math.ceil(count / PAGE_SIZE),
        totalItems: count
      });
    }
  } catch (error) {
    console.error('Error finding owners:', error);
    next(error);
  }
};

/**
 * @function initUpdateOwnerForm
 * @description Renders the form to update an existing owner.
 * Fetches owner details by ID from the database.
 * @param {object} req - Express request object, containing ownerId in req.params.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Renders or redirects.
 */
exports.initUpdateOwnerForm = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId, { include: [{ model: Pet, include: [PetType] }] });
    if (!owner) {
      return next(new Error(i18n.__('Owner not found with id: ') + req.params.ownerId + i18n.__('. Please ensure the ID is correct ')));
    }
    res.render('owners/createOrUpdateOwnerForm', { owner, errors: [] });
  } catch (error) {
    console.error('Error fetching owner for update:', error);
    next(error);
  }
};

/**
 * @function processUpdateOwnerForm
 * @description Processes the submission of the owner update form.
 * Validates input, updates the owner, and redirects to the owner details page or back to the form if errors exist.
 * @param {object} req - Express request object, containing ownerId in req.params and form data in req.body.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Redirects or renders.
 */
exports.processUpdateOwnerForm = [
  // Validate and sanitize input fields
  body('firstName').trim().notEmpty().withMessage('firstName ' + i18n.__('required')),
  body('lastName').trim().notEmpty().withMessage('lastName ' + i18n.__('required')),
  body('address').trim().notEmpty().withMessage('address ' + i18n.__('required')),
  body('city').trim().notEmpty().withMessage('city ' + i18n.__('required')),
  body('telephone').trim().matches(/^\d{10}$/).withMessage(i18n.__('telephone.invalid')),

  async (req, res, next) => {
    const errors = validationResult(req);
    const ownerId = req.params.ownerId;
    const ownerData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      city: req.body.city,
      telephone: req.body.telephone,
    };

    if (!errors.isEmpty()) {
      // If there are validation errors, re-render the form with error messages
      req.flash('error', i18n.__('There was an error in updating the owner.'));
      return res.render('owners/createOrUpdateOwnerForm', {
        owner: { id: ownerId, ...ownerData }, // Pass existing ID for proper form handling
        errors: errors.array(),
        message: req.flash('message'),
        error: req.flash('error')
      });
    }

    try {
      const owner = await Owner.findByPk(ownerId);
      if (!owner) {
        return next(new Error(i18n.__('Owner not found with id: ') + ownerId + i18n.__('. Please ensure the ID is correct ')));
      }

      await owner.update(ownerData);
      req.flash('message', i18n.__('Owner Values Updated'));
      res.redirect(`/owners/${owner.id}`);
    } catch (error) {
      console.error('Error updating owner:', error);
      next(error);
    }
  }
];

/**
 * @function showOwner
 * @description Displays the details of a single owner, including their pets and visits.
 * @param {object} req - Express request object, containing ownerId in req.params.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Renders the 'owners/ownerDetails' view.
 */
exports.showOwner = async (req, res, next) => {
  try {
    const owner = await Owner.findByPk(req.params.ownerId, {
      include: [{
        model: Pet,
        as: 'pets',
        include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits' }],
        order: [['name', 'ASC']] // Order pets by name
      }],
      order: [[{ model: Pet, as: 'pets' }, 'name', 'ASC'], [{ model: Pet, as: 'pets' }, { model: Visit, as: 'visits' }, 'date', 'ASC']] // Order visits by date
    });

    if (!owner) {
      return next(new Error(i18n.__('Owner not found with id: ') + req.params.ownerId + i18n.__('. Please ensure the ID is correct ')));
    }
    res.render('owners/ownerDetails', { owner, message: req.flash('message'), error: req.flash('error') });
  } catch (error) {
    console.error('Error fetching owner details:', error);
    next(error);
  }
};


// --- Pet-related handlers ---

/**
 * @function populatePetTypes
 * @description Middleware to populate pet types for forms.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Attaches pet types to res.locals.
 */
exports.populatePetTypes = async (req, res, next) => {
  try {
    const types = await PetType.findAll({ order: [['name', 'ASC']] });
    res.locals.types = types; // Make types available in views
    next();
  } catch (error) {
    console.error('Error fetching pet types:', error);
    next(error);
  }
};

/**
 * @function findOwnerAndPet
 * @description Middleware to find owner and pet based on IDs for pet/visit related forms.
 * @param {object} req - Express request object, expecting ownerId and petId (optional) in params.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Attaches owner and pet to req.locals (or req.data for consistency with Spring).
 */
exports.findOwnerAndPet = async (req, res, next) => {
  try {
    const ownerId = req.params.ownerId;
    const petId = req.params.petId;

    const owner = await Owner.findByPk(ownerId, {
      include: [{ model: Pet, as: 'pets', include: [{ model: PetType, as: 'type' }, { model: Visit, as: 'visits' }] }]
    });

    if (!owner) {
      return next(new Error(i18n.__('Owner not found with id: ') + ownerId + i18n.__('. Please ensure the ID is correct ')));
    }
    req.owner = owner; // Attach owner to request for subsequent middleware/handlers

    if (petId) {
      const pet = owner.pets.find(p => p.id === parseInt(petId, 10));
      if (!pet) {
        return next(new Error(`Pet with id ${petId} not found for owner with id ${ownerId}.`));
      }
      req.pet = pet; // Attach pet to request
    } else {
      req.pet = {}; // If no petId, initialize an empty pet object for new pet forms
    }
    res.locals.owner = req.owner; // Make owner available to views
    res.locals.pet = req.pet;     // Make pet available to views
    next();
  } catch (error) {
    console.error('Error finding owner or pet:', error);
    next(error);
  }
};

/**
 * @function initNewPetForm
 * @description Renders the form to create a new pet for an owner.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Renders the 'pets/createOrUpdatePetForm' view.
 */
exports.initNewPetForm = (req, res) => {
  res.render('pets/createOrUpdatePetForm', { pet: {}, owner: req.owner, types: res.locals.types, errors: [] });
};

/**
 * @function processNewPetForm
 * @description Processes the submission of the new pet form.
 * Validates input, saves the pet, and redirects to the owner details page or back to the form if errors exist.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Redirects or renders.
 */
exports.processNewPetForm = [
  // Validate and sanitize input fields
  body('name').trim().notEmpty().withMessage('name ' + i18n.__('required')),
  body('birthDate').trim().notEmpty().withMessage('birthDate ' + i18n.__('required'))
    .isISO8601().toDate().withMessage(i18n.__('typeMismatch.date')), // Ensure date is ISO format and convert to Date object
  body('type').trim().notEmpty().withMessage('type ' + i18n.__('required')),

  async (req, res, next) => {
    const errors = validationResult(req);
    const owner = req.owner;
    const petData = {
      name: req.body.name,
      birthDate: req.body.birthDate,
      ownerId: owner.id,
    };

    if (req.body.type) {
      const petType = await PetType.findOne({ where: { name: req.body.type } });
      if (petType) {
        petData.typeId = petType.id;
        petData.type = petType; // For view rendering
      } else {
        errors.errors.push({ param: 'type', msg: i18n.__('type') + ' ' + i18n.__('notFound') });
      }
    }

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', {
        owner,
        pet: petData,
        types: res.locals.types,
        errors: errors.array(),
        message: req.flash('message'),
        error: req.flash('error')
      });
    }

    // Additional server-side validation logic (e.g., duplicate pet name for owner, future birth date)
    if (owner.pets.some(p => p.name.toLowerCase() === petData.name.toLowerCase())) {
      errors.errors.push({ param: 'name', msg: 'name ' + i18n.__('duplicate') });
    }
    if (moment(petData.birthDate).isAfter(moment())) {
      errors.errors.push({ param: 'birthDate', msg: i18n.__('typeMismatch.birthDate') });
    }

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', {
        owner,
        pet: petData,
        types: res.locals.types,
        errors: errors.array(),
        message: req.flash('message'),
        error: req.flash('error')
      });
    }

    try {
      await Pet.create(petData);
      req.flash('message', i18n.__('New Pet has been Added'));
      res.redirect(`/owners/${owner.id}`);
    } catch (error) {
      console.error('Error creating pet:', error);
      next(error);
    }
  }
];

/**
 * @function initUpdatePetForm
 * @description Renders the form to update an existing pet.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Renders the 'pets/createOrUpdatePetForm' view.
 */
exports.initUpdatePetForm = (req, res) => {
  res.render('pets/createOrUpdatePetForm', { pet: req.pet, owner: req.owner, types: res.locals.types, errors: [] });
};

/**
 * @function processUpdatePetForm
 * @description Processes the submission of the pet update form.
 * Validates input, updates the pet, and redirects to the owner details page or back to the form if errors exist.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Redirects or renders.
 */
exports.processUpdatePetForm = [
  // Validate and sanitize input fields
  body('name').trim().notEmpty().withMessage('name ' + i18n.__('required')),
  body('birthDate').trim().notEmpty().withMessage('birthDate ' + i18n.__('required'))
    .isISO8601().toDate().withMessage(i18n.__('typeMismatch.date')),
  body('type').trim().notEmpty().withMessage('type ' + i18n.__('required')),

  async (req, res, next) => {
    const errors = validationResult(req);
    const owner = req.owner;
    const pet = req.pet;
    const petData = {
      name: req.body.name,
      birthDate: req.body.birthDate,
    };

    if (req.body.type) {
      const petType = await PetType.findOne({ where: { name: req.body.type } });
      if (petType) {
        petData.typeId = petType.id;
        petData.type = petType; // For view rendering
      } else {
        errors.errors.push({ param: 'type', msg: i18n.__('type') + ' ' + i18n.__('notFound') });
      }
    }

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', {
        owner,
        pet: { id: pet.id, ...petData },
        types: res.locals.types,
        errors: errors.array(),
        message: req.flash('message'),
        error: req.flash('error')
      });
    }

    // Additional server-side validation for duplicate pet name (excluding the current pet being updated)
    if (owner.pets.some(p => p.id !== pet.id && p.name.toLowerCase() === petData.name.toLowerCase())) {
      errors.errors.push({ param: 'name', msg: 'name ' + i18n.__('duplicate') });
    }
    if (moment(petData.birthDate).isAfter(moment())) {
      errors.errors.push({ param: 'birthDate', msg: i18n.__('typeMismatch.birthDate') });
    }

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdatePetForm', {
        owner,
        pet: { id: pet.id, ...petData },
        types: res.locals.types,
        errors: errors.array(),
        message: req.flash('message'),
        error: req.flash('error')
      });
    }

    try {
      await pet.update(petData);
      req.flash('message', i18n.__('Pet details has been edited'));
      res.redirect(`/owners/${owner.id}`);
    } catch (error) {
      console.error('Error updating pet:', error);
      next(error);
    }
  }
];

// --- Visit-related handlers ---

/**
 * @function initNewVisitForm
 * @description Renders the form to add a new visit for a pet.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Renders the 'pets/createOrUpdateVisitForm' view.
 */
exports.initNewVisitForm = (req, res) => {
  // `req.owner` and `req.pet` are populated by `findOwnerAndPet` middleware
  res.render('pets/createOrUpdateVisitForm', {
    owner: req.owner,
    pet: req.pet,
    visit: { date: moment().format('YYYY-MM-DD') }, // Pre-fill date with current date
    errors: [],
    message: req.flash('message'),
    error: req.flash('error')
  });
};

/**
 * @function processNewVisitForm
 * @description Processes the submission of the new visit form.
 * Validates input, saves the visit, and redirects to the owner details page or back to the form if errors exist.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {Promise<void>} Redirects or renders.
 */
exports.processNewVisitForm = [
  // Validate and sanitize input fields
  body('date').trim().notEmpty().withMessage('date ' + i18n.__('required'))
    .isISO8601().toDate().withMessage(i18n.__('typeMismatch.date')),
  body('description').trim().notEmpty().withMessage('description ' + i18n.__('required')),

  async (req, res, next) => {
    const errors = validationResult(req);
    const owner = req.owner;
    const pet = req.pet;
    const visitData = {
      date: req.body.date,
      description: req.body.description,
      petId: pet.id,
    };

    if (!errors.isEmpty()) {
      return res.render('pets/createOrUpdateVisitForm', {
        owner,
        pet,
        visit: visitData,
        errors: errors.array(),
        message: req.flash('message'),
        error: req.flash('error')
      });
    }

    try {
      await Visit.create(visitData);
      req.flash('message', i18n.__('Your visit has been booked'));
      res.redirect(`/owners/${owner.id}`);
    } catch (error) {
      console.error('Error creating visit:', error);
      next(error);
    }
  }
];
