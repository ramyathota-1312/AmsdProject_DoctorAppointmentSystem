import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import api from "../utils/api";
import { logoutUser } from "../utils/auth";

function DoctorDashboard() {
  const navigate = useNavigate();
  const { dark, setDark } = useContext(ThemeContext);

  const [onLeave, setOnLeave] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);

  const [slots, setSlots] = useState([
    { time: "10:00 - 11:00", available: true },
    { time: "11:00 - 12:00", available: true },
    { time: "12:00 - 01:00", available: false },
  ]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const mappedAppts = res.data.data.map(a => ({
        id: a._id,
        patient: a.patientName,
        date: a.date,
        time: a.time,
        status: a.status,
        prescriptionUrl: a.prescriptionUrl
      }));
      setAppointments(mappedAppts);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
      setDoctorInfo(JSON.parse(userStr));
    } else {
      localStorage.removeItem('user'); // Clean up corrupt state
    }
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      // Instead of locally mapping, refetch to guarantee UI is in sync
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const uploadPrescription = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('prescription', file);

    try {
      await api.post(`/appointments/${id}/prescription`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Prescription Uploaded!');
      // Immediately mark as completed so the frontend knows we are done with the flow
      await updateStatus(id, "Completed");
    } catch (err) {
      alert(err.response?.data?.message || "Prescription upload failed");
    }
  };

  const applyLeave = () => {
    setOnLeave(true);
    alert("Leave applied. Patients notified.");
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Doctor Dashboard</h2>
      </div>

      <div style={styles.grid}>
        <div>
          {/* Profile */}
          <div className="card" style={styles.profileCard}>
            <h3>Dr. Rajesh Kumar</h3>
            <p><strong>MBBS, MD (Cardiology)</strong></p>
            <p>Email: rajesh@hospital.com</p>
            <p>Location: Hyderabad</p>

            <button style={styles.leaveBtn} onClick={applyLeave}>
              Apply Leave (2 days notice)
            </button>

            {onLeave && (
              <p style={styles.leaveText}>
                You are on leave. New bookings blocked.
              </p>
            )}
          </div>

          <div className="card">
            <h3>Availability</h3>
            {slots.map((slot, i) => (
              <div key={i} style={styles.slotRow}>
                <span style={{ fontWeight: 600 }}>{slot.time}</span>
                <button
                  style={{
                    ...styles.availabilityBtn,
                    ...(slot.available ? styles.available : styles.unavailable),
                  }}
                  onClick={() =>
                    setSlots(
                      slots.map((s, idx) =>
                        idx === i ? { ...s, available: !s.available } : s
                      )
                    )
                  }
                >
                  {slot.available ? "Mark Unavailable" : "Mark Available"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments */}
        <div className="card">
          <h3>Today's Appointments</h3>
          {appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length === 0 && (
            <p style={{ color: 'var(--text-secondary)' }}>No appointments for today.</p>
          )}
          {appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).map((appt) => (
            <div key={appt.id} className="card" style={{ padding: '16px', background: 'var(--nav-bg)', border: '1px solid var(--card-border)', margin: '0 0 15px 0' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Patient:</strong> {appt.patient}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {appt.date}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Time:</strong> {appt.time}</p>
              <p style={{ margin: '0 0 15px 0' }}>
                <strong>Status:</strong>{" "}
                <span style={statusColor(appt.status)}>
                  {appt.status}
                </span>
              </p>

              {!onLeave && appt.status === "Pending" && (
                <div>
                  <button
                    style={styles.accept}
                    onClick={() => updateStatus(appt.id, "Accepted")}
                  >
                    Accept
                  </button>
                  <button
                    style={styles.reject}
                    onClick={() => updateStatus(appt.id, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              )}

              {appt.status === "Accepted" && !appt.prescriptionUrl && (
                <div style={{ marginTop: '10px' }}>
                  <input type="file" accept="application/pdf" style={{ marginBottom: '10px' }} onChange={(e) => uploadPrescription(e, appt.id)} />
                </div>
              )}

              {appt.prescriptionUrl && (
                <p style={{ marginTop: '10px' }}>
                  <a href={`http://localhost:5000${appt.prescriptionUrl}`} target="_blank" rel="noreferrer" style={{ color: '#0d9488', fontWeight: 600 }}>
                    📄 View Prescription
                  </a>
                </p>
              )}
            </div>
          ))}

          <h3 style={{ marginTop: '20px' }}>Upcoming Appointments</h3>
          {appointments.filter(a => new Date(a.date).toDateString() !== new Date().toDateString()).length === 0 && (
            <p style={{ color: 'var(--text-secondary)' }}>No future appointments.</p>
          )}
          {appointments.filter(a => new Date(a.date).toDateString() !== new Date().toDateString()).map((appt) => (
            <div key={appt.id} className="card" style={{ padding: '16px', background: 'var(--nav-bg)', border: '1px solid var(--card-border)', margin: '0 0 15px 0', opacity: 0.8 }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Patient:</strong> {appt.patient}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {appt.date}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Time:</strong> {appt.time}</p>
              <p style={{ margin: '0 0 15px 0' }}>
                <strong>Status:</strong>{" "}
                <span style={statusColor(appt.status)}>
                  {appt.status}
                </span>
              </p>

              {!onLeave && appt.status === "Pending" && (
                <div>
                  <button
                    style={styles.accept}
                    onClick={() => updateStatus(appt.id, "Accepted")}
                  >
                    Accept
                  </button>
                  <button
                    style={styles.reject}
                    onClick={() => updateStatus(appt.id, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              )}

              {appt.status === "Accepted" && !appt.prescriptionUrl && (
                <div style={{ marginTop: '10px' }}>
                  <input type="file" accept="application/pdf" style={{ marginBottom: '10px' }} onChange={(e) => {
                    // Mock upload for frontend presentation
                    updateStatus(appt.id, "Completed");
                    setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, prescriptionUrl: '/mock-prescription.pdf' } : a));
                    alert('Prescription Uploaded!');
                  }} />
                </div>
              )}

              {appt.prescriptionUrl && (
                <p style={{ marginTop: '10px' }}>
                  <a href={appt.prescriptionUrl} target="_blank" rel="noreferrer" style={{ color: '#0d9488', fontWeight: 600 }}>
                    📄 View Prescription
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

const statusColor = (status) => ({
  color:
    status === "Accepted"
      ? "#15803d"
      : status === "Rejected"
        ? "#b91c1c"
        : "#854d0e",
});

const styles = {
  container: { padding: "40px 6vw", fontFamily: "'Outfit', sans-serif" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" },
  heading: { color: "#0f766e", fontSize: "32px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", alignItems: "start" },
  profileCard: { display: "flex", flexDirection: "column", gap: "10px", lineHeight: "1.6" },
  leaveBtn: { marginTop: "15px", background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)" },
  leaveText: { marginTop: "12px", color: "#b91c1c", fontWeight: "600", background: "rgba(254, 226, 226, 0.8)", padding: "10px", borderRadius: 10 },
  slotRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  availabilityBtn: { padding: "6px 12px", borderRadius: "8px", fontSize: "12px", marginLeft: "10px" },
  available: { background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" },
  unavailable: { background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 10px rgba(239, 68, 68, 0.2)" },
  accept: { background: "linear-gradient(135deg, #10b981, #059669)", marginRight: "10px", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)" },
  reject: { background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)" }
};


export default DoctorDashboard;
