
import React, { useEffect, useState } from "react";
import { Persons } from "../api";
import { Link } from "react-router-dom";

export default function PersonsList() {
  const [items, setItems] = useState([]);

  useEffect(() => { loadPersons(); }, []);
  function loadPersons() {
    Persons.list().then(setItems).catch(console.error);
  }

  function deletePerson(id) {
    if (!window.confirm("Delete this person?")) return;
    Persons.del(id).then(loadPersons).catch(console.error);
  }

  // --- Styles: grid + card (inline, Tailwind-independent) ---
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
  };
  const listStyle = { listStyle: "none", padding: 0, margin: 0 };
  const cardStyle = {
    background: "#e0f2fe",           // light blue (Tailwind sky-100)
    border: "1px solid #bae6fd",     // sky-200
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    padding: "12px 16px",
    color: "#0f172a",                // dark slate text for contrast
    textDecoration: "none",
    display: "block",
  };
  const delBtnStyle = {
    position: "absolute",
    top: 8,
    right: 8,
    color: "#b91c1c",                // red-700
    background: "transparent",
    border: 0,
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Persons</h1>
        <Link
          to="/persons/new"
          style={{
            background: "#2563eb", color: "#fff", borderRadius: 8,
            padding: "8px 12px", textDecoration: "none",
          }}
        >
          + Create Person
        </Link>
      </div>

      {/* Card grid */}
      <ul style={{ ...listStyle, ...gridStyle }}>
        {items.map((p) => (
          <li key={p.perkey} style={{ position: "relative" }}>
            {/* Delete (optional) */}
            <button
              onClick={() => deletePerson(p.perkey)}
              title="Delete person"
              style={delBtnStyle}
            >
              ✖
            </button>

            <Link to={`/persons/${p.perkey}/view`} style={cardStyle}>
              <div style={{ fontWeight: 600 }}>
                {p.firstName} {p.lastName}
              </div>
              {p.location ? (
                <div style={{ fontSize: 14, color: "#334155", marginTop: 4 /* slate-700 */ }}>
                  {p.location}
                </div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
