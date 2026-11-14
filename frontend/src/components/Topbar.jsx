import styles from './Topbar.module.css';

const titles = {
  dashboard: 'The Hall',
  cgpa: 'Grade Ledger',
  attendance: 'Attendance Chronicle',
  planner: 'Course Calendar',
  archive: 'Semester Archive',
  account: 'Your Account',
};

export default function Topbar({ user, page }) {
  return (
    <header className={styles.top}>
      <div>
        <div className={styles.eyebrow}>
          IIT BHILAI <span>✦</span> ACADEMIC YEAR 2026–27
        </div>
        <h1>{titles[page] || 'The Hall'}</h1>
      </div>
      <div className={styles.user}>
        <div className={styles.avatar}>{(user?.name || 'S').slice(0, 1).toUpperCase()}</div>
        <div>
          <strong>{user?.name || 'Student'}</strong>
          <small>{user?.email}</small>
        </div>
      </div>
    </header>
  );
}
