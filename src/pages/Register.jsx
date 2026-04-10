import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/common.css";

function Register() {
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [location, setLocation] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if (!name || !email || !password) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const payload = { name, email, password, role };
      if (role === 'doctor') {
        payload.specialization = specialization;
        payload.qualification = qualification;
        payload.location = location;
      }

      await api.post('/auth/register', payload);
      alert('Registration Successful! Please login.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🚀</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join DocBook today</p>
        </div>

        {error && <p style={{ color: '#ef4444', textAlign: 'center', margin: '0 0 10px 0', fontSize: '14px' }}>{error}</p>}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: "16px" }}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "16px" }}
        />

        {role === "doctor" && (
          <>
            <input
              placeholder="Specialization (e.g. Cardiologist)"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              style={{ marginBottom: "16px" }}
            />
            <input
              placeholder="Qualification (e.g. MBBS, MD)"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              style={{ marginBottom: "16px" }}
            />
            <input
              placeholder="Clinic Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ marginBottom: "16px" }}
            />
          </>
        )}

        <button style={styles.button} onClick={handleRegister}>
          Register
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
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
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
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
    color: "var(--text-secondary)",
    fontSize: "15px"
  },
  button: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    marginTop: "10px"
  }
};

export default Register;
