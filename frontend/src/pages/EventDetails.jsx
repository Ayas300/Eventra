import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventById } from '../services/eventService';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchEventById(id);
        setEvent(data.event || null);
      } catch (err) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading event...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!event) return <div style={{ padding: 24 }}>Event not found.</div>;

  return (
    <div style={{ padding: 24 }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: 12 }}>← Back to events</Link>

      <h1 style={{ marginTop: 0 }}>{event.title}</h1>
      <p style={{ color: '#555' }}>{new Date(event.date).toLocaleString()}</p>
      <p style={{ color: '#777' }}>{event.location}</p>

      <div style={{ marginTop: 18 }}>
        <h3>Description</h3>
        <p style={{ color: '#333' }}>{event.description}</p>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Ticket Types</h3>
        {event.ticketTypes && event.ticketTypes.length > 0 ? (
          <ul>
            {event.ticketTypes.map((t, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <strong>{t.name}</strong> — ${Number(t.price).toFixed(2)} — {t.quantity} available
              </li>
            ))}
          </ul>
        ) : (
          <p>No ticket types available.</p>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
