import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar-shell">
      <div className="navbar-inner">
        <div className="navbar-header">
          <span className="navbar-brand">Policy Task Tracker</span>
          <p className="navbar-title">Welcome, {user.name}</p>
        </div>
        <nav className="navbar-links" aria-label="Primary">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/projects" className="navbar-link">
            Projects
          </Link>
          <Link to="/tasks" className="navbar-link">
            Tasks
          </Link>
          <button type="button" className="navbar-button" onClick={logout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
