import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail]       = useState('admin@domusadmin.it');
  const [password, setPassword] = useState('Admin2026!');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulated auth
    setTimeout(() => {
      setLoading(false);
      if (email && password.length >= 6) {
        toast.success('Accesso effettuato — Benvenuto in DomusAdmin!');
        nav('/');
      } else {
        toast.error('Credenziali non valide');
      }
    }, 700);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.07]"
             style={{ backgroundImage: 'radial-gradient(circle at 25% 10%, #3b82f6 0%, transparent 45%), radial-gradient(circle at 75% 80%, #1e40af 0%, transparent 45%)' }} />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-display font-black text-xl shadow-md">D</div>
            <div>
              <p className="font-display font-extrabold text-lg">DomusAdmin ERP</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Gestione Condominiale</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          <h1 className="font-display text-5xl font-black leading-[1.1] tracking-tight">
            Gestisci il tuo<br/>studio con<br/>
            <span className="text-blue-400">precisione.</span>
          </h1>
          <p className="text-slate-300 max-w-sm leading-relaxed text-[15px]">
            Oltre 100 condomini, millesimi, consuntivi annuali,
            solleciti di pagamento e fornitori — tutto in un'unica piattaforma.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-4 max-w-sm">
            {([
              ['104+', 'Condomini'],
              ['1.900+', 'Unità'],
              ['PDF', 'Consuntivi'],
            ] as [string,string][]).map(([v,l]) => (
              <div key={l} className="border-l-2 border-blue-500 pl-3">
                <p className="font-mono-num text-2xl font-black">{v}</p>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© 2026 DomusAdmin ERP — Gestione Amministrativa Condominiale</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-display font-black">D</div>
            <p className="font-display font-extrabold text-lg">DomusAdmin ERP</p>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
              Accedi al gestionale
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Inserisci le tue credenziali per accedere al pannello di amministrazione.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="input-label" htmlFor="email">Indirizzo email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email" type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="amministratore@studio.it"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="input-label" htmlFor="password">Password</label>
                <button type="button" className="text-xs text-blue-700 hover:underline">
                  Password dimenticata?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password" type={show ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full justify-center h-11 text-[15px]"
              data-testid="btn-login"
            >
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Accesso…</span>
                : 'Accedi'}
            </button>
          </form>

          <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-700 mb-2">Credenziali demo</p>
            <p>📧 <span className="font-mono-num">admin@domusadmin.it</span></p>
            <p>🔑 <span className="font-mono-num">Admin2026!</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
