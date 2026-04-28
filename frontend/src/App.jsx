import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventDetails from './pages/EventDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Attendees Only */}
          <Route
            path="/attendee-dashboard"
            element={
              <ProtectedRoute
                element={
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>Attendee Dashboard</h1>
                    <p>This page is protected for attendees only.</p>
                  </div>
                }
                allowedRoles="attendee"
              />
            }
          />

          {/* Protected Routes - Organizers Only */}
          <Route
            path="/organizer-dashboard"
            element={
              <ProtectedRoute
                element={<OrganizerDashboard />}
                allowedRoles="organizer"
              />
            }
          />

          {/* Catch-all - redirect to home */}
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
