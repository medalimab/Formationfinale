const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const config = require('../config/config');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Non autorisé', 401));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse('Non autorisé', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Role ${req.user.role} non autorisé`, 403)
      );
    }
    next();
  };
};