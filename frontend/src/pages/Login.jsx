import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error on input change
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      // Call login API
      const data = await loginUser(formData);

      // Update auth context
      login(data.token, data.user);

      setSuccess(true);

      // Redirect to previous page or dashboard
      setTimeout(() => {
        const from = location.state?.from?.pathname;
        if (data.user.role === 'organizer') {
          navigate(from || '/organizer-dashboard');
        } else {
          navigate(from || '/');
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto' }}>
      <h1>Login</h1>

      {error && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          ✓ Login successful! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              opacity: loading ? 0.6 : 1,
            }}
            placeholder="your@email.com"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              opacity: loading ? 0.6 : 1,
            }}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
          Register here
        </Link>
      </p>

      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '15px',
          width: '100%',
          padding: '10px',
          backgroundColor: '#6c757d',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Back to Home
      </button>
    </div>
  );
}

export default Login;
