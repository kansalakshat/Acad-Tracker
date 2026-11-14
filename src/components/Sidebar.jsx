import styles from "./Sidebar.module.css";

const links = [
  ["dashboard", "⌂", "The Hall"],
  ["cgpa", "✧", "Grade Ledger"],
  ["attendance", "◷", "Attendance"],
  ["planner", "▦", "Course Calendar"],
  ["archive", "▤", "Semester Archive"],
  ["account", "⚒", "My Account"]
];

export default function Sidebar({ page, onNavigate }) {
  return <aside className={styles.sidebar}>
    <div className={styles.brand}><div className={styles.crest}>A</div><div><div className={styles.name}>ACADEMIA</div><div className={styles.sub}>STUDENT CHRONICLE</div></div></div>
    <div className={styles.rule}><span>YOUR STUDIES</span></div>
    <nav>{links.map(([id, icon, label]) => <button key={id} className={`${styles.link} ${page === id ? styles.active : ""}`} onClick={() => onNavigate(id)}><span className={styles.icon}>{icon}</span>{label}{page === id && <i />}</button>)}</nav>
    <div className={styles.bottom}><div className={styles.motto}>“Knowledge is the<br/>greatest inheritance.”</div><div className={styles.seal}>✦ &nbsp; IIT BHILAI &nbsp; ✦</div></div>
  </aside>;
}