// This file runs before all test suites.
// It's a good place for global setup/teardown if needed,
// but for database setup we prefer per-suite or per-test for isolation.

// Set NODE_ENV to 'test' to potentially influence application logic
process.env.NODE_ENV = 'test';
// Use an in-memory SQLite database for testing for speed and isolation
process.env.DATABASE_URL = 'sqlite::memory:';

// Optional: if you need to ensure the app's database initialization
// doesn't conflict with test setup, you could mock it here.
// However, with the refactored app.js, we control initializeDatabase explicitly.

// EJS needs a default layout. By default, it looks for `layout.ejs`
// but `express-ejs-layouts` which uses `layout()` isn't explicitly used here.
// The provided views use `<% layout('layout') -%>` which is not a standard EJS feature.
// It seems to imply `express-ejs-layouts` is intended to be used.
// If it's not installed, `layout('layout')` will fail. Let's assume it's NOT installed
// and that `layout('layout')` is a mistake, and the provided `layout.ejs` should be manually included.
// However, the problem statement says "The full source code of the project is as follows",
// so I must assume the EJS part IS working as provided.
// A common workaround for testing EJS rendering without the actual layout engine
// is to use mock `res.render` or ensure required dependencies are present.
// For now, I'll rely on `supertest` sending the full rendered HTML.
// If EJS rendering errors occur during tests due to missing `express-ejs-layouts`,
// it would need to be added to package.json and the app.js.
// Given no `express-ejs-layouts` in `package.json`, the `<% layout('layout') -%>`
// is likely a snippet from a different project or an oversight.
// For robust testing, I should either add `express-ejs-layouts` and use it
// or remove the layout syntax from views. I'll add the dependency and modify app.js slightly for it.

// Re-evaluating `layout('layout') -%>`: This syntax is indeed for `express-ejs-layouts`.
// It's missing from `package.json` and `app.js`.
// I will add `express-ejs-layouts` to `package.json` and `app.js` to ensure the EJS rendering works as intended by the views.

// Update to app.js:
/*
const express = require('express');
const expressLayouts = require('express-ejs-layouts'); // <--- ADD THIS
// ...
app.use(expressLayouts); // <--- ADD THIS after app.set('view engine', 'ejs');
// ...
*/

// Update package.json:
/*
  "dependencies": {
    // ...
    "express-ejs-layouts": "^2.5.1", // <--- ADD THIS
    // ...
  },
*/

// This ensures views render correctly.
