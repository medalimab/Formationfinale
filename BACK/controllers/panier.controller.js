const Panier = require('../models/Panier');
const Formation = require('../models/Formation');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Obtenir le panier de l'utilisateur connecté
// @route   GET /api/panier
// @access  Private
exports.getPanier = asyncHandler(async (req, res, next) => {
  let panier = await Panier.findOne({ user: req.user.id }).populate({
    path: 'formations.formation',
    select: 'titre prix description image'
  });

  if (!panier) {
    // Créer un panier vide si l'utilisateur n'en a pas
    panier = await Panier.create({
      user: req.user.id,
      formations: [],
      total: 0
    });
  }

  res.status(200).json({
    success: true,
    data: panier
  });
});

// @desc    Ajouter une formation au panier
// @route   POST /api/panier
// @access  Private
exports.ajouterFormation = asyncHandler(async (req, res, next) => {
  const { formationId } = req.body;

  // Vérifier si la formation existe
  const formation = await Formation.findById(formationId);
  if (!formation) {
    return next(new ErrorResponse('Formation non trouvée', 404));
  }

  // Vérifier si l'utilisateur a déjà un panier
  let panier = await Panier.findOne({ user: req.user.id });
  
  if (!panier) {
    // Créer un nouveau panier
    panier = await Panier.create({
      user: req.user.id,
      formations: [{ formation: formationId }],
      total: formation.prix
    });
  } else {
    // Vérifier si la formation est déjà dans le panier
    const formationExisteDeja = panier.formations.find(
      item => item.formation.toString() === formationId
    );

    if (formationExisteDeja) {
      return next(new ErrorResponse('Formation déjà dans le panier', 400));
    }

    // Ajouter la formation au panier existant
    panier.formations.push({ formation: formationId });
    panier.total += formation.prix;
    await panier.save();
  }

  res.status(200).json({
    success: true,
    data: panier
  });
});

// @desc    Supprimer une formation du panier
// @route   DELETE /api/panier/:formationId
// @access  Private
exports.supprimerFormation = asyncHandler(async (req, res, next) => {
  const formationId = req.params.formationId;
  
  // Vérifier si la formation existe
  const formation = await Formation.findById(formationId);
  if (!formation) {
    return next(new ErrorResponse('Formation non trouvée', 404));
  }

  // Rechercher le panier de l'utilisateur
  const panier = await Panier.findOne({ user: req.user.id });
  
  if (!panier) {
    return next(new ErrorResponse('Panier non trouvé', 404));
  }

  // Vérifier si la formation est dans le panier
  const formationIndex = panier.formations.findIndex(
    item => item.formation.toString() === formationId
  );

  if (formationIndex === -1) {
    return next(new ErrorResponse('Formation non trouvée dans le panier', 404));
  }

  // Supprimer la formation du panier
  panier.total -= formation.prix;
  panier.formations.splice(formationIndex, 1);
  await panier.save();

  res.status(200).json({
    success: true,
    data: panier
  });
});
