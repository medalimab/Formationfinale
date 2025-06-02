const express = require('express');
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  addComment
} = require('../controllers/blog.controller');

const Blog = require('../models/Blog');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(advancedResults(Blog, 'auteur'), getArticles)
  .post(protect, authorize('admin', 'formateur'), createArticle);

router.route('/:id')
  .get(getArticle)
  .put(protect, authorize('admin', 'formateur'), updateArticle)
  .delete(protect, authorize('admin'), deleteArticle);

router.route('/:id/commentaires')
  .post(protect, addComment);

module.exports = router;
