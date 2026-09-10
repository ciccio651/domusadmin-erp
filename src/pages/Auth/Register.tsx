import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    nome: '', cognome: '', studio: '', email: '', password: '',
  });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  const upd = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password: minimo 6 caratteri'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    toast.success('Account creato — Benvenuto in DomusAdmin!');
    nav('/onboarding');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 15%, #3b82f6 0%, transparent 45%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 45%)' }} />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-display font-black text-xl shadow-md">D</div>
          <div>
            <p className="font-display font-extrabold text-lg">DomusAdmin ERP</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Gestione Condominiale</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight">
            Inizia a gestire<br />il tuo portfolio<br />
            <span className="text-blue-400">condominiale.</span>
          </h1>
          <p className="text-slate-300 max-w-xs leading-relaxed text-[15px]">
            Crea il tuo account gratuito e configura il tuo studio in pochi minuti. Nessuna carta di credito richiesta.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-2 max-w-sm">
            {([['Free', 'Trial 14gg'], ['100+', 'Condomini'], ['PDF', 'Consuntivi']] as [string, string][]).map(([v, l]) => (
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
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-display font-black">D</div>
            <p className="font-display font-extrabold text-lg">DomusAdmin ERP</p>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
              Crea il tuo account
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Hai già un account?{' '}
              <Link to="/login" className="text-blue-700 font-semibold hover:underline">Accedi</Link>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label" htmlFor="reg-nome">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reg-nome" required className="input pl-9"
                    placeholder="Mario" value={form.nome} onChange={upd('nome')}
                    data-testid="register-nome"
                  />
                </div>
              </div>
              <div>
                <label className="input-label" htmlFor="reg-cognome">Cognome</label>
                <input
                  id="reg-cognome" required className="input"
                  placeholder="Rossi" value={form.cognome} onChange={upd('cognome')}
                  data-testid="register-cognome"
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="reg-studio">Nome studio</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-studio" className="input pl-9"
                  placeholder="Studio Domus Rossi" value={form.studio} onChange={upd('studio')}
                  data-testid="register-studio"
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="reg-email">Email professionale</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-email" type="email" required className="input pl-9"
                  placeholder="info@studio.it" value={form.email} onChange={upd('email')}
                  data-testid="register-email"
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-password" type={show ? 'text' : 'password'} required
                  minLength={6} className="input pl-9 pr-10"
                  value={form.password} onChange={upd('password')}
                  data-testid="register-password"
                />
                <button
                  type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Almeno 6 caratteri</p>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full justify-center h-11 text-[15px]"
              data-testid="register-submit"
            >
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creazione account…</span>
                : 'Crea account gratuito'}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Continuando accetti i{' '}
            <button className="underline hover:text-slate-600">Termini di servizio</button>
            {' '}e la{' '}
            <button className="underline hover:text-slate-600">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
}
