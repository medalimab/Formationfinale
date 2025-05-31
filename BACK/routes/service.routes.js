const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategorie
} = require('../controllers/service.controller');

const Service = require('../models/Service');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/categorie/:categorie')
  .get(getServicesByCategorie);

router.route('/')
  .get(advancedResults(Service), getServices)
  .post(protect, authorize('admin'), createService);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('admin'), updateService)
  .delete(protect, authorize('admin'), deleteService);

module.exports = router;
