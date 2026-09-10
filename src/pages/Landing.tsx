import { Link } from 'react-router-dom';
import {
  Scale, FileText, ShieldCheck, Sparkles, ArrowRight,
  Clock, Award, Gavel, CheckSquare,
} from 'lucide-react';

const HERO_IMG = 'https://images.unsplash.com/photo-1742981365880-698cfb84492d?crop=entropy&cs=srgb&fm=jpg&q=85';

const FEATURES = [
  { icon: Sparkles,    title: 'AI Draft Engine',          body: 'Claude Sonnet 5 genera bozze in 30-60 s su corpus giuridico italiano.' },
  { icon: FileText,    title: 'Template per Tribunale',   body: 'Milano, Roma, Napoli, Torino, Bologna. Formati e prassi locali.' },
  { icon: CheckSquare, title: 'Checklist Procedurale',    body: 'Termini processuali, marche da bollo, requisiti PCT: nulla lasciato al caso.' },
  { icon: Gavel,       title: 'Giurisprudenza Citata',    body: 'Massime Cassazione e merito pertinenti, con avviso di verifica.' },
  { icon: ShieldCheck, title: 'Document Vault',           body: 'Upload sicuro contratti, fatture, PEC. Cifratura at-rest.' },
  { icon: FileText,    title: 'Export PDF + XML PCT',     body: 'File pronti per deposito su Consolle Avvocato con DatiAtto.xml.' },
];

const PLANS = [
  {
    name: 'Solo Practitioner', price: '199',
    features: ['1 utente', '30 atti / mese', 'Template base', 'Export PDF + XML', 'Email support'],
  },
  {
    name: 'Studio Pro', price: '349', popular: true,
    features: ['Fino a 5 utenti', 'Atti illimitati', 'Tutti i template', 'Giurisprudenza estesa', 'Priority support'],
  },
  {
    name: 'Studio Enterprise', price: '699',
    features: ['Fino a 15 utenti', 'Template custom', 'Onboarding dedicato', 'SLA 99.9%', 'Account manager'],
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] font-sans">

      {/* ── Nav ── */}
      <nav className="border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
            <div className="flex items-center justify-center w-7 h-7 bg-navy-900 rounded">
              <Scale className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-serif text-xl text-navy-900 font-semibold tracking-tight">
              LegalDraft<span className="text-legal-gold">.it</span>
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <a href="#features" className="text-gray-600 hover:text-navy-900 transition-colors">Funzionalità</a>
            <a href="#pricing"  className="text-gray-600 hover:text-navy-900 transition-colors">Prezzi</a>
            <Link to="/login"   className="text-gray-600 hover:text-navy-900 transition-colors" data-testid="nav-login-link">Accedi</Link>
            <Link to="/register" data-testid="nav-cta-trial">
              <button className="btn-primary text-sm py-1.5">Prova 14 giorni</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-legal-gold mb-6">
            <span className="w-8 h-px bg-legal-gold" /> AI per lo studio legale italiano
          </div>
          <h1 className="font-serif text-5xl lg:text-6xl text-navy-900 leading-[1.05] mb-6">
            Redigi atti in <em>minuti</em>,<br />non in ore.
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
            Decreti ingiuntivi, diffide, ricorsi lavoro, comparse. LegalDraft assiste l'avvocato con bozze conformi alla prassi del tribunale competente, giurisprudenza citata e checklist procedurale PCT.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/register" data-testid="hero-cta-trial">
              <button className="btn-primary h-12 px-8 text-base">
                Inizia 14 giorni gratis <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#features" className="text-navy-700 underline underline-offset-4 text-sm" data-testid="hero-features-link">
              Vedi come funziona
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Nessuna carta richiesta</div>
            <div className="flex items-center gap-2"><Award className="w-4 h-4" /> Sviluppato con avvocati italiani</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-navy-900/5 rounded-lg" />
          <img
            src={HERO_IMG}
            alt="Studio legale professionale"
            className="relative rounded-lg shadow-xl object-cover w-full h-[500px]"
          />
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-md shadow-card-md border border-gray-200 max-w-xs">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-legal-gold mb-1">
              <Clock className="w-3 h-3" /> Risparmio medio
            </div>
            <div className="font-serif text-2xl text-navy-900">5-10 ore / settimana</div>
            <div className="text-xs text-gray-500 mt-1">Su un volume di 15-20 atti standard mensili</div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-gray-200 bg-white py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="max-w-2xl mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-legal-gold mb-4">Prodotto</div>
            <h2 className="font-serif text-4xl text-navy-900 mb-4">Progettato attorno al tuo workflow</h2>
            <p className="text-gray-600">Non un LLM generico. Una piattaforma tarata sulla prassi dei tribunali italiani, con export PCT pronto per Consolle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="border border-gray-200 p-8 hover:border-navy-700 transition-colors" data-testid={`feature-${i}`}>
                <f.icon className="w-6 h-6 text-navy-900 mb-6" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI ── */}
      <section className="bg-navy-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-legal-goldlt mb-4">Ritorno sull'investimento</div>
            <h2 className="font-serif text-4xl mb-6">Un decreto ingiuntivo ti costa 2-4 ore.</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Fatturi 300-800€ per atto ma il vero costo è il tempo tolto ad attività ad alto valore: udienze, clienti, pareri. LegalDraft riporta quelle ore dove servono.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: '170k+', v: 'avvocati in Italia' },
              { k: '70%',   v: 'in studi < 3 persone' },
              { k: '5-10h', v: 'risparmio settimanale' },
              { k: '40%',   v: 'trial → paying rate' },
            ].map((s, i) => (
              <div key={i} className="border border-white/20 p-8">
                <div className="font-serif text-4xl text-legal-goldlt mb-1">{s.k}</div>
                <div className="text-sm text-white/60">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-legal-gold mb-4">Piani</div>
            <h2 className="font-serif text-4xl text-navy-900">Un prezzo per ogni dimensione di studio</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <div
                key={i}
                className={`border p-8 relative ${p.popular ? 'border-navy-900 border-2' : 'border-gray-200'}`}
                data-testid={`pricing-${p.name.toLowerCase().replace(/ /g, '-')}`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-8 bg-legal-gold text-white text-xs px-3 py-1 uppercase tracking-widest">
                    Consigliato
                  </div>
                )}
                <div className="text-sm uppercase tracking-widest text-gray-400 mb-2">{p.name}</div>
                <div className="mb-6">
                  <span className="font-serif text-5xl text-navy-900">€{p.price}</span>
                  <span className="text-gray-500 text-sm">/mese</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex gap-2 items-start text-sm text-gray-700">
                      <CheckSquare className="w-4 h-4 text-navy-900 mt-0.5 shrink-0" strokeWidth={1.5} /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" data-testid={`pricing-cta-${i}`}>
                  <button className="btn-primary w-full justify-center">Inizia trial</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-navy-900" />
            <span className="font-serif text-navy-900">LegalDraft.it</span>
          </div>
          <p className="text-xs text-gray-400 max-w-lg text-right">
            © 2026 LegalDraft IT — Assistente AI, non sostituisce l'avvocato. La responsabilità dell'atto resta del professionista.
          </p>
        </div>
      </footer>
    </div>
  );
}
