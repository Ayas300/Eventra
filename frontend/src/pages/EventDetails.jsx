import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchEventById } from '../services/eventService';
import { createOrder } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Checkout state
  const [step, setStep] = useState(1); // 1: select tickets, 2: user info, 3: review
  const [selections, setSelections] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchEventById(id);
        const ev = data.event || null;
        setEvent(ev);
        // initialize selections
        setSelections((ev?.ticketTypes || []).map((t) => ({ name: t.name, price: t.price, quantity: 0 })));
        if (ev && isAuthenticated && user) {
          setCustomerInfo((s) => ({ ...s, name: user.name || s.name, email: user.email || s.email }));
        }
      } catch (err) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isAuthenticated, user]);

  const updateQuantity = (index, qty) => {
    setSelections((s) => s.map((it, i) => (i === index ? { ...it, quantity: qty } : it)));
  };

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const onSubmitOrder = async () => {
    if (!isAuthenticated) {
      // require login to create order
      navigate('/login');
      return;
    }

    const items = selections.filter((s) => Number(s.quantity) > 0);
    if (items.length === 0) {
      alert('Please select at least one ticket');
      setStep(1);
      return;
    }

    const payload = {
      eventId: event._id,
      tickets: items.map((i) => ({ name: i.name, price: Number(i.price) || 0, quantity: Number(i.quantity) })),
      totalAmount: items.reduce((sum, it) => sum + (Number(it.price) || 0) * Number(it.quantity), 0),
      customerInfo,
    };

    try {
      setSubmitting(true);
      const res = await createOrder(payload);
      setOrderResult(res.order);
      setStep(3);
    } catch (err) {
      alert(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading event...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!event) return <div style={{ padding: 24 }}>Event not found.</div>;

  const selectedItems = selections.filter((s) => Number(s.quantity) > 0);
  const total = selectedItems.reduce((sum, it) => sum + (Number(it.price) || 0) * Number(it.quantity), 0);

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

      <hr style={{ margin: '18px 0' }} />

      <div>
        <h2>Purchase Tickets</h2>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: step === 1 ? 'bold' : 'normal' }}>1. Select Tickets</div>
          <div style={{ fontWeight: step === 2 ? 'bold' : 'normal' }}>2. Your Info</div>
          <div style={{ fontWeight: step === 3 ? 'bold' : 'normal' }}>{orderResult ? 'Confirmation' : '3. Review'}</div>
        </div>

        {step === 1 && (
          <div>
            {event.ticketTypes && event.ticketTypes.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {event.ticketTypes.map((t, i) => (
                  <div key={i} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{t.name}</div>
                      <div style={{ color: '#555' }}>${Number(t.price).toFixed(2)}</div>
                      <div style={{ color: '#777', fontSize: 13 }}>{t.quantity} available</div>
                    </div>
                    <div>
                      <input type="number" min={0} max={10} value={selections[i]?.quantity || 0} onChange={(e) => updateQuantity(i, Math.max(0, Number(e.target.value || 0)))} style={{ width: 80, padding: 6 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No ticket types available.</p>
            )}

            <div style={{ marginTop: 12 }}>
              <button onClick={nextStep} style={{ padding: '8px 12px', marginRight: 8 }}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
              <label>
                Name
                <input value={customerInfo.name} onChange={(e) => setCustomerInfo((s) => ({ ...s, name: e.target.value }))} style={{ width: '100%', padding: 8, marginTop: 4 }} />
              </label>

              <label>
                Email
                <input value={customerInfo.email} onChange={(e) => setCustomerInfo((s) => ({ ...s, email: e.target.value }))} style={{ width: '100%', padding: 8, marginTop: 4 }} />
              </label>

              <label>
                Phone
                <input value={customerInfo.phone} onChange={(e) => setCustomerInfo((s) => ({ ...s, phone: e.target.value }))} style={{ width: '100%', padding: 8, marginTop: 4 }} />
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={prevStep} style={{ padding: '8px 12px', marginRight: 8 }}>Back</button>
              <button onClick={nextStep} style={{ padding: '8px 12px' }}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && !orderResult && (
          <div>
            <h4>Review Order</h4>
            {selectedItems.length === 0 ? (
              <p>No tickets selected.</p>
            ) : (
              <div>
                <ul>
                  {selectedItems.map((it, idx) => (
                    <li key={idx}>{it.quantity} × {it.name} — ${Number(it.price).toFixed(2)} each</li>
                  ))}
                </ul>
                <p><strong>Total: ${total.toFixed(2)}</strong></p>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <button onClick={prevStep} style={{ padding: '8px 12px', marginRight: 8 }}>Back</button>
              <button onClick={onSubmitOrder} style={{ padding: '8px 12px' }} disabled={submitting}>{submitting ? 'Submitting...' : 'Place Order'}</button>
            </div>
          </div>
        )}

        {step === 3 && orderResult && (
          <div>
            <h4>Order Submitted</h4>
            <p>Order ID: {orderResult._id}</p>
            <p>Status: {orderResult.status}</p>
            <p>Total: ${Number(orderResult.totalAmount).toFixed(2)}</p>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => navigate('/')} style={{ padding: '8px 12px' }}>Back to Events</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
