import jwt from 'jsonwebtoken';

// @desc    Protect routes - verify JWT token
// @access  Private
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Authorize specific roles
// @access  Private
export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Get user from database to check role
      const User = await import('../models/User.js').then((m) => m.default);
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user has required role
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `User role '${user.role}' is not authorized to access this route`,
        });
      }

      // Store user in request for later use
      req.user.role = user.role;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};
