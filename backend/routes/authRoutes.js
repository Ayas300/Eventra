import express from 'express';
import {
  register,
  login,
  getMe,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Organizer-only route example
router.get('/organizer-only', protect, authorize('organizer'), (req, res) => {
  res.json({
    success: true,
    message: 'This is an organizer-only endpoint',
    user: req.user,
  });
});

export default router;
