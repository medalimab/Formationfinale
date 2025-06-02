const express = require('express');
const { register, login, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { protectRefresh } = require('../middleware/auth-refresh');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// Utilisez le middleware spécial qui accepte les tokens expirés pour le rafraîchissement
router.post('/refresh-token', protectRefresh, refreshToken);

module.exports = router;
