/**
 * @fileoverview Controller for managing veterinarian-related operations.
 * This includes displaying a list of vets in both HTML and JSON formats.
 */

const { Vet, Specialty } = require('../models'); // Import Vet and Specialty models

const ITEMS_PER_PAGE = 5; // Number of vets to display per page in the list view

/**
 * Renders the HTML page displaying a paginated list of veterinarians.
 * @param {object} req - The Express request object, potentially containing a `page` query parameter.
 * @param {object} res - The Express response object.
 */
exports.showVetListHtml = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get current page, default to 1

    try {
        // Find all vets with their associated specialties, with pagination
        const { count, rows } = await Vet.findAndCountAll({
            include: [{
                model: Specialty,
                as: 'specialties',
                attributes: ['name'], // Only fetch the name of the specialty
                through: { attributes: [] } // Don't fetch the join table attributes
            }],
            limit: ITEMS_PER_PAGE,
            offset: (page - 1) * ITEMS_PER_PAGE,
            order: [['lastName', 'ASC'], ['firstName', 'ASC']] // Order by last name, then first name
        });

        // Map vets to a format suitable for the view, including specialty names
        const vetsList = rows.map(vet => ({
            id: vet.id,
            firstName: vet.firstName,
            lastName: vet.lastName,
            specialties: vet.specialties.map(s => s.name).sort(), // Sort specialties by name
            nrOfSpecialties: vet.specialties.length // Count of specialties
        }));

        // Render the vet list HTML page
        res.render('vets/vetList', {
            listVets: vetsList,
            currentPage: page,
            totalPages: Math.ceil(count / ITEMS_PER_PAGE),
            totalItems: count,
            menu: 'vets' // Indicate active menu item for layout
        });
    } catch (error) {
        console.error('Error fetching vet list (HTML):', error);
        res.status(500).render('error', { status: 500, message: res.__('error.general'), menu: 'error' });
    }
};

/**
 * Responds with a JSON array of all veterinarians.
 * This serves as an API endpoint for fetching vet data.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
exports.showResourcesVetList = async (req, res) => {
    try {
        // Find all vets with their associated specialties
        const vets = await Vet.findAll({
            include: [{
                model: Specialty,
                as: 'specialties',
                attributes: ['name'], // Only fetch the name of the specialty
                through: { attributes: [] } // Don't fetch the join table attributes
            }],
            order: [['lastName', 'ASC'], ['firstName', 'ASC']]
        });

        // Map vets to a simpler JSON structure if needed, or send as-is
        const vetsJson = vets.map(vet => ({
            id: vet.id,
            firstName: vet.firstName,
            lastName: vet.lastName,
            specialties: vet.specialties.map(s => s.name).sort(),
            nrOfSpecialties: vet.specialties.length
        }));

        // Respond with JSON data
        res.json({ vetList: vetsJson });
    } catch (error) {
        console.error('Error fetching vet list (JSON):', error);
        res.status(500).json({ error: res.__('error.general') });
    }
};
