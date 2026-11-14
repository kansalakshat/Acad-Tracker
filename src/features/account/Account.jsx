import { useState } from 'react';
import PageHeading from '../../components/PageHeading';
import Field from '../../components/Field';
import Button from '../../components/Button';
import styles from './Account.module.css';

export default function Account({ profile, onUpdate, onSignOut, onReconfigure }) {
  const [name, setName] = useState(profile.name || '');
  const [semester, setSemester] = useState(profile.semester || 1);
  const [subjects, setSubjects] = useState(profile.subjects || []);
  const [saved, setSaved] = useState(false);
  const update = (id, key, value) =>
    setSubjects((s) => s.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  const save = () => {
    onUpdate({ name, semester: Number(semester), subjects });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
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
              <input value={s.name} onChange={(e) => update(s.id, 'name', e.target.value)} />
              <input
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
                { id: `subject-${Date.now()}`, name: 'New subject', credits: 3 },
              ])
            }
          >
            + ADD SUBJECT
          </button>
        </section>
      </div>
      <div className={styles.actions}>
        <Button onClick={save}>Save account changes</Button>
        {saved && <span>Changes saved in this browser.</span>}
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
