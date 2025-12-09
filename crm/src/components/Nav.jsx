import { Link } from "react-router-dom";


export default function Nav() {
return (
<nav className="w-full bg-gray-900 text-white p-4 flex items-center justify-between shadow-lg">
<h1 className="text-xl font-bold">Fullstack Demo</h1>
<div className="flex gap-4 text-lg">
<Link to="/" className="hover:text-blue-400">Home</Link>
<Link to="/persons" className="hover:text-blue-400">Persons</Link>
<Link to="/notes" className="hover:text-blue-400">Notes</Link>
<Link to="/reminders" className="hover:text-blue-400">Reminders</Link>
</div>
</nav>
);
}