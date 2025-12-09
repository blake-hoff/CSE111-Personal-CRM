export default function Home() {
    return (
        <div className="p-10 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
            <h2 className="text-4xl font-extrabold mb-6 text-blue-700">Welcome</h2>
            <p className="text-lg text-gray-700 mb-6">
                This is the React + Flask full‑stack dashboard. Use the sidebar to navigate through different features.
            </p>

            <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4 text-blue-800">Features</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-lg">
                    <li>Manage Persons</li>
                    <li>Store Notes</li>
                    <li>Create Reminders</li>
                    <li>Connect to Flask API</li>
                </ul>
            </div>
        </div>
    );
}
