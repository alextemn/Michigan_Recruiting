import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../apiClient';

export default function ApplicationCreatePage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post(`club/${clubId}/application`, {
        club: clubId,
        title,
      });
      navigate(`/dashboard/clubs/${clubId}/applications`);
    } catch (err) {
      setError('Failed to create application. Please check your input and auth token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Application</h1>
          <p className="page-subtitle">
            Create a new application form for club ID
            {' '}
            {clubId}
            .
          </p>
        </div>
      </div>

      <section className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="title">Application title</label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create application'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

