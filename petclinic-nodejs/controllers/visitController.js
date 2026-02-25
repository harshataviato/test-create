/**
 * @fileoverview Controller for managing visit-related operations for a pet.
 * This includes initializing and processing forms for new visits.
 */

const { Owner, Pet, Visit } = require('../models'); // Import necessary models
const { validationResult } = require('express-validator'); // For handling validation results
const { validateVisitForm } = require('../middleware/validationMiddleware'); // Visit-specific validation rules

/**
 * Middleware to load owner and pet details for visit forms.
 * It fetches the owner and then the specific pet, attaching them to `res.locals`.
 * Also prepares a new Visit instance for the form.
 * @param {object} req - The Express request object, containing `ownerId` and `petId` in `req.params`.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function loadPetWithVisit(req, res, next) {
    const ownerId = req.params.ownerId;
    const petId = req.params.petId;

    try {
        // Fetch the owner and include their pets, ordered by name
        const owner = await Owner.findByPk(ownerId, {
            include: [{
                model: Pet,
                as: 'pets',
                include: ['type', { model: Visit, as: 'visits', order: [['visitDate', 'ASC']] }], // Include pet type and ordered visits
                order: [['name', 'ASC']]
            }]
        });

        if (!owner) {
            req.session.error = res.__('Owner not found with id: ') + ownerId;
            return res.redirect('/owners/find');
        }
        res.locals.owner = owner;

        // Find the specific pet from the owner's pets
        const pet = owner.pets.find(p => p.id === parseInt(petId));

        if (!pet) {
            req.session.error = res.__('Pet with id ') + petId + res.__(' not found for owner with id ') + ownerId + '.';
            return res.redirect(`/owners/${owner.id}`);
        }
        res.locals.pet = pet;

        // Create a new Visit instance for the form, setting the current date as default
        const visit = Visit.build({
            visitDate: new Date(), // Default to current date
            petId: pet.id // Associate with the current pet
        });
        res.locals.visit = visit; // Attach new visit to res.locals

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error in loadPetWithVisit middleware:', error);
        next(error); // Pass the error to the error handling middleware
    }
}

/**
 * Renders the form for creating a new visit.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.initNewVisitForm = [
    loadPetWithVisit, // Ensures owner, pet, and a new visit are loaded
    (req, res) => {
        // Render the 'createOrUpdateVisitForm' view with the loaded data
        res.render('pets/createOrUpdateVisitForm', {
            owner: res.locals.owner,
            pet: res.locals.pet,
            visit: res.locals.visit,
            menu: 'owners'
        });
    }
];

/**
 * Processes the form submission for creating a new visit.
 * Validates the input and saves the new visit to the database.
 * If validation fails, it re-renders the form with error messages.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.processNewVisitForm = [
    loadPetWithVisit, // Ensures owner, pet, and a new visit are loaded
    validateVisitForm(), // Apply visit-specific validation rules
    async (req, res) => {
        const owner = res.locals.owner;
        const pet = res.locals.pet;
        const errors = validationResult(req); // Collect validation errors

        // Reconstruct visit object from body and petId for form re-rendering
        let visit = { ...req.body, petId: pet.id };

        if (!errors.isEmpty()) {
            // If validation errors, re-render the form with existing data and errors
            return res.render('pets/createOrUpdateVisitForm', {
                owner,
                pet,
                visit,
                errors: errors.array(),
                menu: 'owners'
            });
        }

        try {
            // Create the new visit in the database
            await Visit.create({
                visitDate: req.body.date, // Note: form field is 'date', model is 'visitDate'
                description: req.body.description,
                petId: pet.id
            });
            req.session.message = res.__('Your visit has been booked'); // Set success flash message
            res.redirect(`/owners/${owner.id}`); // Redirect to owner details page
        } catch (error) {
            console.error('Error creating new visit:', error);
            req.session.error = res.__('error.general'); // Set error flash message
            res.render('pets/createOrUpdateVisitForm', { owner, pet, visit, menu: 'owners' });
        }
    }
];
