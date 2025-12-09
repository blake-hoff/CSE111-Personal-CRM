import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Persons } from "../api";

export default function PersonForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        birthday: "",
        location: "",
    });

    // Load existing person for editing
    useEffect(() => {
        if (id) {
            Persons.get(id)
                .then((data) => setForm(data))
                .catch(console.error);
        }
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (id) await Persons.update(id, form);
            else await Persons.create(form);
            navigate("/persons");
        } catch (err) {
            alert(err);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6">
                {id ? "Edit" : "Create"} Person
            </h2>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        First Name
                    </label>
                    <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) =>
                            setForm({ ...form, firstName: e.target.value })
                        }
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Last Name
                    </label>
                    <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) =>
                            setForm({ ...form, lastName: e.target.value })
                        }
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Birthday
                    </label>
                    <input
                        type="date"
                        value={form.birthday || ""}
                        onChange={(e) =>
                            setForm({ ...form, birthday: e.target.value })
                        }
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Location
                    </label>
                    <input
                        type="text"
                        value={form.location || ""}
                        onChange={(e) =>
                            setForm({ ...form, location: e.target.value })
                        }
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Save
                </button>
            </form>
        </div>
    );
}
