const Contact = require('../models/Contact');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Envoyer un message de contact
// @route   POST /api/contact
exports.envoyerContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.create(req.body);

  res.status(201).json({
    success: true,
    data: contact
  });
});

// @desc    Récupérer tous les messages de contact
// @route   GET /api/contact
exports.getContacts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer un message de contact
// @route   GET /api/contact/:id
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Message non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Marquer un message comme traité
// @route   PUT /api/contact/:id/traiter
exports.traiterContact = asyncHandler(async (req, res, next) => {
  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Message non trouvé avec l'id ${req.params.id}`, 404));
  }

  contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { traite: true },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Supprimer un message
// @route   DELETE /api/contact/:id
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Message non trouvé avec l'id ${req.params.id}`, 404));
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
