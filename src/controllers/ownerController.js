/**
 * Owner Controller
 * Manages Owner lifecycle: Searching, Listing, Creating, and Updating
 */
const { Owner, Pet, PetType, Visit } = require('../models');
const { Op } = require('sequelize');

exports.initFindForm = (req, res) => {
  res.render('owners/findOwners', { owner: {}, menu: 'owners' });
};

exports.processFindForm = async (req, res) => {
  let lastName = req.query.lastName || '';
  
  // Find owners where last name starts with query (Broad search if empty)
  const owners = await Owner.findAll({
    where: { lastName: { [Op.like]: `${lastName}%` } },
    include: [{ model: Pet, as: 'pets' }]
  });

  if (owners.length === 0) {
    return res.render('owners/findOwners', { 
      owner: { lastName }, 
      errors: [{ msg: 'has not been found' }], 
      menu: 'owners' 
    });
  }

  if (owners.length === 1) {
    return res.redirect(`/owners/${owners[0].id}`);
  }

  // Handle Pagination (logic simplified for brevity, defaults to 1 page)
  res.render('owners/ownersList', { 
    listOwners: owners, 
    totalPages: 1, 
    currentPage: 1, 
    menu: 'owners' 
  });
};

exports.showOwner = async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId, {
    include: [
      { 
        model: Pet, 
        as: 'pets',
        include: ['type', { model: Visit, as: 'visits' }]
      }
    ]
  });
  
  if (!owner) throw new Error("Owner not found");
  res.render('owners/ownerDetails', { owner, menu: 'owners' });
};

exports.initCreationForm = (req, res) => {
  res.render('owners/createOrUpdateOwnerForm', { owner: {}, isNew: true, menu: 'owners' });
};

exports.processCreationForm = async (req, res) => {
  try {
    const owner = await Owner.create(req.body);
    res.redirect(`/owners/${owner.id}`);
  } catch (err) {
    res.render('owners/createOrUpdateOwnerForm', { owner: req.body, isNew: true, menu: 'owners' });
  }
};

exports.initUpdateForm = async (req, res) => {
  const owner = await Owner.findByPk(req.params.ownerId);
  res.render('owners/createOrUpdateOwnerForm', { owner, isNew: false, menu: 'owners' });
};

exports.processUpdateForm = async (req, res) => {
  await Owner.update(req.body, { where: { id: req.params.ownerId } });
  res.redirect(`/owners/${req.params.ownerId}`);
};
