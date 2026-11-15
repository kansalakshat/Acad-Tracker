import { useState } from 'react';
import PageHeading from '../../components/PageHeading';
import Field from '../../components/Field';
import Button from '../../components/Button';
import { api, syncSubjects } from '../../api';
import styles from './Account.module.css';

export default function Account({ profile, onUpdate, onSignOut, onReconfigure }) {
  const [name, setName] = useState(profile.name || '');
  const [semester, setSemester] = useState(profile.semester || 1);
  const [subjects, setSubjects] = useState(profile.subjects || []);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (id, key, value) =>
    setSubjects((s) => s.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  const save = async () => {
    const removed = profile.subjects.filter((c) => !subjects.some((s) => s.id === c.id));
    if (
      removed.length &&
      !window.confirm(
        `Removing ${removed.map((s) => s.name).join(', ')} also deletes its attendance and dates. Continue?`
      )
    )
      return;
    setBusy(true);
    try {
      const me = await api('/auth/me', {
        method: 'PATCH',
        body: { name, semester: Number(semester) },
      });
      const saved = await syncSubjects(profile.subjects, subjects);
      const keep = new Set(saved.map((s) => s.id));
      onUpdate({
        name: me.name,
        semester: me.semester,
        subjects: saved,
        timetable: profile.timetable.filter((t) => keep.has(t.subjectId)),
        events: profile.events.filter((e) => keep.has(e.courseId)),
      });
      setSubjects(saved);
      setError('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="PERSONAL RECORD"
        title="My Account"
        description="Manage the details that shape your academic chronicle."
      />
      <div className={styles.account}>
        <section>
          <h3>Scholar Details</h3>
          <Field label="FULL NAME" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="INSTITUTE EMAIL" value={profile.email || ''} readOnly />
          <label className={styles.select}>
            CURRENT SEMESTER
            <select value={semester} onChange={(e) => setSemester(e.target.value)}>
              {Array.from({ length: 8 }, (_, i) => (
                <option value={i + 1} key={i}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section>
          <h3>Registered Subjects</h3>
          {subjects.map((s) => (
            <div className={styles.subject} key={s.id}>
              <input
                aria-label="Subject name"
                value={s.name}
                onChange={(e) => update(s.id, 'name', e.target.value)}
              />
              <input
                aria-label="Course code"
                placeholder="CODE"
                value={s.code || ''}
                onChange={(e) => update(s.id, 'code', e.target.value)}
              />
              <input
                aria-label="Credits"
                type="number"
                min="1"
                max="10"
                value={s.credits}
                onChange={(e) => update(s.id, 'credits', e.target.value)}
              />
              <button onClick={() => setSubjects((v) => v.filter((x) => x.id !== s.id))}>×</button>
            </div>
          ))}
          <button
            className={styles.add}
            onClick={() =>
              setSubjects((v) => [
                ...v,
                { id: `subject-${Date.now()}`, name: 'New subject', code: '', credits: 3 },
              ])
            }
          >
            + ADD SUBJECT
          </button>
        </section>
      </div>
      <div className={styles.actions}>
        <Button onClick={save} disabled={busy}>
          Save account changes
        </Button>
        {saved && <span>Changes saved.</span>}
        {error && (
          <span role="alert" style={{ color: '#9a3026' }}>
            {error}
          </span>
        )}
      </div>
      <div className={styles.caution}>
        <div>
          <b>Start a new semester</b>
          <p>
            Archive your current semester before replacing it. The backend should snapshot all
            grades, attendance, events and resources.
          </p>
        </div>
        <Button variant="secondary" onClick={onReconfigure}>
          Reconfigure semester
        </Button>
      </div>
      <div className={styles.signout}>
        <Button variant="danger" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    </>
  );
}
