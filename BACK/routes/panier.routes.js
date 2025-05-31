const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getPanier, 
  ajouterFormation, 
  supprimerFormation 
} = require('../controllers/panier.controller');

// Routes du panier
router.get('/', protect, getPanier);
router.post('/', protect, ajouterFormation);
router.delete('/:formationId', protect, supprimerFormation);

module.exports = router;
