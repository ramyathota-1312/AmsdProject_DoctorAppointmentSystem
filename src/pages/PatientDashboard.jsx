import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import api from "../utils/api";

function PatientDashboard() {
  const navigate = useNavigate();
  const { dark, setDark } = useContext(ThemeContext);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const fetchDashboardData = async () => {
    try {
      const [docsRes, apptsRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/appointments')
      ]);
      setDoctors(docsRes.data.data);

      // The backend returns appointments with populated doctorId.name
      // We map it to match our frontend 'doctor' string expectation
      const mappedAppts = apptsRes.data.data.map(a => ({
        id: a._id,
        doctor: a.doctorId?.name || "Unknown Doctor",
        date: a.date,
        time: a.time,
        status: a.status,
        prescriptionUrl: a.prescriptionUrl
      }));
      setAppointments(mappedAppts);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const bookAppointment = async () => {
    if (!selectedDoctor || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor, // using the raw ID from the select value
        date,
        time
      });

      alert("Appointment booked successfully!");
      setSelectedDoctor("");
      setDate("");
      setTime("");
      fetchDashboardData(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book appointment");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Patient Dashboard</h2>
      </div>

      <div style={styles.grid}>
        {/* Book Appointment */}
        <div className="card" style={styles.card}>
          <h3>Book Appointment</h3>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} - {doc.specialization} ({doc.location})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button style={styles.bookBtn} onClick={bookAppointment}>
            Book Appointment
          </button>
        </div>

        {/* My Appointments */}
        <div className="card" style={styles.card}>
          <h3>My Appointments</h3>
          {appointments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No appointments yet</p>}

          {appointments.filter(a => new Date(a.date) >= new Date().setHours(0, 0, 0, 0)).length > 0 && (
            <h4 style={{ marginTop: '10px', color: 'var(--text-primary)' }}>Upcoming</h4>
          )}
          {appointments.filter(a => new Date(a.date) >= new Date().setHours(0, 0, 0, 0)).map((appt, index) => (
            <div key={index} className="card" style={{ padding: '15px', background: 'var(--nav-bg)', border: '1px solid var(--card-border)', margin: '0 0 10px 0' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Doctor:</strong> {appt.doctor}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {appt.date}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Time:</strong> {appt.time}</p>
              <p style={{ margin: 0 }}><strong>Status:</strong> <span style={{ color: '#0d9488' }}>{appt.status}</span></p>
            </div>
          ))}

          {appointments.filter(a => new Date(a.date) < new Date().setHours(0, 0, 0, 0)).length > 0 && (
            <h4 style={{ marginTop: '20px', color: 'var(--text-primary)' }}>Past Appointments</h4>
          )}
          {appointments.filter(a => new Date(a.date) < new Date().setHours(0, 0, 0, 0)).map((appt, index) => (
            <div key={index} className="card" style={{ padding: '15px', background: 'var(--nav-bg)', border: '1px solid var(--card-border)', margin: '0 0 10px 0', opacity: 0.7 }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Doctor:</strong> {appt.doctor}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {appt.date}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Time:</strong> {appt.time}</p>
              <p style={{ margin: 0 }}><strong>Status:</strong> <span style={{ color: '#0d9488' }}>{appt.status}</span></p>

              {appt.prescriptionUrl && (
                <p style={{ marginTop: '10px' }}>
                  <a href={`http://localhost:5000${appt.prescriptionUrl}`} download target="_blank" rel="noreferrer" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>
                    ⬇️ Download Prescription
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 6vw",
    fontFamily: "'Outfit', sans-serif"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px"
  },
  heading: {
    color: "#0f766e",
    fontSize: "32px",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.5px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    alignItems: "start"
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  bookBtn: {
    marginTop: "10px"
  }
};

export default PatientDashboard;
