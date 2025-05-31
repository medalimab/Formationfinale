const express = require('express');
const {
  getFormations,
  getFormation,
  createFormation,
  updateFormation,
  deleteFormation
} = require('../controllers/formation.controller');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Formation = require('../models/Formation');

const router = express.Router();

router.route('/')
  .get(advancedResults(Formation, 'formateur'), getFormations)
  .post(protect, authorize('formateur', 'admin'), createFormation);

router.route('/:id')
  .get(getFormation)
  .put(protect, authorize('formateur', 'admin'), updateFormation)
  .delete(protect, authorize('formateur', 'admin'), deleteFormation);

module.exports = router;