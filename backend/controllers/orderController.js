import Order from '../models/Order.js';
import Event from '../models/Event.js';

// @desc Create a new order (pending)
// @route POST /api/orders
// @access Private (authenticated users)
export const createOrder = async (req, res) => {
  try {
    const { eventId, tickets, customerInfo } = req.body;

    if (!eventId || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order payload' });
    }

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Compute total amount from tickets
    const totalAmount = tickets.reduce((sum, t) => sum + (Number(t.price) || 0) * (Number(t.quantity) || 0), 0);

    const order = await Order.create({
      userId: req.user.id,
      eventId,
      tickets,
      totalAmount,
      status: 'pending',
      customerInfo: customerInfo || {},
    });

    res.status(201).json({ success: true, message: 'Order created', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
