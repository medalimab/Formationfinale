const express = require('express');
const multer = require('multer');
const {
  getRendezVous,
  getMesRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVousStatut,
  deleteRendezVous,
  updateRendezVous,
  getRendezVousByFormateur
} = require('../controllers/rendezVous.controller');

const RendezVous = require('../models/RendezVous');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const upload = multer(); // stockage en mémoire, à adapter si besoin

// Toutes les routes nécessitent d'être authentifié
router.use(protect);

router.route('/me')
  .get(getMesRendezVous);

router.route('/')
  .get(authorize('admin'), advancedResults(RendezVous, 'client'), getRendezVous)
  .post(upload.single('image'), createRendezVous);

router.route('/by-formateur')
  .get(authorize('formateur', 'admin'), getRendezVousByFormateur);

router.route('/:id')
  .get(getRendezVousById)
  .put(protect, updateRendezVous)
  .delete(protect, deleteRendezVous);

router.route('/:id/statut')
  .put(updateRendezVousStatut);

module.exports = router;
