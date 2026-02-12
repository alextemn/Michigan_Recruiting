import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../apiClient';

const BACKEND_BASE = api.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000';

function getFileDownloadUrl(answerFile) {
  if (!answerFile || typeof answerFile !== 'string') return null;
  if (answerFile.startsWith('http://') || answerFile.startsWith('https://')) return answerFile;
  const path = answerFile.startsWith('/') ? answerFile : `/${answerFile}`;
  return `${BACKEND_BASE}${path}`;
}

const ORDERING_FIELDS = [
  { value: 'first_name', label: 'First name' },
  { value: 'last_name', label: 'Last name' },
  { value: 'year', label: 'Year' },
];

export default function ApplicationApplicantsPage() {
  const { clubId, applicationId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderBy, setOrderBy] = useState('first_name');
  const [orderDesc, setOrderDesc] = useState(false);

  const loadData = async () => {
    try {
      setError('');
      setLoading(true);

      const orderingParam = orderDesc ? `-${orderBy}` : orderBy;

      // Fetch all submissions, applicants (with ordering), and questions for this application
      const [subRes, appRes, qRes] = await Promise.all([
        api.get('submission'),
        api.get('applicant', { params: { ordering: orderingParam } }),
        api.get(`club/${clubId}/application/${applicationId}/question`),
      ]);

      const submissions = subRes.data || [];
      const applicants = appRes.data || [];
      const questions = qRes.data || [];

      const byApplicantId = new Map(applicants.map((a) => [a.id, a]));
      const questionById = new Map(questions.map((q) => [q.id, q]));

      const forThisForm = submissions.filter(
        (s) => s.form === Number(applicationId),
      );

      let combined = forThisForm.map((sub) => ({
        submission: sub,
        applicant: byApplicantId.get(sub.applicant),
        answers: (sub.answers || []).map((ans) => ({
          ...ans,
          questionObj: questionById.get(ans.question),
        })),
      }));

      // Sort combined list by the same field so display order matches backend ordering
      combined = combined.slice().sort((a, b) => {
        const av = a.applicant?.[orderBy] ?? '';
        const bv = b.applicant?.[orderBy] ?? '';
        const cmp = typeof av === 'string' ? String(av).localeCompare(String(bv)) : (av - bv);
        return orderDesc ? -cmp : cmp;
      });

      setItems(combined);
    } catch (err) {
      setError('Failed to load applicants or submissions for this application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clubId, applicationId, orderBy, orderDesc]);

  const handleDelete = async (applicantId) => {
    // eslint-disable-next-line no-alert
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this applicant? This will also delete their submission and answers. This cannot be undone.',
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`applicant/${applicantId}`);
      // Reload data after deletion
      await loadData();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete applicant', err);
      setError('Failed to delete applicant. Please try again.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Applicants for Application</h1>
          <p className="page-subtitle">
            Applicants and their responses for application
            {' '}
            {applicationId}
            {' '}
            of club
            {' '}
            {clubId}
            .
          </p>
        </div>
      </div>
      <section className="card">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <label htmlFor="order-by" style={{ marginRight: '0.5rem' }}>Order by:</label>
            <select
              id="order-by"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              style={{ marginRight: '1rem' }}
            >
              {ORDERING_FIELDS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <label htmlFor="order-dir" style={{ marginRight: '0.5rem' }}>Direction:</label>
            <select
              id="order-dir"
              value={orderDesc ? 'desc' : 'asc'}
              onChange={(e) => setOrderDesc(e.target.value === 'desc')}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading applicants…</p>
        ) : items.length === 0 ? (
          <p className="muted">No submissions for this application yet.</p>
        ) : (
          <div className="grid">
            {items.map(({ applicant, submission, answers }) => (
              <div key={submission.id} className="card">
                <div className="card-header">
                  <div>
                    <h2 className="card-title">
                      {applicant
                        ? `${applicant.first_name} ${applicant.last_name}`
                        : 'Unknown applicant'}
                    </h2>
                    <p className="card-description">
                      Submission #
                      {submission.id}
                      {' '}
                      • Year:
                      {' '}
                      {applicant?.year || 'N/A'}
                    </p>
                  </div>
                  {applicant && (
                    <div className="table-actions">
                      <button
                        type="button"
                        onClick={() => handleDelete(applicant.id)}
                      >
                        Delete applicant
                      </button>
                    </div>
                  )}
                </div>
                {answers.length === 0 ? (
                  <p className="muted">No answers recorded for this submission.</p>
                ) : (
                  <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                    {answers.map((ans) => (
                      <li key={ans.id} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: 500 }}>
                          {ans.questionObj?.prompt || `Question #${ans.question}`}
                        </div>
                        <div className="muted">
                          {ans.answer_text
                            ? ans.answer_text
                            : ans.answer_file
                              ? (() => {
                                const fileUrl = getFileDownloadUrl(ans.answer_file);
                                return fileUrl ? (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                  >
                                    Download file
                                  </a>
                                ) : (
                                  'File uploaded'
                                );
                              })()
                              : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

