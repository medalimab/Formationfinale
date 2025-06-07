const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/users/me
exports.getMe = asyncHandler(async (req, res, next) => {
  // Utiliser _id pour la cohérence avec updateDetails
  const user = await User.findById(req.user._id || req.user.id);

  if (!user) {
    return next(new ErrorResponse(`Utilisateur non trouvé`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour les informations utilisateur
// @route   PUT /api/users/me
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  console.log('DEBUG updateDetails - Début de la mise à jour', userId, JSON.stringify(req.body));
  
  try {
    // Première étape: vérifier si l'utilisateur existe et récupérer son état actuel
    const existingUser = await User.findById(userId);
    
    if (!existingUser) {
      console.log(`DEBUG updateDetails - Utilisateur non trouvé avec l'id ${userId}`);
      return next(new ErrorResponse(`Utilisateur non trouvé avec l'id ${userId}`, 404));
    }
    
    console.log('DEBUG updateDetails - Utilisateur trouvé:', existingUser._id);
    console.log('DEBUG updateDetails - Structure actuelle:', 
        'activity type:', typeof existingUser.activity, 
        'isArray:', Array.isArray(existingUser.activity));
    
    try {
      // Implémentation d'une approche plus directe et sûre
      // 1. Mise à jour des champs de base (nom, email)
      existingUser.nom = req.body.nom;
      existingUser.email = req.body.email;
      
      // 2. Gestion du tableau d'activité avec validation supplémentaire
      if (!existingUser.activity || !Array.isArray(existingUser.activity)) {
        console.log('DEBUG updateDetails - Réinitialisation du champ activity corrompu');
        existingUser.activity = [];
      }
      
      // 3. Ajout de la nouvelle activité
      existingUser.activity.push({
        date: new Date(),
        type: 'Modification',
        description: 'Mise à jour du profil.'
      });
      
      console.log('DEBUG updateDetails - Sauvegarde des modifications');
      
      // Sauvegarde directe des modifications au lieu d'utiliser findByIdAndUpdate
      await existingUser.save();
      
      console.log('DEBUG updateDetails - Mise à jour réussie');
      
      res.status(200).json({
        success: true,
        data: existingUser
      });
    } catch (saveError) {
      console.error('ERROR updateDetails - Erreur lors de la sauvegarde:', saveError);
      
      // Approche de secours si save échoue - essayer une méthode alternative
      console.log('DEBUG updateDetails - Tentative avec méthode alternative de mise à jour');
      
      const basicUpdate = {
        $set: {
          nom: req.body.nom,
          email: req.body.email
        }
      };
      
      const updatedUser = await User.findByIdAndUpdate(userId, basicUpdate, {
        new: true,
        runValidators: true
      });
      
      if (!updatedUser) {
        return next(new ErrorResponse(`Mise à jour alternative échouée`, 500));
      }
      
      console.log('DEBUG updateDetails - Mise à jour alternative réussie');
      
      res.status(200).json({
        success: true,
        data: updatedUser,
        note: 'Mise à jour partielle (sans historique) réussie'
      });
    }
  } catch (err) {
    console.error('ERROR updateDetails - Exception principale:', err);
    if (err instanceof mongoose.Error.CastError) {
      console.error('ERROR updateDetails - CastError détecté:', err.path, err.value, err.kind);
      return next(new ErrorResponse(`Erreur de format dans les données: ${err.path}`, 400));
    }
    return next(new ErrorResponse('Erreur lors de la mise à jour du profil: ' + err.message, 500));
  }
});

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/users/updatepassword
exports.updatePassword = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log('DEBUG updatePassword - Début de la mise à jour du mot de passe pour', userId);
    const user = await User.findById(userId).select('+password');

    if (!user) {
      console.log('DEBUG updatePassword - Utilisateur non trouvé');
      return next(new ErrorResponse(`Utilisateur non trouvé`, 404));
    }

    // Vérifier le mot de passe actuel
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Mot de passe incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();
    console.log('DEBUG updatePassword - Mot de passe mis à jour avec succès');

    // Renvoyer un token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('ERROR updatePassword:', err);
    return next(new ErrorResponse('Erreur lors de la mise à jour du mot de passe: ' + err.message, 500));
  }
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

// @desc    Récupérer l'historique d'activité de l'utilisateur connecté
// @route   GET /api/users/me/activity
exports.getUserActivity = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log('DEBUG getUserActivity - Récupération des activités pour', userId);
    const user = await User.findById(userId).select('activity');
    
    if (!user) {
      console.log('DEBUG getUserActivity - Utilisateur non trouvé');
      return next(new ErrorResponse(`Utilisateur non trouvé`, 404));
    }
    
    // S'assurer que l'activité est bien un tableau valide
    const activities = Array.isArray(user.activity) ? user.activity : [];
    console.log(`DEBUG getUserActivity - ${activities.length} activités trouvées`);
    
    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (err) {
    console.error('ERROR getUserActivity:', err);
    return next(new ErrorResponse('Erreur lors de la récupération des activités: ' + err.message, 500));
  }
});

// @desc    Nettoyer les données d'activité corrompues
// @route   POST /api/users/clean-activity
exports.cleanActivityData = asyncHandler(async (req, res, next) => {
  try {
    console.log('DEBUG cleanActivityData - Début de la réparation');
    
    // Trouver tous les utilisateurs
    const users = await User.find({});
    let correctedCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Vérifier si le champ activity est corrompu
      if (!user.activity || !Array.isArray(user.activity)) {
        user.activity = [];
        needsUpdate = true;
        correctedCount++;
      }
      
      if (needsUpdate) {
        await user.save();
      }
    }
    
    console.log(`DEBUG cleanActivityData - ${correctedCount} utilisateurs réparés`);
    
    res.status(200).json({
      success: true,
      message: `${correctedCount} utilisateurs ont été réparés.`
    });
  } catch (err) {
    console.error('ERROR cleanActivityData:', err);
    return next(new ErrorResponse('Erreur lors de la réparation des données: ' + err.message, 500));
  }
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
