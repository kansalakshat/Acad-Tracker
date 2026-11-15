import { useEffect, useState } from 'react';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import ForgotPassword from './features/auth/ForgotPassword';
import Onboarding from './features/onboarding/Onboarding';
import Dashboard from './features/dashboard/Dashboard';
import CGPA from './features/cgpa/CGPA';
import Attendance from './features/attendance/Attendance';
import Planner from './features/planner/Planner';
import Archive from './features/archive/Archive';
import Account from './features/account/Account';
import Shell from './components/Shell';
import { api, getToken, setToken, loadProfile, syncSubjects } from './api';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [page, setPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');
  const [reconfiguring, setReconfiguring] = useState(false);

  const signOut = () => {
    setToken(null);
    setProfile(null);
    setAuthPage('login');
    setPage('dashboard');
  };

  useEffect(() => {
    window.addEventListener('academia-logout', signOut);
    if (getToken())
      loadProfile()
        .then(setProfile)
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    return () => window.removeEventListener('academia-logout', signOut);
  }, []);

  const authenticate = async (path, body) => {
    if (!body.email.toLowerCase().endsWith('@iitbhilai.ac.in'))
      return 'Use your @iitbhilai.ac.in email address.';
    try {
      const { token } = await api(path, { method: 'POST', body });
      setToken(token);
      setProfile(await loadProfile());
      return '';
    } catch (error) {
      return error.message;
    }
  };

  const updateProfile = (patch) => setProfile((current) => ({ ...current, ...patch }));

  const completeSetup = async ({ semester, subjects, timetable }) => {
    try {
      await api('/auth/me', { method: 'PATCH', body: { semester } });
      const saved = await syncSubjects(profile.subjects, subjects);
      // Onboarding refers to subjects by code (new ones have no id yet).
      const idFor = (ref) => saved.find((s) => s.id === ref || s.code === ref)?.id;
      const slots = timetable
        .map((t) => ({ course_id: idFor(t.subjectId), weekday: t.day, start_time: t.time }))
        .filter((t) => t.course_id);
      await api('/timetable', { method: 'PUT', body: { slots } });
      setProfile(await loadProfile());
      setReconfiguring(false);
      setPage('dashboard');
      return '';
    } catch (error) {
      return error.message;
    }
  };

  if (loading) return null;

  if (!profile) {
    if (authPage === 'signup')
      return (
        <Signup
          onBack={() => setAuthPage('login')}
          onCreate={(account) => authenticate('/auth/register', account)}
          onLogin={() => setAuthPage('login')}
        />
      );
    if (authPage === 'forgot') return <ForgotPassword onBack={() => setAuthPage('login')} />;
    return (
      <Login
        onLogin={(account) => authenticate('/auth/login', account)}
        onSignup={() => setAuthPage('signup')}
        onForgot={() => setAuthPage('forgot')}
      />
    );
  }

  if (reconfiguring || !profile.subjects.length)
    return <Onboarding profile={profile} onComplete={completeSetup} />;

  const user = { name: profile.name, email: profile.email };
  const content = {
    dashboard: <Dashboard profile={profile} onNavigate={setPage} />,
    cgpa: <CGPA subjects={profile.subjects} />,
    attendance: <Attendance profile={profile} />,
    planner: <Planner profile={profile} onUpdate={updateProfile} />,
    archive: <Archive profile={profile} />,
    account: (
      <Account
        profile={profile}
        onUpdate={updateProfile}
        onSignOut={signOut}
        onReconfigure={() => setReconfiguring(true)}
      />
    ),
  }[page] || <Dashboard profile={profile} onNavigate={setPage} />;

  return (
    <Shell page={page} onNavigate={setPage} user={user}>
      {content}
    </Shell>
  );
}
