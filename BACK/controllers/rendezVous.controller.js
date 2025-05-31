const RendezVous = require('../models/RendezVous');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les rendez-vous
// @route   GET /api/rendezvous
exports.getRendezVous = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer mes rendez-vous
// @route   GET /api/rendezvous/me
exports.getMesRendezVous = asyncHandler(async (req, res, next) => {
  const rendezvous = await RendezVous.find({ client: req.user.id });

  res.status(200).json({
    success: true,
    count: rendezvous.length,
    data: rendezvous
  });
});

// @desc    Récupérer un rendez-vous
// @route   GET /api/rendezvous/:id
exports.getRendezVousById = asyncHandler(async (req, res, next) => {
  const rendezvous = await RendezVous.findById(req.params.id);

  if (!rendezvous) {
    return next(new ErrorResponse(`Rendez-vous non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Vérifier si l'utilisateur est le client ou un admin
  if (rendezvous.client.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Non autorisé à accéder à ce rendez-vous`, 401));
  }

  res.status(200).json({
    success: true,
    data: rendezvous
  });
});

// @desc    Créer un rendez-vous
// @route   POST /api/rendezvous
exports.createRendezVous = asyncHandler(async (req, res, next) => {
  // Ajouter l'ID de l'utilisateur au corps de la requête
  req.body.client = req.user.id;

  // Vérifier si le créneau est disponible
  const creneauExiste = await RendezVous.findOne({
    date: req.body.date,
    heure: req.body.heure,
    statut: { $ne: 'annule' }
  });

  if (creneauExiste) {
    return next(new ErrorResponse(`Ce créneau horaire n'est pas disponible`, 400));
  }

  const rendezvous = await RendezVous.create(req.body);

  res.status(201).json({
    success: true,
    data: rendezvous
  });
});

// @desc    Mettre à jour le statut d'un rendez-vous
// @route   PUT /api/rendezvous/:id/statut
exports.updateRendezVousStatut = asyncHandler(async (req, res, next) => {
  let rendezvous = await RendezVous.findById(req.params.id);

  if (!rendezvous) {
    return next(new ErrorResponse(`Rendez-vous non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Vérifier si l'utilisateur est le client ou un admin
  const isClient = rendezvous.client.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  if (!isClient && !isAdmin) {
    return next(new ErrorResponse(`Non autorisé à modifier ce rendez-vous`, 401));
  }

  // Si c'est le client, il ne peut qu'annuler
  if (isClient && !isAdmin && req.body.statut !== 'annule') {
    return next(new ErrorResponse(`Vous ne pouvez qu'annuler vos rendez-vous`, 401));
  }

  rendezvous = await RendezVous.findByIdAndUpdate(
    req.params.id,
    { statut: req.body.statut },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: rendezvous
  });
});

// @desc    Supprimer un rendez-vous
// @route   DELETE /api/rendezvous/:id
exports.deleteRendezVous = asyncHandler(async (req, res, next) => {
  const rendezvous = await RendezVous.findById(req.params.id);

  if (!rendezvous) {
    return next(new ErrorResponse(`Rendez-vous non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Seul un admin peut supprimer définitivement
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`Pour annuler un rendez-vous, utilisez la route de changement de statut`, 401));
  }

  await rendezvous.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
