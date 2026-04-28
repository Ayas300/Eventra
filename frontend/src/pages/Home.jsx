import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllEvents } from '../services/eventService';

function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ location: '', date: '' });

  const loadEvents = async (appliedFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllEvents(appliedFilters);
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const q = {};
    if (filters.location) q.location = filters.location;
    if (filters.date) q.date = filters.date;
    loadEvents(q);
  };

  return (
    <div style={{ padding: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ margin: 0 }}>Event Ticketing Platform</h1>
        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <strong>{user?.name} ({user?.role})</strong>
              <button onClick={logout} style={{ padding: '8px 12px', background: '#dc3545', color: 'white', borderRadius: 6 }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" style={{ padding: '8px 12px', background: '#007bff', color: 'white', borderRadius: 6, textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ padding: '8px 12px', background: '#28a745', color: 'white', borderRadius: 6, textDecoration: 'none' }}>Register</Link>
            </div>
          )}
        </div>
      </header>

      <section style={{ marginBottom: '20px' }}>
        <form onSubmit={onSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters((s) => ({ ...s, location: e.target.value }))}
            style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters((s) => ({ ...s, date: e.target.value }))}
            style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, background: '#007bff', color: 'white' }}>Search</button>
          <button
            type="button"
            onClick={() => { setFilters({ location: '', date: '' }); loadEvents(); }}
            style={{ padding: '8px 12px', borderRadius: 6 }}
          >
            Clear
          </button>
        </form>
      </section>

      <main>
        {loading && <p>Loading events...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {events.length === 0 && !loading && <p>No events found.</p>}

          {events.map((ev) => (
            <Link to={`/events/${ev._id}`} key={ev._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, background: 'white' }}>
                <h3 style={{ marginTop: 0 }}>{ev.title}</h3>
                <p style={{ margin: '6px 0', color: '#555' }}>{new Date(ev.date).toLocaleString()}</p>
                <p style={{ margin: '6px 0', color: '#777' }}>{ev.location}</p>
                <p style={{ marginTop: 12, color: '#333' }}>{ev.description?.slice(0, 140)}{ev.description && ev.description.length > 140 ? '...' : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;
