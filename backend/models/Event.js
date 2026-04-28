import mongoose from 'mongoose';

const ticketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ticket type name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Ticket type price is required'],
      min: [0, 'Ticket type price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Ticket type quantity is required'],
      min: [0, 'Ticket type quantity cannot be negative'],
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
