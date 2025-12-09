
// src/pages/PersonDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "/api"; // base path from Flask

// Reusable inline button styles (same vibe as your lists)
const btn = (bg = "#2563eb") => ({
  background: bg,
  color: "#fff",
  borderRadius: 8,
  padding: "8px 12px",
  border: 0,
  cursor: "pointer",
});
const btnSm = (bg = "#2563eb") => ({
  ...btn(bg),
  padding: "6px 10px",
});
const btnSecondary = {
  background: "#e5e7eb", // gray-200
  color: "#111827",      // gray-900
  borderRadius: 8,
  padding: "8px 12px",
  border: "1px solid #cbd5e1",
  cursor: "pointer",
};

export default function PersonDetail() {
  const { perkey } = useParams();

  // Data
  const [person, setPerson] = useState(null);
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [relationships, setRelationships] = useState([]);

  // Reference data
  const [allPeople, setAllPeople] = useState([]);
  const [relTypes, setRelTypes] = useState([]);

  // UI state
  const [editMode, setEditMode] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);

  // Forms
  const [noteForm, setNoteForm] = useState({ title: "", content: "", personKeys: [Number(perkey)] });
  const [reminderForm, setReminderForm] = useState({ label: "", due_date: "", description: "", personKeys: [Number(perkey)] });
  const [relationshipForm, setRelationshipForm] = useState({ otherPerkey: "", relTypeKey: "" });

  useEffect(() => {
    loadPerson();
    loadNotes();
    loadReminders();
    loadRelationships();
    // Reference lists
    fetch(`${API}/persons`).then(r => r.json()).then(setAllPeople);           // persons list [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    fetch(`${API}/relationship_types`).then(r => r.json()).then(setRelTypes); // rel types list (added endpoint) [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
  }, [perkey]);

  // Loads
  const loadPerson = () => fetch(`${API}/persons/${perkey}`).then(r => r.json()).then(setPerson);             // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
  const loadNotes = () => fetch(`${API}/persons/${perkey}/notes`).then(r => r.json()).then(setNotes);          // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
  const loadReminders = () => fetch(`${API}/persons/${perkey}/reminders`).then(r => r.json()).then(setReminders); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
  const loadRelationships = () => fetch(`${API}/persons/${perkey}/relationships`).then(r => r.json()).then(setRelationships); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)

  // Person save
  const savePerson = async () => {
    await fetch(`${API}/persons/${perkey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    }); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    setEditMode(false);
    loadPerson();
  };

  // Create Note (multi-people)
  const createNote = async () => {
    await fetch(`${API}/persons/${perkey}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteForm),
    }); // supports personKeys [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    setShowNoteForm(false);
    setNoteForm({ title: "", content: "", personKeys: [Number(perkey)] });
    loadNotes();
  };

  // Update/Delete Note
  const editNote = async (note) => {
    await fetch(`${API}/persons/${perkey}/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: note.title, content: note.content }),
    }); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    loadNotes();
  };
  const deleteNote = async (note) => {
    if (!window.confirm("Delete this note?")) return;
    await fetch(`${API}/persons/${perkey}/notes/${note.id}`, { method: "DELETE" }); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    loadNotes();
  };

  // Create Reminder (multi-people)
  const createReminder = async () => {
    await fetch(`${API}/persons/${perkey}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminderForm),
    }); // supports personKeys [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    setShowReminderForm(false);
    setReminderForm({ label: "", due_date: "", description: "", personKeys: [Number(perkey)] });
    loadReminders();
  };

  const editReminder = async (rem) => {
    await fetch(`${API}/persons/${perkey}/reminders/${rem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: rem.label, description: rem.description, due_date: rem.due_date }),
    }); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    loadReminders();
  };
  const toggleComplete = async (rem) => {
    await fetch(`${API}/persons/${perkey}/reminders/${rem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !rem.completed }),
    }); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    loadReminders();
  };
  const deleteReminder = async (rem) => {
    if (!window.confirm("Delete this reminder?")) return;
    await fetch(`${API}/persons/${perkey}/reminders/${rem.id}`, { method: "DELETE" }); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    loadReminders();
  };

  // Create Relationship
  const createRelationship = async () => {
    if (!relationshipForm.otherPerkey || !relationshipForm.relTypeKey) return;
    await fetch(`${API}/persons/${perkey}/relationships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perkey2: Number(relationshipForm.otherPerkey), relTypeKey: Number(relationshipForm.relTypeKey) }),
    }); // perkey2 + relTypeKey contract [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    setShowRelationshipForm(false);
    setRelationshipForm({ otherPerkey: "", relTypeKey: "" });
    loadRelationships();
  };
  const editRelationship = async (rel) => {
    await fetch(`${API}/persons/${perkey}/relationships/${rel.withPerson.perkey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relTypeKey: rel.relTypeKey }),
    }); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    loadRelationships();
  };
  const deleteRelationship = async (rel) => {
    if (!window.confirm("Delete this relationship?")) return;
    await fetch(`${API}/persons/${perkey}/relationships/${rel.withPerson.perkey}`, { method: "DELETE" }); // [1](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/PersonDetail.jsx)
    loadRelationships();
  };

  if (!person) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* PERSON INFO */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
        <h2 className="text-2xl font-bold mb-4">Personal Info</h2>
        {editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">First name</span>
              <input
                name="firstName"
                value={person.firstName || ""}
                onChange={(e) => setPerson({ ...person, firstName: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Last name</span>
              <input
                name="lastName"
                value={person.lastName || ""}
                onChange={(e) => setPerson({ ...person, lastName: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Birthday</span>
              <input
                name="birthday"
                value={person.birthday || ""}
                onChange={(e) => setPerson({ ...person, birthday: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Location</span>
              <input
                name="location"
                value={person.location || ""}
                onChange={(e) => setPerson({ ...person, location: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </label>

            <div className="col-span-full flex gap-2 mt-2">
              <button style={btn("#2563eb")} onClick={savePerson}>Save</button>
              <button style={btnSecondary} onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p><span className="text-slate-600">Name:</span> {person.firstName} {person.lastName}</p>
            <p><span className="text-slate-600">Birthday:</span> {person.birthday ?? "-"}</p>
            <p><span className="text-slate-600">Location:</span> {person.location ?? "-"}</p>
            <button style={btn("#f59e0b")} onClick={() => setEditMode(true)}>Edit</button> {/* amber */}
          </div>
        )}
      </section>

      {/* NOTES */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Notes</h2>
          <button style={btn("#2563eb")} onClick={() => setShowNoteForm(v => !v)}>
            {showNoteForm ? "Close" : "+ New Note"}
          </button>
        </div>

        {showNoteForm && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Title</span>
              <input
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </label>

            <label className="md:col-span-2 flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Content</span>
              <textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                rows={4}
                className="border rounded px-2 py-2"
              />
            </label>

            <label className="md:col-span-2 flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Add people to this note</span>
              <select
                multiple
                value={noteForm.personKeys.map(String)}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                  setNoteForm({ ...noteForm, personKeys: opts });
                }}
                className="border rounded px-2 py-2 h-28"
              >
                {allPeople.map(p => (
                  <option key={p.perkey} value={p.perkey}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
              <span className="text-xs text-slate-500 mt-1">Tip: hold Cmd/Ctrl to select multiple.</span>
            </label>

            <div className="md:col-span-2 flex gap-2">
              <button style={btn("#2563eb")} onClick={createNote}>Save Note</button>
              <button
                style={btnSecondary}
                onClick={() => {
                  setShowNoteForm(false);
                  setNoteForm({ title: "", content: "", personKeys: [Number(perkey)] });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {notes.map(n => (
            <li key={n.id} className="border border-slate-200 rounded p-3 flex justify-between bg-slate-50">
              <div>
                <div className="font-medium">{n.title}</div>
                {n.content ? <div className="text-sm text-slate-600 mt-1">{n.content}</div> : null}
              </div>
              <div className="flex gap-2">
                <button style={btnSm("#2563eb")} onClick={() => editNote(n)}>Edit</button>
                <button style={btnSm("#dc2626")} onClick={() => deleteNote(n)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* REMINDERS */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Reminders</h2>
          <button style={btn("#2563eb")} onClick={() => setShowReminderForm(v => !v)}>
            {showReminderForm ? "Close" : "+ New Reminder"}
          </button>
        </div>

        {showReminderForm && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Label</span>
              <input
                value={reminderForm.label}
                onChange={(e) => setReminderForm({ ...reminderForm, label: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Due date/time (optional)</span>
              <input
                type="datetime-local"
                value={reminderForm.due_date}
                onChange={(e) => setReminderForm({ ...reminderForm, due_date: e.target.value })}
                className="border rounded px-2 py-1"
              />
            </label>

            <label className="md:col-span-2 flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Add people to this reminder</span>
              <select
                multiple
                value={reminderForm.personKeys.map(String)}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                  setReminderForm({ ...reminderForm, personKeys: opts });
                }}
                className="border rounded px-2 py-2 h-28"
              >
                {allPeople.map(p => (
                  <option key={p.perkey} value={p.perkey}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2 flex gap-2">
              <button style={btn("#2563eb")} onClick={createReminder}>Save Reminder</button>
              <button
                style={btnSecondary}
                onClick={() => {
                  setShowReminderForm(false);
                  setReminderForm({ label: "", due_date: "", description: "", personKeys: [Number(perkey)] });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {reminders.map(r => (
            <li key={r.id} className="border border-slate-200 rounded p-3 flex justify-between bg-slate-50">
              <span>
                <span className="font-medium">{r.label}</span>{" "}
                <span className="text-slate-500">— {r.completed ? "✔ Done" : "⏳ Pending"}</span>
              </span>
              <div className="flex gap-2">
                <button style={btnSm(r.completed ? "#60a5fa" : "#2563eb")} onClick={() => toggleComplete(r)}>
                  {r.completed ? "Mark Pending" : "Mark Complete"}
                </button>
                <button style={btnSm("#f59e0b")} onClick={() => editReminder(r)}>Edit</button>
                <button style={btnSm("#dc2626")} onClick={() => deleteReminder(r)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* RELATIONSHIPS */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Relationships</h2>
          <button style={btn("#2563eb")} onClick={() => setShowRelationshipForm(v => !v)}>
            {showRelationshipForm ? "Close" : "+ New Relationship"}
          </button>
        </div>

        {showRelationshipForm && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Other person</span>
              <select
                value={relationshipForm.otherPerkey}
                onChange={(e) => setRelationshipForm({ ...relationshipForm, otherPerkey: e.target.value })}
                className="border rounded px-2 py-2"
              >
                <option value="">Select person…</option>
                {allPeople
                  .filter((p) => String(p.perkey) !== String(perkey))
                  .map((p) => (
                    <option key={p.perkey} value={p.perkey}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Relationship type</span>
              <select
                value={relationshipForm.relTypeKey}
                onChange={(e) => setRelationshipForm({ ...relationshipForm, relTypeKey: e.target.value })}
                className="border rounded px-2 py-2"
              >
                <option value="">Select type…</option>
                {relTypes.map((t) => (
                  <option key={t.relTypeKey} value={t.relTypeKey}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2 flex gap-2">
              <button style={btn("#2563eb")} onClick={createRelationship}>Save Relationship</button>
              <button style={btnSecondary} onClick={() => setShowRelationshipForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {relationships.map((r, idx) => (
            <li
              key={`${r.withPerson.perkey}-${r.relTypeKey}-${idx}`}
              className="border border-slate-200 rounded p-3 flex justify-between bg-slate-50"
            >
              <span>{r.withPerson.firstName} {r.withPerson.lastName} — Type: {r.type}</span>
              <div className="flex gap-2">
                <button style={btnSm("#f59e0b")} onClick={() => editRelationship(r)}>Edit</button>
                <button style={btnSm("#dc2626")} onClick={() => deleteRelationship(r)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
