import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "./Shell.module.css";

export default function Shell({ page, onNavigate, user, children }) {
  return <div className={styles.layout}>
    <Sidebar page={page} onNavigate={onNavigate} />
    <main className={styles.main}>
      <Topbar user={user} page={page} />
      <div className={styles.content}>{children}</div>
      <footer className={styles.footer}>ACADEMIA · THE STUDENT CHRONICLE <span>EST. MMXXVI</span></footer>
    </main>
  </div>;
}