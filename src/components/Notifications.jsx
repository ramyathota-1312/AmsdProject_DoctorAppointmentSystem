import { useState, useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function Notifications({ notifications = [], onMarkAsRead }) {
  const [isOpen, setIsOpen] = useState(false);
  const { dark } = useContext(ThemeContext);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          padding: "5px",
          position: "relative",
          color: dark ? '#f8fafc' : '#0f766e',
          boxShadow: "none"
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '-10px',
          width: '320px',
          background: dark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          borderRadius: '16px',
          boxShadow: dark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(13, 148, 136, 0.15)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
          }}>
            <h4 style={{
              margin: 0,
              color: dark ? '#f8fafc' : '#0f766e',
              fontSize: '16px',
              fontWeight: 700
            }}>
              Notifications
            </h4>
            {unreadCount > 0 && (
              <span style={{ fontSize: '12px', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                {unreadCount} New
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.5 }}>📭</div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                You're all caught up!
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map((notif, idx) => (
                <li
                  key={idx}
                  onClick={() => !notif.isRead && onMarkAsRead(notif.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
                    fontSize: '14px',
                    lineHeight: '1.5',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    transition: 'all 0.2s ease',
                    cursor: notif.isRead ? 'default' : 'pointer',
                    opacity: notif.isRead ? 0.6 : 1,
                    borderLeft: notif.isRead ? 'none' : `3px solid ${notif.type === 'success' ? '#10b981' : '#0ea5e9'}`
                  }}
                >
                  <div style={{ fontSize: '18px', marginTop: '2px', opacity: notif.isRead ? 0.5 : 1 }}>
                    {notif.type === 'success' ? '✅' : notif.type === 'alert' ? '⚠️' : '🔵'}
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: notif.isRead ? 400 : 500 }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px', fontWeight: 600 }}>
                      {notif.time || "Just now"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
