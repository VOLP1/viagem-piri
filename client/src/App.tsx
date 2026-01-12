import { useEffect, useState } from 'react';
import Login from './components/Login';
import SwipeDeck from './components/SwipeDeck';

const STORAGE_KEY = 'pirimatch_user_name';

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setUserName(saved && saved.trim() ? saved : null);
  }, []);

  if (!userName) {
    return (
      <Login
        onLoggedIn={(name) => {
          setUserName(name);
        }}
      />
    );
  }

  return <SwipeDeck userName={userName} />;
}
