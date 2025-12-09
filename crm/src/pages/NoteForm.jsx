import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function NoteForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: "", content: "" });

    // Load existing note if editing
    useEffect(() => {
        if (id) {
            api.NotesAPI.get(id)
                .then((note) => {
                    setForm({
                        title: note.title,
                        content: note.content
                    });
                })
                .catch((err) => console.error("Error loading note:", err));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await api.NotesAPI.update(id, form);
            } else {
                await api.NotesAPI.create(form);
            }
            navigate("/notes");
        } catch (err) {
            console.error("Error saving note:", err);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
                {id ? "Edit Note" : "Add Note"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Title"
                    className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                />

                <textarea
                    placeholder="Content"
                    className="border border-gray-300 p-3 rounded h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors"
                >
                    {id ? "Update Note" : "Create Note"}
                </button>
            </form>
        </div>
    );
}
