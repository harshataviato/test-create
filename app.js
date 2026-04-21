/**
 * Main entry point for the application.
 * Replaces the Spring Boot Application class.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const taskRoutes = require('./routes/task.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up view engine (Equivalent to Thymeleaf/JSP in Java)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routing
app.use('/', taskRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
