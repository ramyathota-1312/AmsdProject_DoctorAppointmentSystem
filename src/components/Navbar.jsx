import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Notifications from "./Notifications";
import api from "../utils/api";
import "../styles/Navbar.css";

function Navbar() {
  const { dark, setDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const userString = localStorage.getItem('user');
  const user = (userString && userString !== "undefined") ? JSON.parse(userString) : null;

  useEffect(() => {
    let interval;
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await api.get('/notifications');
        const notifs = res.data.data;
        // Map backend notifications to frontend expected format
        const mappedNotifs = notifs.map(n => ({
          id: n._id,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          time: new Date(n.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
            ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date(n.createdAt).toLocaleDateString()
        }));
        setNotifications(mappedNotifs);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
    interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '28px' }}>🏥</span>
        {user
          ? (user.role === 'patient'
            ? 'Patient Portal'
            : user.role === 'admin'
              ? 'Admin Dashboard'
              : 'DocBook')
          : 'DocBook'}
      </h2>
      <ul>
        {user ? (
          <>
            <li><Link to={`/${user.role}`} style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link></li>
            <li onClick={handleLogout}>Logout</li>
            <li style={{ marginLeft: "10px", display: "flex", alignItems: "center" }}>
              <Notifications
                notifications={notifications}
                onMarkAsRead={async (id) => {
                  try {
                    await api.put(`/notifications/${id}/read`);
                    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
                  } catch (err) {
                    console.error("Failed to mark as read");
                  }
                }}
              />
            </li>
          </>
        ) : (
          <>
            <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link></li>
            <li><Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Register</Link></li>
          </>
        )}
        <li style={{ marginLeft: "10px" }}>
          <button
            onClick={() => setDark(!dark)}
            style={{
              padding: "6px 12px",
              fontSize: "18px",
              background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              color: dark ? "#f8fafc" : "#0f766e",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "none"
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
