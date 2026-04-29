import mongoose from 'mongoose';
import Event from '../models/Event.js';

const normalizeTicketTypes = (ticketTypes = []) => {
  if (!Array.isArray(ticketTypes)) {
    return [];
  }

  return ticketTypes
    .filter((ticketType) => ticketType && ticketType.name)
    .map((ticketType) => ({
      name: ticketType.name,
      price: Number(ticketType.price) || 0,
      quantity: Number(ticketType.quantity) || 0,
    }));
};

const validateEventPayload = (body) => {
  const { title, description, date, location } = body;

  if (!title || !description || !date || !location) {
    return 'Please provide title, description, date, and location';
  }

  return null;
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Organizer
export const createEvent = async (req, res) => {
  try {
    const validationError = validateEventPayload(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      image: req.body.image || '',
      organizerId: req.user.id,
      ticketTypes: normalizeTicketTypes(req.body.ticketTypes),
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Organizer
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizerId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not authorized',
      });
    }

    const updatedFields = {
      title: req.body.title ?? event.title,
      description: req.body.description ?? event.description,
      date: req.body.date ?? event.date,
      location: req.body.location ?? event.location,
      image: req.body.image ?? event.image,
      ticketTypes: req.body.ticketTypes ? normalizeTicketTypes(req.body.ticketTypes) : event.ticketTypes,
    };

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Organizer
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizerId: req.user.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not authorized',
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in organizer's events
// @route   GET /api/events/my-events
// @access  Private/Organizer
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all public events (with basic filtering)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const { location, date } = req.query;

    const filter = {};

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const events = await Event.find(filter).sort({ date: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event by id
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
