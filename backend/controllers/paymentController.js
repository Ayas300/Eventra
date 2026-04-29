import dotenv from 'dotenv';
import Stripe from 'stripe';
import Order from '../models/Order.js';

// Re-read env on each request so local .env edits take effect without a server restart.
// This keeps development simpler while still using process.env as the source of truth.
dotenv.config({ override: true });

// Helper to get Stripe instance (lazy) and validate env
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes('XXXXXXXXXXXXXXXX') || key.startsWith('sk_test_XXXXXXXXXXXXXXXX')) return null;
  return new Stripe(key);
};

// @desc Create a PaymentIntent for an order
// @route POST /api/payments/create-payment-intent
// @access Private
export const createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe not configured on server. Set STRIPE_SECRET_KEY in backend .env' });
    }
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Ensure the logged-in user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    const amount = Math.round((Number(order.totalAmount) || 0) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { orderId: order._id.toString() },
    });

    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Stripe webhook handler
// @route POST /api/webhooks/stripe
// @access Public (Stripe will call)
export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const stripe = getStripe();
    if (!stripe) {
      console.error('Stripe not configured for webhook. Missing STRIPE_SECRET_KEY');
      return res.status(500).send('Stripe not configured');
    }

    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        try {
          const order = await Order.findById(orderId);
          if (order) {
            order.status = 'paid';
            await order.save();
          }
        } catch (err) {
          console.error('Failed updating order status on webhook:', err.message);
        }
      }
      break;
    }
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
