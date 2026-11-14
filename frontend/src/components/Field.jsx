import styles from './Field.module.css';
export default function Field({ label, ...props }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
