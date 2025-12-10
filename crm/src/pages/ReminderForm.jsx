
 import { useState, useEffect } from "react";
 import api from "../api";
 import { useParams, useNavigate } from "react-router-dom";

const btn = (bg = "#2563eb") => ({
  background: bg,
  color: "#fff",
  borderRadius: 8,
  padding: "8px 12px",
  border: 0,
  cursor: "pointer",
});
const btnSecondary = {
  background: "#e5e7eb",
  color: "#111827",
  borderRadius: 8,
  padding: "8px 12px",
  border: "1px solid #cbd5e1",
  cursor: "pointer",
};
const btnDanger = {
  background: "#dc2626",
  color: "#fff",
  borderRadius: 8,
  padding: "8px 12px",
  border: 0,
  cursor: "pointer",
};

 export default function ReminderForm() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [form, setForm] = useState({ label: "", description: "", due_date: "", completed: false });
   const isEdit = Boolean(id);
  // People dropdown state
  const [allPeople, setAllPeople] = useState([]);
  const [selectedPersonKeys, setSelectedPersonKeys] = useState([]);

   useEffect(() => {
    // Load all people for dropdown
    fetch("/api/persons").then((r) => r.json()).then(setAllPeople).catch(console.error);
    if (isEdit) {
      api.RemindersAPI.get(id)
        .then((data) => setForm({
          label: data.label || "",
          description: data.description || "",
          due_date: data.due_date || "",
          completed: Boolean(data.completed),
        }))
        .catch(console.error);
      // Preselect currently attached people (if endpoint is available)
      fetch(`/api/reminders/${id}/people`)
        .then((r) => r.json())
        .then((people) => setSelectedPersonKeys(people.map((p) => Number(p.perkey))))
        .catch(() => {}); // non-fatal if not implemented yet
    }
   }, [id]);

   function handleChange(e) {
     const { name, value, type, checked } = e.target;
     setForm({ ...form, [name]: type === "checkbox" ? checked : value });
   }
  function handlePeopleChange(e) {
    const keys = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
    setSelectedPersonKeys(keys);
  }

   function handleSubmit(e) {
     e.preventDefault();
    (async () => {
      try {
        let remId = id;
        if (isEdit) {
          await api.RemindersAPI.update(id, form);
        } else {
          const created = await api.RemindersAPI.create(form); // expects { id }
          remId = created?.id;
        }
        // Attach selected people (replace associations)
        if (remId) {
          await fetch(`/api/reminders/${remId}/attach_people`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ personKeys: selectedPersonKeys }),
          });
        }
        navigate("/reminders");
      } catch (err) {
        alert(err);
      }
    })();
   }

  async function handleDelete() {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await api.RemindersAPI.del(id);
      navigate("/reminders");
    } catch (err) {
      alert(err);
    }
  }

  // Card  inputs styling (match PersonForm)
  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    padding: 16,
  };
  const labelStyle = { display: "flex", flexDirection: "column", gap: 6 };
  const inputStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "8px 10px",
    width: "100%",
  };
  const textAreaStyle = { ...inputStyle, minHeight: 96, resize: "vertical" };

   return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        {isEdit ? "Edit Reminder" : "Create Reminder"}
      </h1>

      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Label */}
          <label style={labelStyle}>
            <span style={{ fontSize: 13, color: "#475569" }}>Label</span>
            <input name="label" value={form.label} onChange={handleChange} style={inputStyle} required />
          </label>

          {/* Due date/time */}
          <label style={labelStyle}>
            <span style={{ fontSize: 13, color: "#475569" }}>Due Date/Time (optional)</span>
            <input type="datetime-local" name="due_date" value={form.due_date} onChange={handleChange} style={inputStyle} />
          </label>

          {/* Description */}
          <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
            <span style={{ fontSize: 13, color: "#475569" }}>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} style={textAreaStyle} />
          </label>

          {/* People multi-select */}
          <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
            <span style={{ fontSize: 13, color: "#475569" }}>Assign people to this reminder</span>
            <select
              multiple
              value={selectedPersonKeys.map(String)}
              onChange={handlePeopleChange}
              style={{ ...inputStyle, minHeight: 120 }}
            >
              {allPeople.map((p) => (
                <option key={p.perkey} value={p.perkey}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: "#64748b" }}>Tip: hold Cmd/Ctrl to select multiple.</span>
          </label>

          {/* Completed */}
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="completed" checked={form.completed} onChange={handleChange} />
            <span style={{ fontSize: 13, color: "#475569" }}>Completed</span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button type="submit" style={btn("#2563eb")}>Save</button>
          <button type="button" style={btnSecondary} onClick={() => navigate("/reminders")}>Cancel</button>
          {isEdit && <button type="button" style={btnDanger} onClick={handleDelete}>Delete</button>}
        </div>
      </form>
    </div>
   );
 }
