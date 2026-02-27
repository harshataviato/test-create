const express = require('express');
const path = require('path');
const i18n = require('i18n');
const methodOverride = require('method-override');
const { sequelize } = require('./src/db/models');

const app = express();
const PORT = process.env.PORT || 8080;

// Internationalization Configuration
i18n.configure({
    locales: ['en', 'de', 'es', 'fa', 'ko', 'pt', 'ru', 'tr'],
    directory: path.join(__dirname, 'src/locales'),
    defaultLocale: 'en',
    objectNotation: true,
    queryParameter: 'lang',
    register: global
});

// Express Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(i18n.init);

// Custom middleware to handle pagination variables for templates
app.use((req, res, next) => {
    res.locals.url = req.url;
    next();
});

// Route Controllers
const ownerRoutes = require('./src/routes/ownerRoutes');
const vetRoutes = require('./src/routes/vetRoutes');

app.get('/', (req, res) => res.render('welcome', { menu: 'home' }));
app.use('/owners', ownerRoutes);
app.use('/vets.html', vetRoutes);

// Error Handler (The "/oups" behavior)
app.get('/oups', (req, res) => {
    throw new Error('Expected: controller used to showcase what happens when an exception is thrown');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        status: 500, 
        message: err.message,
        menu: 'error'
    });
});

// Sync Database and Start
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`PetClinic Server running at http://localhost:${PORT}`);
    });
});
