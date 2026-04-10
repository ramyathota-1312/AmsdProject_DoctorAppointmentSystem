import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/common.css";

function Login() {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");


    try {
      const res = await api.post('/auth/login', { email, password, role });
      const data = res.data;

      // Store real token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate(`/${role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🩺</div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && <p style={{ color: '#ef4444', textAlign: 'center', margin: '0 0 10px 0', fontSize: '14px' }}>{error}</p>}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: "16px" }}
        >
          <option value="patient">Patient Login</option>
          <option value="doctor">Doctor Login</option>
          <option value="admin">Admin Portal</option>
        </select>

        <input
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "24px" }}
        />

        <button style={styles.button} onClick={handleLogin}>
          Sign In
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    backgroundImage: "url('/doctors_working_bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
  },
  header: {
    textAlign: "center",
    marginBottom: "30px"
  },
  icon: {
    fontSize: "48px",
    marginBottom: "10px"
  },
  title: {
    color: "#0f766e",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "5px"
  },
  subtitle: {
    color: "#64748b",
    fontSize: "15px"
  },
  button: {
    width: "100%",
    padding: "14px",
    fontSize: "16px"
  }
};

export default Login;