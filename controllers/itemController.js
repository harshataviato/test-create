/**
 * @fileoverview Controller for handling all Item-related requests.
 * This module contains functions to manage CRUD operations for Item resources,
 * interacting with the database through Sequelize models and rendering appropriate views.
 */

const { Item } = require('../models'); // Import the Item model from our Sequelize setup

/**
 * Renders the page to display all items.
 * Fetches all items from the database and passes them to the 'items/index' view.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} Renders the item list view or sends a 500 error.
 */
exports.getAllItems = async (req, res) => {
    try {
        // Find all records in the Item table
        const items = await Item.findAll({
            order: [['createdAt', 'DESC']] // Order items by creation date, newest first
        });
        // Render the 'items/index' view, passing the fetched items data
        res.render('items/index', { items: items, title: 'All Items' });
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error fetching items:', error);
        // Render an error page or send a generic error response
        res.status(500).render('error', { message: 'Failed to load items.', error: error });
    }
};

/**
 * Renders the form to create a new item.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void} Renders the item creation form.
 */
exports.getCreateItemForm = (req, res) => {
    // Simply render the 'items/create' view, which contains the form for new items
    res.render('items/create', { title: 'Create New Item' });
};

/**
 * Handles the submission of the new item form.
 * Creates a new item in the database with the provided data from the request body.
 *
 * @param {object} req - The Express request object, containing form data in `req.body`.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} Redirects to the item list on success, or renders an error.
 */
exports.createItem = async (req, res) => {
    try {
        const { name, description, price } = req.body; // Extract data from the request body

        // Validate incoming data (basic validation for demonstration)
        if (!name || !description || !price) {
            return res.status(400).render('items/create', {
                title: 'Create New Item',
                error: 'All fields are required.',
                item: { name, description, price } // Repopulate form with existing data
            });
        }
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            return res.status(400).render('items/create', {
                title: 'Create New Item',
                error: 'Price must be a positive number.',
                item: { name, description, price }
            });
        }

        // Create a new item record in the database
        await Item.create({ name, description, price: parseFloat(price) });
        // Redirect to the items listing page after successful creation
        res.redirect('/items');
    } catch (error) {
        console.error('Error creating item:', error);
        // If there's a database error, re-render the form with an error message
        res.status(500).render('items/create', {
            title: 'Create New Item',
            error: 'Failed to create item. Please try again.',
            item: req.body // Repopulate form with data user tried to submit
        });
    }
};

/**
 * Renders the form to edit an existing item.
 * Fetches the item by its ID from the database and passes its data to the 'items/edit' view.
 *
 * @param {object} req - The Express request object, containing `id` in `req.params`.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} Renders the item edit form or redirects if item not found.
 */
exports.getEditItemForm = async (req, res) => {
    try {
        const { id } = req.params; // Get the item ID from the URL parameters
        // Find an item by its primary key (ID)
        const item = await Item.findByPk(id);

        if (!item) {
            // If item is not found, redirect to the items list with an error message (optional)
            // For a simple app, a direct redirect might be sufficient, for complex apps, flash messages are better.
            return res.redirect('/items');
        }
        // Render the 'items/edit' view, passing the found item's data
        res.render('items/edit', { item: item, title: `Edit Item: ${item.name}` });
    } catch (error) {
        console.error('Error fetching item for edit:', error);
        res.status(500).render('error', { message: 'Failed to load item for editing.', error: error });
    }
};

/**
 * Handles the submission of the edit item form.
 * Updates an existing item in the database with the provided data.
 *
 * @param {object} req - The Express request object, containing `id` in `req.params` and form data in `req.body`.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} Redirects to the item list on success, or renders an error.
 */
exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params; // Get the item ID from the URL parameters
        const { name, description, price } = req.body; // Extract updated data from the request body

        // Find the item by its primary key
        const item = await Item.findByPk(id);

        if (!item) {
            return res.redirect('/items'); // Item not found, redirect
        }

        // Validate incoming data
        if (!name || !description || !price) {
            return res.status(400).render('items/edit', {
                title: `Edit Item: ${item.name}`,
                error: 'All fields are required.',
                item: { ...item.toJSON(), name, description, price } // Repopulate form
            });
        }
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            return res.status(400).render('items/edit', {
                title: `Edit Item: ${item.name}`,
                error: 'Price must be a positive number.',
                item: { ...item.toJSON(), name, description, price }
            });
        }

        // Update the item's properties and save to the database
        item.name = name;
        item.description = description;
        item.price = parseFloat(price);
        await item.save(); // Persist changes to the database

        // Redirect to the items listing page after successful update
        res.redirect('/items');
    } catch (error) {
        console.error('Error updating item:', error);
        // In case of error, try to fetch the item again to re-render the edit form with error message
        const { id } = req.params;
        const item = await Item.findByPk(id); // Re-fetch the original item or current request data
        res.status(500).render('items/edit', {
            title: `Edit Item: ${item ? item.name : 'Unknown'}`,
            error: 'Failed to update item. Please try again.',
            item: item ? { ...item.toJSON(), ...req.body } : req.body // Repopulate with original + attempted changes
        });
    }
};

/**
 * Handles the deletion of an item.
 * Deletes an item from the database based on its ID.
 *
 * @param {object} req - The Express request object, containing `id` in `req.params`.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} Redirects to the item list on success, or sends a 500 error.
 */
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params; // Get the item ID from the URL parameters
        // Destroy (delete) the item record from the database by its primary key
        const deletedRows = await Item.destroy({
            where: { id: id }
        });

        if (deletedRows === 0) {
            // If no rows were deleted, it means the item was not found
            console.warn(`Attempted to delete non-existent item with ID: ${id}`);
        }
        // Redirect to the items listing page after successful deletion (or attempted deletion)
        res.redirect('/items');
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).render('error', { message: 'Failed to delete item.', error: error });
    }
};
