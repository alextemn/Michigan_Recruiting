import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';

export default function ApplyStartPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    year: '',
    club_association: '',
    application: '',
  });
  const [error, setError] = useState('');
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        setLoadingClubs(true);
        const res = await api.get('club');
        setClubs(res.data);
      } catch (err) {
        setError('Failed to load clubs. Please try again later.');
      } finally {
        setLoadingClubs(false);
      }
    };

    loadClubs();
  }, []);

  const loadApplicationsForClub = async (clubId) => {
    if (!clubId) {
      setApplications([]);
      return;
    }
    try {
      setLoadingApplications(true);
      setError('');
      const res = await api.get(`club/${clubId}/application`);
      const list = Array.isArray(res.data) ? res.data : [];
      // Only show applications that belong to the selected club
      const clubIdNum = Number(clubId);
      const forThisClub = list.filter(
        (app) => Number(app.club) === clubIdNum || app.club === clubIdNum,
      );
      setApplications(forThisClub);
    } catch (err) {
      setError('Failed to load applications for the selected club.');
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'club_association') {
      setForm((prev) => ({ ...prev, club_association: value, application: '' }));
      loadApplicationsForClub(value);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Store form data and navigate to questions page without creating applicant yet
    navigate('/apply/questions', {
      state: {
        applicantInfo: {
          first_name: form.first_name,
          last_name: form.last_name,
          year: form.year,
          club_association: Number(form.club_association),
          application: Number(form.application),
        },
      },
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Start Application</h1>
          <p className="page-subtitle">
            Tell us who you are and which club you are applying to.
          </p>
        </div>
      </div>

      <section className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="first_name">First name</label>
            <input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              name="year"
              value={form.year}
              onChange={handleChange}
              required
            >
              <option value="">Select year</option>
              <option value="1">Freshman</option>
              <option value="2">Sophomore</option>
              <option value="3">Junior</option>
              <option value="4">Senior</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="club_association">Club</label>
            {loadingClubs ? (
              <p className="muted">Loading clubs…</p>
            ) : clubs.length === 0 ? (
              <p className="error-text">No clubs available to apply to yet.</p>
            ) : (
              <select
                id="club_association"
                name="club_association"
                value={form.club_association}
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
          <div className="form-row">
            <label htmlFor="application">Application</label>
            {form.club_association === '' ? (
              <p className="muted">Select a club first to see its applications.</p>
            ) : loadingApplications ? (
              <p className="muted">Loading applications for this club…</p>
            ) : applications.length === 0 ? (
              <p className="error-text">No applications available for this club yet.</p>
            ) : (
              <>
                <p className="muted" style={{ marginBottom: '0.35rem' }}>
                  Applications for{' '}
                  {clubs.find((c) => String(c.id) === String(form.club_association))?.name ?? 'selected club'}
                  :
                </p>
                <select
                  id="application"
                  name="application"
                  value={form.application}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.title}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="button-primary">
              Continue to questions
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

