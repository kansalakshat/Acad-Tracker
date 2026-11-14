import styles from "./AuthFrame.module.css";
export default function AuthFrame({ eyebrow, title, subtitle, children }) {
  return <div className={styles.page}><div className={styles.ornament}>✦</div><section className={styles.panel}><div className={styles.brand}>A</div><div className={styles.kicker}>IIT BHILAI · STUDENT CHRONICLE</div><h1>{title}</h1><p className={styles.subtitle}>{subtitle}</p><div className={styles.rule}><span>✧</span></div>{children}<div className={styles.foot}>ACADEMIA · EST. MMXXVI</div></section></div>;
}