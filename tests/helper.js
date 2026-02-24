import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
import routes from '../routes/index.js';

// Recreate the Express App configuration for testing purposes
// This avoids importing server.js directly which would start the listener
export const createTestApp = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Adjust path to point to root views
    const viewsPath = path.join(__dirname, '../views');
    const publicPath = path.join(__dirname, '../public');

    const app = express();

    app.set('view engine', 'ejs');
    app.set('views', viewsPath);
    app.use(expressLayouts);
    app.set('layout', 'layout');

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(express.static(publicPath));

    app.use(session({
        secret: 'test-secret',
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
        res.locals.message = req.session.message;
        delete req.session.message;
        next();
    });

    app.use('/', routes);

    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err.status = 404;
        res.render('error', { message: 'The requested page was not found.', error: err });
    });

    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', { message: err.message, error: err });
    });

    return app;
};
