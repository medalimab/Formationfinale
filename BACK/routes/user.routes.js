const express = require('express');
const {
  getMe,
  updateDetails,
  updatePassword,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserActivity,
  cleanActivityData
} = require('../controllers/user.controller');

const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protection des routes utilisateur
router.use(protect);

// Routes utilisateur
router.get('/me', getMe);
router.put('/me', updateDetails);
router.put('/updatepassword', updatePassword);
router.get('/me/activity', getUserActivity);

// Routes admin
router.use(authorize('admin'));

// Route de nettoyage des données (admin uniquement)
router.post('/clean-activity', cleanActivityData);

router.route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
