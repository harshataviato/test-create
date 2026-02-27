const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const actuator = require('express-actuator');
const path = require('path');

const { seed } = require('./models');
const i18nMiddleware = require('./middleware/i18n');
const cacheService = require('./services/cacheService');
const vetRoutes = require('./routes/vetRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

const app = express();

/**
 * OAuth2: Google Login Configuration
 */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  (accessToken, refreshToken, profile, cb) => {
    // In a real app, find or create user in DB
    return cb(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Express Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// I18n Middleware
app.use(i18nMiddleware);

/**
 * System Health and Error Diagnostics
 * Spring Actuator-like endpoints and custom error handling.
 */
app.use(actuator({
  basePath: '/management',
  customEndpoints: [{
    id: 'cache-stats',
    controller: (req, res) => res.json(cacheService.getStats())
  }]
}));

// Routes
app.get('/', (req, res) => res.render('index', { user: req.user }));

// OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

app.use(vetRoutes);
app.use(ownerRoutes);

/**
 * Global Error Handling
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!', error: err });
});

// Start Server
const PORT = process.env.PORT || 3000;
seed().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health checks available at http://localhost:${PORT}/management/health`);
  });
});
