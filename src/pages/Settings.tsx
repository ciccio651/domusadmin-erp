import { useState } from 'react';
import {
  Building2, User, Shield, Bell, Save, Eye, EyeOff,
  Mail, Phone, MapPin, Hash, CreditCard, Check,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Section tabs ──────────────────────────────────────────────────────────

type Tab = 'studio' | 'profilo' | 'sicurezza' | 'notifiche';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'studio',    label: 'Studio',     icon: Building2 },
  { id: 'profilo',   label: 'Profilo',    icon: User      },
  { id: 'sicurezza', label: 'Sicurezza',  icon: Shield    },
  { id: 'notifiche', label: 'Notifiche',  icon: Bell      },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function Settings() {
  const [tab, setTab] = useState<Tab>('studio');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="page-header">
        <h1 className="page-title">Impostazioni</h1>
        <p className="page-sub">Gestisci il profilo dello studio e le preferenze dell'applicazione</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            data-testid={`settings-tab-${id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="animate-fade-up">
        {tab === 'studio'    && <StudioTab />}
        {tab === 'profilo'   && <ProfiloTab />}
        {tab === 'sicurezza' && <SicurezzaTab />}
        {tab === 'notifiche' && <NotificheTab />}
      </div>
    </div>
  );
}

// ── Studio Tab ────────────────────────────────────────────────────────────

function StudioTab() {
  const [form, setForm] = useState({
    nome: 'Domus Admin Studio Associato',
    piva: '12345678901',
    cf: 'DMSSSD00A00A000A',
    indirizzo: 'Via Roma 12',
    citta: 'Milano',
    cap: '20121',
    tel: '+39 02 1234567',
    email: 'info@domusadmin.it',
    pec: 'domusadmin@pec.it',
  });

  const upd = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Dati studio salvati');
  };

  return (
    <form onSubmit={save} className="card p-6 space-y-5">
      <h2 className="font-display font-bold text-slate-800">Dati dello studio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="input-label">Nome / Ragione sociale</label>
          <div className="relative mt-1">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" value={form.nome} onChange={upd('nome')} data-testid="settings-nome-studio" />
          </div>
        </div>
        <div>
          <label className="input-label">P.IVA</label>
          <div className="relative mt-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9 font-mono-num" value={form.piva} onChange={upd('piva')} />
          </div>
        </div>
        <div>
          <label className="input-label">Codice Fiscale</label>
          <div className="relative mt-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9 font-mono-num" value={form.cf} onChange={upd('cf')} />
          </div>
        </div>
        <div>
          <label className="input-label">Indirizzo</label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" value={form.indirizzo} onChange={upd('indirizzo')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Città</label>
            <input className="input mt-1" value={form.citta} onChange={upd('citta')} />
          </div>
          <div>
            <label className="input-label">CAP</label>
            <input className="input mt-1 font-mono-num" value={form.cap} onChange={upd('cap')} maxLength={5} />
          </div>
        </div>
        <div>
          <label className="input-label">Telefono</label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9 font-mono-num" value={form.tel} onChange={upd('tel')} />
          </div>
        </div>
        <div>
          <label className="input-label">Email</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" type="email" value={form.email} onChange={upd('email')} />
          </div>
        </div>
        <div>
          <label className="input-label">PEC</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" value={form.pec} onChange={upd('pec')} />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button type="submit" className="btn-primary" data-testid="btn-save-studio">
          <Save className="w-4 h-4" /> Salva modifiche
        </button>
      </div>
    </form>
  );
}

// ── Profilo Tab ───────────────────────────────────────────────────────────

function ProfiloTab() {
  const [form, setForm] = useState({
    nome: 'Amministratore',
    cognome: 'Principale',
    email: 'admin@domusadmin.it',
    ruolo: 'Amministratore di condominio',
  });
  const upd = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={e => { e.preventDefault(); toast.success('Profilo aggiornato'); }} className="card p-6 space-y-5">
      <h2 className="font-display font-bold text-slate-800">Dati personali</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center text-white font-display font-black text-2xl shrink-0">
          {form.nome.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{form.nome} {form.cognome}</p>
          <p className="text-sm text-slate-500">{form.ruolo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="input-label">Nome</label>
          <input className="input mt-1" value={form.nome} onChange={upd('nome')} />
        </div>
        <div>
          <label className="input-label">Cognome</label>
          <input className="input mt-1" value={form.cognome} onChange={upd('cognome')} />
        </div>
        <div className="md:col-span-2">
          <label className="input-label">Email</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" type="email" value={form.email} onChange={upd('email')} />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="input-label">Ruolo</label>
          <input className="input mt-1" value={form.ruolo} onChange={upd('ruolo')} />
        </div>
      </div>
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> Salva</button>
      </div>
    </form>
  );
}

// ── Sicurezza Tab ─────────────────────────────────────────────────────────

function SicurezzaTab() {
  const [show, setShow] = useState({ curr: false, new1: false, new2: false });
  const [pwd, setPwd] = useState({ curr: '', new1: '', new2: '' });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.new1 !== pwd.new2) { toast.error('Le password non coincidono'); return; }
    if (pwd.new1.length < 8)   { toast.error('Minimo 8 caratteri'); return; }
    toast.success('Password aggiornata');
    setPwd({ curr: '', new1: '', new2: '' });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="card p-6 space-y-4">
        <h2 className="font-display font-bold text-slate-800">Cambia password</h2>
        {(['curr', 'new1', 'new2'] as const).map((k, i) => {
          const labels = ['Password attuale', 'Nuova password', 'Conferma nuova password'];
          return (
            <div key={k}>
              <label className="input-label">{labels[i]}</label>
              <div className="relative mt-1">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input pl-9 pr-10"
                  type={show[k] ? 'text' : 'password'}
                  value={pwd[k]}
                  onChange={e => setPwd({ ...pwd, [k]: e.target.value })}
                  minLength={k !== 'curr' ? 8 : undefined}
                  data-testid={`pwd-${k}`}
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, [k]: !show[k] })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show[k] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button type="submit" className="btn-primary"><Save className="w-4 h-4" /> Aggiorna password</button>
        </div>
      </form>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-800">Autenticazione a due fattori</h3>
            <p className="text-sm text-slate-500 mt-1">Aggiungi un livello di sicurezza aggiuntivo all'account</p>
          </div>
          <button
            className="btn-secondary text-xs"
            onClick={() => toast.info('2FA — funzionalità in arrivo')}
          >
            <CreditCard className="w-3.5 h-3.5" /> Attiva 2FA
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Notifiche Tab ─────────────────────────────────────────────────────────

type PrefKey = 'scadenze_rate' | 'nuovi_movimenti' | 'report_mensile' | 'solleciti_auto' | 'verbali';

const NOTIF_ITEMS: { key: PrefKey; label: string; desc: string }[] = [
  { key: 'scadenze_rate',    label: 'Scadenze rate',         desc: 'Avviso email 7 giorni prima della scadenza delle rate' },
  { key: 'nuovi_movimenti',  label: 'Nuovi movimenti',       desc: 'Notifica per ogni nuovo movimento bancario registrato' },
  { key: 'report_mensile',   label: 'Report mensile',        desc: 'Riepilogo mensile di entrate, uscite e debiti' },
  { key: 'solleciti_auto',   label: 'Solleciti automatici',  desc: 'Invia sollecito automatico dopo 30 giorni di ritardo' },
  { key: 'verbali',          label: 'Verbali assemblea',     desc: 'Notifica quando un verbale è pronto per la firma' },
];

function NotificheTab() {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    scadenze_rate: true, nuovi_movimenti: false,
    report_mensile: true, solleciti_auto: false, verbali: true,
  });

  const toggle = (k: PrefKey) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="card p-6 space-y-1">
      <h2 className="font-display font-bold text-slate-800 mb-4">Preferenze notifiche</h2>
      {NOTIF_ITEMS.map(({ key, label, desc }) => (
        <div
          key={key}
          className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0"
        >
          <div className="flex-1 pr-6">
            <p className="font-semibold text-slate-700 text-sm">{label}</p>
            <p className="text-[12px] text-slate-400 mt-0.5">{desc}</p>
          </div>
          <button
            onClick={() => {
              toggle(key);
              toast.success(`${label}: ${!prefs[key] ? 'attivato' : 'disattivato'}`);
            }}
            data-testid={`toggle-notif-${key}`}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200
              ${prefs[key] ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform duration-200
              ${prefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
            {prefs[key] && (
              <Check className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-white" />
            )}
          </button>
        </div>
      ))}
      <div className="flex justify-end pt-4">
        <button className="btn-primary" onClick={() => toast.success('Preferenze notifiche salvate')}>
          <Save className="w-4 h-4" /> Salva preferenze
        </button>
      </div>
    </div>
  );
}
