/**
 * @fileoverview Controller for handling the welcome page.
 * This module exports functions to render the main welcome view of the application.
 */

/**
 * Renders the welcome page.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.welcome = (req, res) => {
    // Render the 'welcome.ejs' view. The 'home' parameter indicates the active menu item.
    res.render('welcome', { menu: 'home' });
};
