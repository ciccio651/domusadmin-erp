import { FileBarChart2, FileCheck2, Mail, ClipboardList, Receipt, FileText, Gavel, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const DOCS = [
  {
    icon: FileBarChart2,
    title: 'Bilancio Consuntivo Annuale',
    desc: 'Consuntivo di esercizio con ripartizione millesimi proprietà, ascensore e riscaldamento.',
    link: '/consuntivi',
    linkLabel: 'Vai ai consuntivi →',
    status: 'disponibile',
  },
  {
    icon: Mail,
    title: 'Sollecito di Pagamento',
    desc: 'Lettera di sollecito a 3 livelli: bonario, secondo avviso, diffida ad adempiere.',
    link: '/debiti',
    linkLabel: 'Vai ai debiti →',
    status: 'disponibile',
  },
  {
    icon: Gavel,
    title: 'Ingiunzione Recupero Crediti',
    desc: 'Atto di messa in mora e diffida formale con avviso di procedura legale.',
    link: '/debiti',
    linkLabel: 'Genera da Debiti →',
    status: 'disponibile',
  },
  {
    icon: ClipboardList,
    title: 'Verbale di Assemblea',
    desc: 'Modello standard per verbale di assemblea ordinaria e straordinaria.',
    link: null,
    status: 'in_arrivo',
  },
  {
    icon: FileCheck2,
    title: 'Convocazione Assemblea',
    desc: 'Convocazione con ordine del giorno e modalità di voto.',
    link: null,
    status: 'in_arrivo',
  },
  {
    icon: Receipt,
    title: 'Estratto Conto Individuale',
    desc: 'Situazione contabile per singolo condòmino: rate, pagamenti, saldo.',
    link: null,
    status: 'in_arrivo',
  },
  {
    icon: FileText,
    title: 'Detrazioni Fiscali 50%/65%',
    desc: 'Certificazione lavori edili per detrazioni IRPEF su interventi agevolati.',
    link: null,
    status: 'in_arrivo',
  },
  {
    icon: BookOpen,
    title: 'Tabella Millesimi',
    desc: 'Stampa delle tabelle millesimali allegate al regolamento condominiale.',
    link: null,
    status: 'in_arrivo',
  },
];

export default function Modulistica() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Modulistica & PDF</h1>
        <p className="page-sub">Documenti ufficiali pronti per la stampa e la trasmissione</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DOCS.map(doc => (
          <div
            key={doc.title}
            className={`card p-5 group transition-all hover:shadow-card-md
              ${doc.status === 'disponibile'
                ? 'hover:border-blue-300 cursor-pointer'
                : 'opacity-70'}`}
            data-testid={`doc-${doc.title.toLowerCase().replace(/[\s&/]+/g, '-')}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                ${doc.status === 'disponibile'
                  ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                  : 'bg-slate-100 text-slate-400'}`}>
                <doc.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-slate-800 text-sm leading-tight">{doc.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{doc.desc}</p>

                <div className="mt-3">
                  {doc.status === 'disponibile' && doc.link ? (
                    <Link to={doc.link} className="text-xs font-bold text-blue-700 hover:underline">
                      {doc.linkLabel}
                    </Link>
                  ) : (
                    <span className="badge badge-amber">In arrivo</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-slate-900 text-white border-slate-700">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
            <Gavel className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white">Connessione con studi legali</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              DomusAdmin supporta la generazione di memorie difensive, atti di diffida e
              istanze di decreto ingiuntivo per il recupero crediti condominiali, da inviare
              direttamente agli avvocati convenzionati. <span className="text-blue-400">Funzione in sviluppo.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
