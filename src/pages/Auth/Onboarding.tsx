import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { newId, nowIso } from '@/utils/helpers';

// ── Types ─────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

// ── Component ─────────────────────────────────────────────────────────────

export default function Onboarding() {
  const nav = useNavigate();
  const { addCondominio } = useStore();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [studio, setStudio] = useState({
    nome: '', piva: '', indirizzo: '', citta: '', cap: '',
  });
  const [condo, setCondo] = useState({
    nome: '', indirizzo: '', citta: '', cap: '', n_unita: '',
  });

  const updStudio = (k: keyof typeof studio) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setStudio({ ...studio, [k]: e.target.value });
  const updCondo = (k: keyof typeof condo) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setCondo({ ...condo, [k]: e.target.value });

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    // Add the first condominium
    addCondominio({
      id: newId(),
      nome: condo.nome,
      indirizzo: condo.indirizzo,
      citta: condo.citta,
      cap: condo.cap,
      n_unita: Number(condo.n_unita) || 1,
      created_at: nowIso(),
    });
    setLoading(false);
    setStep(3);
  };

  const finish = () => {
    toast.success(`Benvenuto in DomusAdmin! Studio "${studio.nome || 'Principale'}" configurato.`);
    nav('/');
  };

  const STEPS = [
    { n: 1, label: 'Studio' },
    { n: 2, label: 'Condominio' },
    { n: 3, label: 'Completato' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-display font-black text-lg shadow-md">
            D
          </div>
          <div>
            <p className="font-display font-extrabold text-slate-900">DomusAdmin ERP</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Configurazione iniziale</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                ${step === s.n ? 'bg-slate-900 text-white' :
                  step > s.n ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
              >
                {step > s.n ? <CheckCircle className="w-4 h-4" /> : <span className="w-5 text-center">{s.n}</span>}
                <span>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${step > s.n ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Studio ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="card p-7 space-y-5 animate-fade-up">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h1 className="font-display font-bold text-slate-900">Configura il tuo studio</h1>
                <p className="text-xs text-slate-400">Inserisci i dati principali dello studio</p>
              </div>
            </div>

            <div>
              <label className="input-label">Nome / Ragione sociale *</label>
              <input
                required className="input mt-1"
                placeholder="Studio Rossi Amministrazioni"
                value={studio.nome} onChange={updStudio('nome')}
                data-testid="onboard-nome-studio"
              />
            </div>
            <div>
              <label className="input-label">P.IVA</label>
              <input
                className="input mt-1 font-mono-num"
                placeholder="12345678901" maxLength={11}
                value={studio.piva} onChange={updStudio('piva')}
                data-testid="onboard-piva"
              />
            </div>
            <div>
              <label className="input-label">Indirizzo sede</label>
              <input
                className="input mt-1"
                placeholder="Via Roma 12"
                value={studio.indirizzo} onChange={updStudio('indirizzo')}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="input-label">Città</label>
                <input className="input mt-1" placeholder="Milano" value={studio.citta} onChange={updStudio('citta')} />
              </div>
              <div>
                <label className="input-label">CAP</label>
                <input className="input mt-1 font-mono-num" placeholder="20121" maxLength={5} value={studio.cap} onChange={updStudio('cap')} />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center h-11" data-testid="onboard-next-1">
              Avanti <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ── Step 2: Primo condominio ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="card p-7 space-y-5 animate-fade-up">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h1 className="font-display font-bold text-slate-900">Aggiungi il primo condominio</h1>
                <p className="text-xs text-slate-400">Potrai aggiungerne altri in qualsiasi momento</p>
              </div>
            </div>

            <div>
              <label className="input-label">Nome condominio *</label>
              <input
                required className="input mt-1"
                placeholder="Condominio Via Manzoni 8"
                value={condo.nome} onChange={updCondo('nome')}
                data-testid="onboard-nome-condo"
              />
            </div>
            <div>
              <label className="input-label">Indirizzo *</label>
              <input
                required className="input mt-1"
                placeholder="Via Alessandro Manzoni 8"
                value={condo.indirizzo} onChange={updCondo('indirizzo')}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="input-label">Città *</label>
                <input required className="input mt-1" placeholder="Milano" value={condo.citta} onChange={updCondo('citta')} />
              </div>
              <div>
                <label className="input-label">CAP</label>
                <input className="input mt-1 font-mono-num" placeholder="20121" maxLength={5} value={condo.cap} onChange={updCondo('cap')} />
              </div>
            </div>
            <div>
              <label className="input-label">Numero unità abitative</label>
              <input
                className="input mt-1 font-mono-num" type="number" min={1}
                placeholder="12" value={condo.n_unita} onChange={updCondo('n_unita')}
                data-testid="onboard-n-unita"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button" onClick={() => setStep(1)}
                className="btn-secondary flex-1 justify-center"
              >
                <ArrowLeft className="w-4 h-4" /> Indietro
              </button>
              <button
                type="submit" disabled={loading}
                className="btn-primary flex-[2] justify-center h-11"
                data-testid="onboard-next-2"
              >
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvataggio…</span>
                  : <>Crea condominio <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Completato ── */}
        {step === 3 && (
          <div className="card p-10 text-center space-y-5 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-slate-900">Configurazione completata!</h1>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Il tuo studio <strong>{studio.nome || 'DomusAdmin'}</strong> è pronto.<br />
                Il condominio <strong>{condo.nome}</strong> è stato aggiunto al gestionale.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 py-3">
              {[
                ['Dashboard', 'Panoramica completa'],
                ['Condomini', 'Gestisci le proprietà'],
                ['Spese', 'Traccia i costi'],
              ].map(([t, d]) => (
                <div key={t} className="bg-slate-50 rounded-xl p-3 text-left">
                  <p className="font-display font-bold text-slate-800 text-sm">{t}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{d}</p>
                </div>
              ))}
            </div>
            <button
              onClick={finish}
              className="btn-primary w-full justify-center h-11 text-[15px]"
              data-testid="onboard-finish"
            >
              Entra in DomusAdmin <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
