import { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function RemindersList() {
    const [reminders, setReminders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadReminders();
    }, []);

    function loadReminders() {
        api.RemindersAPI.list().then(setReminders).catch(console.error);
    }

    function deleteReminder(id) {
        if (!confirm("Delete this reminder?")) return;

        api.RemindersAPI.del(id)
            .then(loadReminders)
            .catch(console.error);
    }

    function toggleCompleted(rem) {
        api.RemindersAPI.update(rem.id, { completed: !rem.completed })
            .then(loadReminders)
            .catch(console.error);
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Reminders</h2>

            <Link
                to="/reminders/new"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
                + New Reminder
            </Link>

            <ul className="mt-4 space-y-4">
                {reminders.map((r) => (
                    <li
                        key={r.id}
                        className="border p-4 rounded shadow relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                        <div className="flex-1">
                            <div className="font-semibold text-lg">{r.label}</div>
                            <div className="text-gray-600">
                                Due: {r.due_date || "No date"}
                            </div>
                            <div className="text-gray-700">
                                Status: {r.completed ? "✔ Done" : "⏳ Pending"}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                            <button
                                onClick={() => toggleCompleted(r)}
                                className={`px-3 py-1 rounded text-white ${r.completed ? "bg-blue-400 hover:bg-blue-500" : "bg-blue-600 hover:bg-blue-700"
                                    } transition-colors`}
                            >
                                {r.completed ? "Mark Pending" : "Mark Complete"}
                            </button>

                            <button
                                onClick={() => navigate(`/reminders/${r.id}`)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                            >
                                Edit
                            </button>

                            <button
                                onClick={() => deleteReminder(r.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
