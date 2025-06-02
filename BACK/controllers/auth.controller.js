const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.register = asyncHandler(async (req, res, next) => {
  const { nom, email, password, role } = req.body;

  const user = await User.create({ nom, email, password, role });
  
  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  console.log('LOGIN - Tentative de connexion:', req.body.email);
  
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    console.error('LOGIN - Échec de connexion pour:', email);
    return next(new ErrorResponse('Identifiants invalides', 401));
  }

  console.log('LOGIN - Connexion réussie pour:', email, '- Rôle:', user.role);
  sendTokenResponse(user, 200, res);
});

// Ajout de la route pour rafraîchir le token
exports.refreshToken = asyncHandler(async (req, res, next) => {
  // Nous n'avons pas besoin de récupérer le token ici car il est déjà vérifié
  // par le middleware protectRefresh qui a mis l'utilisateur dans req.user

  // Si le middleware protectRefresh a passé, on génère un nouveau token
  if (!req.user) {
    console.error("RefreshToken - Données utilisateur manquantes dans req.user");
    return next(new ErrorResponse('Erreur lors du rafraîchissement du token', 401));
  }
  
  try {
    // Log pour débogage
    console.log(`Rafraîchissement de token pour: ${req.user.email}, rôle: ${req.user.role}`);
    
    // Générer un nouveau token pour l'utilisateur authentifié
    sendTokenResponse(req.user, 200, res);
    
  } catch (err) {
    console.error("RefreshToken - Erreur lors de la génération du token:", err);
    return next(new ErrorResponse('Erreur lors de la génération du token', 500));
  }
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  
  console.log('TOKEN - Génération de token pour:', user.email, '- Rôle:', user.role);
  console.log('TOKEN - Valeur du token (début):', token.substring(0, 20) + '...');

  res.status(statusCode).json({
    success: true,
    token,
    role: user.role,
    // Ajouter plus d'informations utilisateur pour faciliter le débogage côté frontend
    userId: user._id,
    email: user.email,
    nom: user.nom
  });
};