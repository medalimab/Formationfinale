const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const config = require('../config/config');

/**
 * Middleware spécial pour la route de rafraîchissement qui accepte les tokens expirés
 */
exports.protectRefresh = async (req, res, next) => {
  let token;

  console.log('REFRESH MIDDLEWARE - URL:', req.originalUrl);
  console.log('REFRESH MIDDLEWARE - Headers:', JSON.stringify(req.headers));

  // Vérifier le header d'autorisation pour le token
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('REFRESH MIDDLEWARE - Token trouvé dans le header:', token.substring(0, 20) + '...');
  } else {
    console.log('REFRESH MIDDLEWARE - Pas de token dans le header Authorization');
  }

  // Si pas de token, retourner erreur 401
  if (!token) {
    console.error('REFRESH MIDDLEWARE - Token manquant pour le rafraîchissement, retour 401');
    return next(new ErrorResponse('Non autorisé - Token manquant pour le rafraîchissement', 401));
  }
  try {
    // Tenter d'abord la vérification normale
    try {
      const verified = jwt.verify(token, config.JWT_SECRET);
      // Si la vérification passe, utiliser le token vérifié
      const user = await User.findById(verified.id);
      if (!user) {
        return next(new ErrorResponse('Utilisateur non trouvé', 401));
      }
      req.user = user;
      console.log('Token rafraîchi avec succès - encore valide');
      return next();
    } catch (verifyError) {
      // Si l'erreur est due à l'expiration, continuer avec le décodage
      if (verifyError.name !== 'TokenExpiredError') {
        return next(new ErrorResponse('Token invalide - Signature incorrecte', 401));
      }
      console.log('Token expiré, vérifiant s\'il peut être rafraîchi');
    }

    // Décoder le token sans vérifier la signature ni l'expiration
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.id) {
      return next(new ErrorResponse('Token invalide - Format incorrect', 401));
    }
    
    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 401));
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    console.log('Token expiré accepté pour rafraîchissement');
    next();
    
  } catch (err) {
    console.error('Erreur lors du traitement du token pour rafraîchissement:', err);
    return next(new ErrorResponse('Erreur lors du traitement du token', 401));
  }
};
