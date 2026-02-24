import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import sequelize from './config/database.js';
import routes from './routes/index.js';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // Use views/layout.ejs

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple Flash Message Middleware (Alternative to connect-flash to keep deps low)
import session from 'express-session';
app.use(session({
    secret: 'petclinic-secret',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    req.flash = (type, message) => {
        if (message) {
            req.session[type] = message;
        } else {
            const msg = req.session[type];
            delete req.session[type];
            return msg;
        }
    };
    // Make flash messages available to all views
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Routes
app.use('/', routes);

// 404 Handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    res.render('error', { message: 'The requested page was not found.', error: err });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500);
    res.render('error', { message: err.message, error: err });
});

// Database Connection & Server Start
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
