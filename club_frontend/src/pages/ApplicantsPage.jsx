import { useEffect, useState } from 'react';
import api from '../apiClient';

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadApplicants = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await api.get('applicant');
        setApplicants(res.data);
      } catch (err) {
        setError('Failed to load applicants. Make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    loadApplicants();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Applicants</h1>
          <p className="page-subtitle">
            All applicants via the `/applicant` endpoint (admin view).
          </p>
        </div>
      </div>
      <section className="card">
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading applicants…</p>
        ) : applicants.length === 0 ? (
          <p className="muted">No applicants found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Year</th>
                <th>Club</th>
                <th>Passed Apps</th>
                <th>First Round</th>
                <th>Second Round</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>
                    {a.first_name}
                    {' '}
                    {a.last_name}
                  </td>
                  <td>{a.year}</td>
                  <td>{a.club_association}</td>
                  <td>{a.pass_apps ? 'Yes' : 'No'}</td>
                  <td>{a.pass_first ? 'Yes' : 'No'}</td>
                  <td>{a.pass_second ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

