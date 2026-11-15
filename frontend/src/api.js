const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'academia-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    if (res.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event('academia-logout'));
    }
    throw new Error(json?.message || `Request failed (${res.status}).`);
  }
  return json.data;
}

// Backend rows -> the shapes the UI components already use.
export const toSubject = (c) => ({ id: c.id, name: c.name, code: c.code, credits: c.credits });
export const toSlot = (t) => ({ id: t.id, subjectId: t.course_id, day: t.weekday, time: t.start_time });
export const toEvent = (a) => ({
  id: a.id,
  title: a.title,
  type: a.type,
  date: new Date(a.due_at).toLocaleDateString('en-CA'),
  subject: a.course_name,
  courseId: a.course_id,
});
export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export async function loadProfile() {
  const [me, courses, slots, assignments] = await Promise.all([
    api('/auth/me'),
    api('/courses'),
    api('/timetable'),
    api('/assignments'),
  ]);
  return {
    name: me.name,
    email: me.email,
    semester: me.semester,
    subjects: courses.map(toSubject),
    timetable: slots.map(toSlot),
    events: assignments.map(toEvent),
    history: [],
  };
}

// Make the server's course list match `subjects`: create new, update changed, delete removed.
export async function syncSubjects(current, subjects) {
  const keep = new Set(subjects.filter((s) => typeof s.id === 'number').map((s) => s.id));
  const body = (s) => ({ name: s.name.trim(), code: (s.code || '').trim(), credits: Number(s.credits) });
  await Promise.all(
    current.filter((c) => !keep.has(c.id)).map((c) => api(`/courses/${c.id}`, { method: 'DELETE' }))
  );
  return Promise.all(
    subjects.map(async (s) => {
      if (typeof s.id !== 'number') return toSubject(await api('/courses', { method: 'POST', body: body(s) }));
      const old = current.find((c) => c.id === s.id);
      const b = body(s);
      if (old && old.name === b.name && old.code === b.code && old.credits === b.credits) return old;
      return toSubject(await api(`/courses/${s.id}`, { method: 'PUT', body: b }));
    })
  );
}
