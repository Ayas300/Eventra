import express from 'express';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All event routes are restricted to organizers
router.use(protect, authorize('organizer'));

router.route('/').post(createEvent);
router.route('/my-events').get(getMyEvents);
router.route('/:id').put(updateEvent).delete(deleteEvent);

export default router;
