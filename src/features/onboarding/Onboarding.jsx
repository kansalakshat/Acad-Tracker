import { useState } from 'react';
import Field from '../../components/Field';
import Button from '../../components/Button';
import { weekdays } from '../../data';
import styles from './Onboarding.module.css';

export default function Onboarding({ profile, onComplete }) {
  const [step, setStep] = useState(0);
  const [semester, setSemester] = useState(profile.semester || 1);
  const [subjects, setSubjects] = useState([{ name: '', code: '', credits: 3 }]);
  const [timetable, setTimetable] = useState([]);
  const addSubject = () => setSubjects((s) => [...s, { name: '', code: '', credits: 3 }]);
  const updateSubject = (i, key, value) =>
    setSubjects((s) => s.map((x, n) => (n === i ? { ...x, [key]: value } : x)));
  const addClass = () =>
    setTimetable((t) => [
      ...t,
      { subjectId: subjects[0]?.code || '', day: 'Monday', time: '09:00' },
    ]);
  const updateClass = (i, key, value) =>
    setTimetable((t) => t.map((x, n) => (n === i ? { ...x, [key]: value } : x)));
  const finish = () =>
    onComplete({
      semester: Number(semester),
      subjects: subjects
        .filter((s) => s.name.trim())
        .map((s, i) => ({ ...s, id: `sub-${Date.now()}-${i}`, credits: Number(s.credits) })),
      timetable: timetable.map((x, i) => ({ ...x, id: `class-${Date.now()}-${i}` })),
      history: profile.history || [],
    });
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.crest}>A</div>
        <div className={styles.kicker}>YOUR ACADEMIC RECORD BEGINS</div>
        <h1>Prepare Your Ledger</h1>
        <p className={styles.intro}>
          A few details now will shape your personal academic chronicle.
        </p>
        <div className={styles.progress}>
          <span style={{ width: `${(step + 1) * 33.33}%` }} />
        </div>
        <div className={styles.steps}>STEP {step + 1} OF 3</div>
        {step === 0 && (
          <section>
            <h2>Which semester are you in?</h2>
            <p>Choose your current semester. You can change it later from My Account.</p>
            <label className={styles.selectLabel}>
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
        )}
        {step === 1 && (
          <section>
            <h2>Enter your subjects</h2>
            <p>Add the subjects you are studying this semester, with their credit values.</p>
            {subjects.map((s, i) => (
              <div className={styles.subject} key={i}>
                <Field
                  label="SUBJECT NAME"
                  value={s.name}
                  placeholder="e.g. Data Structures"
                  onChange={(e) => updateSubject(i, 'name', e.target.value)}
                />
                <Field
                  label="COURSE CODE"
                  value={s.code}
                  placeholder="CS201"
                  onChange={(e) => updateSubject(i, 'code', e.target.value)}
                />
                <Field
                  label="CREDITS"
                  type="number"
                  min="1"
                  max="10"
                  value={s.credits}
                  onChange={(e) => updateSubject(i, 'credits', e.target.value)}
                />
              </div>
            ))}
            <button className={styles.add} onClick={addSubject}>
              + ADD ANOTHER SUBJECT
            </button>
          </section>
        )}
        {step === 2 && (
          <section>
            <h2>Set your weekly timetable</h2>
            <p>
              Add recurring class slots. Attendance entries will be generated from this schedule.
            </p>
            {timetable.map((t, i) => (
              <div className={styles.classRow} key={i}>
                <select
                  value={t.subjectId}
                  onChange={(e) => updateClass(i, 'subjectId', e.target.value)}
                >
                  {subjects
                    .filter((s) => s.name)
                    .map((s) => (
                      <option value={s.code} key={s.code}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <select value={t.day} onChange={(e) => updateClass(i, 'day', e.target.value)}>
                  {weekdays.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={t.time}
                  onChange={(e) => updateClass(i, 'time', e.target.value)}
                />
              </div>
            ))}
            <button className={styles.add} onClick={addClass}>
              + ADD CLASS SLOT
            </button>
          </section>
        )}
        <div className={styles.actions}>
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button onClick={finish}>Open My Chronicle</Button>
          )}
        </div>
      </div>
    </div>
  );
}
