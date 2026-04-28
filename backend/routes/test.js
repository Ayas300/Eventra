import express from 'express';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
