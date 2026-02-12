import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome to Club Recruit</h1>
          <p className="page-subtitle">
            Manage clubs, applications, and applicants – and let students apply online.
          </p>
        </div>
        <div className="form-actions">
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <button type="button" className="button-primary">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button type="button">Register</button>
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/dashboard">
              <button type="button" className="button-primary">
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2 className="card-title">Admin Portal</h2>
          <p className="card-description">
            Use the dashboard to configure clubs, applications, questions, applicants,
            submissions, and answers.
          </p>
          <div className="pill-nav" style={{ marginTop: '0.75rem' }}>
            <span className="badge">JWT protected</span>
            <span className="badge">Django REST API</span>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Apply to a Club</h2>
          <p className="card-description">
            Start a new application, answer all questions, and submit your responses online.
          </p>
          <div className="form-actions" style={{ marginTop: '0.75rem' }}>
            <Link to="/apply">
              <button type="button" className="button-primary">
                Apply
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

