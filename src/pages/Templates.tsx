import { useState } from 'react';
import {
  FileText, Copy, CheckCircle, Star, Clock, Users,
  MessageSquare, FileBarChart2, Banknote,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types & data ──────────────────────────────────────────────────────────

type CatTemplate = 'assemblea' | 'pagamenti' | 'fornitori' | 'contabilita' | 'comunicazioni';

interface Template {
  id: string;
  nome: string;
  descrizione: string;
  categoria: CatTemplate;
  utilizzi: number;
  aggiornato: string;
  featured?: boolean;
}

const CAT_LABEL: Record<CatTemplate, string> = {
  assemblea:      'Assemblea',
  pagamenti:      'Pagamenti',
  fornitori:      'Fornitori',
  contabilita:    'Contabilità',
  comunicazioni:  'Comunicazioni',
};

const CAT_BADGE: Record<CatTemplate, string> = {
  assemblea:     'badge badge-blue',
  pagamenti:     'badge badge-red',
  fornitori:     'badge badge-slate',
  contabilita:   'badge badge-amber',
  comunicazioni: 'badge badge-green',
};

const CAT_ICON: Record<CatTemplate, React.ElementType> = {
  assemblea:    Users,
  pagamenti:    Banknote,
  fornitori:    FileText,
  contabilita:  FileBarChart2,
  comunicazioni:MessageSquare,
};

const TEMPLATES: Template[] = [
  {
    id: 't1', nome: 'Verbale Assemblea Ordinaria', categoria: 'assemblea', utilizzi: 48,
    aggiornato: '2025-04-01', featured: true,
    descrizione: 'Schema completo per verbale di assemblea ordinaria annuale con ordine del giorno, presenze e delibere.',
  },
  {
    id: 't2', nome: 'Verbale Assemblea Straordinaria', categoria: 'assemblea', utilizzi: 22,
    aggiornato: '2025-03-15',
    descrizione: 'Template per convocazione e verbale di assemblea straordinaria con delibere specifiche.',
  },
  {
    id: 't3', nome: 'Sollecito Pagamento — 1° Grado', categoria: 'pagamenti', utilizzi: 95,
    aggiornato: '2025-05-20', featured: true,
    descrizione: 'Primo sollecito bonario per rate condominiali scadute con riepilogo importi e scadenze.',
  },
  {
    id: 't4', nome: 'Sollecito Pagamento — 2° Grado', categoria: 'pagamenti', utilizzi: 61,
    aggiornato: '2025-05-20',
    descrizione: 'Secondo sollecito formale con avviso di eventuale azione legale per recupero crediti.',
  },
  {
    id: 't5', nome: 'Lettera Incarico Fornitore', categoria: 'fornitori', utilizzi: 34,
    aggiornato: '2025-02-28',
    descrizione: 'Lettera di incarico formale per lavori ordinari o straordinari con descrizione e importo.',
  },
  {
    id: 't6', nome: 'Consuntivo Annuale', categoria: 'contabilita', utilizzi: 29,
    aggiornato: '2025-01-10', featured: true,
    descrizione: 'Schema di consuntivo annuale con tabelle di ripartizione millesimale per tutte le categorie di spesa.',
  },
  {
    id: 't7', nome: 'Preventivo Spese Straordinarie', categoria: 'contabilita', utilizzi: 18,
    aggiornato: '2025-03-05',
    descrizione: 'Template per presentazione preventivo spese straordinarie con ripartizione e modalità di pagamento.',
  },
  {
    id: 't8', nome: 'Comunicazione Lavori in Corso', categoria: 'comunicazioni', utilizzi: 41,
    aggiornato: '2025-04-22',
    descrizione: 'Circolare informativa ai condòmini per lavori in corso con tempistiche e disagi previsti.',
  },
  {
    id: 't9', nome: 'Comunicazione Modifica Tariffe', categoria: 'comunicazioni', utilizzi: 15,
    aggiornato: '2025-05-01',
    descrizione: 'Lettera ai condòmini per comunicazione variazione quote condominiali per il nuovo esercizio.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function Templates() {
  const [catFilter, setCat] = useState<'all' | CatTemplate>('all');
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());

  const filtered = catFilter === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.categoria === catFilter);

  const featured = filtered.filter(t => t.featured);
  const rest = filtered.filter(t => !t.featured);

  const useTemplate = (id: string, nome: string) => {
    setUsedIds(prev => new Set([...prev, id]));
    toast.success(`Template "${nome}" copiato negli appunti`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Modulistica & Template</h1>
        <p className="page-sub">{TEMPLATES.length} template disponibili per la gestione condominiale</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2" data-testid="category-filters">
        <button
          onClick={() => setCat('all')}
          className={`btn text-xs px-3 py-1.5 ${catFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Tutti
        </button>
        {(Object.keys(CAT_LABEL) as CatTemplate[]).map(cat => {
          const Icon = CAT_ICON[cat];
          return (
            <button
              key={cat}
              onClick={() => setCat(cat)}
              className={`btn text-xs px-3 py-1.5 ${catFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              data-testid={`cat-filter-${cat}`}
            >
              <Icon className="w-3.5 h-3.5" />{CAT_LABEL[cat]}
            </button>
          );
        })}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wider">
              Più utilizzati
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {featured.map(t => <TemplateCard key={t.id} t={t} used={usedIds.has(t.id)} onUse={useTemplate} featured />)}
          </div>
        </div>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <div>
          {featured.length > 0 && (
            <h2 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">
              Altri template
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rest.map(t => <TemplateCard key={t.id} t={t} used={usedIds.has(t.id)} onUse={useTemplate} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────

function TemplateCard({
  t, used, onUse, featured = false,
}: {
  t: Template; used: boolean; onUse: (id: string, nome: string) => void; featured?: boolean;
}) {
  const Icon = CAT_ICON[t.categoria];
  return (
    <div
      className={`card p-5 hover:shadow-md transition-all duration-200 flex flex-col ${featured ? 'ring-1 ring-amber-200/60' : ''}`}
      data-testid={`template-card-${t.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex items-center gap-1.5">
          {featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
          <span className={CAT_BADGE[t.categoria]}>{CAT_LABEL[t.categoria]}</span>
        </div>
      </div>

      <h3 className="font-display font-bold text-slate-800 text-[15px] leading-snug mb-1">
        {t.nome}
      </h3>
      <p className="text-[13px] text-slate-500 leading-relaxed flex-1">{t.descrizione}</p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {t.utilizzi} usi
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {t.aggiornato}
          </span>
        </div>
        <button
          onClick={() => onUse(t.id, t.nome)}
          className={`btn text-xs py-1.5 px-3 gap-1 ${used ? 'btn-secondary text-emerald-700 border-emerald-200' : 'btn-primary'}`}
          data-testid={`btn-use-template-${t.id}`}
        >
          {used
            ? <><CheckCircle className="w-3.5 h-3.5" /> Copiato</>
            : <><Copy className="w-3.5 h-3.5" /> Usa</>}
        </button>
      </div>
    </div>
  );
}
