// Create Registration page with a form that allows users to register with name, email, password, and role. Use the AuthContext to call the register function on form submission. Redirect to the login page on successful registration.
import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Role } from "../types";

export default function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register({ name, email, password, role: role || undefined });
      navigate("/login");
    } catch {
      setError("Registration failed. Please check your inputs.");
    }
  };

  return (
    <div className="registration">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          placeholder="Role"
        />
        <button type="submit">Register</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Already have an account? <Link to="/login">Login here</Link>.
      </p>
    </div>
  );
}
