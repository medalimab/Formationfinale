const express = require('express');
const {
  envoyerContact,
  getContacts,
  getContact,
  traiterContact,
  deleteContact
} = require('../controllers/contact.controller');

const Contact = require('../models/Contact');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Route publique pour envoyer un contact
router.post('/', envoyerContact);

// Protection des routes admin
router.use(protect, authorize('admin'));

router.route('/')
  .get(advancedResults(Contact), getContacts);

router.route('/:id')
  .get(getContact)
  .delete(deleteContact);

router.route('/:id/traiter')
  .put(traiterContact);

module.exports = router;
