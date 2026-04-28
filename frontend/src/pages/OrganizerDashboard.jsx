import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEvent, deleteEvent, fetchMyEvents, updateEvent } from '../services/eventService';

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  image: '',
  ticketTypes: [{ name: 'General', price: '', quantity: '' }],
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #cfcfcf',
  borderRadius: '6px',
  fontSize: '14px',
};

const buttonStyle = {
  padding: '10px 14px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
};

const OrganizerDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingEventId, setEditingEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMyEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'organizer') {
      loadEvents();
    }
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'organizer') {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTicketTypeChange = (index, field, value) => {
    setFormData((prev) => {
      const ticketTypes = [...prev.ticketTypes];
      ticketTypes[index] = { ...ticketTypes[index], [field]: value };
      return { ...prev, ticketTypes };
    });
  };

  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: '', price: '', quantity: '' }],
    }));
  };

  const removeTicketType = (index) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingEventId(null);
  };

  const handleEdit = (event) => {
    setEditingEventId(event._id);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      image: event.image || '',
      ticketTypes: event.ticketTypes?.length
        ? event.ticketTypes.map((ticketType) => ({
            name: ticketType.name || '',
            price: ticketType.price ?? '',
            quantity: ticketType.quantity ?? '',
          }))
        : [{ name: 'General', price: '', quantity: '' }],
    });
    setMessage('Editing existing event');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      ticketTypes: formData.ticketTypes.map((ticketType) => ({
        name: ticketType.name,
        price: Number(ticketType.price),
        quantity: Number(ticketType.quantity),
      })),
    };

    try {
      if (editingEventId) {
        await updateEvent(editingEventId, payload);
        setMessage('Event updated successfully');
      } else {
        await createEvent(payload);
        setMessage('Event created successfully');
      }

      resetForm();
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Delete this event?');
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await deleteEvent(eventId);
      setMessage('Event deleted successfully');
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 48px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Organizer Dashboard</h1>
        <p style={{ color: '#555' }}>Manage the events you create.</p>
      </header>

      {message ? <div style={{ marginBottom: '16px', padding: '12px', background: '#e9f8ee', borderRadius: '6px' }}>{message}</div> : null}
      {error ? <div style={{ marginBottom: '16px', padding: '12px', background: '#fdeaea', borderRadius: '6px' }}>{error}</div> : null}

      <section style={{ marginBottom: '28px', padding: '20px', border: '1px solid #e2e2e2', borderRadius: '10px', background: '#fff' }}>
        <h2 style={{ marginBottom: '16px' }}>{editingEventId ? 'Edit Event' : 'Create Event'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <input style={inputStyle} name="title" value={formData.title} onChange={handleChange} placeholder="Event title" required />
          <textarea style={inputStyle} name="description" value={formData.description} onChange={handleChange} placeholder="Event description" rows="4" required />
          <input style={inputStyle} name="date" type="datetime-local" value={formData.date} onChange={handleChange} required />
          <input style={inputStyle} name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
          <input style={inputStyle} name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Ticket Types</h3>
              <button type="button" onClick={addTicketType} style={buttonStyle}>Add Ticket Type</button>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              {formData.ticketTypes.map((ticketType, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr auto', gap: '10px', alignItems: 'center' }}>
                  <input
                    style={inputStyle}
                    value={ticketType.name}
                    onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                    placeholder="Type name"
                    required
                  />
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    value={ticketType.price}
                    onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                    placeholder="Price"
                    required
                  />
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    value={ticketType.quantity}
                    onChange={(e) => handleTicketTypeChange(index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                    required
                  />
                  <button type="button" onClick={() => removeTicketType(index)} disabled={formData.ticketTypes.length === 1} style={buttonStyle}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={loading} style={{ ...buttonStyle, background: '#0f62fe', color: '#fff' }}>
              {loading ? 'Saving...' : editingEventId ? 'Update Event' : 'Create Event'}
            </button>
            {editingEventId ? (
              <button type="button" onClick={resetForm} style={{ ...buttonStyle, background: '#eee' }}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Your Events</h2>
          <button type="button" onClick={loadEvents} style={{ ...buttonStyle, background: '#eee' }}>
            Refresh
          </button>
        </div>

        {loading ? <p>Loading events...</p> : null}
        {!loading && events.length === 0 ? <p>No events created yet.</p> : null}

        <div style={{ display: 'grid', gap: '16px' }}>
          {events.map((event) => (
            <article key={event._id} style={{ border: '1px solid #e2e2e2', borderRadius: '10px', padding: '18px', background: '#fff' }}>
              <h3 style={{ marginTop: 0 }}>{event.title}</h3>
              <p style={{ color: '#555' }}>{event.description}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
              <p><strong>Location:</strong> {event.location}</p>
              {event.image ? <p><strong>Image:</strong> {event.image}</p> : null}
              <div style={{ marginTop: '10px' }}>
                <strong>Ticket Types</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  {event.ticketTypes.map((ticketType, index) => (
                    <li key={`${event._id}-${index}`}>
                      {ticketType.name} - ${ticketType.price} - Qty {ticketType.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => handleEdit(event)} style={{ ...buttonStyle, background: '#ffdd57' }}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(event._id)} style={{ ...buttonStyle, background: '#ff6b6b', color: '#fff' }}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OrganizerDashboard;
