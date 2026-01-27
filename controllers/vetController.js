/**
 * @fileoverview Controller for handling Vet-related operations.
 * This includes listing all vets and providing a JSON API for vets.
 */

const db = require('../models');
const Vet = db.Vet;
const Specialty = db.Specialty;

/**
 * @function index
 * @description Renders the page listing all veterinarians.
 * Includes their specialties, sorted by last name then first name.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.index = async (req, res, next) => {
  try {
    const vets = await Vet.findAll({
      include: [{ model: Specialty, as: 'specialties' }],
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC']
      ]
    });

    res.render('vets/vetList', { vets: vets, title: req.__('vet.list') });
  } catch (error) {
    next(error);
  }
};

/**
 * @function listVetsApi
 * @description Provides a JSON API endpoint for all veterinarians.
 * Includes their specialties.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
exports.listVetsApi = async (req, res, next) => {
  try {
    const vets = await Vet.findAll({
      include: [{ model: Specialty, as: 'specialties' }],
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC']
      ]
    });
    res.json({ vets: vets });
  } catch (error) {
    next(error);
  }
};

