const API_BASE = "http://localhost:5000/api"; // explicit backend

export async function apiFetch(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        ...opts,
    });
    if (!res.ok && res.status !== 204) throw new Error(await res.text());
    return res.status === 204 ? null : res.json();
}

export const Persons = {
    list: () => apiFetch('/persons'),
    get: (id) => apiFetch(`/persons/${id}`),
    create: (data) => apiFetch('/persons', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/persons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    del: (id) => apiFetch(`/persons/${id}`, { method: 'DELETE' })
};

export const NotesAPI = {
    list: () => apiFetch('/notes'),
    get: (id) => apiFetch(`/notes/${id}`),
    create: (data) => apiFetch('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    del: (id) => apiFetch(`/notes/${id}`, { method: 'DELETE' })
};
export const RemindersAPI = {
    list: () => apiFetch('/reminders'),
    get: (id) => apiFetch(`/reminders/${id}`),
    create: (data) => apiFetch('/reminders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    del: (id) => apiFetch(`/reminders/${id}`, { method: 'DELETE' })
};
// default export so imports like `import api from '../api'` work
export default {
    Persons,
    NotesAPI,
    RemindersAPI
};
