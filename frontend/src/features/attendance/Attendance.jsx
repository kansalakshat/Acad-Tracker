import { useCallback, useEffect, useState } from 'react';
import PageHeading from '../../components/PageHeading';
import Button from '../../components/Button';
import { api, capitalize } from '../../api';
import styles from './Attendance.module.css';

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
export default function Attendance({ profile }) {
  const [date, setDate] = useState(today());
  // One record per subject per date on the server: { [courseId]: { id, status } }
  const [records, setRecords] = useState({});
  const [counts, setCounts] = useState({ present: 0, absent: 0, cancelled: 0 });
  const [extras, setExtras] = useState([]);
  const [error, setError] = useState('');
  const [extra, setExtra] = useState(false);
  const [extraSubject, setExtraSubject] = useState(profile.subjects?.[0]?.id || '');
  const [extraTime, setExtraTime] = useState('16:00');
  const weekday = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  const scheduled = (profile.timetable || []).filter((t) => t.day === weekday);
  const scheduledIds = new Set(scheduled.map((t) => t.subjectId));
  const extraIds = new Set([
    ...extras.map((x) => x.subjectId),
    ...Object.keys(records).map(Number),
  ]);
  const classes = [
    ...scheduled,
    ...[...extraIds]
      .filter((id) => !scheduledIds.has(id))
      .map((id) => ({
        id: `extra-${id}`,
        subjectId: id,
        time: extras.find((x) => x.subjectId === id)?.time || '—',
        extra: true,
      })),
  ];
  const subjectName = (id) => profile.subjects?.find((s) => s.id === id)?.name || 'Subject';

  const loadSummary = useCallback(
    () =>
      api('/attendance/summary').then((rows) =>
        setCounts({
          present: rows.reduce((n, r) => n + r.attended, 0),
          absent: rows.reduce((n, r) => n + r.total_classes - r.attended, 0),
          cancelled: rows.reduce((n, r) => n + r.cancelled, 0),
        })
      ),
    []
  );

  useEffect(() => {
    setError('');
    setExtras([]);
    api(`/attendance?date=${date}`)
      .then((rows) =>
        setRecords(
          Object.fromEntries(rows.map((r) => [r.course_id, { id: r.id, status: capitalize(r.status) }]))
        )
      )
      .catch((e) => setError(e.message));
  }, [date]);

  useEffect(() => {
    loadSummary().catch((e) => setError(e.message));
  }, [loadSummary]);

  const mark = async (courseId, status) => {
    const existing = records[courseId];
    const body = { status: status.toLowerCase() };
    try {
      const saved = existing
        ? await api(`/attendance/${existing.id}`, { method: 'PUT', body })
        : await api(`/courses/${courseId}/attendance`, {
            method: 'POST',
            body: { ...body, class_date: date },
          });
      setRecords((r) => ({ ...r, [courseId]: { id: saved.id, status } }));
      setError('');
      await loadSummary();
    } catch (e) {
      setError(e.message);
    }
  };
  const addExtra = () => {
    setExtras((x) => [...x, { subjectId: Number(extraSubject), time: extraTime }]);
    setExtra(false);
  };
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
                    onClick={() => mark(c.subjectId, s)}
                    className={`${records[c.subjectId]?.status === s ? styles[s.toLowerCase()] : ''}`}
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
      {error && (
        <p className={styles.notice} role="alert" style={{ color: '#9a3026' }}>
          {error}
        </p>
      )}
    </>
  );
}
