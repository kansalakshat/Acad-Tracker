import { useMemo, useState } from 'react';
import PageHeading from '../../components/PageHeading';
import Button from '../../components/Button';
import { gradePoints } from '../../data';
import styles from './CGPA.module.css';

export default function CGPA({ subjects }) {
  const [rows, setRows] = useState(
    (subjects || []).map((s) => ({
      id: s.id,
      name: s.name,
      credits: s.credits,
      grade: 'A',
    }))
  );
  const [showForm, setShowForm] = useState(false);
  const [newCount, setNewCount] = useState('');
  const result = useMemo(() => {
    let points = 0,
      credits = 0,
      failed = 0;
    rows.forEach((r) => {
      const g = gradePoints[r.grade];
      const c = Number(r.credits);
      if (r.grade === 'F') {
        failed++;
        credits += c;
        return;
      }
      if (g !== undefined && c > 0) {
        points += g * c;
        credits += c;
      }
    });
    return { cgpa: credits ? points / credits : null, credits, failed, points };
  }, [rows]);
  const update = (id, key, value) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  const addRows = () => {
    const n = Math.max(1, Math.min(20, Number(newCount) || 1));
    setRows((r) => [
      ...r,
      ...Array.from({ length: n }, (_, i) => ({
        id: `new-${Date.now()}-${i}`,
        name: `Subject ${r.length + i + 1}`,
        credits: 3,
        grade: 'A',
      })),
    ]);
    setShowForm(false);
    setNewCount('');
  };
  return (
    <>
      <PageHeading
        eyebrow="ACADEMIC PERFORMANCE"
        title="Grade Ledger"
        description="Calculate your semester GPA from course credits and grades."
      />
      <div className={styles.layout}>
        <section className={styles.ledger}>
          <div className={styles.ledgerHead}>
            <h3>Subject Register</h3>
            <span>{rows.length} COURSES</span>
          </div>
          <div className={styles.tableHead}>
            <span>SUBJECT</span>
            <span>CREDITS</span>
            <span>GRADE</span>
            <span>POINTS</span>
          </div>
          {rows.map((r) => (
            <div className={styles.row} key={r.id}>
              <input
                aria-label="Subject name"
                value={r.name}
                onChange={(e) => update(r.id, 'name', e.target.value)}
              />
              <input
                aria-label="Credits"
                type="number"
                min="1"
                max="10"
                value={r.credits}
                onChange={(e) => update(r.id, 'credits', e.target.value)}
              />
              <select
                aria-label="Grade"
                value={r.grade}
                onChange={(e) => update(r.id, 'grade', e.target.value)}
              >
                {[...Object.keys(gradePoints), 'F'].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <b>{r.grade === 'F' ? '—' : gradePoints[r.grade]}</b>
            </div>
          ))}
          <div className={styles.actions}>
            <button onClick={() => setShowForm((v) => !v)}>+ ADD SUBJECTS</button>
            <button onClick={() => setRows(rows.filter((r) => r.id !== rows[rows.length - 1]?.id))}>
              REMOVE LAST
            </button>
          </div>
          {showForm && (
            <div className={styles.addPanel}>
              <label>
                NUMBER OF SUBJECTS
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  placeholder="How many?"
                />
              </label>
              <Button onClick={addRows}>Add to ledger</Button>
            </div>
          )}
        </section>
        <aside className={styles.result}>
          <div className={styles.kicker}>YOUR CALCULATED RESULT</div>
          <div className={styles.big}>{result.cgpa === null ? '—' : result.cgpa.toFixed(2)}</div>
          <div className={styles.caption}>SEMESTER GPA</div>
          <div className={styles.rule} />
          <div className={styles.metric}>
            <span>Credits counted</span>
            <b>{result.credits}</b>
          </div>
          <div className={styles.metric}>
            <span>Weighted grade points</span>
            <b>{result.points}</b>
          </div>
          <div className={styles.metric}>
            <span>Failed subjects excluded</span>
            <b>{result.failed}</b>
          </div>
          <p>
            Formula: Σ (credit × grade point) ÷ Σ counted credits. Failed courses are excluded from
            both totals.
          </p>
        </aside>
      </div>
      <div className={styles.note}>
        GRADE SCALE <span>A+ 10 · A 10 · A− 9 · B 8 · B− 7 · C 6 · C− 7 · F excluded</span>
      </div>
    </>
  );
}
