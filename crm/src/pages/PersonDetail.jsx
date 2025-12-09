import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function PersonDetail() {
    const { perkey } = useParams();
    const [person, setPerson] = useState(null);
    const [notes, setNotes] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [relationships, setRelationships] = useState([]);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        loadPerson();
        loadNotes();
        loadReminders();
        loadRelationships();
    }, [perkey]);

    const loadPerson = () =>
        api.Persons.get(perkey).then(setPerson).catch(console.error);

    const loadNotes = () =>
        api.Persons.listNotes(perkey).then(setNotes).catch(console.error);

    const loadReminders = () =>
        api.Persons.listReminders(perkey).then(setReminders).catch(console.error);

    const loadRelationships = () =>
        api.Persons.listRelationships(perkey).then(setRelationships).catch(console.error);

    // ------------------ PERSON INFO ------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPerson({ ...person, [name]: value });
    };

    const savePerson = () => {
        api.Persons.update(perkey, person).then(loadPerson);
        setEditMode(false);
    };

    // ------------------ NOTES ------------------
    const addNote = () => {
        const title = prompt("Note title");
        if (!title) return;
        api.Persons.createNote(perkey, { title, content: "" }).then(loadNotes);
    };

    const editNote = (note) => {
        const title = prompt("Update title", note.title);
        const content = prompt("Update content", note.content);
        if (!title) return;
        api.Persons.updateNote(perkey, note.id, { title, content }).then(loadNotes);
    };

    const deleteNote = (note) => {
        if (confirm("Delete this note?")) {
            api.Persons.deleteNote(perkey, note.id).then(loadNotes);
        }
    };

    // ------------------ REMINDERS ------------------
    const addReminder = () => {
        const label = prompt("Reminder label");
        if (!label) return;
        api.Persons.createReminder(perkey, { label, completed: false }).then(loadReminders);
    };

    const editReminder = (rem) => {
        const label = prompt("Update label", rem.label);
        if (!label) return;
        api.Persons.updateReminder(perkey, rem.id, { label }).then(loadReminders);
    };

    const toggleComplete = (rem) => {
        api.Persons.updateReminder(perkey, rem.id, { completed: !rem.completed }).then(loadReminders);
    };

    const deleteReminder = (rem) => {
        if (confirm("Delete this reminder?")) {
            api.Persons.deleteReminder(perkey, rem.id).then(loadReminders);
        }
    };

    // ------------------ RELATIONSHIPS ------------------
    const addRelationship = () => {
        const otherKey = parseInt(prompt("Other person's key"));
        const relType = parseInt(prompt("Relationship type key"));
        if (!otherKey || !relType) return;
        api.Persons.createRelationship(perkey, otherKey, { relTypeKey: relType }).then(loadRelationships);
    };

    const editRelationship = (rel) => {
        const relType = parseInt(prompt("Update relationship type key", rel.relTypeKey));
        if (!relType) return;
        api.Persons.updateRelationship(perkey, rel.other_perkey, { relTypeKey: relType }).then(loadRelationships);
    };

    const deleteRelationship = (rel) => {
        if (confirm("Delete this relationship?")) {
            api.Persons.deleteRelationship(perkey, rel.other_perkey).then(loadRelationships);
        }
    };

    if (!person) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">

            {/* -------- PERSON INFO -------- */}
            <div className="border p-4 rounded">
                <h2 className="text-2xl font-bold mb-2">Personal Info</h2>
                {editMode ? (
                    <div className="space-y-2">
                        <input name="firstName" value={person.firstName} onChange={handleChange} className="border p-1" />
                        <input name="lastName" value={person.lastName} onChange={handleChange} className="border p-1" />
                        <input name="birthday" value={person.birthday || ""} onChange={handleChange} className="border p-1" />
                        <input name="location" value={person.location || ""} onChange={handleChange} className="border p-1" />
                        <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={savePerson}>Save</button>
                    </div>
                ) : (
                    <div>
                        <p>Name: {person.firstName} {person.lastName}</p>
                        <p>Birthday: {person.birthday || "-"}</p>
                        <p>Location: {person.location || "-"}</p>
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => setEditMode(true)}>Edit</button>
                    </div>
                )}
            </div>

            {/* -------- NOTES -------- */}
            <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-2">Notes</h2>
                <button className="bg-green-600 text-white px-2 py-1 rounded mb-2" onClick={addNote}>+ Add Note</button>
                <ul className="space-y-2">
                    {notes.map((n) => (
                        <li key={n.id ?? Math.random()} className="border p-2 rounded flex justify-between">
                            <span>{n.title}</span>
                            <div>
                                <button className="mr-2" onClick={() => editNote(n)}>Edit</button>
                                <button onClick={() => deleteNote(n)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* -------- REMINDERS -------- */}
            <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-2">Reminders</h2>
                <button className="bg-green-600 text-white px-2 py-1 rounded mb-2" onClick={addReminder}>+ Add Reminder</button>
                <ul className="space-y-2">
                    {reminders.map((r) => (
                        <li key={r.id ?? Math.random()} className="border p-2 rounded flex justify-between">
                            <span>{r.label} - {r.completed ? "✔ Done" : "⏳ Pending"}</span>
                            <div>
                                <button className="mr-2" onClick={() => toggleComplete(r)}>
                                    {r.completed ? "Mark Pending" : "Mark Complete"}
                                </button>
                                <button className="mr-2" onClick={() => editReminder(r)}>Edit</button>
                                <button onClick={() => deleteReminder(r)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* -------- RELATIONSHIPS -------- */}
            <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-2">Relationships</h2>
                <button className="bg-green-600 text-white px-2 py-1 rounded mb-2" onClick={addRelationship}>+ Add Relationship</button>
                <ul className="space-y-2">
                    {relationships.map((r) => (
                        <li key={`${r.other_perkey}-${r.relTypeKey}`} className="border p-2 rounded flex justify-between">
                            <span>{r.withPerson?.firstName} {r.withPerson?.lastName} - Type: {r.type}</span>
                            <div>
                                <button className="mr-2" onClick={() => editRelationship(r)}>Edit</button>
                                <button onClick={() => deleteRelationship(r)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}
