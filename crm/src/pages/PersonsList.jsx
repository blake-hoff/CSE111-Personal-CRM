import React, { useEffect, useState } from "react";
import { Persons } from "../api";
import { Link } from "react-router-dom";

export default function PersonsList() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        loadPersons();
    }, []);

    function loadPersons() {
        Persons.list().then(setItems).catch(console.error);
    }

    function deletePerson(id) {
        if (!confirm("Delete this person?")) return;

        Persons.del(id)
            .then(() => loadPersons())
            .catch(console.error);
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Persons</h2>
                <Link
                    to="/persons/new"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                    + Create Person
                </Link>
            </div>

            <ul className="space-y-3">
                {items.map((p) => (
                    <li
                        key={p.perkey}
                        className="border p-3 rounded shadow relative hover:shadow-md transition-shadow"
                    >
                        <Link
                            to={`/persons/${p.perkey}`}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            {p.firstName} {p.lastName}
                        </Link>

                        <button
                            onClick={() => deletePerson(p.perkey)}
                            className="absolute top-3 right-3 text-red-600 hover:text-red-800"
                            title="Delete person"
                        >
                            ✖
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
