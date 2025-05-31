const Devis = require('../models/Devis');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les devis
// @route   GET /api/devis
exports.getDevis = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer les devis d'un client
// @route   GET /api/devis/client
exports.getMesDevis = asyncHandler(async (req, res, next) => {
  const devis = await Devis.find({ client: req.user.id });

  res.status(200).json({
    success: true,
    count: devis.length,
    data: devis
  });
});

// @desc    Récupérer un devis
// @route   GET /api/devis/:id
exports.getDevisById = asyncHandler(async (req, res, next) => {
  const devis = await Devis.findById(req.params.id);

  if (!devis) {
    return next(new ErrorResponse(`Devis non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Vérifier si l'utilisateur est le client ou un admin
  if (devis.client.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Non autorisé à accéder à ce devis`, 401));
  }

  res.status(200).json({
    success: true,
    data: devis
  });
});

// @desc    Créer un devis
// @route   POST /api/devis
exports.createDevis = asyncHandler(async (req, res, next) => {
  // Ajouter l'ID de l'utilisateur au corps de la requête
  req.body.client = req.user.id;

  const devis = await Devis.create(req.body);

  res.status(201).json({
    success: true,
    data: devis
  });
});

// @desc    Mettre à jour le statut d'un devis
// @route   PUT /api/devis/:id/statut
exports.updateDevisStatut = asyncHandler(async (req, res, next) => {
  let devis = await Devis.findById(req.params.id);

  if (!devis) {
    return next(new ErrorResponse(`Devis non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Seul un admin peut changer le statut
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`Non autorisé à modifier ce devis`, 401));
  }

  devis = await Devis.findByIdAndUpdate(
    req.params.id,
    { 
      statut: req.body.statut,
      montantEstime: req.body.montantEstime,
      delaiEstime: req.body.delaiEstime,
      dateTraitement: Date.now()
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: devis
  });
});

// @desc    Supprimer un devis
// @route   DELETE /api/devis/:id
exports.deleteDevis = asyncHandler(async (req, res, next) => {
  const devis = await Devis.findById(req.params.id);

  if (!devis) {
    return next(new ErrorResponse(`Devis non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Seul le client ou un admin peut supprimer
  if (devis.client.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Non autorisé à supprimer ce devis`, 401));
  }

  await devis.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
