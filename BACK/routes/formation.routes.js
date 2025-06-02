const express = require('express');
const multer = require('multer');
const {
  getFormations,
  getFormation,
  createFormation,
  updateFormation,
  deleteFormation,
  getUserFormations
} = require('../controllers/formation.controller');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Formation = require('../models/Formation');

const router = express.Router();
const upload = multer(); // stockage en mémoire, à adapter si besoin

router.route('/mes-formations')
  .get(protect, getUserFormations);

router.route('/')
  .get(advancedResults(Formation, 'formateur'), getFormations)
  .post(
    protect,
    authorize('formateur', 'admin'),
    upload.single('image'), // Ajout du middleware multer pour gérer FormData
    createFormation
  );

router.route('/:id')
  .get(getFormation)
  .put(protect, authorize('formateur', 'admin'), updateFormation)
  .delete(protect, authorize('formateur', 'admin'), deleteFormation);

module.exports = router;