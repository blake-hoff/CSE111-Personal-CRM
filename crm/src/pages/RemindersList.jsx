
import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function RemindersList() {
  const [reminders, setReminders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { loadReminders(); }, []);
  function loadReminders() {
    api.RemindersAPI.list().then(setReminders).catch(console.error);
  }
  function deleteReminder(id) {
    if (!window.confirm("Delete this reminder?")) return;
    api.RemindersAPI.del(id).then(loadReminders).catch(console.error);
  }
  function toggleCompleted(rem) {
    api.RemindersAPI.update(rem.id, { completed: !rem.completed })
      .then(loadReminders)
      .catch(console.error);
  }

  // --- Styles: grid + card (inline) ---
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  };
  const listStyle = { listStyle: "none", padding: 0, margin: 0 };
  const cardStyle = {
    background: "#e0f2fe",           // light blue
    border: "1px solid #bae6fd",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    padding: 16,
    color: "#0f172a",
  };
  const pillBase = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 12,
    border: "1px solid transparent",
  };
  const pillDone = {
    ...pillBase,
    background: "#d1fae5",  // emerald-100
    color: "#065f46",       // emerald-800
    borderColor: "#a7f3d0", // emerald-200
  };
  const pillPending = {
    ...pillBase,
    background: "#fffbeb",  // amber-50/100
    color: "#92400e",       // amber-800
    borderColor: "#fde68a", // amber-200
  };
  const actionBtn = (bg = "#2563eb") => ({
    background: bg,
    color: "#fff",
    borderRadius: 8,
    padding: "6px 10px",
    border: 0,
    cursor: "pointer",
  });

  // (Optional) basic due date display helper
  const formatDue = (due) => (due ? due : "No date");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Reminders</h1>
        <Link
          to="/reminders/new"
          style={{ ...actionBtn() }}
        >
          + New Reminder
        </Link>
      </div>

      {/* Card grid */}
      <ul style={{ ...listStyle, ...gridStyle }}>
        {reminders.map((r) => (
          <li key={r.id}>
            <div style={cardStyle}>
              {/* Title + status pill */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 600 }}>{r.label}</div>
                <span style={r.completed ? pillDone : pillPending}>
                  {r.completed ? "Done" : "Pending"}
                </span>
              </div>

              {/* Meta */}
              <div style={{ fontSize: 14, color: "#334155", marginTop: 6 }}>
                <strong>Due:</strong> {formatDue(r.due_date)}
                {r.description ? (
                  <div style={{ marginTop: 4 }}>{r.description}</div>
                ) : null}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => toggleCompleted(r)}
                  style={actionBtn(r.completed ? "#60a5fa" : "#2563eb")} // blue-400 vs blue-600
                >
                  {r.completed ? "Mark Pending" : "Mark Complete"}
                </button>

                <button
                  onClick={() => navigate(`/reminders/${r.id}`)}
                  style={actionBtn("#f59e0b")} // amber-500 (Edit)
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteReminder(r.id)}
                  style={actionBtn("#dc2626")} // red-600 (Delete)
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
