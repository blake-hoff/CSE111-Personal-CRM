import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

import PersonsList from './pages/PersonsList'
import PersonForm from './pages/PersonForm'
import PersonDetail from './pages/PersonDetail' // ✅ Import PersonDetail

import NotesList from './pages/NotesList'
import NoteForm from './pages/NoteForm'

import RemindersList from './pages/RemindersList'
import ReminderForm from './pages/ReminderForm'

export default function App() {
    return (
        <BrowserRouter>
            <div style={{ display: 'flex', gap: 20 }}>
                <nav style={{ padding: 10 }}>
                    <h3>People & Notes</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/persons">Persons</Link></li>
                        <li><Link to="/notes">Notes</Link></li>
                        <li><Link to="/reminders">Reminders</Link></li>
                    </ul>
                </nav>

                <main style={{ padding: 10, flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<div>Welcome — choose a page</div>} />

                        {/* Persons */}
                        <Route path="/persons" element={<PersonsList />} />
                        <Route path="/persons/new" element={<PersonForm />} />
                        <Route path="/persons/:id" element={<PersonForm />} />
                        {/* ✅ Person detail with notes, reminders, relationships */}
                        <Route path="/persons/:perkey/view" element={<PersonDetail />} />

                        {/* Notes */}
                        <Route path="/notes" element={<NotesList />} />
                        <Route path="/notes/new" element={<NoteForm />} />
                        <Route path="/notes/:id" element={<NoteForm />} />

                        {/* Reminders */}
                        <Route path="/reminders" element={<RemindersList />} />
                        <Route path="/reminders/new" element={<ReminderForm />} />
                        <Route path="/reminders/:id" element={<ReminderForm />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}
