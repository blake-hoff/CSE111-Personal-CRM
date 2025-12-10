
// src/pages/PersonForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Persons } from "../api";

// Button styles to match lists
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

export default function PersonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", birthday: "", location: "" });

  // Load existing person for editing
  useEffect(() => {
    if (id) {
      Persons.get(id)
        .then((data) => setForm(data))
        .catch(console.error);
    }
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (id) await Persons.update(id, form);
      else await Persons.create(form);
      navigate("/persons");
    } catch (err) {
      alert(err);
    }
  };

  // Simple input style
  const inputStyle = {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "8px 10px",
    width: "100%",
  };
  const labelStyle = { display: "flex", flexDirection: "column", gap: 6 };
  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    padding: 16,
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        {id ? "Edit" : "Create"} Person
      </h1>

      <form onSubmit={submit} style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={labelStyle}>
            <span style={{ fontSize: 13, color: "#475569" }}>First Name</span>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              style={inputStyle}
              required
            />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 13, color: "#475569" }}>Last Name</span>
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              style={inputStyle}
              required
            />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 13, color: "#475569" }}>Birthday</span>
            <input
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 13, color: "#475569" }}>Location</span>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button type="submit" style={btn("#2563eb")}>Save</button>
          <button type="button" style={btnSecondary} onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}