import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import api from "../utils/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const navigate = useNavigate();
  const { dark, setDark } = useContext(ThemeContext);

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [counts, setCounts] = useState({ doctors: 0, patients: 0, appointments: 0 });

  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: []
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/analytics');
      const rd = res.data.data;

      // Extract the lists safely and map ID fields to match our frontend usage
      setDoctors(rd.lists.doctors.map(d => ({ ...d, id: d._id, status: 'Active' }))); // Note: Status is static 'Active' as blocking isn't stored in DB yet.
      setPatients(rd.lists.patients.map(p => ({ ...p, id: p._id })));
      setAppointments(rd.lists.appointments);
      setCounts(rd.counts);

      setGraphData(rd.monthlyGraph);
    } catch (err) {
      console.error("Failed to load admin analytics", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleDoctorStatus = (id) => {
    setDoctors(
      doctors.map((doc) =>
        doc.id === id
          ? {
            ...doc,
            status: doc.status === "Active" ? "Blocked" : "Active",
          }
          : doc
      )
    );
  };

  const cancelAppointment = (id) => {
    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, status: "Cancelled by Admin" } : a
      )
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Admin Dashboard</h2>
      </div>

      {/* Stats Summary Row */}
      <div style={styles.statsRow}>
        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>👨‍⚕️</div>
          <div>
            <p style={styles.statLabel}>Total Doctors</p>
            <h3 style={styles.statValue}>{counts.doctors}</h3>
          </div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>👥</div>
          <div>
            <p style={styles.statLabel}>Total Patients</p>
            <h3 style={styles.statValue}>{counts.patients}</h3>
          </div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>📅</div>
          <div>
            <p style={styles.statLabel}>Appointments</p>
            <h3 style={styles.statValue}>{counts.appointments}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Graph Row */}
      <div className="card" style={{ marginBottom: '30px', padding: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Monthly Bookings Trend</h3>
        <div style={{ height: '300px', width: '100%' }}>
          {graphData.labels.length > 0 ? (
            <Bar
              options={{ responsive: true, maintainAspectRatio: false }}
              data={graphData}
            />
          ) : (
            <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-secondary)' }}>Loading analytics...</p>
          )}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.column}>
          {/* Doctors */}
          <div className="card">
            <h3>Registered Doctors</h3>
            {doctors.map((doc) => (
              <div key={doc.id} style={styles.row}>
                <span>
                  {doc.name} — <strong style={{ color: doc.status === 'Active' ? '#0f766e' : '#b91c1c' }}>{doc.status}</strong>
                </span>
                <button
                  style={doc.status === 'Active' ? styles.blockBtn : styles.unblockBtn}
                  onClick={() => toggleDoctorStatus(doc.id)}
                >
                  {doc.status === "Active" ? "Block" : "Unblock"}
                </button>
              </div>
            ))}
          </div>

          {/* Patients */}
          <div className="card">
            <h3>Registered Patients</h3>
            {patients.map((p) => (
              <p key={p.id} style={{ padding: '10px', background: 'var(--nav-bg)', borderRadius: '8px', marginBottom: '8px' }}>
                {p.name}
              </p>
            ))}
          </div>
        </div>

        {/* Appointments */}
        <div className="card">
          <h3>System Appointments</h3>
          {appointments.map((a) => (
            <div key={a.id} className="card" style={{ padding: '15px', background: 'var(--nav-bg)', border: '1px solid var(--card-border)', margin: '0 0 15px 0' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Doctor:</strong> {a.doctor}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Patient:</strong> {a.patient}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontWeight: '600', color: '#0d9488' }}>
                  Status: {a.status}
                </span>
                {a.status !== "Cancelled by Admin" && (
                  <button
                    style={styles.cancelBtn}
                    onClick={() => cancelAppointment(a.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "40px 6vw", fontFamily: "'Outfit', sans-serif" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" },
  heading: { color: "#0f766e", fontSize: "32px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", alignItems: "start" },
  column: { display: "flex", flexDirection: "column", gap: "30px" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid rgba(0,0,0,0.05)" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" },
  statCard: { display: "flex", alignItems: "center", gap: "20px", padding: "25px" },
  statIcon: { width: "50px", height: "50px", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px" },
  statLabel: { margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 500 },
  statValue: { margin: "5px 0 0 0", color: "#1e293b", fontSize: "24px", fontWeight: 700 },

  blockBtn: { background: "linear-gradient(135deg, #ef4444, #dc2626)", padding: "6px 16px", borderRadius: "8px", fontSize: "13px" },
  unblockBtn: { background: "linear-gradient(135deg, #10b981, #059669)", padding: "6px 16px", borderRadius: "8px", fontSize: "13px" },
  cancelBtn: { background: "linear-gradient(135deg, #ef4444, #dc2626)", padding: "8px 18px", borderRadius: "8px", fontSize: "13px", boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)" }
};

export default AdminDashboard;
