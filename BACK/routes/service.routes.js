const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategorie,
  getUserServices
} = require('../controllers/service.controller');

const Service = require('../models/Service');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer(); // stockage en mémoire, à adapter si besoin

const router = express.Router();

router.route('/categorie/:categorie')
  .get(getServicesByCategorie);

router.route('/mes-services')
  .get(protect, getUserServices);

router.route('/')
  .get(advancedResults(Service), getServices)
  .post(
    protect,
    authorize('admin', 'formateur'),
    upload.single('image'), // Ajout du middleware multer pour gérer FormData
    createService
  );

router.route('/:id')
  .get(getService)
  .put(protect, authorize('admin', 'formateur'), updateService)
  .delete(protect, authorize('admin', 'formateur'), deleteService);

module.exports = router;
