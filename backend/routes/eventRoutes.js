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
router.route('/:id').get(getEventById);

// The routes below require organizer authentication
router.use(protect, authorize('organizer'));

router.route('/').post(createEvent);
router.route('/my-events').get(getMyEvents);
router.route('/:id').put(updateEvent).delete(deleteEvent);

export default router;
