/**
 * @fileoverview Controller for managing owner-related operations in the PetClinic application.
 * This includes creating, finding, updating, and displaying owner details.
 */

const { Owner } = require('../models'); // Import the Owner model
const { validationResult } = require('express-validator'); // For handling validation results
const { validateOwnerForm } = require('../middleware/validationMiddleware'); // Owner-specific validation rules

const ITEMS_PER_PAGE = 5; // Number of owners to display per page in the list view

/**
 * Initializes the form for creating a new owner.
 * Renders the 'createOrUpdateOwnerForm' view with an empty Owner object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.initCreationForm = (req, res) => {
    res.render('owners/createOrUpdateOwnerForm', { owner: {}, menu: 'owners' });
};

/**
 * Processes the form submission for creating a new owner.
 * Validates the input and saves the new owner to the database.
 * If validation fails, it re-renders the form with error messages.
 * @param {object} req - The Express request object, containing form data in `req.body`.
 * @param {object} res - The Express response object.
 */
exports.processCreationForm = [
    // Apply validation middleware before processing the form
    validateOwnerForm(),
    async (req, res) => {
        const errors = validationResult(req); // Collect validation errors

        if (!errors.isEmpty()) {
            // If there are validation errors, re-render the form with existing data and errors
            // The `req.body` contains the submitted form data.
            return res.render('owners/createOrUpdateOwnerForm', {
                owner: req.body, // Pass submitted data back to the form
                errors: errors.array(), // Pass validation errors
                menu: 'owners'
            });
        }

        try {
            // Create a new owner instance and save to the database
            const newOwner = await Owner.create(req.body);
            // Redirect to the owner's detail page with a success message
            req.session.message = res.__('New Owner Created');
            res.redirect(`/owners/${newOwner.id}`);
        } catch (error) {
            console.error('Error creating owner:', error);
            req.session.error = res.__('Error creating owner');
            res.render('owners/createOrUpdateOwnerForm', { owner: req.body, menu: 'owners' });
        }
    }
];

/**
 * Initializes the form for finding owners.
 * Renders the 'findOwners' view with an empty Owner object for search criteria.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.initFindForm = (req, res) => {
    res.render('owners/findOwners', { owner: {}, menu: 'owners' });
};

/**
 * Processes the form submission for finding owners.
 * Searches for owners based on the provided last name and displays results.
 * Handles pagination and redirects if only one owner is found.
 * @param {object} req - The Express request object, potentially containing `lastName` query parameter and `page` number.
 * @param {object} res - The Express response object.
 */
exports.processFindForm = async (req, res) => {
    const lastName = req.query.lastName || ''; // Get last name from query, default to empty string
    const page = parseInt(req.query.page) || 1; // Get current page, default to 1

    try {
        // Find owners by last name with pagination
        const { count, rows } = await Owner.findAndCountAll({
            where: {
                lastName: { [require('sequelize').Op.like]: `${lastName}%` } // Case-insensitive partial match
            },
            limit: ITEMS_PER_PAGE,
            offset: (page - 1) * ITEMS_PER_PAGE,
            order: [['lastName', 'ASC']] // Order results by last name
        });

        if (count === 0) {
            // No owners found, re-render find form with an error message
            return res.render('owners/findOwners', {
                owner: { lastName }, // Pass back the search term
                errors: [{ msg: res.__('lastName') + ' ' + res.__('notFound'), param: 'lastName' }],
                menu: 'owners'
            });
        }

        if (count === 1 && !req.query.hasOwnProperty('page')) {
            // Exactly one owner found and not explicitly navigating pages, redirect to details page
            return res.redirect(`/owners/${rows[0].id}`);
        }

        // Multiple owners found, render the list view with pagination data
        res.render('owners/ownersList', {
            listOwners: rows,
            currentPage: page,
            totalPages: Math.ceil(count / ITEMS_PER_PAGE),
            totalItems: count,
            menu: 'owners'
        });
    } catch (error) {
        console.error('Error finding owners:', error);
        res.render('owners/findOwners', {
            owner: { lastName },
            errors: [{ msg: res.__('error.general') }],
            menu: 'owners'
        });
    }
};

/**
 * Initializes the form for updating an existing owner.
 * Fetches the owner by ID and renders the 'createOrUpdateOwnerForm' with their details.
 * If owner is not found, redirects to the find owners page with an error.
 * @param {object} req - The Express request object, containing `ownerId` in `req.params`.
 * @param {object} res - The Express response object.
 */
exports.initUpdateOwnerForm = async (req, res) => {
    const ownerId = req.params.ownerId;
    try {
        const owner = await Owner.findByPk(ownerId); // Find owner by primary key

        if (!owner) {
            // If owner not found, redirect with an error message
            req.session.error = res.__('Owner not found with id: ') + ownerId;
            return res.redirect('/owners/find');
        }

        res.render('owners/createOrUpdateOwnerForm', { owner, menu: 'owners' });
    } catch (error) {
        console.error('Error initializing update form for owner:', error);
        req.session.error = res.__('error.general');
        res.redirect('/owners/find');
    }
};

/**
 * Processes the form submission for updating an existing owner.
 * Validates the input and updates the owner's details in the database.
 * If validation fails or owner ID mismatch, re-renders the form with errors.
 * @param {object} req - The Express request object, containing `ownerId` in `req.params` and form data in `req.body`.
 * @param {object} res - The Express response object.
 */
exports.processUpdateOwnerForm = [
    // Apply validation middleware before processing the form
    validateOwnerForm(),
    async (req, res) => {
        const ownerId = req.params.ownerId;
        const errors = validationResult(req); // Collect validation errors

        if (!errors.isEmpty()) {
            // If validation errors, re-render the form with existing data and errors
            const owner = { id: ownerId, ...req.body }; // Reconstruct owner object for form
            return res.render('owners/createOrUpdateOwnerForm', {
                owner,
                errors: errors.array(),
                menu: 'owners'
            });
        }

        try {
            // Find the owner to update
            const ownerToUpdate = await Owner.findByPk(ownerId);
            if (!ownerToUpdate) {
                // If owner not found, redirect with an error
                req.session.error = res.__('Owner not found with id: ') + ownerId;
                return res.redirect('/owners/find');
            }

            // Update the owner with new data from the form
            await ownerToUpdate.update(req.body);
            // Redirect to the owner's detail page with a success message
            req.session.message = res.__('Owner Values Updated');
            res.redirect(`/owners/${ownerId}`);
        } catch (error) {
            console.error('Error updating owner:', error);
            req.session.error = res.__('error.general');
            const owner = { id: ownerId, ...req.body };
            res.render('owners/createOrUpdateOwnerForm', { owner, menu: 'owners' });
        }
    }
];

/**
 * Displays the details of a single owner, including their pets and visits.
 * Fetches the owner and their associated data, then renders the 'ownerDetails' view.
 * If owner not found, redirects to the find owners page with an error.
 * @param {object} req - The Express request object, containing `ownerId` in `req.params`.
 * @param {object} res - The Express response object.
 */
exports.showOwner = async (req, res) => {
    const ownerId = req.params.ownerId;
    try {
        // Find owner by ID, including associated pets and their visits
        const owner = await Owner.findByPk(ownerId, {
            include: [{
                association: 'pets',
                include: ['type', {
                    association: 'visits',
                    order: [['visitDate', 'ASC']] // Order visits by date
                }],
                order: [['name', 'ASC']] // Order pets by name
            }]
        });

        if (!owner) {
            // If owner not found, redirect with an error message
            req.session.error = res.__('Owner not found with id: ') + ownerId;
            return res.redirect('/owners/find');
        }

        // Render the owner details page
        res.render('owners/ownerDetails', {
            owner: owner.toJSON(), // Convert Sequelize instance to plain JSON for rendering
            message: req.session.message, // Pass one-time success message from session
            error: req.session.error, // Pass one-time error message from session
            menu: 'owners'
        });

        // Clear one-time messages after use
        delete req.session.message;
        delete req.session.error;
    } catch (error) {
        console.error('Error showing owner details:', error);
        req.session.error = res.__('error.general');
        res.redirect('/owners/find');
    }
};
