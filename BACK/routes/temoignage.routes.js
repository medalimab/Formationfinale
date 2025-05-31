const express = require('express');
const {
  getTemoignages,
  getTemoignagesApprouves,
  getTemoignage,
  createTemoignage,
  approuverTemoignage,
  updateTemoignage,
  deleteTemoignage
} = require('../controllers/temoignage.controller');

const Temoignage = require('../models/Temoignage');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/approuves')
  .get(getTemoignagesApprouves);

router.route('/')
  .get(advancedResults(Temoignage), getTemoignages)
  .post(createTemoignage);

router.route('/:id')
  .get(getTemoignage)
  .put(protect, authorize('admin'), updateTemoignage)
  .delete(protect, authorize('admin'), deleteTemoignage);

router.route('/:id/approuver')
  .put(protect, authorize('admin'), approuverTemoignage);

module.exports = router;
