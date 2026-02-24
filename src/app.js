const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const router = require('./routes');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8080;

// View Engine Setup
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    // Helper to compare values in templates (useful for select options)
    if_eq: function(a, b, opts) {
        if (a == b) return opts.fn(this);
        else return opts.inverse(this);
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/resources', express.static(path.join(__dirname, 'public'))); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/', router);

// Error Handling
app.use((err, req, res, next) => {
  // console.error(err.stack); // Suppress stack trace in tests
  res.status(500).render('error', {
    message: err.message,
    status: 500
  });
});

app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    status: 404
  });
});

// Database Sync and Server Start
// Only start listening if this file is run directly (not required by tests)
if (require.main === module) {
  sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });
}

module.exports = app;
