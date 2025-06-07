const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getPanier, 
  ajouterFormation, 
  supprimerFormation,
  getAllPaniers,
  deletePanierAdmin,
  updatePanierAdmin
} = require('../controllers/panier.controller');

// Routes du panier
router.get('/', protect, getPanier);
router.post('/', protect, ajouterFormation);
router.delete('/:formationId', protect, supprimerFormation);
router.get('/all', protect, authorize('admin'), getAllPaniers);

// Routes admin pour gestion des paniers
router.delete('/admin/:panierId', protect, authorize('admin'), deletePanierAdmin);
router.put('/admin/:panierId', protect, authorize('admin'), updatePanierAdmin);

module.exports = router;
