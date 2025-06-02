const RendezVous = require('../models/RendezVous');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les rendez-vous
// @route   GET /api/rendezvous
exports.getRendezVous = asyncHandler(async (req, res, next) => {
  const rendezvous = await RendezVous.find().populate('service', 'titre');
  res.status(200).json({
    success: true,
    count: rendezvous.length,
    data: rendezvous
  });
});

// @desc    Récupérer mes rendez-vous
// @route   GET /api/rendezvous/me
exports.getMesRendezVous = asyncHandler(async (req, res, next) => {
  const rendezvous = await RendezVous.find({ client: req.user.id }).populate('service', 'titre');

  res.status(200).json({
    success: true,
    count: rendezvous.length,
    data: rendezvous
  });
});

// @desc    Récupérer un rendez-vous
// @route   GET /api/rendezvous/:id
exports.getRendezVousById = asyncHandler(async (req, res, next) => {
  const rendezvous = await RendezVous.findById(req.params.id).populate({ path: 'service', select: 'titre user' });

  if (!rendezvous) {
    return next(new ErrorResponse(`Rendez-vous non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Autoriser : client, admin, ou formateur propriétaire du service
  const isClient = rendezvous.client.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  const isFormateur = req.user.role === 'formateur' && rendezvous.service && rendezvous.service.user && rendezvous.service.user.toString() === req.user.id;

  if (!isClient && !isAdmin && !isFormateur) {
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

  // Si un fichier image est uploadé, stocker son nom dans req.body.image
  if (req.file) {
    req.body.image = req.file.originalname;
  }

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
  let rendezvous = await RendezVous.findById(req.params.id).populate({ path: 'service', select: 'user' });

  if (!rendezvous) {
    return next(new ErrorResponse(`Rendez-vous non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Autoriser : client, admin, ou formateur propriétaire du service
  const isClient = rendezvous.client.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  const isFormateur = req.user.role === 'formateur' && rendezvous.service && rendezvous.service.user && rendezvous.service.user.toString() === req.user.id;

  if (!isClient && !isAdmin && !isFormateur) {
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

// @desc    Modifier un rendez-vous
// @route   PUT /api/rendezvous/:id
exports.updateRendezVous = asyncHandler(async (req, res, next) => {
  let rendezvous = await RendezVous.findById(req.params.id).populate({ path: 'service', select: 'user' });
  if (!rendezvous) {
    return next(new ErrorResponse(`Rendez-vous non trouvé avec l'id ${req.params.id}`, 404));
  }
  // Autoriser : client, admin, ou formateur propriétaire du service
  const isClient = rendezvous.client.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  const isFormateur = req.user.role === 'formateur' && rendezvous.service && rendezvous.service.user && rendezvous.service.user.toString() === req.user.id;
  if (!isClient && !isAdmin && !isFormateur) {
    return next(new ErrorResponse(`Non autorisé à modifier ce rendez-vous`, 401));
  }
  rendezvous = await RendezVous.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: rendezvous
  });
});

// @desc    Supprimer un rendez-vous
// @route   DELETE /api/rendezvous/:id
exports.deleteRendezVous = asyncHandler(async (req, res, next) => {
  const rendezvous = await RendezVous.findById(req.params.id).populate({ path: 'service', select: 'user' });

  if (!rendezvous) {
    return next(new ErrorResponse(`Rendez-vous non trouvé avec l'id ${req.params.id}`, 404));
  }

  const isAdmin = req.user.role === 'admin';
  const isFormateur = req.user.role === 'formateur' && rendezvous.service && rendezvous.service.user && rendezvous.service.user.toString() === req.user.id;

  if (!isAdmin && !isFormateur) {
    return next(new ErrorResponse(`Non autorisé à supprimer ce rendez-vous`, 401));
  }

  await rendezvous.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Récupérer les rendez-vous des services du formateur connecté
// @route   GET /api/rendezvous/by-formateur
exports.getRendezVousByFormateur = asyncHandler(async (req, res, next) => {
  // Récupérer tous les services dont l'utilisateur est propriétaire
  const Service = require('../models/Service');
  const services = await Service.find({ user: req.user.id }).select('_id');
  const serviceIds = services.map(s => s._id);
  // Récupérer tous les rendez-vous liés à ces services
  const rendezvous = await RendezVous.find({ service: { $in: serviceIds } })
    .populate('service', 'titre')
    .populate('client', 'nom prenom email');
  res.status(200).json({
    success: true,
    count: rendezvous.length,
    data: rendezvous
  });
});
