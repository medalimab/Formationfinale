const Blog = require('../models/Blog');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les articles
// @route   GET /api/blog
exports.getArticles = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer un article
// @route   GET /api/blog/:id
exports.getArticle = asyncHandler(async (req, res, next) => {
  const article = await Blog.findById(req.params.id)
    .populate('auteur', 'nom')
    .populate('commentaires.utilisateur', 'nom');

  if (!article) {
    return next(new ErrorResponse(`Article non trouvé avec l'id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: article
  });
});

// @desc    Créer un article
// @route   POST /api/blog
exports.createArticle = asyncHandler(async (req, res, next) => {
  req.body.auteur = req.user.id;
  // Gestion de l'image uploadée
  if (req.file && req.file.filename) {
    req.body.image = '/uploads/' + req.file.filename;
  } else {
    delete req.body.image;
  }
  const article = await Blog.create(req.body);
  res.status(201).json({
    success: true,
    data: article
  });
});

// @desc    Mettre à jour un article
// @route   PUT /api/blog/:id
exports.updateArticle = asyncHandler(async (req, res, next) => {
  let article = await Blog.findById(req.params.id);
  if (!article) {
    return next(new ErrorResponse(`Article non trouvé avec l'id ${req.params.id}`, 404));
  }
  if (article.auteur.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`L'utilisateur ${req.user.id} n'est pas autorisé à modifier cet article`, 401));
  }
  // Gestion de l'image uploadée
  if (req.file && req.file.filename) {
    req.body.image = '/uploads/' + req.file.filename;
  } else {
    delete req.body.image;
  }
  article = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: article
  });
});

// @desc    Supprimer un article
// @route   DELETE /api/blog/:id
exports.deleteArticle = asyncHandler(async (req, res, next) => {
  const article = await Blog.findById(req.params.id);

  if (!article) {
    return next(new ErrorResponse(`Article non trouvé avec l'id ${req.params.id}`, 404));
  }

  // Vérifier si l'utilisateur est l'auteur ou un admin
  if (article.auteur.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`L'utilisateur ${req.user.id} n'est pas autorisé à supprimer cet article`, 401));
  }

  await article.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Ajouter un commentaire à un article
// @route   POST /api/blog/:id/commentaires
exports.addComment = asyncHandler(async (req, res, next) => {
  const article = await Blog.findById(req.params.id);

  if (!article) {
    return next(new ErrorResponse(`Article non trouvé avec l'id ${req.params.id}`, 404));
  }

  const commentaire = {
    texte: req.body.texte,
    utilisateur: req.user.id
  };

  article.commentaires.push(commentaire);
  await article.save();

  res.status(201).json({
    success: true,
    data: commentaire
  });
});
