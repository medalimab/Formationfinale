const express = require('express');
const {
  getRendezVous,
  getMesRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVousStatut,
  deleteRendezVous
} = require('../controllers/rendezVous.controller');

const RendezVous = require('../models/RendezVous');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent d'être authentifié
router.use(protect);

router.route('/me')
  .get(getMesRendezVous);

router.route('/')
  .get(authorize('admin'), advancedResults(RendezVous, 'client'), getRendezVous)
  .post(createRendezVous);

router.route('/:id')
  .get(getRendezVousById)
  .delete(authorize('admin'), deleteRendezVous);

router.route('/:id/statut')
  .put(updateRendezVousStatut);

module.exports = router;
