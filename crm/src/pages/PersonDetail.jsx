
// src/pages/PersonDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "/api"; // Flask base

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
  background: "#e5e7eb",
  color: "#111827",
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

  // Creation forms
  const [noteForm, setNoteForm] = useState({ title: "", content: "", personKeys: [Number(perkey)] });
  const [reminderForm, setReminderForm] = useState({ label: "", due_date: "", description: "", personKeys: [Number(perkey)] });
  const [relationshipForm, setRelationshipForm] = useState({ otherPerkey: "", relTypeKey: "" });

  // 🔸 Inline edit forms (per item)
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteForm, setEditingNoteForm] = useState({ title: "", content: "" });

  const [editingReminderId, setEditingReminderId] = useState(null);
  const [editingReminderForm, setEditingReminderForm] = useState({ label: "", description: "", due_date: "" });

  const [editingRelationshipId, setEditingRelationshipId] = useState(null); // other person's perkey
  const [editingRelationshipForm, setEditingRelationshipForm] = useState({ relTypeKey: "" });

  useEffect(() => {
    loadPerson();
    loadNotes();
    loadReminders();
    loadRelationships();

    // Reference lists
    fetch(`${API}/persons`).then(r => r.json()).then(setAllPeople);
    fetch(`${API}/relationship_types`).then(r => r.json()).then(setRelTypes);
  }, [perkey]);

  // Loads
  const loadPerson = () => fetch(`${API}/persons/${perkey}`).then(r => r.json()).then(setPerson);
  const loadNotes = () => fetch(`${API}/persons/${perkey}/notes`).then(r => r.json()).then(setNotes);
  const loadReminders = () => fetch(`${API}/persons/${perkey}/reminders`).then(r => r.json()).then(setReminders);
  const loadRelationships = () => fetch(`${API}/persons/${perkey}/relationships`).then(r => r.json()).then(setRelationships);

  // Person save
  const savePerson = async () => {
    await fetch(`${API}/persons/${perkey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    });
    setEditMode(false);
    loadPerson();
  };

  // --- Create Note (multi-people)
  const createNote = async () => {
    await fetch(`${API}/persons/${perkey}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteForm),
    });
    setShowNoteForm(false);
    setNoteForm({ title: "", content: "", personKeys: [Number(perkey)] });
    loadNotes();
  };

  // --- Note inline edit ---
  const startEditNote = (n) => {
    setEditingNoteId(n.id);
    setEditingNoteForm({ title: n.title || "", content: n.content || "" });
  };
  const saveEditNote = async () => {
    await fetch(`${API}/persons/${perkey}/notes/${editingNoteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingNoteForm),
    });
    setEditingNoteId(null);
    setEditingNoteForm({ title: "", content: "" });
    loadNotes();
  };
  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteForm({ title: "", content: "" });
  };
  const deleteNote = async (note) => {
    if (!window.confirm("Delete this note?")) return;
    await fetch(`${API}/persons/${perkey}/notes/${note.id}`, { method: "DELETE" });
    loadNotes();
  };

  // --- Create Reminder (multi-people)
  const createReminder = async () => {
    await fetch(`${API}/persons/${perkey}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminderForm),
    });
    setShowReminderForm(false);
    setReminderForm({ label: "", due_date: "", description: "", personKeys: [Number(perkey)] });
    loadReminders();
  };

  // --- Reminder inline edit ---
  const startEditReminder = (r) => {
    setEditingReminderId(r.id);
    setEditingReminderForm({
      label: r.label || "",
      description: r.description || "",
      due_date: r.due_date || "",
    });
  };
  const saveEditReminder = async () => {
    await fetch(`${API}/persons/${perkey}/reminders/${editingReminderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingReminderForm),
    });
    setEditingReminderId(null);
    setEditingReminderForm({ label: "", description: "", due_date: "" });
    loadReminders();
  };
  const cancelEditReminder = () => {
    setEditingReminderId(null);
    setEditingReminderForm({ label: "", description: "", due_date: "" });
  };
  const toggleComplete = async (rem) => {
    await fetch(`${API}/persons/${perkey}/reminders/${rem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !rem.completed }),
    });
    loadReminders();
  };
  const deleteReminder = async (rem) => {
    if (!window.confirm("Delete this reminder?")) return;
    await fetch(`${API}/persons/${perkey}/reminders/${rem.id}`, { method: "DELETE" });
    loadReminders();
  };

  // --- Relationship create & inline edit (type only) ---
  const createRelationship = async () => {
    if (!relationshipForm.otherPerkey || !relationshipForm.relTypeKey) return;
    await fetch(`${API}/persons/${perkey}/relationships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        perkey2: Number(relationshipForm.otherPerkey),
        relTypeKey: Number(relationshipForm.relTypeKey),
      }),
    });
    setShowRelationshipForm(false);
    setRelationshipForm({ otherPerkey: "", relTypeKey: "" });
    loadRelationships();
  };

  const startEditRelationship = (r) => {
    setEditingRelationshipId(r.withPerson.perkey);
    // Ensure we store the numeric key (as string to bind to <select>)
    setEditingRelationshipForm({
      relTypeKey: String(r.relTypeKey ?? ""),
    });
  };
  const saveEditRelationship = async () => {
    if (!editingRelationshipId || !editingRelationshipForm.relTypeKey) return;
    await fetch(`${API}/persons/${perkey}/relationships/${editingRelationshipId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relTypeKey: Number(editingRelationshipForm.relTypeKey) }),
    });
    setEditingRelationshipId(null);
    setEditingRelationshipForm({ relTypeKey: "" });
    loadRelationships();
  };
  const cancelEditRelationship = () => {
    setEditingRelationshipId(null);
    setEditingRelationshipForm({ relTypeKey: "" });
  };
  const deleteRelationship = async (rel) => {
    if (!window.confirm("Delete this relationship?")) return;
    await fetch(`${API}/persons/${perkey}/relationships/${rel.withPerson.perkey}`, { method: "DELETE" });
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
              <button style={btnSecondary} onClick={() => { setShowNoteForm(false); setNoteForm({ title: "", content: "", personKeys: [Number(perkey)] }); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {notes.map(n => (
            <li key={n.id} className="border border-slate-200 rounded p-3 bg-slate-50">
              {editingNoteId === n.id ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-600 mb-1">Title</span>
                    <input
                      value={editingNoteForm.title}
                      onChange={(e) => setEditingNoteForm({ ...editingNoteForm, title: e.target.value })}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                  <label className="md:col-span-2 flex flex-col">
                    <span className="text-sm text-slate-600 mb-1">Content</span>
                    <textarea
                      value={editingNoteForm.content}
                      onChange={(e) => setEditingNoteForm({ ...editingNoteForm, content: e.target.value })}
                      rows={4}
                      className="border rounded px-2 py-2"
                    />
                  </label>
                  <div className="md:col-span-2 flex gap-2">
                    <button style={btnSm("#2563eb")} onClick={saveEditNote}>Save</button>
                    <button style={btnSm("#e5e7eb")} onClick={cancelEditNote}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{n.title}</div>
                    {n.content ? <div className="text-sm text-slate-600 mt-1">{n.content}</div> : null}
                  </div>
                  <div className="flex gap-2">
                    <button style={btnSm("#f59e0b")} onClick={() => startEditNote(n)}>Edit</button>
                    <button style={btnSm("#dc2626")} onClick={() => deleteNote(n)}>Delete</button>
                  </div>
                </div>
              )}
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
              <button style={btnSecondary} onClick={() => { setShowReminderForm(false); setReminderForm({ label: "", due_date: "", description: "", personKeys: [Number(perkey)] }); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {reminders.map(r => (
            <li key={r.id} className="border border-slate-200 rounded p-3 bg-slate-50">
              {editingReminderId === r.id ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-600 mb-1">Label</span>
                    <input
                      value={editingReminderForm.label}
                      onChange={(e) => setEditingReminderForm({ ...editingReminderForm, label: e.target.value })}
                      className="border rounded px-2 py-1"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm text-slate-600 mb-1">Due date/time (optional)</span>
                    <input
                      type="datetime-local"
                      value={editingReminderForm.due_date}
                      onChange={(e) => setEditingReminderForm({ ...editingReminderForm, due_date: e.target.value })}
                      className="border rounded px-2 py-1"
                    />
                  </label>

                  <label className="md:col-span-2 flex flex-col">
                    <span className="text-sm text-slate-600 mb-1">Description</span>
                    <textarea
                      value={editingReminderForm.description}
                      onChange={(e) => setEditingReminderForm({ ...editingReminderForm, description: e.target.value })}
                      rows={3}
                      className="border rounded px-2 py-2"
                    />
                  </label>

                  <div className="md:col-span-2 flex gap-2">
                    <button style={btnSm("#2563eb")} onClick={saveEditReminder}>Save</button>
                    <button style={btnSm("#e5e7eb")} onClick={cancelEditReminder}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {r.label}{" "}
                      <span className="text-slate-500">— {r.completed ? "✔ Done" : "⏳ Pending"}</span>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      <strong>Due:</strong> {r.due_date || "No date"}
                      {r.description ? <div className="mt-1">{r.description}</div> : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button style={btnSm(r.completed ? "#60a5fa" : "#2563eb")} onClick={() => toggleComplete(r)}>
                      {r.completed ? "Mark Pending" : "Mark Complete"}
                    </button>
                    <button style={btnSm("#f59e0b")} onClick={() => startEditReminder(r)}>Edit</button>
                    <button style={btnSm("#dc2626")} onClick={() => deleteReminder(r)}>Delete</button>
                  </div>
                </div>
              )}
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
                {allPeople.filter(p => String(p.perkey) !== String(perkey)).map(p => (
                  <option key={p.perkey} value={p.perkey}>{p.firstName} {p.lastName}</option>
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
                {relTypes.map(t => (
                  <option key={t.relTypeKey} value={t.relTypeKey}>{t.name}</option>
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
            <li key={`${r.withPerson.perkey}-${r.relTypeKey}-${idx}`} className="border border-slate-200 rounded p-3 bg-slate-50">
              {editingRelationshipId === r.withPerson.perkey ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-600 mb-1">Relationship type</span>
                    <select
                      value={editingRelationshipForm.relTypeKey}
                      onChange={(e) => setEditingRelationshipForm({ relTypeKey: e.target.value })}
                      className="border rounded px-2 py-2"
                    >
                      <option value="">Select type…</option>
                      {relTypes.map(t => (
                        <option key={t.relTypeKey} value={t.relTypeKey}>{t.name}</option>
                      ))}
                    </select>
                  </label>
                  <div className="md:col-span-2 flex gap-2">
                    <button style={btnSm("#2563eb")} onClick={saveEditRelationship}>Save</button>
                    <button style={btnSm("#e5e7eb")} onClick={cancelEditRelationship}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <span>{r.withPerson.firstName} {r.withPerson.lastName} — Type: {r.type}</span>
                  <div className="flex gap-2">
                    <button style={btnSm("#f59e0b")} onClick={() => startEditRelationship(r)}>Edit</button>
                    <button style={btnSm("#dc2626")} onClick={() => deleteRelationship(r)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
