const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les services
// @route   GET /api/services
exports.getServices = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer un service
// @route   GET /api/services/:id
exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Créer un service
// @route   POST /api/services
exports.createService = asyncHandler(async (req, res, next) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Mettre à jour un service
// @route   PUT /api/services/:id
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service non trouvé avec l'id ${req.params.id}`, 404));
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Supprimer un service
// @route   DELETE /api/services/:id
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service non trouvé avec l'id ${req.params.id}`, 404));
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Récupérer services par catégorie
// @route   GET /api/services/categorie/:categorie
exports.getServicesByCategorie = asyncHandler(async (req, res, next) => {
  const services = await Service.find({ categorie: req.params.categorie });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});
