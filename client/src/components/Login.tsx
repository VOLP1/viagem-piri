import { useMemo, useState } from 'react';
import { UserRound } from 'lucide-react';

type LoginProps = {
  onLoggedIn: (userName: string) => void;
};

const STORAGE_KEY = 'pirimatch_user_name';

export default function Login({ onLoggedIn }: LoginProps) {
  const initial = useMemo(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? saved : '';
  }, []);

  const [name, setName] = useState<string>(initial);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Digite seu nome para continuar.');
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    onLoggedIn(trimmed);
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/50 border border-slate-800 shadow-2xl p-6 backdrop-blur pm-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-slate-950/40 border border-slate-200/10 grid place-items-center">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">PiriMatch</h1>
            <p className="text-slate-300 text-sm">Vote nas cachoeiras como no Tinder</p>
          </div>
        </div>

        <label className="block text-sm text-slate-200 mb-2">Qual seu nome?</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          className="w-full rounded-2xl bg-slate-950/50 border border-slate-200/10 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300/30 transition"
          placeholder="Ex: Edu"
          autoFocus
        />

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

        <button
          onClick={submit}
          className="mt-6 w-full rounded-2xl bg-white text-slate-950 font-semibold py-3 hover:bg-slate-200 active:scale-[0.99] transition"
        >
          Entrar
        </button>

        <p className="mt-4 text-xs text-slate-400">Seu nome fica salvo no navegador.</p>
      </div>
      </div>
    </div>
  );
}
