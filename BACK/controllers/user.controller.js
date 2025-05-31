const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/users/me
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour les informations utilisateur
// @route   PUT /api/users/me
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    nom: req.body.nom,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/users/updatepassword
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Vérifier le mot de passe actuel
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Mot de passe incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  // Renvoyer un token
  sendTokenResponse(user, 200, res);
});

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/users
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Utilisateur non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Créer un utilisateur
// @route   POST /api/users
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`Utilisateur non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Utilisateur non trouvé avec l'id ${req.params.id}`, 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Fonction pour générer et envoyer le token de réponse
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    role: user.role
  });
};
