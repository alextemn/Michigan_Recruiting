import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../apiClient';

export default function ApplyQuestionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // questionId -> string (text) or File (for File type)

  useEffect(() => {
    const init = async () => {
      try {
        setError('');
        const applicantInfo = location.state?.applicantInfo;

        if (!applicantInfo) {
          setError('Missing application information. Please restart the application flow.');
          setLoading(false);
          return;
        }

        const clubId = applicantInfo.club_association;
        const formId = applicantInfo.application;

        if (!formId) {
          setError('No application selected. Please restart the application flow.');
          setLoading(false);
          return;
        }

        // Load questions for that form.
        const qRes = await api.get(`club/${clubId}/application/${formId}/question`);
        setQuestions(qRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load questions for this application.');
        setLoading(false);
      }
    };

    init();
  }, [location.state]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFileChange = (questionId, file) => {
    setAnswers((prev) => ({ ...prev, [questionId]: file || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const applicantInfo = location.state?.applicantInfo;

    if (!applicantInfo) {
      setError('Missing application information. Please restart the application flow.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Step 1: Create the applicant object
      const applicantRes = await api.post('applicants/', applicantInfo);
      const applicantId = applicantRes.data.id;

      // Step 2: Create a submission for this applicant and form
      const formId = applicantInfo.application;
      let submission = null;
      try {
        const subRes = await api.post('submission', {
          form: formId,
          applicant: applicantId,
        });
        submission = subRes.data;
      } catch (postErr) {
        // If a submission already exists, fetch and re-use it
        if (postErr.response && postErr.response.status === 400) {
          const allSubsRes = await api.get('submission');
          const existing = (allSubsRes.data || []).find(
            (s) => s.form === formId && s.applicant === applicantId,
          );
          if (!existing) {
            throw postErr;
          }
          submission = existing;
        } else {
          throw postErr;
        }
      }

      const submissionId = submission.id;

      // Step 3: Post all answers (text as JSON, file as multipart)
      const questionById = new Map(questions.map((q) => [q.id, q]));

      await Promise.all(
        Object.entries(answers).map(async ([questionId, value]) => {
          const q = questionById.get(Number(questionId));
          const isFile = q?.question_type === 'File';

          if (isFile && value instanceof File) {
            const formData = new FormData();
            formData.append('submission', submissionId);
            formData.append('question', questionId);
            formData.append('answer_file', value);
            await api.post(`submission/${submissionId}/answers`, formData);
          } else if (!isFile && typeof value === 'string') {
            await api.post(`submission/${submissionId}/answers`, {
              submission: submissionId,
              question: Number(questionId),
              answer_text: value,
            });
          }
        }),
      );

      navigate('/');
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading application questions...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Application Questions</h1>
          <p className="page-subtitle">
            Answer the questions below to complete your application.
          </p>
        </div>
      </div>

      <section className="card">
        {error && <p className="error-text">{error}</p>}
        {!questions.length && !error && (
          <p className="muted">No questions configured for this application.</p>
        )}
        {questions.length > 0 && (
          <form className="form" onSubmit={handleSubmit}>
            {questions.map((q) => (
              <div key={q.id} className="form-row">
                <label htmlFor={`q-${q.id}`}>
                  {q.prompt}
                  {q.required && ' *'}
                </label>
                {q.question_type === 'File' ? (
                  <input
                    id={`q-${q.id}`}
                    type="file"
                    onChange={(e) => handleFileChange(q.id, e.target.files?.[0])}
                    required={q.required}
                  />
                ) : (
                  <textarea
                    id={`q-${q.id}`}
                    value={typeof answers[q.id] === 'string' ? answers[q.id] : ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    required={q.required}
                  />
                )}
              </div>
            ))}
            <div className="form-actions">
              <button type="submit" className="button-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit application'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

