import { useState } from 'react';
import PageHeading from '../../components/PageHeading';
import Field from '../../components/Field';
import Button from '../../components/Button';
import styles from './Planner.module.css';

const blank = {
  title: '',
  type: 'Exam',
  date: '',
  subject: '',
};

const today = () => new Date().toLocaleDateString('en-CA');

export default function Planner({ profile, onUpdate }) {
  const [form, setForm] = useState(blank);
  const [show, setShow] = useState(false);

  const [view, setView] = useState('events');
  const [selectedSubject, setSelectedSubject] = useState(profile.subjects?.[0]?.id || '');

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(today());

  const events = [...(profile.events || [])].sort((a, b) => a.date.localeCompare(b.date));

  const attendance = profile.attendance || {};
  const timetable = profile.timetable || [];

  const save = (e) => {
    e.preventDefault();

    if (!form.title || !form.date) return;

    onUpdate({
      events: [...(profile.events || []), { ...form, id: `event-${Date.now()}` }],
    });

    setForm(blank);
    setShow(false);
  };

  const remove = (id) => {
    onUpdate({
      events: (profile.events || []).filter((e) => e.id !== id),
    });
  };

  const previousMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  };

  const getDateKey = (day) => {
    const y = month.getFullYear();
    const m = String(month.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getAttendanceStatus = (date) => {
    const weekday = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
    });

    const classes = timetable.filter((t) => t.day === weekday && t.subjectId === selectedSubject);

    if (!classes.length) return '';

    const statuses = classes.map((c) => attendance[`${date}_${c.id}`]);

    if (statuses.every((s) => s === 'Cancelled')) return 'cancelled';

    if (statuses.includes('Absent')) return 'absent';

    if (statuses.includes('Present')) return 'present';

    return '';
  };

  const getClassesForDate = (date) => {
    const weekday = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
    });

    return timetable.filter((t) => t.day === weekday && t.subjectId === selectedSubject);
  };

  const selectedClasses = getClassesForDate(selectedDate);

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedEvents = events.filter((e) => e.date === selectedDate);

  return (
    <>
      <PageHeading
        eyebrow="DATES THAT SHAPE YOUR TERM"
        title="Course Calendar"
        description="Keep track of your academic schedule and attendance."
        action={<Button onClick={() => setShow((v) => !v)}>+ Add an event</Button>}
      />

      <div className={styles.calendarToolbar}>
        <label className={styles.select}>
          CALENDAR VIEW
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="events">Exams & Assignments</option>
            <option value="attendance">Subject Attendance</option>
          </select>
        </label>

        {view === 'attendance' && (
          <label className={styles.select}>
            SELECT SUBJECT
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              {(profile.subjects || []).map((s) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {show && view === 'events' && (
        <form className={styles.form} onSubmit={save}>
          <div className={styles.formTitle}>ENTER A NEW DATE</div>

          <Field
            label="TITLE"
            placeholder="e.g. Mid-semester examination"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            required
          />

          <label className={styles.select}>
            EVENT TYPE
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
            >
              <option>Exam</option>
              <option>Assignment</option>
              <option>Quiz</option>
              <option>Project</option>
              <option>Other</option>
            </select>
          </label>

          <Field
            label="DUE DATE"
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            required
          />

          <label className={styles.select}>
            SUBJECT
            <select
              value={form.subject}
              onChange={(e) =>
                setForm({
                  ...form,
                  subject: e.target.value,
                })
              }
            >
              <option value="">General</option>

              {(profile.subjects || []).map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit">Save to calendar</Button>
        </form>
      )}

      {view === 'events' ? (
        <div className={styles.eventList}>
          {events.length ? (
            events.map((e) => (
              <article className={styles.event} key={e.id}>
                <div className={styles.date}>
                  <b>{new Date(e.date + 'T00:00:00').getDate()}</b>

                  <span>
                    {new Date(e.date + 'T00:00:00')
                      .toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })
                      .toUpperCase()}
                  </span>
                </div>

                <div className={styles.details}>
                  <span className={styles.type}>{e.type}</span>
                  <h3>{e.title}</h3>
                  <p>{e.subject || 'General academic event'}</p>
                </div>

                <button
                  className={styles.remove}
                  onClick={() => remove(e.id)}
                  aria-label="Delete event"
                >
                  ×
                </button>
              </article>
            ))
          ) : (
            <div className={styles.empty}>
              No dates have been added yet. Create your first course event.
            </div>
          )}
        </div>
      ) : (
        <div className={styles.attendanceCalendar}>
          <div className={styles.calendarHeader}>
            <button onClick={previousMonth}>←</button>

            <h3>
              {month.toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>

            <button onClick={nextMonth}>→</button>
          </div>

          <div className={styles.weekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }

              const date = getDateKey(day);
              const status = getAttendanceStatus(date);

              return (
                <button
                  key={date}
                  className={[
                    styles.calendarDay,
                    status ? styles[status] : '',
                    selectedDate === date ? styles.selectedDay : '',
                  ].join(' ')}
                  onClick={() => setSelectedDate(date)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className={styles.legend}>
            <span>
              <i className={styles.presentDot} /> Present
            </span>
            <span>
              <i className={styles.absentDot} /> Absent
            </span>
            <span>
              <i className={styles.cancelledDot} /> Cancelled
            </span>
          </div>

          <div className={styles.dayDetails}>
            <h3>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>

            {selectedClasses.length ? (
              selectedClasses.map((c) => {
                const status = attendance[`${selectedDate}_${c.id}`];

                return (
                  <div className={styles.classRecord} key={c.id}>
                    <span>{c.time}</span>

                    <strong>{profile.subjects?.find((s) => s.id === selectedSubject)?.name}</strong>

                    <b>{status || 'Not marked'}</b>
                  </div>
                );
              })
            ) : (
              <p>No classes scheduled for this subject.</p>
            )}

            {selectedEvents.map((e) => (
              <div className={styles.classRecord} key={e.id}>
                <span>{e.type}</span>
                <strong>{e.title}</strong>
                <b>{e.subject || 'General'}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
