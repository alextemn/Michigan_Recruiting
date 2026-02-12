import { useEffect, useState } from 'react';
import api from '../apiClient';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', club_id: '' });
  const [creating, setCreating] = useState(false);

  const loadClubs = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('club');
      console.log('Clubs from /api/club:', res.data);
      setClubs(res.data);
    } catch (err) {
      setError('Failed to load clubs. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await api.post('club', form);
      setClubs((prev) => [...prev, res.data]);
      setForm({ name: '', club_id: '' });
    } catch (err) {
      setError('Failed to create club. Check your input and auth token.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clubs</h1>
          <p className="page-subtitle">
            View and manage club records from the `/club` endpoint.
          </p>
        </div>
      </div>
      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Create a new club</h2>
            <p className="card-description">
              POST to `/club` with a name and club_id (string identifier).
            </p>
          </div>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="club_id">Club ID</label>
            <input
              id="club_id"
              name="club_id"
              value={form.club_id}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={creating}>
              {creating ? 'Creating…' : 'Create club'}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Existing clubs</h2>
            <p className="card-description">
              Data loaded from GET `/club` (JWT required).
            </p>
          </div>
        </div>
        {loading ? (
          <p className="muted">Loading clubs…</p>
        ) : clubs.length === 0 ? (
          <p className="muted">No clubs yet. Create one above.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Club ID</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.club_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

