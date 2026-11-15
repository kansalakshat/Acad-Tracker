import { useState } from 'react';
import AuthFrame from './AuthFrame';
import Field from '../../components/Field';
import Button from '../../components/Button';
import styles from './Auth.module.css';

export default function Signup({ onBack, onCreate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@iitbhilai.ac.in')) {
      setError('Registration is restricted to @iitbhilai.ac.in addresses.');
      return;
    }
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    const message = await onCreate({ name, email, password });
    setBusy(false);
    setError(message);
  };
  return (
    <AuthFrame title="Join the Chronicle" subtitle="A place for every scholar">
      <form className={styles.form} onSubmit={submit}>
        <Field
          label="FULL NAME"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Field
          label="INSTITUTE EMAIL"
          type="email"
          placeholder="name@iitbhilai.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="PASSWORD"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" disabled={busy}>
          Create Account
        </Button>
      </form>
      <div className={styles.switch}>
        Already registered?{' '}
        <button className={styles.textButton} onClick={onBack}>
          Sign in
        </button>
      </div>
    </AuthFrame>
  );
}
