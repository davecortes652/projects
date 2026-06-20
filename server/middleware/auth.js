const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Verify JWT token ───────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Accept token from Authorization header or cookie
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or has been deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

// ─── Role-based access control ──────────────────────────────────────────────
// Usage: authorize('admin')  or  authorize('admin', 'staff')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

// ─── Shortcut middleware combos ─────────────────────────────────────────────
const adminOnly      = [protect, authorize('admin')];
const adminOrStaff   = [protect, authorize('admin', 'staff')];
const adminOrDoctor  = [protect, authorize('admin', 'doctor')];
const allStaff       = [protect, authorize('admin', 'doctor', 'staff')];

module.exports = { protect, authorize, adminOnly, adminOrStaff, adminOrDoctor, allStaff };
