import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testAPI } from '../services/api';

function Home() {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Test API connection on mount
  useEffect(() => {
    const checkAPI = async () => {
      setLoading(true);
      try {
        const data = await testAPI();
        setApiResponse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAPI();
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '40px' }}>
      {/* Navigation Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '20px',
          borderBottom: '2px solid #ddd',
          marginBottom: '40px',
        }}
      >
        <h1 style={{ margin: 0 }}>Event Ticketing Platform</h1>

        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold' }}>
                Welcome, {user?.name}! ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to="/login"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {isAuthenticated ? (
        <div>
          <h2>Welcome Back, {user?.name}!</h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
            You are logged in as an <strong>{user?.role}</strong>.
          </p>

          {user?.role === 'attendee' && (
            <div
              style={{
                padding: '20px',
                backgroundColor: '#e7f3ff',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <h3>Attendee Dashboard</h3>
              <p>Browse and purchase event tickets here.</p>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Browse Events
              </button>
            </div>
          )}

          {user?.role === 'organizer' && (
            <div
              style={{
                padding: '20px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <h3>Organizer Dashboard</h3>
              <p>Create and manage your events here.</p>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffc107',
                  color: 'black',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Create Event
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Welcome to Event Ticketing Platform</h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
            Discover amazing events and get your tickets today!
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                padding: '20px',
                backgroundColor: '#e7f3ff',
                borderRadius: '8px',
              }}
            >
              <h3>For Attendees</h3>
              <p>Browse and purchase tickets to amazing events.</p>
              <Link
                to="/register"
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                }}
              >
                Register as Attendee
              </Link>
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
              }}
            >
              <h3>For Organizers</h3>
              <p>Create and manage events, sell tickets.</p>
              <Link
                to="/register"
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#ffc107',
                  color: 'black',
                  borderRadius: '4px',
                  textDecoration: 'none',
                }}
              >
                Register as Organizer
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* API Status */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginTop: '40px',
        }}
      >
        <h2>API Status</h2>
        {loading && <p>Checking API connection...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {apiResponse && (
          <div>
            <p style={{ color: 'green' }}>✓ Backend Connected!</p>
            <pre style={{ textAlign: 'left', marginTop: '10px', backgroundColor: '#fff', padding: '10px' }}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
