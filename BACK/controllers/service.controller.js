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
  // Vérifier si l'utilisateur est authentifié
  if (!req.user || !req.user.id) {
    console.error('Tentative de création de service sans utilisateur authentifié');
    return next(new ErrorResponse('Non autorisé - utilisateur non authentifié', 401));
  }

  // Ajouter l'ID de l'utilisateur authentifié au service
  req.body.user = req.user.id;

  // Si un fichier image est uploadé, stocker son nom dans req.body.image
  if (req.file && req.file.filename) {
    req.body.image = '/uploads/' + req.file.filename;
  } else {
    delete req.body.image; // On ne met pas d'image si aucun fichier
  }

  console.log('Création de service avec utilisateur:', req.user.id);
  console.log('Données du service:', req.body);

  try {
    const service = await Service.create(req.body);
    console.log('Service créé avec succès:', service._id);
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erreur lors de la création du service:', error.message);
    return next(new ErrorResponse(`Erreur lors de la création du service: ${error.message}`, 400));
  }
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

// @desc    Récupérer les services d'un utilisateur
// @route   GET /api/services/mes-services
exports.getUserServices = asyncHandler(async (req, res, next) => {
  console.log('Recherche des services pour utilisateur:', req.user.id);
  
  const services = await Service.find({ user: req.user.id });
  
  console.log(`Services trouvés: ${services.length}`);

  // Ne pas retourner une erreur si aucun service n'est trouvé
  res.status(200).json({
    success: true,
    count: services.length,
    data: services || []
  });
});
