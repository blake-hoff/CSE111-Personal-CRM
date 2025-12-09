
// components/Nav.jsx
import { NavLink } from "react-router-dom";

export default function Nav() {
  const base =
    "block rounded-lg px-4 py-3 font-medium transition-colors border border-slate-700/60 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
  const inactive =
    "bg-slate-800/60 text-slate-200 hover:bg-slate-700 hover:text-white";
  const active =
    "bg-blue-600 text-white border-blue-500 shadow-blue-500/30";

  return (
    <aside
      role="navigation"
      aria-label="Primary"
      className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 border-r border-slate-700 shadow-2xl"
    >
      <div className="h-full flex flex-col">
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b border-slate-700/60">
          <h1 className="text-2xl font-bold tracking-tight">People &amp; Notes</h1>
          <p className="text-sm text-slate-400">Navigation</p>
        </div>

        {/* Links centered vertically */}
        <ul className="flex-1 flex flex-col justify-center gap-3 px-4">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/persons"
              className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
              Persons
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/notes"
              className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
              Notes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reminders"
              className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
            >
              Reminders
            </NavLink>
          </li>
        </ul>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700/60 text-xs text-slate-400">
          © {new Date().getFullYear()} People &amp; Notes
        </div>
      </div>
    </aside>
  );
}
