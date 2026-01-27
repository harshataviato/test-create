/**
 * @fileoverview Controller for handling Visit-related operations for a specific Pet.
 * This includes adding new visits and listing existing visits for a pet.
 */

const { validationResult } = require('express-validator');
const db = require('../models');
const Owner = db.Owner;
const Pet = db.Pet;
const Visit = db.Visit;
const PetType = db.PetType;

/**
 * Helper function to load owner, pet, and their related data, handling not found scenarios.
 * @param {number} ownerId - The ID of the owner.
 * @param {number} petId - The ID of the pet.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 * @returns {Promise<Pet|null>} The pet object with its owner and type if found, otherwise null (and handles response).
 */
async function loadPetWithVisits(ownerId, petId, req, res, next) {
  try {
    const pet = await Pet.findByPk(petId, {
      include: [
        { model: Owner, as: 'owner' },
        { model: PetType, as: 'type' },
        { model: Visit, as: 'visits', order: [['visit_date', 'ASC']] }
      ]
    });

    // Check if pet exists and belongs to the specified owner
    if (!pet || pet.ownerId !== parseInt(ownerId)) {
      req.flash('error', req.__('pet.notFoundForOwner', petId, ownerId));
      if (pet) { // Pet found, but belongs to different owner
        res.redirect(`/owners/${pet.ownerId}/pets/${petId}/visits`); // Redirect to correct owner's pet page
      } else { // Pet not found at all
        res.redirect(`/owners/${ownerId}`); // Redirect to owner details or list
      }
      return null;
    }
    return pet;
  } catch (error) {
    next(error);
    return null;
  }
}

/**
 * @function newVisitForm
 * @description Renders the form for adding a new visit to a specific pet.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.newVisitForm = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;

  const pet = await loadPetWithVisits(ownerId, petId, req, res, next);
  if (!pet) return; // Response already handled by helper

  const visit = Visit.build({ petId: pet.id, date: new Date() }); // Default visit date to today

  res.render('pets/createOrUpdateVisitForm', {
    owner: pet.owner,
    pet: pet,
    visit: visit,
    title: req.__('visit.new')
  });
};

/**
 * @function create
 * @description Handles the submission of the new visit form, creates a new visit record for a pet.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.create = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;

  const pet = await loadPetWithVisits(ownerId, petId, req, res, next);
  if (!pet) return; // Response already handled by helper

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // There are validation errors, re-render the form with error messages
    const visit = Visit.build({ ...req.body, petId: pet.id }); // Re-populate form with submitted data
    return res.render('pets/createOrUpdateVisitForm', {
      owner: pet.owner,
      pet: pet,
      visit: visit,
      title: req.__('visit.new'),
      errors: errors.array()
    });
  }

  try {
    const { date, description } = req.body;
    const newVisit = await Visit.create({
      visitDate: date, // Map to model's 'date' attribute, which uses 'visit_date' field
      description: description,
      petId: pet.id
    });

    // Manually add to pet's visits for immediate display if needed, or re-fetch owner details
    pet.addVisit(newVisit);

    req.flash('message', req.__('visit.created', pet.name, newVisit.date));
    res.redirect(`/owners/${ownerId}`); // Redirect to owner details page

  } catch (error) {
    next(error);
  }
};

/**
 * @function listByPet
 * @description Displays a list of visits for a specific pet.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.listByPet = async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const petId = req.params.petId;

  const pet = await loadPetWithVisits(ownerId, petId, req, res, next);
  if (!pet) return; // Response already handled by helper

  res.render('pets/petVisitsList', {
    owner: pet.owner,
    pet: pet,
    visits: pet.visits, // Visits are already included by loadPetWithVisits
    title: req.__('visit.list')
  });
};

