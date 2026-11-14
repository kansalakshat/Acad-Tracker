import { useMemo, useState } from 'react';
import PageHeading from '../../components/PageHeading';
import Button from '../../components/Button';
import styles from './Dashboard.module.css';

const dateLabel = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export default function Dashboard({ profile, onNavigate }) {
  const [month, setMonth] = useState(new Date('2026-11-01T00:00:00'));
  const upcoming = [...(profile.events || [])]
    .filter((e) => new Date(e.date + 'T23:59:00') >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  const days = useMemo(() => {
    const y = month.getFullYear(),
      m = month.getMonth(),
      first = new Date(y, m, 1).getDay(),
      count = new Date(y, m + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [month]);
  const eventsByDay = (day) =>
    day
      ? (profile.events || []).filter(
          (e) =>
            e.date ===
            `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        )
      : [];
  return (
    <>
      <PageHeading
        eyebrow={`SEMESTER ${profile.semester} · YOUR OVERVIEW`}
        title="The Scholar’s Desk"
        description="A clear view of the work that lies ahead."
        action={
          <Button variant="secondary" onClick={() => onNavigate('account')}>
            Edit semester
          </Button>
        }
      />
      <div className={styles.stats}>
        <button onClick={() => onNavigate('cgpa')}>
          <span>✧</span>
          <small>GRADE LEDGER</small>
          <strong>Calculate CGPA</strong>
          <em>Enter grades and credits →</em>
        </button>
        <button onClick={() => onNavigate('attendance')}>
          <span>◷</span>
          <small>ATTENDANCE</small>
          <strong>Track your classes</strong>
          <em>Mark today's classes →</em>
        </button>
        <button onClick={() => onNavigate('planner')}>
          <span>▦</span>
          <small>UPCOMING WORK</small>
          <strong>{upcoming.length} scheduled</strong>
          <em>Exams & assignments →</em>
        </button>
      </div>
      <div className={styles.columns}>
        <section className={styles.calendar}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.kicker}>YOUR MONTH AT A GLANCE</div>
              <h3>Course Calendar</h3>
            </div>
            <div className={styles.month}>
              <button
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                ‹
              </button>
              {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              <button
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                ›
              </button>
            </div>
          </div>
          <div className={styles.grid}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <b key={i}>{d}</b>
            ))}
            {days.map((day, i) => (
              <div key={i} className={day ? styles.day : styles.empty}>
                {day && (
                  <>
                    <span>{day}</span>
                    {eventsByDay(day).map((e) => (
                      <i key={e.id} title={e.title} />
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className={styles.legend}>
            <span>
              <i /> Exam / quiz
            </span>
            <span>
              <i /> Assignment
            </span>
          </div>
        </section>
        <section className={styles.upcoming}>
          <div className={styles.kicker}>MARK THESE DATES</div>
          <h3>Coming Up</h3>
          {upcoming.length ? (
            upcoming.map((e) => (
              <div className={styles.event} key={e.id}>
                <div className={styles.date}>{dateLabel(e.date)}</div>
                <div>
                  <b>{e.title}</b>
                  <small>
                    {e.type} · {e.subject}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyText}>No upcoming deadlines. A rare peaceful chapter.</p>
          )}
          <button className={styles.viewAll} onClick={() => onNavigate('planner')}>
            VIEW ALL DATES →
          </button>
        </section>
      </div>
      <div className={styles.lower}>
        <div>
          <span className={styles.kicker}>CURRENT TERM</span>
          <strong>Semester {profile.semester}</strong>
          <small>{profile.subjects?.length || 0} subjects registered</small>
        </div>
        <button onClick={() => onNavigate('archive')}>OPEN SEMESTER ARCHIVE →</button>
      </div>
    </>
  );
}
