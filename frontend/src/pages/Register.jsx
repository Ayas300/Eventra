import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee', // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

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
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Call register API
      const data = await registerUser(formData);

      // Update auth context
      register(data.token, data.user);

      setSuccess(true);

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === 'organizer') {
          navigate('/organizer-dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '50px auto' }}>
      <h1>Create Account</h1>

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
          ✓ Registration successful! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Full Name:
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
            placeholder="John Doe"
          />
        </div>

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
            placeholder="john@example.com"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Register As:
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <option value="attendee">Attendee (Buy Tickets)</option>
            <option value="organizer">Organizer (Create Events)</option>
          </select>
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
            placeholder="Minimum 6 characters"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Confirm Password:
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
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
            placeholder="Confirm password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
          Login here
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

export default Register;
