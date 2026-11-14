import PageHeading from '../../components/PageHeading';
import styles from './Archive.module.css';
export default function Archive({ profile }) {
  const history = profile.history || [];
  return (
    <>
      <PageHeading
        eyebrow="YOUR ACADEMIC MEMORY"
        title="Semester Archive"
        description="A record of previous semesters, their results and course material."
      />
      <div className={styles.current}>
        <div className={styles.kicker}>ACTIVE RECORD</div>
        <h3>Semester {profile.semester}</h3>
        <p>{profile.subjects?.length || 0} registered subjects · Current academic term</p>
        <div className={styles.subjects}>
          {(profile.subjects || []).map((s) => (
            <span key={s.id}>
              {s.name} <small>{s.credits} credits</small>
            </span>
          ))}
        </div>
      </div>
      {history.length ? (
        history.map((h) => (
          <div className={styles.old} key={h.semester}>
            <h3>Semester {h.semester}</h3>
            <p>
              CGPA: {h.cgpa || 'Not entered'} · {h.subjects?.length || 0} subjects
            </p>
          </div>
        ))
      ) : (
        <div className={styles.empty}>
          <div>✧</div>
          <h3>Your earlier chapters will live here.</h3>
          <p>
            When you move to a new semester, the previous semester's grades, attendance, events and
            study material should be preserved here.
          </p>
        </div>
      )}
    </>
  );
}
