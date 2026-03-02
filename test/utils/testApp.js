/**
 * Test App Instance
 * Recreates the Express App configuration from server.js but for testing environment.
 * Uses in-memory SQLite database.
 */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const Sequelize = require('sequelize');

// Create specific Sequelize instance for testing (In-Memory)
const sequelize = new Sequelize('sqlite::memory:', {
    logging: false // Keep test output clean
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Manually Load Models with the Test DB instance
// We cannot require models/index.js directly because it requires config/database.js
// which points to the file-based DB. We inject the test sequelize instance.
const OwnerModel = require('../../models/owner')(sequelize, Sequelize);
const PetModel = require('../../models/pet')(sequelize, Sequelize);
const PetTypeModel = require('../../models/petType')(sequelize, Sequelize);
const VisitModel = require('../../models/visit')(sequelize, Sequelize);
const VetModel = require('../../models/vet')(sequelize, Sequelize);
const SpecialtyModel = require('../../models/specialty')(sequelize, Sequelize);

// Re-establish Associations (Copy from models/index.js)
OwnerModel.hasMany(PetModel, { as: 'pets', foreignKey: 'ownerId', onDelete: 'CASCADE' });
PetModel.belongsTo(OwnerModel, { as: 'owner', foreignKey: 'ownerId' });
PetTypeModel.hasMany(PetModel, { foreignKey: 'typeId' });
PetModel.belongsTo(PetTypeModel, { as: 'type', foreignKey: 'typeId' });
PetModel.hasMany(VisitModel, { as: 'visits', foreignKey: 'petId', onDelete: 'CASCADE' });
VisitModel.belongsTo(PetModel, { foreignKey: 'petId' });
VetModel.belongsToMany(SpecialtyModel, { through: 'vet_specialties', as: 'specialties', foreignKey: 'vetId' });
SpecialtyModel.belongsToMany(VetModel, { through: 'vet_specialties', foreignKey: 'specialtyId' });

const models = {
    Owner: OwnerModel,
    Pet: PetModel,
    PetType: PetTypeModel,
    Visit: VisitModel,
    Vet: VetModel,
    Specialty: SpecialtyModel
};

// Mock the models/index.js requirement for routes
// Since routes require('../models'), we rely on caching or we need to pass models.
// However, Node's require cache makes this tricky without Dependency Injection.
// To workaround without changing source code, we use a proxy via a slightly hacky method
// or we just trust that the routes will pick up the 'models' if we mock the file.
// Ideally, routes should accept models as arguments.
// 
// STRATEGY: We will rely on the fact that if we load routes *after* mocking, 
// strictly speaking, the routes file `require('../models')` will load the file from disk.
// The file from disk loads `config/database`. 
//
// To make this robust without changing source code, we will actually just use the 
// standard app flow but we will set process.env.DATABASE to force a behavior if possible, 
// OR we will monkey-patch the `config/database.js` export if necessary.
//
// SIMPLER STRATEGY: We will just use the standard `models/index` but force the config 
// to be memory by setting the sequelize instance on the exported db object *before* loading routes.

const realDb = require('../../config/database');
realDb.sequelize = sequelize; // Override with in-memory instance
realDb.Sequelize = Sequelize;

// Now load routes
const indexRoutes = require('../../routes/index');
const ownerRoutes = require('../../routes/owner');
const vetRoutes = require('../../routes/vet');
const petRoutes = require('../../routes/pet');
const visitRoutes = require('../../routes/visit');
const crashRoutes = require('../../routes/crash');

const app = express();

// View Engine (Use actual views)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.currentPath = req.path;
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/owners', ownerRoutes);
app.use('/vets', vetRoutes);
app.use('/owners/:ownerId/pets', petRoutes);
app.use('/owners/:ownerId/pets/:petId/visits', visitRoutes);
app.use('/oups', crashRoutes);

app.use((req, res) => res.status(404).send('Not Found'));
app.use((err, req, res, next) => res.status(500).send(err.message));

module.exports = { app, db: models, sequelize };
