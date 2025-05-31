const Temoignage = require('../models/Temoignage');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les témoignages
// @route   GET /api/temoignages
exports.getTemoignages = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer tous les témoignages approuvés
// @route   GET /api/temoignages/approuves
exports.getTemoignagesApprouves = asyncHandler(async (req, res, next) => {
  const temoignages = await Temoignage.find({ approuve: true });

  res.status(200).json({
    success: true,
    count: temoignages.length,
    data: temoignages
  });
});

// @desc    Récupérer un témoignage
// @route   GET /api/temoignages/:id
exports.getTemoignage = asyncHandler(async (req, res, next) => {
  const temoignage = await Temoignage.findById(req.params.id);

  if (!temoignage) {
    return next(new ErrorResponse(`Témoignage non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: temoignage
  });
});

// @desc    Créer un témoignage
// @route   POST /api/temoignages
exports.createTemoignage = asyncHandler(async (req, res, next) => {
  const temoignage = await Temoignage.create(req.body);

  res.status(201).json({
    success: true,
    data: temoignage
  });
});

// @desc    Approuver un témoignage
// @route   PUT /api/temoignages/:id/approuver
exports.approuverTemoignage = asyncHandler(async (req, res, next) => {
  let temoignage = await Temoignage.findById(req.params.id);

  if (!temoignage) {
    return next(new ErrorResponse(`Témoignage non trouvé avec l'id ${req.params.id}`, 404));
  }

  temoignage = await Temoignage.findByIdAndUpdate(
    req.params.id,
    { approuve: true },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: temoignage
  });
});

// @desc    Mettre à jour un témoignage
// @route   PUT /api/temoignages/:id
exports.updateTemoignage = asyncHandler(async (req, res, next) => {
  let temoignage = await Temoignage.findById(req.params.id);

  if (!temoignage) {
    return next(new ErrorResponse(`Témoignage non trouvé avec l'id ${req.params.id}`, 404));
  }

  temoignage = await Temoignage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: temoignage
  });
});

// @desc    Supprimer un témoignage
// @route   DELETE /api/temoignages/:id
exports.deleteTemoignage = asyncHandler(async (req, res, next) => {
  const temoignage = await Temoignage.findById(req.params.id);

  if (!temoignage) {
    return next(new ErrorResponse(`Témoignage non trouvé avec l'id ${req.params.id}`, 404));
  }

  await temoignage.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
