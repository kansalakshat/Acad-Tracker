import { useMemo, useState } from 'react';
import PageHeading from '../../components/PageHeading';
import Button from '../../components/Button';
import styles from './Attendance.module.css';

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
export default function Attendance({ profile, onUpdate }) {
  const [date, setDate] = useState(today());
  const [records, setRecords] = useState(profile.attendance || {});
  const [extra, setExtra] = useState(false);
  const [extraSubject, setExtraSubject] = useState(profile.subjects?.[0]?.id || '');
  const [extraTime, setExtraTime] = useState('16:00');
  const classes = (profile.timetable || []).filter(
    (t) =>
      t.day ===
      new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
      })
  );
  const subjectName = (id) =>
    profile.subjects?.find((s) => s.id === id)?.name ||
    profile.subjects?.find((s) => s.code === id)?.name ||
    'Subject';
  const key = (id) => `${date}_${id}`;
  const mark = (id, status) => {
    const next = { ...records, [key(id)]: status };
    setRecords(next);
    onUpdate({ attendance: next });
  };
  const addExtra = () => {
    const item = {
      id: `extra-${Date.now()}`,
      subjectId: extraSubject,
      day: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
      }),
      time: extraTime,
      extra: true,
    };
    const next = [...(profile.timetable || []), item];
    onUpdate({ timetable: next });
    setExtra(false);
  };
  const counts = useMemo(() => {
    const vals = Object.values(records);
    return {
      present: vals.filter((v) => v === 'Present').length,
      absent: vals.filter((v) => v === 'Absent').length,
      cancelled: vals.filter((v) => v === 'Cancelled').length,
    };
  }, [records]);
  return (
    <>
      <PageHeading
        eyebrow="DAILY CLASS REGISTER"
        title="Attendance Chronicle"
        description="Mark each scheduled class. Unmarked past classes are treated as absent by the server."
        action={
          <Button variant="secondary" onClick={() => setExtra((v) => !v)}>
            + Extra Class
          </Button>
        }
      />
      <div className={styles.summary}>
        <div>
          <b>{counts.present}</b>
          <span>PRESENT</span>
        </div>
        <div>
          <b>{counts.absent}</b>
          <span>ABSENT</span>
        </div>
        <div>
          <b>{counts.cancelled}</b>
          <span>CANCELLED</span>
        </div>
      </div>
      {extra && (
        <div className={styles.extra}>
          <label>
            SUBJECT
            <select value={extraSubject} onChange={(e) => setExtraSubject(e.target.value)}>
              {(profile.subjects || []).map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            TIME
            <input type="time" value={extraTime} onChange={(e) => setExtraTime(e.target.value)} />
          </label>
          <Button onClick={addExtra}>Add extra class</Button>
        </div>
      )}
      <div className={styles.datebar}>
        <label>
          REGISTER DATE
          <input
            type="date"
            value={date}
            onChange={(e) => {
              if (e.target.value <= today()) {
                setDate(e.target.value);
              }
            }}
          />
        </label>
        <span>
          {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className={styles.list}>
        {classes.length ? (
          classes.map((c) => (
            <div className={styles.classItem} key={c.id}>
              <div className={styles.time}>{c.time}</div>
              <div className={styles.subject}>
                <b>{subjectName(c.subjectId)}</b>
                <small>{c.extra ? 'EXTRA CLASS' : 'TIMETABLE CLASS'}</small>
              </div>
              <div className={styles.status}>
                {['Present', 'Absent', 'Cancelled'].map((s) => (
                  <button
                    key={s}
                    onClick={() => mark(c.id, s)}
                    className={`${records[key(c.id)] === s ? styles[s.toLowerCase()] : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            No classes are scheduled for this day. Add an extra class or choose another date.
          </div>
        )}
      </div>
      <p className={styles.notice}>
        Attendance is currently saved in this browser for demonstration. The backend must close each
        day and create absent records for any unmarked scheduled class.
      </p>
    </>
  );
}
