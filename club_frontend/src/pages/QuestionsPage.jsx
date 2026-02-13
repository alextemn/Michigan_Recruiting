import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../apiClient';

const QUESTION_TYPES = ['Short', 'Long', 'Multi-Select', 'File'];

export default function QuestionsPage() {
  const { clubId, applicationId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [prompt, setPrompt] = useState('');
  const [questionType, setQuestionType] = useState('Short');
  const [required, setRequired] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await api.get(`club/${clubId}/application/${applicationId}/question`);
        setQuestions(res.data);
      } catch (err) {
        setError('Failed to load questions for this application.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [clubId, applicationId]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const payload = {
        form: Number(applicationId),
        prompt,
        question_type: questionType,
        required,
      };
      const res = await api.post(
        `club/${clubId}/application/${applicationId}/question`,
        payload,
      );
      setQuestions((prev) => [...prev, res.data]);
      setPrompt('');
      setQuestionType('Short');
      setRequired(true);
    } catch (err) {
      setError('Failed to add question. Please check your input.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Are you sure you want to delete this question? This cannot be undone.');
    if (!ok) return;
    try {
      setError('');
      await api.delete(`club/${clubId}/application/${applicationId}/question/${questionId}`);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      setError('Failed to delete question. Please try again.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Questions</h1>
          <p className="page-subtitle">
            Questions for application
            {' '}
            {applicationId}
            {' '}
            of club
            {' '}
            {clubId}
            {' '}
            from `/club/{clubId}/application/{applicationId}/question`.
          </p>
        </div>
      </div>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Existing questions</h2>
            <p className="card-description">
              These are currently configured on this application form.
            </p>
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading questions…</p>
        ) : questions.length === 0 ? (
          <p className="muted">No questions yet. Add one below.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Prompt</th>
                <th>Type</th>
                <th>Required</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.prompt}</td>
                  <td>{q.question_type}</td>
                  <td>{q.required ? 'Yes' : 'No'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Add a question</h2>
            <p className="card-description">
              POST a new question to this application form.
            </p>
          </div>
        </div>
        <form className="form" onSubmit={handleAddQuestion}>
          <div className="form-row">
            <label htmlFor="prompt">Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="questionType">Question type</label>
            <select
              id="questionType"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="required">
              <input
                id="required"
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
              {' '}
              Required
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={creating}>
              {creating ? 'Adding…' : 'Add question'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

