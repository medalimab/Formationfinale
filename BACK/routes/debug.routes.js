const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Vérifier l'état du token
// @route   GET /api/debug/token
router.get('/token', (req, res) => {
  let token;
  
  // Récupérer le token du header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(200).json({
      success: false,
      message: 'Aucun token fourni',
      status: 'missing'
    });
  }
  
  try {
    // Vérifier le token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    return res.status(200).json({
      success: true,
      message: 'Token valide',
      status: 'valid',
      data: {
        id: decoded.id,
        exp: decoded.exp,
        iat: decoded.iat,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        remainingTime: (decoded.exp * 1000) - Date.now()
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Token expiré mais bien formé
      try {
        // Décoder sans vérifier l'expiration
        const decoded = jwt.decode(token);
        
        return res.status(200).json({
          success: false,
          message: 'Token expiré',
          status: 'expired',
          data: {
            id: decoded.id,
            exp: decoded.exp,
            iat: decoded.iat,
            expiredSince: Date.now() - (decoded.exp * 1000)
          }
        });
      } catch (decodeError) {
        return res.status(200).json({
          success: false,
          message: 'Token expiré et mal formé',
          status: 'expired_invalid'
        });
      }
    }
    
    // Autre problème de token
    return res.status(200).json({
      success: false,
      message: `Token invalide: ${error.message}`,
      status: 'invalid',
      error: error.name
    });
  }
});

// @desc    Vérifier l'authentification de l'utilisateur
// @route   GET /api/debug/auth
router.get('/auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Utilisateur authentifié',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      nom: req.user.nom
    }
  });
});

module.exports = router;
