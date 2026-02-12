import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    club: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        setLoadingClubs(true);
        const res = await api.get('club');
        setClubs(res.data);
      } catch (err) {
        // Registration can still proceed without clubs; just log error state.
        // eslint-disable-next-line no-console
        console.error('Failed to load clubs for registration', err);
      } finally {
        setLoadingClubs(false);
      }
    };

    loadClubs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        club: form.club ? Number(form.club) : null,
      };
      await api.post('register/', payload);
      setSuccess('Account created. You can now log in.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        const msg =
          data.username?.[0] ||
          data.email?.[0] ||
          data.password?.[0] ||
          'Registration failed.';
        setError(msg);
      } else {
        setError('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Register</h1>
          <p className="page-subtitle">Create an account to manage club recruiting.</p>
        </div>
      </div>

      <section className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="club">Club association</label>
            {loadingClubs ? (
              <p className="muted">Loading clubs…</p>
            ) : clubs.length === 0 ? (
              <p className="error-text">You must create at least one club before registering users.</p>
            ) : (
              <select
                id="club"
                name="club"
                value={form.club}
                onChange={handleChange}
                required
              >
                <option value="">Select a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}
          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

