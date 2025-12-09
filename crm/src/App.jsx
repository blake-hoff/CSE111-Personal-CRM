
import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import PersonsList from "./pages/PersonsList";
import PersonForm from "./pages/PersonForm";
import PersonDetail from "./pages/PersonDetail";

import NotesList from "./pages/NotesList";
import NoteForm from "./pages/NoteForm";

import RemindersList from "./pages/RemindersList";
import ReminderForm from "./pages/ReminderForm";

const SIDEBAR_WIDTH = 264;

function Sidebar() {
  const linkBase = {
    display: "block",
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid rgba(51,65,85,0.6)",
    background: "rgba(51,65,85,0.6)", // boxed look
    color: "#E5E7EB",
    textDecoration: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
    transition: "background 160ms ease, color 160ms ease, border-color 160ms ease",
  };

  const activeStyles = {
    background: "#2563EB",
    borderColor: "#1D4ED8",
    color: "#fff",
    boxShadow: "0 0 0 2px rgba(37,99,235,0.3)",
  };

  return (
    <aside
      aria-label="Primary"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: SIDEBAR_WIDTH,
        background: "linear-gradient(to bottom, #000000, #0b1220)", // keep sidebar dark/black
        borderRight: "1px solid #334155",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "20px 16px 14px 16px",
          borderBottom: "1px solid rgba(51,65,85,0.6)",
          color: "#E5E7EB",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>People &amp; Notes</h1>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>Navigation</div>
      </div>

      {/* Links centered vertically */}
      <ul
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
          padding: "0 16px",
          listStyle: "none",
          margin: 0,
        }}
      >
        <li>
          <NavLink
            to="/"
            style={({ isActive }) => ({ ...linkBase, ...(isActive ? activeStyles : {}) })}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/persons"
            style={({ isActive }) => ({ ...linkBase, ...(isActive ? activeStyles : {}) })}
          >
            Persons
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/reminders"
            style={({ isActive }) => ({ ...linkBase, ...(isActive ? activeStyles : {}) })}
          >
            Reminders
          </NavLink>
        </li>
      </ul>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(51,65,85,0.6)",
          padding: "10px 16px",
          fontSize: 12,
          color: "#94A3B8",
        }}
      >
        © {new Date().getFullYear()} Jason Chen, Blake Hoff, &amp; Michael Wang (CSE111)
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Keep a dark backdrop behind the sidebar; content area will be white */}
      <div style={{ minHeight: "100vh", background: "#0b1220" }}>
        <Sidebar />

        {/* Main content pushed to the right & on white background */}
        <main
          style={{
            marginLeft: SIDEBAR_WIDTH,
            padding: 24,
            background: "#ffffff",   // ← white page background
            color: "#0f172a",        // dark slate text for contrast
            minHeight: "100vh",
          }}
        >
          <Routes>
            <Route path="/" element={<div>Welcome — choose a page</div>} />

            {/* Persons */}
            <Route path="/persons" element={<PersonsList />} />
            <Route path="/persons/new" element={<PersonForm />} />
            <Route path="/persons/:id" element={<PersonForm />} />
            <Route path="/persons/:perkey/view" element={<PersonDetail />} />

            {/* Reminders */}
            <Route path="/reminders" element={<RemindersList />} />
            <Route path="/reminders/new" element={<ReminderForm />} />
            <Route path="/reminders/:id" element={<ReminderForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
