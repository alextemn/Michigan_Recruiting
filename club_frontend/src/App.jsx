import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import ClubsPage from './pages/ClubsPage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';
import ApplicationCreatePage from './pages/ApplicationCreatePage.jsx';
import QuestionsPage from './pages/QuestionsPage.jsx';
import ApplicantsPage from './pages/ApplicantsPage.jsx';
import ApplicationApplicantsPage from './pages/ApplicationApplicantsPage.jsx';
import ApplyStartPage from './pages/ApplyStartPage.jsx';
import ApplyQuestionsPage from './pages/ApplyQuestionsPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { useAuth } from './AuthContext.jsx';

function AppLayout({ children }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          <Link to="/" className="brand">
            Club Recruit
          </Link>
        </div>
        <nav className="app-nav">
          <Link to="/">Home</Link>
          {!isAuthenticated && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button type="button" className="link-button" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Public apply flow – no authentication required */}
        <Route path="/apply" element={<ApplyStartPage />} />
        <Route path="/apply/questions" element={<ApplyQuestionsPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/clubs" element={<ClubsPage />} />
          <Route
            path="/dashboard/clubs/:clubId/applications"
            element={<ApplicationsPage />}
          />
          <Route
            path="/dashboard/clubs/:clubId/applications/new"
            element={<ApplicationCreatePage />}
          />
          <Route
            path="/dashboard/clubs/:clubId/applications/:applicationId/questions"
            element={<QuestionsPage />}
          />
          <Route path="/dashboard/applicants" element={<ApplicantsPage />} />
          <Route
            path="/dashboard/clubs/:clubId/applications/:applicationId/applicants"
            element={<ApplicationApplicantsPage />}
          />
        </Route>
      </Routes>
    </AppLayout>
  );
}

export default App;
