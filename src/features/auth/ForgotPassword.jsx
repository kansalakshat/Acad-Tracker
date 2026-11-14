import { useState } from "react";
import AuthFrame from "./AuthFrame";
import Field from "../../components/Field";
import Button from "../../components/Button";
import styles from "./Auth.module.css";
export default function ForgotPassword({ onBack }) {
  const [email,setEmail]=useState("");const [sent,setSent]=useState(false);const [error,setError]=useState("");
  const submit=e=>{e.preventDefault();if(!email.toLowerCase().endsWith("@iitbhilai.ac.in")){setError("Enter your institute email address.");return;}setError("");setSent(true);};
  return <AuthFrame title="Recover Access" subtitle="We will help you return to your studies">{sent?<p className={styles.success}>If this address belongs to an account, password reset instructions will be sent by the backend service.</p>:<form className={styles.form} onSubmit={submit}><Field label="INSTITUTE EMAIL" type="email" placeholder="name@iitbhilai.ac.in" value={email} onChange={e=>setEmail(e.target.value)} required/>{error&&<p className={styles.error}>{error}</p>}<Button type="submit">Send Reset Link</Button></form>}<div className={styles.switch}><button className={styles.textButton} onClick={onBack}>Return to sign in</button></div></AuthFrame>;
}