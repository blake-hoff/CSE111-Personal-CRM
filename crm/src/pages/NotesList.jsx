import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function NotesList() {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        loadNotes();
    }, []);

    function loadNotes() {
        api.NotesAPI.list()
            .then(setNotes)
            .catch(err => console.error("Error fetching notes:", err));
    }

    function deleteNote(id) {
        if (!confirm("Delete this note?")) return;

        api.NotesAPI.del(id)
            .then(() => loadNotes())
            .catch(console.error);
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Notes</h2>
                <Link
                    to="/notes/new"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                    + New Note
                </Link>
            </div>

            {notes.length === 0 ? (
                <p className="text-gray-500">No notes yet. Create one above!</p>
            ) : (
                <ul className="space-y-4">
                    {notes.map((note) => (
                        <li
                            key={note.id}
                            className="border border-gray-300 p-4 rounded-lg shadow hover:shadow-md transition-shadow relative bg-white"
                        >
                            <Link
                                to={`/notes/${note.id}`}
                                className="text-blue-600 font-semibold text-lg hover:underline"
                            >
                                {note.title || "Untitled Note"}
                            </Link>

                            <p className="text-gray-700 mt-2">{note.content}</p>

                            <button
                                onClick={() => deleteNote(note.id)}
                                className="absolute top-3 right-3 text-red-600 hover:text-red-800 transition-colors"
                            >
                                ✖
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
