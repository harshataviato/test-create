const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const sequelize = require('./config/database');
const startupRoutes = require('./routes/startupRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Allows us to use DELETE/PUT in HTML forms
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', startupRoutes);

/**
 * Initialize Database and Start Server
 */
async function startServer() {
  try {
    // Sync database (creates tables if they don't exist)
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
