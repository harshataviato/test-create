const Startup = require('../models/Startup');

/**
 * Controller handling all business logic for Startups.
 */
class StartupController {
  
  /**
   * Fetches all startups and renders the dashboard.
   */
  async getAllStartups(req, res) {
    try {
      const startups = await Startup.findAll({ order: [['createdAt', 'DESC']] });
      res.render('index', { startups });
    } catch (error) {
      res.status(500).send("Error fetching startups: " + error.message);
    }
  }

  /**
   * Renders the form to create a new startup.
   */
  getCreateForm(req, res) {
    res.render('create');
  }

  /**
   * Logic to save a new startup to the database.
   * @param {Object} req.body - Contains name, industry, valuation, and status.
   */
  async createStartup(req, res) {
    try {
      const { name, industry, valuation, status } = req.body;
      await Startup.create({ name, industry, valuation, status });
      res.redirect('/');
    } catch (error) {
      res.status(400).send("Validation Error: " + error.message);
    }
  }

  /**
   * Deletes a startup by ID.
   * @param {string} req.params.id - The ID of the startup.
   */
  async deleteStartup(req, res) {
    try {
      await Startup.destroy({ where: { id: req.params.id } });
      res.redirect('/');
    } catch (error) {
      res.status(500).send("Delete failed: " + error.message);
    }
  }
}

module.exports = new StartupController();
