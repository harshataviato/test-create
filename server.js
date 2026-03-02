const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const { sequelize } = require('./models');
const seed = require('./utils/seed');

const app = express();
const PORT = process.env.PORT || 8080;

// Config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const routes = require('./routes/index');
app.use('/', routes);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err });
});

app.use((req, res, next) => {
    res.status(404).render('error', { error: { message: "The requested page was not found." } });
});

// Database Sync and Server Start
// Using .sync() makes sure tables exist.
// Running seed() ensures default data exists if tables are empty.
sequelize.sync().then(async () => {
    // Simple check to see if we need to seed
    const { PetType } = require('./models');
    const count = await PetType.count();
    if (count === 0) {
        await seed();
    }
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
