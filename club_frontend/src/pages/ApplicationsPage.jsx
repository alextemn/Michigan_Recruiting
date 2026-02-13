import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../apiClient';

export default function ApplicationsPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await api.get(`club/${clubId}/application`);
        setApplications(res.data);
      } catch (err) {
        setError('Failed to load applications for this club.');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [clubId]);

  const startEdit = (app) => {
    setEditingId(app.id);
    setEditTitle(app.title ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleUpdate = async (applicationId) => {
    const trimmed = editTitle?.trim();
    if (!trimmed) return;

    try {
      setError('');
      const res = await api.patch(`club/${clubId}/application/${applicationId}`, {
        title: trimmed,
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? res.data : a)),
      );
      cancelEdit();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update application', err);
      setError('Failed to update application. Please try again.');
    }
  };

  const handleDelete = async (applicationId) => {
    // Optional confirmation; remove if you don't want the prompt
    // eslint-disable-next-line no-alert
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this application? This cannot be undone.',
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`club/${clubId}/application/${applicationId}`);
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete application', err);
      setError('Failed to delete application. Please try again.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">
            Application forms for club ID
            {' '}
            {clubId}
            {' '}
            from `/club/{clubId}/application`.
          </p>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="button-primary"
            onClick={() => navigate(`/dashboard/clubs/${clubId}/applications/new`)}
          >
            New application
          </button>
        </div>
      </div>

      <section className="card">
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading applications…</p>
        ) : applications.length === 0 ? (
          <p className="muted">No applications for this club yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Created</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>
                    {editingId === app.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate(app.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="input"
                        placeholder="Application title"
                        autoFocus
                        aria-label="Application title"
                      />
                    ) : (
                      app.title
                    )}
                  </td>
                  <td>{app.created_at ? new Date(app.created_at).toLocaleString() : '—'}</td>
                  <td>{app.updated_at ? new Date(app.updated_at).toLocaleString() : '—'}</td>
                  <td>
                    <div className="table-actions">
                      {editingId === app.id ? (
                        <>
                          <button
                            type="button"
                            className="button-primary"
                            onClick={() => handleUpdate(app.id)}
                          >
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(app)}
                          >
                            Update
                          </button>
                          <Link
                            to={`/dashboard/clubs/${clubId}/applications/${app.id}/questions`}
                          >
                            <button type="button" className="button-primary">
                              Manage questions
                            </button>
                          </Link>
                          <Link
                            to={`/dashboard/clubs/${clubId}/applications/${app.id}/applicants`}
                          >
                            <button type="button">
                              View applicants
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
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

