const Formation = require('../models/Formation');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getFormations = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getFormation = asyncHandler(async (req, res, next) => {
  const formation = await Formation.findById(req.params.id).populate('formateur', 'nom');

  if (!formation) {
    return next(new ErrorResponse(`Formation non trouvée`, 404));
  }

  res.status(200).json({ success: true, data: formation });
});

exports.createFormation = asyncHandler(async (req, res, next) => {
  req.body.formateur = req.user.id;
  // Si un fichier image est uploadé, stocker le chemin complet dans req.body.image
  if (req.file) {
    req.body.image = '/uploads/' + req.file.filename;
  }
  const formation = await Formation.create(req.body);
  
  // Ajouter la formation au formateur
  await User.findByIdAndUpdate(req.user.id, {
    $push: { formationsCrees: formation._id }
  });

  res.status(201).json({ success: true, data: formation });
});

exports.updateFormation = asyncHandler(async (req, res, next) => {
  let formation = await Formation.findById(req.params.id);

  if (!formation) {
    return next(new ErrorResponse(`Formation non trouvée`, 404));
  }

  // Vérifier que l'utilisateur est le formateur qui a créé la formation
  if (formation.formateur.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Non autorisé à modifier cette formation`, 401));
  }

  // Si un fichier image est uploadé, stocker le chemin complet dans req.body.image
  if (req.file) {
    req.body.image = '/uploads/' + req.file.filename;
  }
  formation = await Formation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: formation
  });
});

exports.deleteFormation = asyncHandler(async (req, res, next) => {
  const formation = await Formation.findById(req.params.id);

  if (!formation) {
    return next(new ErrorResponse(`Formation non trouvée`, 404));
  }

  // Vérifier que l'utilisateur est le formateur qui a créé la formation
  if (formation.formateur.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Non autorisé à supprimer cette formation`, 401));
  }

  await Formation.deleteOne({ _id: req.params.id });
  
  // Retirer la formation de la liste des formations du formateur
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { formationsCrees: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getUserFormations = asyncHandler(async (req, res, next) => {
  const formations = await Formation.find({ formateur: req.user.id });

  if (!formations || formations.length === 0) {
    return next(new ErrorResponse('Aucune formation trouvée pour cet utilisateur', 404));
  }

  res.status(200).json({ success: true, data: formations });
});