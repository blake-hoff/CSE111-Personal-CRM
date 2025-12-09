import { useState, useEffect } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

export default function ReminderForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        label: "",
        description: "",
        due_date: "",
        completed: false,
    });

    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) {
            api.RemindersAPI.get(id)
                .then((data) => setForm(data))
                .catch(console.error);
        }
    }, [id]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const action = isEdit
            ? api.RemindersAPI.update(id, form)
            : api.RemindersAPI.create(form);

        action
            .then(() => navigate("/reminders"))
            .catch(console.error);
    }

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">
                {isEdit ? "Edit Reminder" : "Create Reminder"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block font-medium mb-1">Label</label>
                    <input
                        type="text"
                        name="label"
                        value={form.label}
                        onChange={handleChange}
                        className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="border p-2 rounded w-full h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Due Date</label>
                    <input
                        type="date"
                        name="due_date"
                        value={form.due_date}
                        onChange={handleChange}
                        className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="completed"
                        checked={form.completed}
                        onChange={handleChange}
                        className="h-4 w-4"
                    />
                    <span className="ml-2">Completed</span>
                </div>

                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Save
                </button>
            </form>
        </div>
    );
}
