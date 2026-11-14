import { useEffect, useMemo, useState } from 'react';
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
import { initialEvents, initialSubjects } from './data';

const starter = {
  name: 'Divyansh Kori',
  email: 'divyansh@iitbhilai.ac.in',
  semester: 3,
  subjects: initialSubjects,
  timetable: [
    { id: 't1', subjectId: 's1', day: 'Monday', time: '09:00' },
    { id: 't2', subjectId: 's2', day: 'Monday', time: '11:00' },
    { id: 't3', subjectId: 's3', day: 'Tuesday', time: '10:00' },
    { id: 't4', subjectId: 's1', day: 'Wednesday', time: '09:00' },
    { id: 't5', subjectId: 's4', day: 'Thursday', time: '14:00' },
    { id: 't6', subjectId: 's2', day: 'Friday', time: '11:00' },
  ],
  events: initialEvents,
  history: [],
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('academia-user'));
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('academia-profile')) || starter;
    } catch {
      return starter;
    }
  });
  const [ready, setReady] = useState(() => localStorage.getItem('academia-ready') === 'true');

  useEffect(() => {
    if (user) localStorage.setItem('academia-user', JSON.stringify(user));
    else localStorage.removeItem('academia-user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('academia-profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (patch) => setProfile((current) => ({ ...current, ...patch }));
  const signIn = (account) => {
    if (!account.email.toLowerCase().endsWith('@iitbhilai.ac.in'))
      return 'Use your @iitbhilai.ac.in email address.';
    setUser(account);
    setProfile((current) => ({
      ...current,
      name: account.name || current.name,
      email: account.email,
    }));
    return '';
  };
  const completeSetup = (details) => {
    setProfile((current) => ({ ...current, ...details }));
    setReady(true);
    localStorage.setItem('academia-ready', 'true');
    setPage('dashboard');
  };
  const signOut = () => {
    setUser(null);
    setAuthPage('login');
    setPage('dashboard');
  };

  if (!user) {
    if (authPage === 'signup')
      return (
        <Signup
          onBack={() => setAuthPage('login')}
          onCreate={signIn}
          onLogin={() => setAuthPage('login')}
        />
      );
    if (authPage === 'forgot') return <ForgotPassword onBack={() => setAuthPage('login')} />;
    return (
      <Login
        onLogin={signIn}
        onSignup={() => setAuthPage('signup')}
        onForgot={() => setAuthPage('forgot')}
      />
    );
  }

  if (!ready) return <Onboarding profile={profile} onComplete={completeSetup} />;

  const content = {
    dashboard: <Dashboard profile={profile} onNavigate={setPage} />,
    cgpa: <CGPA subjects={profile.subjects} />,
    attendance: <Attendance profile={profile} onUpdate={updateProfile} />,
    planner: <Planner profile={profile} onUpdate={updateProfile} />,
    archive: <Archive profile={profile} />,
    account: (
      <Account
        profile={profile}
        onUpdate={updateProfile}
        onSignOut={signOut}
        onReconfigure={() => {
          setReady(false);
          localStorage.removeItem('academia-ready');
        }}
      />
    ),
  }[page] || <Dashboard profile={profile} onNavigate={setPage} />;

  return (
    <Shell page={page} onNavigate={setPage} user={user}>
      {content}
    </Shell>
  );
}
