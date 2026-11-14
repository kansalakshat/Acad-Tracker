import { useState } from 'react';
import AuthFrame from './AuthFrame';
import Field from '../../components/Field';
import Button from '../../components/Button';
import styles from './Auth.module.css';

export default function Login({ onLogin, onSignup, onForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const message = onLogin({
      email,
      password,
      name: email
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    });
    setError(message);
  };
  return (
    <AuthFrame title="Welcome Back" subtitle="Return to your place of learning">
      <form className={styles.form} onSubmit={submit}>
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
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className={styles.row}>
          <button type="button" className={styles.textButton} onClick={onForgot}>
            Forgot password?
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit">Enter the Hall</Button>
      </form>
      <div className={styles.switch}>
        New to Academia?{' '}
        <button className={styles.textButton} onClick={onSignup}>
          Create an account
        </button>
      </div>
    </AuthFrame>
  );
}
