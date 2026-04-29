import express from 'express';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getEvents,
  getEventById,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for attendees
router.route('/').get(getEvents);
router.route('/my-events').get(protect, authorize('organizer'), getMyEvents);
router.route('/:id').get(getEventById);

// Organizer-only mutation routes
router.route('/').post(protect, authorize('organizer'), createEvent);
router.route('/:id').put(protect, authorize('organizer'), updateEvent).delete(protect, authorize('organizer'), deleteEvent);

export default router;
