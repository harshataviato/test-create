/**
 * @module controllers/homeController
 * @description Controller for rendering the application's home page.
 */

/**
 * @function renderHomePage
 * @description Renders the main index page of the application.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
exports.renderHomePage = (req, res) => {
  res.render('index', { title: res.__('home.welcomeTitle') });
};
