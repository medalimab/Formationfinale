const express = require('express');
const {
  getDevis,
  getMesDevis,
  getDevisById,
  createDevis,
  updateDevisStatut,
  deleteDevis
} = require('../controllers/devis.controller');

const Devis = require('../models/Devis');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent d'être authentifié
router.use(protect);

router.route('/client')
  .get(getMesDevis);

router.route('/')
  .get(authorize('admin'), advancedResults(Devis, 'client'), getDevis)
  .post(createDevis);

router.route('/:id')
  .get(getDevisById)
  .delete(deleteDevis);

router.route('/:id/statut')
  .put(authorize('admin'), updateDevisStatut);

module.exports = router;
