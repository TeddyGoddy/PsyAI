const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    // Normalize fields to support both naming styles across the codebase
    req.user = {
      ...decoded,
      id: decoded.userId ?? decoded.id,
      userId: decoded.userId ?? decoded.id,
      user_type: decoded.user_type ?? decoded.userType,
      userType: decoded.userType ?? decoded.user_type,
    };
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token.'
    });
  }
};

module.exports = authMiddleware;
module.exports.authenticateToken = authMiddleware;
