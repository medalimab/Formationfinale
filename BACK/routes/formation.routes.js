const express = require('express');
const upload = require('../middleware/upload');
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
  .put(
    protect,
    authorize('formateur', 'admin'),
    upload.single('image'), // Ajout du middleware multer pour gérer FormData aussi en update
    updateFormation
  )
  .delete(protect, authorize('formateur', 'admin'), deleteFormation);

module.exports = router;