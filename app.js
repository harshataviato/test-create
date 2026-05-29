/**
 * @module app
 * @description Main entry point for the Node.js Express application.
 *              Sets up the Express server, middleware, view engine, and routes.
 */

const express = require('express'); // Import the Express framework
const path = require('path');       // Import the path module for working with file and directory paths
const methodOverride = require('method-override'); // Import method-override for PUT and DELETE requests from forms
const expressLayouts = require('express-ejs-layouts'); // Import express-ejs-layouts for EJS layouts
const taskRoutes = require('./routes/taskRoutes'); // Import task routes
// Removed: const ejs = require('ejs'); // Explicitly import EJS - express-ejs-layouts handles EJS engine registration

const app = express(); // Create an Express application instance
const PORT = process.env.PORT || 3000; // Define the port the server will listen on

// --- View Engine Setup (should be done early) ---

// Removed: app.engine('ejs', ejs.renderFile); // This explicit engine registration can interfere with express-ejs-layouts

/**
 * @description Set EJS as the template engine for rendering views.
 */
app.set('view engine', 'ejs');

/**
 * @description Specify the directory where the view templates are located.
 *              `path.join(__dirname, 'views')` ensures the views directory is found correctly.
 */
app.set('views', path.join(__dirname, 'views'));

/**
 * @description Set the default layout file for express-ejs-layouts.
 *              This must be called BEFORE app.use(expressLayouts) for the layout to be available.
 */
app.set('layout', 'layout'); // Explicitly set the default layout file

/**
 * @function expressLayouts
 * @description Middleware to enable EJS layouts. This must be used after setting the view engine.
 *              This middleware automatically configures EJS to use layouts.
 */
app.use(expressLayouts);

// --- Middleware Setup ---

/**
 * @function express.urlencoded
 * @description Middleware to parse URL-encoded bodies (from HTML forms).
 *              It populates `req.body` with parsed data. `extended: true` allows for rich objects and arrays.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * @function methodOverride
 * @description Middleware to allow forms to use HTTP verbs such as PUT or DELETE.
 *              It looks for a `_method` query parameter or form field to override the HTTP method.
 * @param {string} '_method' - The query parameter or form field name to look for.
 */
app.use(methodOverride('_method'));

/**
 * @function express.static
 * @description Middleware to serve static files (CSS, JavaScript, images) from the 'public' directory.
 *              The `path.join(__dirname, 'public')` ensures the path is resolved correctly regardless of where the script is run.
 */
app.use(express.static(path.join(__dirname, 'public')));


// --- Routes Setup ---

/**
 * @function app.get('/')
 * @description Defines a route for the root URL (`/`).
 *              Renders the `home.ejs` view when accessed.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
app.get('/', (req, res) => {
    res.render('home', { title: 'Welcome' }); // Renders views/home.ejs with a title variable
});

/**
 * @function app.use('/tasks')
 * @description Mounts the task-specific routes under the `/tasks` path.
 *              All routes defined in `taskRoutes.js` will be prefixed with `/tasks`.
 */
app.use('/tasks', taskRoutes);

// --- Error Handling Middleware ---

/**
 * @function app.use(errorHandler)
 * @description Generic error handling middleware.
 *              This catches any errors that occur in the application and sends a user-friendly response.
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console for debugging
    res.status(500).render('error', { // Render an error page with a 500 status code
        title: 'Error',
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {} // Show error details only in development
    });
});

// --- Server Initialization ---

/**
 * @function app.listen
 * @description Starts the Express server and makes it listen for incoming requests on the specified port.
 * @param {number} PORT - The port number to listen on.
 * @param {function} callback - A function to execute once the server starts successfully.
 */
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export the app for testing purposes
module.exports = app;
