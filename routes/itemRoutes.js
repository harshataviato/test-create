/**
 * @fileoverview Defines all API routes for Item resources.
 * This module sets up Express Router to map HTTP requests to corresponding
 * controller functions for creating, reading, updating, and deleting items.
 */

const express = require('express');
const router = express.Router(); // Create a new Express router instance
const itemController = require('../controllers/itemController'); // Import the item controller

// --- Item Routes Definition ---

/**
 * GET /items
 * Route to display a list of all items.
 * Maps to the `getAllItems` method in the itemController.
 */
router.get('/', itemController.getAllItems);

/**
 * GET /items/create
 * Route to display the form for creating a new item.
 * Maps to the `getCreateItemForm` method in the itemController.
 */
router.get('/create', itemController.getCreateItemForm);

/**
 * POST /items
 * Route to handle the submission of the new item form.
 * Creates a new item in the database.
 * Maps to the `createItem` method in the itemController.
 */
router.post('/', itemController.createItem);

/**
 * GET /items/:id/edit
 * Route to display the form for editing an existing item.
 * The `:id` is a URL parameter representing the item's unique identifier.
 * Maps to the `getEditItemForm` method in the itemController.
 */
router.get('/:id/edit', itemController.getEditItemForm);

/**
 * PUT /items/:id
 * Route to handle the submission of the edit item form.
 * Updates an existing item in the database.
 * Uses `method-override` middleware to allow browser forms to send PUT requests.
 * Maps to the `updateItem` method in the itemController.
 */
router.put('/:id', itemController.updateItem);

/**
 * DELETE /items/:id
 * Route to handle the deletion of an item.
 * Deletes an item from the database.
 * Uses `method-override` middleware to allow browser forms to send DELETE requests.
 * Maps to the `deleteItem` method in the itemController.
 */
router.delete('/:id', itemController.deleteItem);

// Export the router to be used by the main application (app.js)
module.exports = router;
