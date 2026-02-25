/**
 * @fileoverview Controller for managing pet-related operations for an owner.
 * This includes creating, updating, and displaying pet forms.
 */

const { Owner, Pet, PetType } = require('../models'); // Import necessary models
const { validationResult } = require('express-validator'); // For handling validation results
const { validatePetForm } = require('../middleware/petValidator'); // Pet-specific validation rules

/**
 * Middleware to fetch an Owner by ID from the URL and attach it to `res.locals.owner`.
 * This ensures that subsequent middleware/routes have access to the owner object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function findOwnerMiddleware(req, res, next) {
    const ownerId = req.params.ownerId;
    try {
        // Fetch the owner, including their pets
        const owner = await Owner.findByPk(ownerId, { include: [{ model: Pet, as: 'pets' }] });
        if (!owner) {
            // If owner not found, return a 404 or redirect
            req.session.error = res.__('Owner not found with id: ') + ownerId;
            return res.redirect('/owners/find');
        }
        res.locals.owner = owner; // Attach owner to res.locals for access in views/other middleware
        next();
    } catch (error) {
        console.error('Error fetching owner in PetController middleware:', error);
        next(error); // Pass the error to the error handling middleware
    }
}

/**
 * Middleware to fetch PetTypes and attach them to `res.locals.types`.
 * This ensures that views rendering pet forms have access to the list of pet types.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
async function populatePetTypesMiddleware(req, res, next) {
    try {
        // Fetch all pet types, ordered by name
        const types = await PetType.findAll({ order: [['name', 'ASC']] });
        res.locals.types = types; // Attach pet types to res.locals
        next();
    } catch (error) {
        console.error('Error populating pet types in PetController middleware:', error);
        next(error);
    }
}

/**
 * Initializes the form for creating a new pet for a specific owner.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.initCreationForm = [
    findOwnerMiddleware, // Ensure owner is fetched
    populatePetTypesMiddleware, // Ensure pet types are available
    (req, res) => {
        const owner = res.locals.owner;
        const pet = Pet.build(); // Create a new, unsaved pet instance
        res.render('pets/createOrUpdatePetForm', { owner, pet, menu: 'owners' });
    }
];

/**
 * Processes the form submission for creating a new pet.
 * Validates the input and saves the new pet to the database, associating it with the owner.
 * Handles duplicate pet names for the same owner and invalid birth dates.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.processCreationForm = [
    findOwnerMiddleware, // Ensure owner is fetched
    populatePetTypesMiddleware, // Ensure pet types are available
    validatePetForm(), // Apply pet-specific validation rules
    async (req, res) => {
        const owner = res.locals.owner;
        const petData = { ...req.body, ownerId: owner.id }; // Combine form data with ownerId
        const errors = validationResult(req); // Collect validation errors

        let pet = Pet.build(petData); // Create a pet instance from submitted data

        // Custom business logic validation (duplicate name, future birth date)
        if (petData.name && owner.pets.some(p => p.name.toLowerCase() === petData.name.toLowerCase())) {
            // Check for duplicate pet name for this owner
            errors.errors.push({ param: 'name', msg: res.__('duplicate') });
        }

        const birthDate = new Date(petData.birthDate);
        const currentDate = new Date();
        if (birthDate > currentDate) {
            // Check if birth date is in the future
            errors.errors.push({ param: 'birthDate', msg: res.__('typeMismatch.birthDate') });
        }

        if (!errors.isEmpty() || errors.errors.length > 0) {
            // If validation errors, re-render the form
            // Ensure `pet.type` is an object if it was just a string ID from the form
            if (petData.type) {
                pet.type = await PetType.findByPk(petData.type);
            }
            return res.render('pets/createOrUpdatePetForm', {
                owner,
                pet,
                errors: errors.array(),
                menu: 'owners'
            });
        }

        try {
            // Create the new pet in the database
            const newPet = await Pet.create(petData);
            owner.addPet(newPet); // Associate the new pet with the owner instance (in memory for current request)

            req.session.message = res.__('New Pet has been Added'); // Set success flash message
            res.redirect(`/owners/${owner.id}`); // Redirect to owner details
        } catch (error) {
            console.error('Error creating pet:', error);
            req.session.error = res.__('error.general'); // Set error flash message
            res.render('pets/createOrUpdatePetForm', { owner, pet, menu: 'owners' });
        }
    }
];

/**
 * Initializes the form for updating an existing pet.
 * Fetches the pet by ID and renders the 'createOrUpdatePetForm' with its details.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.initUpdateForm = [
    findOwnerMiddleware, // Ensure owner is fetched
    populatePetTypesMiddleware, // Ensure pet types are available
    async (req, res, next) => {
        const owner = res.locals.owner;
        const petId = req.params.petId;
        try {
            // Find the pet, including its type
            const pet = await Pet.findByPk(petId, { include: [PetType] });
            if (!pet || pet.ownerId !== owner.id) {
                // If pet not found or doesn't belong to this owner, handle error
                req.session.error = res.__('Pet not found or does not belong to owner.');
                return res.redirect(`/owners/${owner.id}`);
            }
            res.render('pets/createOrUpdatePetForm', { owner, pet, menu: 'owners' });
        } catch (error) {
            console.error('Error initializing update form for pet:', error);
            next(error);
        }
    }
];

/**
 * Processes the form submission for updating an existing pet.
 * Validates the input and updates the pet's details in the database.
 * Handles duplicate pet names and invalid birth dates.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.processUpdateForm = [
    findOwnerMiddleware, // Ensure owner is fetched
    populatePetTypesMiddleware, // Ensure pet types are available
    validatePetForm(), // Apply pet-specific validation rules
    async (req, res) => {
        const owner = res.locals.owner;
        const petId = req.params.petId;
        const petData = req.body;
        const errors = validationResult(req);

        let petToUpdate = await Pet.findByPk(petId, { include: [PetType] });

        if (!petToUpdate || petToUpdate.ownerId !== owner.id) {
            req.session.error = res.__('Pet not found or does not belong to owner.');
            return res.redirect(`/owners/${owner.id}`);
        }

        // Custom business logic validation (duplicate name for other pets, future birth date)
        if (petData.name && owner.pets.some(p => p.name.toLowerCase() === petData.name.toLowerCase() && p.id != petId)) {
            errors.errors.push({ param: 'name', msg: res.__('duplicate') });
        }

        const birthDate = new Date(petData.birthDate);
        const currentDate = new Date();
        if (birthDate > currentDate) {
            errors.errors.push({ param: 'birthDate', msg: res.__('typeMismatch.birthDate') });
        }

        if (!errors.isEmpty() || errors.errors.length > 0) {
            // Reconstruct pet object for form rendering, including fetched type if present
            if (petData.type) {
                petData.type = await PetType.findByPk(petData.type);
            }
            return res.render('pets/createOrUpdatePetForm', {
                owner,
                pet: { ...petToUpdate.toJSON(), ...petData, id: petId }, // Merge existing and new data for rendering
                errors: errors.array(),
                menu: 'owners'
            });
        }

        try {
            // Update the pet in the database
            await petToUpdate.update(petData);
            req.session.message = res.__('Pet details has been edited'); // Set success flash message
            res.redirect(`/owners/${owner.id}`); // Redirect to owner details
        } catch (error) {
            console.error('Error updating pet:', error);
            req.session.error = res.__('error.general'); // Set error flash message
            res.render('pets/createOrUpdatePetForm', { owner, pet: { ...petToUpdate.toJSON(), ...petData, id: petId }, menu: 'owners' });
        }
    }
];
