import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { useAuth } from '../AuthContext.jsx';

export default function DashboardHome() {
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadClubs = async () => {
      try {
        setError('');
        setLoadingClubs(true);
        const res = await api.get('club');
        setClubs(res.data);
      } catch (err) {
        setError('Failed to load clubs. Make sure you are logged in.');
      } finally {
        setLoadingClubs(false);
      }
    };

    loadClubs();
  }, []);

  const goToCreateApplication = (clubId) => {
    navigate(`/dashboard/clubs/${clubId}/applications/new`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Browse and manage clubs, applications, questions, and applicants.
          </p>
        </div>
      </div>

      {user && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
            }}
          >
            Club ID:
            {' '}
            {user.club ?? 'N/A'}
          </div>
        </div>
      )}

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title">Data sections</h2>
        <p className="card-description">Jump to any part of the API data model.</p>
        <div className="pill-nav" style={{ marginTop: '0.75rem' }}>
          <Link to="/dashboard/clubs">Clubs</Link>
          <Link to="/dashboard/applicants">Applicants</Link>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Create application for a club</h2>
            <p className="card-description">
              Pick a club and click the button to create a new application form for it.
            </p>
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        {loadingClubs ? (
          <p className="muted">Loading clubs…</p>
        ) : clubs.length === 0 ? (
          <p className="muted">
            No clubs found. Create a club first on the
            {' '}
            <Link to="/dashboard/clubs">Clubs</Link>
            {' '}
            page.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Club</th>
                <th>Club ID</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.id}>
                  <td>{club.name}</td>
                  <td>{club.id || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="button-primary"
                        onClick={() => goToCreateApplication(club.id)}
                      >
                        Create application
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/clubs/${club.id}/applications`)}
                      >
                        View applications
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

