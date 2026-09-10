import { useState, useMemo } from 'react';
import {
  Scale, FileText, Gavel, AlertTriangle, Send,
  Clock, CheckCircle2, Building2, ChevronRight, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { fmtEur } from '@/utils/helpers';

// ── Tipi documento legale ─────────────────────────────────────────────────
const TIPI_ATTO = [
  {
    id: 'decreto_ingiuntivo',
    label: 'Decreto Ingiuntivo',
    icon: Gavel,
    descrizione: 'Atto giudiziario per il recupero forzoso di crediti condominiali insoluti.',
    soglia: 500,
    colore: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
    badge: 'badge badge-red',
  },
  {
    id: 'diffida',
    label: 'Atto di Diffida',
    icon: AlertTriangle,
    descrizione: 'Messa in mora formale prima di procedere per via giudiziaria.',
    soglia: 200,
    colore: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'badge badge-amber',
  },
  {
    id: 'memoria_difensiva',
    label: 'Memoria Difensiva',
    icon: FileText,
    descrizione: 'Documento difensivo per opposizioni o controversie condominiali.',
    soglia: 0,
    colore: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    badge: 'badge badge-blue',
  },
] as const;

type TipoAttoId = typeof TIPI_ATTO[number]['id'];

interface PraticaForm {
  tipo: TipoAttoId;
  rata_id: string;
  note: string;
  avvocato: string;
}

// Mock avvocati convenzionati
const AVVOCATI = [
  { id: 'av1', nome: 'Avv. Marco Ferretti',  foro: 'Milano',  specialita: 'Diritto condominiale' },
  { id: 'av2', nome: 'Avv. Laura Conti',     foro: 'Roma',    specialita: 'Recupero crediti'     },
  { id: 'av3', nome: 'Avv. Giorgio Riva',    foro: 'Torino',  specialita: 'Diritto immobiliare'  },
  { id: 'av4', nome: 'Avv. Sofia Martini',   foro: 'Napoli',  specialita: 'Diritto condominiale' },
];

export default function Legale() {
  const { rate, unita, condomini } = useStore();
  const [condoFilter, setCondoFilter] = useState('all');
  const [praticaForm, setPraticaForm] = useState<PraticaForm | null>(null);
  const [inviate, setInviate] = useState<Set<string>>(new Set());

  // Rate insolute rilevanti per recupero legale
  const insolute = useMemo(() => {
    let r = rate.filter(x => x.stato !== 'pagata');
    if (condoFilter !== 'all') r = r.filter(x => x.condominio_id === condoFilter);
    return r.sort((a, b) => (b.importo - b.pagato) - (a.importo - a.pagato));
  }, [rate, condoFilter]);

  const totaleEsposizione = useMemo(
    () => insolute.reduce((s, r) => s + (r.importo - r.pagato), 0),
    [insolute]
  );

  const cName = (id: string) => condomini.find(c => c.id === id)?.nome ?? '—';
  const uInfo = (id: string) => {
    const u = unita.find(x => x.id === id);
    return u ? { interno: u.interno, proprietario: u.proprietario } : { interno: '—', proprietario: '—' };
  };

  const tipoAtto = (residuo: number) =>
    residuo >= 500 ? TIPI_ATTO[0] : residuo >= 200 ? TIPI_ATTO[1] : TIPI_ATTO[2];

  const apriPratica = (rataId: string, tipo: TipoAttoId) => {
    setPraticaForm({ tipo, rata_id: rataId, note: '', avvocato: AVVOCATI[0].id });
  };

  const inviaPratica = (e: React.FormEvent) => {
    e.preventDefault();
    if (!praticaForm) return;
    setInviate(prev => new Set(prev).add(praticaForm.rata_id));
    const av = AVVOCATI.find(a => a.id === praticaForm.avvocato);
    toast.success(`Pratica inviata a ${av?.nome ?? 'avvocato'} — conferma via email attesa`);
    setPraticaForm(null);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <div className="flex items-center gap-2">
            <h1 className="page-title">Studi Legali Convenzionati</h1>
            <span className="badge badge-blue text-[10px] px-2 py-0.5">In sviluppo</span>
          </div>
          <p className="page-sub">
            Generazione atti e invio pratiche agli avvocati convenzionati per il recupero crediti
          </p>
        </div>
        <select
          className="select w-64"
          value={condoFilter}
          onChange={e => setCondoFilter(e.target.value)}
          data-testid="filter-legale-condo"
        >
          <option value="all">Tutti i condomini</option>
          {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {/* Banner info */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 flex gap-4">
        <Scale className="w-8 h-8 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 text-sm">
            Connessione con studi legali
          </p>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed">
            DomusAdmin supporta la generazione di memorie difensive, atti di diffida e istanze di
            decreto ingiuntivo per il recupero crediti condominiali, da inviare direttamente agli
            avvocati convenzionati. <span className="font-semibold">Funzione in sviluppo.</span>
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Rate insolute',       val: insolute.length,                                              fmt: (v: number) => v.toString(),  cls: 'text-rose-700'  },
          { label: 'Esposizione totale',  val: totaleEsposizione,                                             fmt: fmtEur,                       cls: 'text-rose-700'  },
          { label: 'Decreti ingiuntivi',  val: insolute.filter(r => r.importo - r.pagato >= 500).length,    fmt: (v: number) => v.toString(),  cls: 'text-rose-600'  },
          { label: 'Pratiche inviate',    val: inviate.size,                                                  fmt: (v: number) => v.toString(),  cls: 'text-emerald-600' },
        ].map(({ label, val, fmt, cls }) => (
          <div key={label} className="card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            <span className={`font-mono-num font-bold text-lg ${cls}`}>{fmt(val)}</span>
          </div>
        ))}
      </div>

      {/* Tipi atto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIPI_ATTO.map(tipo => {
          const Icon = tipo.icon;
          const count = insolute.filter(r => {
            const res = r.importo - r.pagato;
            if (tipo.id === 'decreto_ingiuntivo') return res >= 500;
            if (tipo.id === 'diffida') return res >= 200 && res < 500;
            return res < 200;
          }).length;
          return (
            <div key={tipo.id} className={`rounded-2xl border p-4 ${tipo.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${tipo.colore}`} />
                <span className={`text-sm font-bold ${tipo.colore}`}>{tipo.label}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{tipo.descrizione}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{count} pratiche idonee</span>
                <span className={tipo.badge}>{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabella rate insolute */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="font-semibold text-slate-700 text-sm">Rate — Posizioni Recuperabili</p>
          <span className="text-xs text-slate-400">{insolute.length} posizioni</span>
        </div>
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
              <tr>
                <th className="th text-left">Condominio</th>
                <th className="th text-left">Unità / Proprietario</th>
                <th className="th text-right">Residuo</th>
                <th className="th text-center">Atto consigliato</th>
                <th className="th text-center">Stato</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {insolute.slice(0, 200).map(r => {
                const residuo = r.importo - r.pagato;
                const atto = tipoAtto(residuo);
                const Icon = atto.icon;
                const inviata = inviate.has(r.id);
                const ui = uInfo(r.unita_id);
                return (
                  <tr key={r.id} className="tr-hover">
                    <td className="td">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-600 truncate max-w-[120px]">{cName(r.condominio_id)}</span>
                      </div>
                    </td>
                    <td className="td">
                      <p className="text-sm font-medium text-slate-800">{ui.proprietario}</p>
                      <p className="text-[11px] text-slate-400">Int. {ui.interno}</p>
                    </td>
                    <td className="td text-right font-mono-num font-bold text-rose-700">
                      {fmtEur(residuo)}
                    </td>
                    <td className="td text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Icon className={`w-3.5 h-3.5 ${atto.colore}`} />
                        <span className={`text-[11px] font-medium ${atto.colore}`}>{atto.label}</span>
                      </div>
                    </td>
                    <td className="td text-center">
                      {inviata
                        ? <span className="flex items-center justify-center gap-1 text-emerald-600 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Inviata
                          </span>
                        : <span className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                            <Clock className="w-3.5 h-3.5" /> In attesa
                          </span>
                      }
                    </td>
                    <td className="td">
                      <button
                        onClick={() => apriPratica(r.id, atto.id)}
                        disabled={inviata}
                        className="btn-primary text-xs py-1 px-3 gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid={`btn-pratica-${r.id}`}
                      >
                        <Send className="w-3 h-3" />
                        {inviata ? 'Inviata' : 'Avvia pratica'}
                        {!inviata && <ChevronRight className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {insolute.length === 0 && (
                <tr><td colSpan={6} className="td text-center py-12 text-slate-400">
                  <Scale className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  Nessuna rata insoluta — ottima gestione!
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Avvocati convenzionati */}
      <div className="card p-5">
        <p className="font-semibold text-slate-700 text-sm mb-4">Avvocati convenzionati</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AVVOCATI.map(av => (
            <div key={av.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col gap-1">
              <p className="font-semibold text-slate-800 text-sm">{av.nome}</p>
              <p className="text-xs text-slate-500">Foro di {av.foro}</p>
              <span className="badge badge-blue text-[10px] w-fit mt-1">{av.specialita}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal pratica */}
      {praticaForm && (() => {
        const rata = rate.find(r => r.id === praticaForm.rata_id);
        if (!rata) return null;
        const ui = uInfo(rata.unita_id);
        const residuo = rata.importo - rata.pagato;
        const tipoInfo = TIPI_ATTO.find(t => t.id === praticaForm.tipo)!;
        const Icon = tipoInfo.icon;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPraticaForm(null)} />
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${tipoInfo.colore}`} />
                  <h2 className="font-display font-bold text-xl">Avvia pratica legale</h2>
                </div>
                <button onClick={() => setPraticaForm(null)} className="btn-ghost p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className={`rounded-xl border p-3 ${tipoInfo.bg}`}>
                <p className={`text-sm font-semibold ${tipoInfo.colore}`}>{tipoInfo.label}</p>
                <p className="text-xs text-slate-600 mt-0.5">{tipoInfo.descrizione}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Condominio</span>
                  <span className="font-medium text-slate-800">{cName(rata.condominio_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Debitore</span>
                  <span className="font-medium text-slate-800">{ui.proprietario} — Int. {ui.interno}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Importo residuo</span>
                  <span className="font-bold text-rose-700 font-mono-num">{fmtEur(residuo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scadenza rata</span>
                  <span className="font-mono-num text-slate-700">{rata.scadenza}</span>
                </div>
              </div>

              <form onSubmit={inviaPratica} className="space-y-3">
                <div>
                  <label className="input-label">Avvocato convenzionato*</label>
                  <select
                    className="select w-full"
                    value={praticaForm.avvocato}
                    onChange={e => setPraticaForm({ ...praticaForm, avvocato: e.target.value })}
                    data-testid="select-avvocato"
                  >
                    {AVVOCATI.map(av => (
                      <option key={av.id} value={av.id}>{av.nome} — {av.foro}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Note per l'avvocato</label>
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="Eventuali note o istruzioni specifiche..."
                    value={praticaForm.note}
                    onChange={e => setPraticaForm({ ...praticaForm, note: e.target.value })}
                    data-testid="textarea-note-legale"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setPraticaForm(null)} className="btn-secondary flex-1">
                    Annulla
                  </button>
                  <button type="submit" className="btn-primary flex-1 gap-1.5" data-testid="btn-invia-pratica">
                    <Send className="w-4 h-4" /> Invia pratica
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
