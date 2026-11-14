import styles from './PageHeading.module.css';
export default function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className={styles.heading}>
      <div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
