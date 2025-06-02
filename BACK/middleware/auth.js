const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const config = require('../config/config');

exports.protect = async (req, res, next) => {
  let token;

  console.log('AUTH MIDDLEWARE - URL:', req.originalUrl);
  console.log('AUTH MIDDLEWARE - Headers:', JSON.stringify(req.headers));

  // Vérifier le header d'autorisation pour le token
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('AUTH MIDDLEWARE - Token trouvé dans le header:', token.substring(0, 20) + '...');
  } else {
    console.log('AUTH MIDDLEWARE - Pas de token dans le header Authorization');
  }

  // Si pas de token, retourner erreur 401
  if (!token) {
    console.error('AUTH MIDDLEWARE - Token manquant, retour 401');
    return next(new ErrorResponse('Non autorisé - Token manquant', 401));
  }

  try {
    // Vérifier la validité du token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Vérifier si l'utilisateur existe toujours dans la base de données
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('Non autorisé - Utilisateur non trouvé', 401));
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    
    // Log pour débogage
    console.log(`Utilisateur authentifié: ${user.email} (${user.role})`);
    
    next();
  } catch (err) {
    // Log détaillé pour le débogage côté serveur
    console.error('Erreur d\'authentification:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Non autorisé - Token expiré', 401));
    } else if (err.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Non autorisé - Token invalide', 401));
    }
    
    return next(new ErrorResponse('Non autorisé', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Role ${req.user.role} non autorisé`, 403)
      );
    }
    next();
  };
};