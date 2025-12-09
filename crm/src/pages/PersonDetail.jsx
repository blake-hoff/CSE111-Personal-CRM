
// src/pages/PersonDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "/api"; // base path from Flask

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
    fetch(`${API}/persons`).then(r => r.json()).then(setAllPeople);                // persons list [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    fetch(`${API}/relationship_types`).then(r => r.json()).then(setRelTypes);      // rel types list (added endpoint)
  }, [perkey]);

  // Loads
  const loadPerson = () => fetch(`${API}/persons/${perkey}`).then(r => r.json()).then(setPerson);             // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
  const loadNotes = () => fetch(`${API}/persons/${perkey}/notes`).then(r => r.json()).then(setNotes);          // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
  const loadReminders = () => fetch(`${API}/persons/${perkey}/reminders`).then(r => r.json()).then(setReminders); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
  const loadRelationships = () => fetch(`${API}/persons/${perkey}/relationships`).then(r => r.json()).then(setRelationships); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)

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

  // Create Note (multi-people)
  const createNote = async () => {
    await fetch(`${API}/persons/${perkey}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteForm),
    }); // personKeys supported by backend change [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    setShowNoteForm(false);
    setNoteForm({ title: "", content: "", personKeys: [Number(perkey)] });
    loadNotes();
  };

  // Update/Delete Note (person-scoped)
  const editNote = async (note) => {
    await fetch(`${API}/persons/${perkey}/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: note.title, content: note.content }),
    }); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    loadNotes();
  };
  const deleteNote = async (note) => {
    if (!window.confirm("Delete this note?")) return;
    await fetch(`${API}/persons/${perkey}/notes/${note.id}`, { method: "DELETE" }); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    loadNotes();
  };

  // Create Reminder (multi-people)
  const createReminder = async () => {
    await fetch(`${API}/persons/${perkey}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminderForm),
    }); // personKeys supported by backend change [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    setShowReminderForm(false);
    setReminderForm({ label: "", due_date: "", description: "", personKeys: [Number(perkey)] });
    loadReminders();
  };

  const editReminder = async (rem) => {
    await fetch(`${API}/persons/${perkey}/reminders/${rem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: rem.label, description: rem.description, due_date: rem.due_date }),
    }); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    loadReminders();
  };
  const toggleComplete = async (rem) => {
    await fetch(`${API}/persons/${perkey}/reminders/${rem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !rem.completed }),
    }); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    loadReminders();
  };
  const deleteReminder = async (rem) => {
    if (!window.confirm("Delete this reminder?")) return;
    await fetch(`${API}/persons/${perkey}/reminders/${rem.id}`, { method: "DELETE" }); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    loadReminders();
  };

  // Create Relationship
  const createRelationship = async () => {
    if (!relationshipForm.otherPerkey || !relationshipForm.relTypeKey) return;
    await fetch(`${API}/persons/${perkey}/relationships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perkey2: Number(relationshipForm.otherPerkey), relTypeKey: Number(relationshipForm.relTypeKey) }),
    }); // perkey2 + relTypeKey per backend contract [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    setShowRelationshipForm(false);
    setRelationshipForm({ otherPerkey: "", relTypeKey: "" });
    loadRelationships();
  };
  const editRelationship = async (rel) => {
    await fetch(`${API}/persons/${perkey}/relationships/${rel.withPerson.perkey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relTypeKey: rel.relTypeKey }),
    }); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
    loadRelationships();
  };
  const deleteRelationship = async (rel) => {
    if (!window.confirm("Delete this relationship?")) return;
    await fetch(`${API}/persons/${perkey}/relationships/${rel.withPerson.perkey}`, { method: "DELETE" }); // [2](https://merced-my.sharepoint.com/personal/bhoff_ucmerced_edu/Documents/Microsoft%20Copilot%20Chat%20Files/api.py)
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
              <input name="firstName" value={person.firstName || ""} onChange={(e) => setPerson({ ...person, firstName: e.target.value })} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Last name</span>
              <input name="lastName" value={person.lastName || ""} onChange={(e) => setPerson({ ...person, lastName: e.target.value })} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Birthday</span>
              <input name="birthday" value={person.birthday || ""} onChange={(e) => setPerson({ ...person, birthday: e.target.value })} className="border rounded px-2 py-1" />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Location</span>
              <input name="location" value={person.location || ""} onChange={(e) => setPerson({ ...person, location: e.target.value })} className="border rounded px-2 py-1" />
            </label>

            <div className="col-span-full flex gap-2 mt-2">
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded" onClick={savePerson}>Save</button>
              <button className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p><span className="text-slate-600">Name:</span> {person.firstName} {person.lastName}</p>
            <p><span className="text-slate-600">Birthday:</span> {person.birthday ?? "-"}</p>
            <p><span className="text-slate-600">Location:</span> {person.location ?? "-"}</p>
            <button className="bg-yellow-500 text-white px-3 py-1.5 rounded" onClick={() => setEditMode(true)}>Edit</button>
          </div>
        )}
      </section>

      {/* NOTES */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Notes</h2>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded" onClick={() => setShowNoteForm(v => !v)}>
            {showNoteForm ? "Close" : "+ New Note"}
          </button>
        </div>

        {showNoteForm && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Title</span>
              <input value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} className="border rounded px-2 py-1" />
            </label>

            <label className="md:col-span-2 flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Content</span>
              <textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} rows={4} className="border rounded px-2 py-2" />
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
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded" onClick={createNote}>Save Note</button>
              <button className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded" onClick={() => { setShowNoteForm(false); setNoteForm({ title: "", content: "", personKeys: [Number(perkey)] }); }}>Cancel</button>
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
                <button className="text-blue-600" onClick={() => editNote(n)}>Edit</button>
                <button className="text-red-600" onClick={() => deleteNote(n)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* REMINDERS */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Reminders</h2>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded" onClick={() => setShowReminderForm(v => !v)}>
            {showReminderForm ? "Close" : "+ New Reminder"}
          </button>
        </div>

        {showReminderForm && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Label</span>
              <input value={reminderForm.label} onChange={(e) => setReminderForm({ ...reminderForm, label: e.target.value })} className="border rounded px-2 py-1" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Due date/time (optional)</span>
              <input type="datetime-local" value={reminderForm.due_date} onChange={(e) => setReminderForm({ ...reminderForm, due_date: e.target.value })} className="border rounded px-2 py-1" />
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
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded" onClick={createReminder}>Save Reminder</button>
              <button className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded" onClick={() => { setShowReminderForm(false); setReminderForm({ label: "", due_date: "", description: "", personKeys: [Number(perkey)] }); }}>Cancel</button>
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
                <button className="text-slate-700" onClick={() => toggleComplete(r)}>{r.completed ? "Mark Pending" : "Mark Complete"}</button>
                <button className="text-blue-600" onClick={() => editReminder(r)}>Edit</button>
                <button className="text-red-600" onClick={() => deleteReminder(r)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* RELATIONSHIPS */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Relationships</h2>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded" onClick={() => setShowRelationshipForm(v => !v)}>
            {showRelationshipForm ? "Close" : "+ New Relationship"}
          </button>
        </div>

        {showRelationshipForm && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Other person</span>
              <select value={relationshipForm.otherPerkey} onChange={(e) => setRelationshipForm({ ...relationshipForm, otherPerkey: e.target.value })} className="border rounded px-2 py-2">
                <option value="">Select person…</option>
                {allPeople.filter(p => String(p.perkey) !== String(perkey)).map(p => (
                  <option key={p.perkey} value={p.perkey}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-slate-600 mb-1">Relationship type</span>
              <select value={relationshipForm.relTypeKey} onChange={(e) => setRelationshipForm({ ...relationshipForm, relTypeKey: e.target.value })} className="border rounded px-2 py-2">
                <option value="">Select type…</option>
                {relTypes.map(t => (
                  <option key={t.relTypeKey} value={t.relTypeKey}>{t.name}</option>
                ))}
              </select>
            </label>

            <div className="md:col-span-2 flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded" onClick={createRelationship}>Save Relationship</button>
              <button className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded" onClick={() => setShowRelationshipForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {relationships.map((r, idx) => (
            <li key={`${r.withPerson.perkey}-${r.relTypeKey}-${idx}`} className="border border-slate-200 rounded p-3 flex justify-between bg-slate-50">
              <span>{r.withPerson.firstName} {r.withPerson.lastName} — Type: {r.type}</span>
              <div className="flex gap-2">
                <button className="text-blue-600" onClick={() => editRelationship(r)}>Edit</button>
                <button className="text-red-600" onClick={() => deleteRelationship(r)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
