import { useState } from 'react';
import {
  FileText, Copy, CheckCircle, Star, Clock, Users,
  MessageSquare, FileBarChart2, Banknote, X, Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';

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
  contenuto?: string;
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
    contenuto: 'VERBALE DI ASSEMBLEA ORDINARIA\n\nCondominio: {{nome_condominio}}\nData: {{data_assemblea}}\nLuogo: {{luogo_assemblea}}\n\nOggetto dell’incontro:\n{{oggetto_assemblea}}\n\nIn data {{data_assemblea}} si è riunita l’assemblea dei condòmini del condominio {{nome_condominio}}.\n\nOrdine del giorno:\n{{ordine_del_giorno}}\n\nDelibere e discussione:\n{{delibere}}\n\nIl presente verbale viene letto, approvato e sottoscritto.',
  },
  {
    id: 't2', nome: 'Verbale Assemblea Straordinaria', categoria: 'assemblea', utilizzi: 22,
    aggiornato: '2025-03-15',
    descrizione: 'Template per convocazione e verbale di assemblea straordinaria con delibere specifiche.',
    contenuto: 'VERBALE DI ASSEMBLEA STRAORDINARIA\n\nCondominio: {{nome_condominio}}\nData: {{data_assemblea}}\nLuogo: {{luogo_assemblea}}\n\nOggetto dell’incontro:\n{{oggetto_assemblea}}\n\nL’assemblea straordinaria è convocata per discutere il seguente ordine del giorno:\n{{ordine_del_giorno}}\n\nPartecipanti e deleghe:\n{{partecipanti}}\n\nEsito delle deliberazioni:\n{{delibere}}',
  },
  {
    id: 't3', nome: 'Sollecito Pagamento — 1° Grado', categoria: 'pagamenti', utilizzi: 95,
    aggiornato: '2025-05-20', featured: true,
    descrizione: 'Primo sollecito bonario per rate condominiali scadute con riepilogo importi e scadenze.',
    contenuto: 'Oggetto: Primo sollecito pagamento\n\nGentile {{nome_proprietario}},\n\nla contattiamo per la posizione relativa al condominio {{nome_condominio}}, unità {{interno}}. Risulta dovuto l’importo di € {{importo_dovuto}}, con scadenza {{scadenza}}.\n\nLa invitiamo a regolarizzare il pagamento entro {{termine_pagamento}}.\n\nCordiali saluti\nL’amministratore',
  },
  {
    id: 't4', nome: 'Sollecito Pagamento — 2° Grado', categoria: 'pagamenti', utilizzi: 61,
    aggiornato: '2025-05-20',
    descrizione: 'Secondo sollecito formale con avviso di eventuale azione legale per recupero crediti.',
    contenuto: 'Oggetto: Secondo sollecito pagamento\n\nGentile {{nome_proprietario}},\n\nnon risulta ancora saldato l’importo di € {{importo_dovuto}} relativo al condominio {{nome_condominio}}, unità {{interno}}, scaduto il {{scadenza}}.\n\nLa invitiamo a provvedere entro {{termine_pagamento}}. In mancanza, la posizione potrà essere sottoposta al professionista incaricato per le valutazioni del caso.\n\nL’amministratore',
  },
  {
    id: 't5', nome: 'Lettera Incarico Fornitore', categoria: 'fornitori', utilizzi: 34,
    aggiornato: '2025-02-28',
    descrizione: 'Lettera di incarico formale per lavori ordinari o straordinari con descrizione e importo.',
    contenuto: 'LETTERA DI INCARICO\n\nSpett.le {{fornitore}},\n\ncon riferimento al condominio {{nome_condominio}}, confermiamo l’incarico per {{descrizione_lavori}} per l’importo di € {{importo_lavori}}.\n\nL’intervento dovrà essere completato entro {{termine_lavori}}.\n\nNote, appunti e precisazioni:\n{{note_fornitore}}\n\nCordiali saluti\nL’amministratore',
  },
  {
    id: 't6', nome: 'Consuntivo Annuale', categoria: 'contabilita', utilizzi: 29,
    aggiornato: '2025-01-10', featured: true,
    descrizione: 'Schema di consuntivo annuale con tabelle di ripartizione millesimale per tutte le categorie di spesa.',
    contenuto: 'CONSUNTIVO ANNUALE\n\nCondominio: {{nome_condominio}}\nEsercizio: {{esercizio}}\n\nTotale spese: € {{totale_spese}}\n\nRiepilogo per categoria:\n{{riepilogo_spese}}\n\nCriteri di ripartizione:\n{{criteri_ripartizione}}\n\nNote:\n{{note_consuntivo}}',
  },
  {
    id: 't7', nome: 'Preventivo Spese Straordinarie', categoria: 'contabilita', utilizzi: 18,
    aggiornato: '2025-03-05',
    descrizione: 'Template per presentazione preventivo spese straordinarie con ripartizione e modalità di pagamento.',
    contenuto: 'PREVENTIVO SPESE STRAORDINARIE\n\nCondominio: {{nome_condominio}}\nOggetto dei lavori: {{descrizione_lavori}}\nImporto preventivato: € {{importo_lavori}}\n\nModalità di ripartizione e pagamento:\n{{modalita_pagamento}}\n\nNote:\n{{note_preventivo}}',
  },
  {
    id: 't8', nome: 'Comunicazione Lavori in Corso', categoria: 'comunicazioni', utilizzi: 41,
    aggiornato: '2025-04-22',
    descrizione: 'Circolare informativa ai condòmini per lavori in corso con tempistiche e disagi previsti.',
    contenuto: 'COMUNICAZIONE AI CONDÒMINI\n\nCondominio: {{nome_condominio}}\n\nSi comunica l’avvio di {{descrizione_lavori}} dal {{data_inizio}}, con durata prevista di {{durata_lavori}}.\n\nDisagi o limitazioni previste:\n{{disagi}}\n\nPer informazioni: {{contatti_amministratore}}\n\nL’amministratore',
  },
  {
    id: 't9', nome: 'Comunicazione Modifica Tariffe', categoria: 'comunicazioni', utilizzi: 15,
    aggiornato: '2025-05-01',
    descrizione: 'Lettera ai condòmini per comunicazione variazione quote condominiali per il nuovo esercizio.',
    contenuto: 'Oggetto: Comunicazione modifica quote condominiali\n\nGentile {{nome_proprietario}},\n\nper il condominio {{nome_condominio}}, a decorrere dal {{data_decorrenza}}, la quota prevista sarà pari a € {{nuova_quota}} con scadenza {{scadenza}}.\n\nLa variazione deriva da:\n{{motivazione}}\n\nCordiali saluti\nL’amministratore',
  },
  {
    id: 't10', nome: 'Convocazione Assemblea Ordinaria', categoria: 'assemblea', utilizzi: 0,
    aggiornato: '2026-09-13', featured: true,
    descrizione: 'Convocazione completa con ordine del giorno, luogo, data e modalità di partecipazione.',
    contenuto: 'Oggetto: Convocazione assemblea condominiale\n\nGentile {{nome_proprietario}},\n\nla informiamo che è convocata l’assemblea del condominio {{nome_condominio}} per il giorno {{data_assemblea}}, alle ore {{ora_assemblea}}, presso {{luogo_assemblea}}.\n\nOrdine del giorno:\n{{ordine_del_giorno}}\n\nCordiali saluti\nL’amministratore',
  },
  {
    id: 't11', nome: 'Delega Assemblea', categoria: 'assemblea', utilizzi: 0,
    aggiornato: '2026-09-13',
    descrizione: 'Delega per la partecipazione e il voto in assemblea condominiale.',
    contenuto: 'DELEGA\n\nIl/La sottoscritto/a {{nome_proprietario}}, proprietario/a dell’unità {{interno}} del condominio {{nome_condominio}}, delega il/la Sig./Sig.ra {{delegato}} a rappresentarlo/a all’assemblea del {{data_assemblea}}, con facoltà di discutere e votare sugli argomenti all’ordine del giorno.\n\nData: {{data_documento}}\nFirma: ____________________',
  },
  {
    id: 't12', nome: 'Sollecito Quote Condominiali', categoria: 'pagamenti', utilizzi: 0,
    aggiornato: '2026-09-13', featured: true,
    descrizione: 'Sollecito bonario con riepilogo della quota scaduta e termine per il pagamento.',
    contenuto: 'Oggetto: Sollecito pagamento quote condominiali\n\nGentile {{nome_proprietario}},\n\ncon riferimento al condominio {{nome_condominio}}, risulta ancora da saldare l’importo di € {{importo_dovuto}}, con scadenza {{scadenza}}.\n\nLa invitiamo a regolarizzare la posizione entro {{termine_pagamento}}. In caso di pagamento già effettuato, la preghiamo di trasmettere la relativa ricevuta.\n\nCordiali saluti\nL’amministratore',
  },
  {
    id: 't13', nome: 'Diffida e Messa in Mora', categoria: 'pagamenti', utilizzi: 0,
    aggiornato: '2026-09-13',
    descrizione: 'Comunicazione formale per il mancato pagamento, da verificare prima dell’invio.',
    contenuto: 'Oggetto: Diffida al pagamento e costituzione in mora\n\nGentile {{nome_proprietario}},\n\nper conto del condominio {{nome_condominio}}, la invitiamo e diffidiamo a versare l’importo di € {{importo_dovuto}}, relativo alle quote con scadenza {{scadenza}}.\n\nIl pagamento dovrà essere effettuato entro {{termine_pagamento}} dal ricevimento della presente, con avvertenza che, in difetto, potranno essere intraprese le iniziative consentite dalla legge.\n\nLa presente comunicazione deve essere verificata dal professionista incaricato prima dell’invio.\n\nL’amministratore',
  },
  {
    id: 't14', nome: 'Comunicazione Lavori Condominiali', categoria: 'comunicazioni', utilizzi: 0,
    aggiornato: '2026-09-13',
    descrizione: 'Avviso ai condòmini per lavori, durata prevista, accessi e possibili disagi.',
    contenuto: 'Oggetto: Comunicazione avvio lavori condominiali\n\nGentili condòmini,\n\nnel condominio {{nome_condominio}} inizieranno i lavori di {{descrizione_lavori}} a partire dal {{data_inizio}}, con durata prevista di {{durata_lavori}}.\n\nL’impresa incaricata è {{impresa}}. Durante i lavori potrebbero verificarsi {{disagi}}.\n\nPer comunicazioni o segnalazioni rivolgersi all’amministratore.\n\nCordiali saluti',
  },
  {
    id: 't15', nome: 'Richiesta Documentazione Condòmino', categoria: 'comunicazioni', utilizzi: 0,
    aggiornato: '2026-09-13',
    descrizione: 'Richiesta formale di documenti o informazioni necessari alla gestione condominiale.',
    contenuto: 'Oggetto: Richiesta documentazione\n\nGentile {{nome_proprietario}},\n\nper gli adempimenti relativi al condominio {{nome_condominio}}, chiediamo di trasmettere entro {{termine_documenti}} la seguente documentazione: {{documenti_richiesti}}.\n\nLa documentazione può essere inviata a {{email_amministratore}}.\n\nCordiali saluti\nL’amministratore',
  },
  {
    id: 't16', nome: 'Incarico a Fornitore', categoria: 'fornitori', utilizzi: 0,
    aggiornato: '2026-09-13',
    descrizione: 'Lettera di incarico per attività di manutenzione o lavori deliberati.',
    contenuto: 'Oggetto: Conferimento incarico\n\nSpett.le {{fornitore}},\n\ncon riferimento al condominio {{nome_condominio}}, confermiamo l’incarico per {{descrizione_lavori}}, per l’importo concordato di € {{importo_lavori}}.\n\nL’intervento dovrà essere eseguito entro {{termine_lavori}}, previo coordinamento con l’amministratore.\n\nNote, appunti e precisazioni:\n{{note_fornitore}}\n\nCordiali saluti\nL’amministratore',
  },
  {
    id: 't17', nome: 'Trasmissione Pratica all’Avvocato', categoria: 'comunicazioni', utilizzi: 0,
    aggiornato: '2026-09-13',
    descrizione: 'Lettera di accompagnamento per inviare all’avvocato i dati di una posizione.',
    contenuto: 'Oggetto: Trasmissione pratica — {{nome_condominio}}\n\nGentile Avvocato,\n\ntrasmettiamo la documentazione relativa alla posizione di {{nome_proprietario}}, unità {{interno}}, per un importo residuo di € {{importo_dovuto}}.\n\nLa pratica riguarda: {{oggetto_pratica}}. La documentazione disponibile comprende: {{documenti_disponibili}}.\n\nRestiamo a disposizione per integrazioni.\n\nCordiali saluti\nL’amministratore',
  },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function Templates() {
  const { condomini, unita } = useStore();
  const [catFilter, setCat] = useState<'all' | CatTemplate>('all');
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const filtered = catFilter === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.categoria === catFilter);

  const featured = filtered.filter(t => t.featured);
  const rest = filtered.filter(t => !t.featured);

  const useTemplate = (id: string, nome: string) => {
    const template = TEMPLATES.find(t => t.id === id);
    if (template?.contenuto) {
      setSelectedTemplate(template);
      setFields({ data_documento: new Date().toLocaleDateString('it-IT') });
    } else {
      toast.success(`Template "${nome}" selezionato`);
    }
  };

  const renderTemplate = () => (selectedTemplate?.contenuto ?? '').replace(/\{\{([^}]+)\}\}/g, (_, key: string) => fields[key.trim()] || `[${key.trim()}]`);

  const copyTemplate = async () => {
    await navigator.clipboard.writeText(renderTemplate());
    if (selectedTemplate) setUsedIds(prev => new Set([...prev, selectedTemplate.id]));
    toast.success('Testo copiato negli appunti');
  };

  const downloadTemplate = () => {
    const blob = new Blob([renderTemplate()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate?.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'modello'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    if (selectedTemplate) setUsedIds(prev => new Set([...prev, selectedTemplate.id]));
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

      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTemplate(null)} />
          <div className="relative grid h-[calc(100vh-3rem)] max-h-[900px] w-full max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
            <div className="min-h-0 overflow-y-auto p-7 lg:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Modello compilabile</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900">{selectedTemplate.nome}</h2>
                </div>
                <button type="button" onClick={() => setSelectedTemplate(null)} className="btn-ghost p-1" aria-label="Chiudi"><X className="w-4 h-4" /></button>
              </div>
              <div className="mt-5 space-y-3">
                <div>
                  <label className="input-label">Condominio</label>
                  <select className="select" value={fields.nome_condominio || ''} onChange={e => {
                    const condo = condomini.find(c => c.nome === e.target.value);
                    setFields({ ...fields, nome_condominio: e.target.value, condominio_id: condo?.id || '', nome_proprietario: '', interno: '' });
                  }}>
                    <option value="">Seleziona o scrivi nei campi</option>
                    {condomini.map(condo => <option key={condo.id} value={condo.nome}>{condo.nome}</option>)}
                  </select>
                </div>
                <Field label="Nome condominio" name="nome_condominio" fields={fields} setFields={setFields} />
                {selectedTemplate.contenuto?.includes('{{nome_proprietario}}') && <Field label="Nome proprietario" name="nome_proprietario" fields={fields} setFields={setFields} />}
                <div>
                  <label className="input-label">Unità / interno</label>
                  <select className="select" value={fields.interno || ''} onChange={e => {
                    const unit = unita.find(u => u.id === e.target.value);
                    setFields({ ...fields, interno: unit?.interno || e.target.value, nome_proprietario: unit?.proprietario || fields.nome_proprietario });
                  }}>
                    <option value="">Inserisci manualmente</option>
                    {unita.filter(u => !fields.condominio_id || u.condominio_id === fields.condominio_id).map(unit => <option key={unit.id} value={unit.id}>Int. {unit.interno} — {unit.proprietario}</option>)}
                  </select>
                </div>
                {['data_assemblea', 'ora_assemblea', 'luogo_assemblea', 'oggetto_assemblea', 'ordine_del_giorno', 'partecipanti', 'delibere', 'importo_dovuto', 'scadenza', 'termine_pagamento', 'descrizione_lavori', 'data_inizio', 'durata_lavori', 'impresa', 'disagi', 'contatti_amministratore', 'termine_documenti', 'documenti_richiesti', 'email_amministratore', 'fornitore', 'importo_lavori', 'termine_lavori', 'note_fornitore', 'oggetto_pratica', 'documenti_disponibili', 'delegato', 'esercizio', 'totale_spese', 'riepilogo_spese', 'criteri_ripartizione', 'note_consuntivo', 'modalita_pagamento', 'note_preventivo', 'data_decorrenza', 'nuova_quota', 'motivazione'].filter(key => selectedTemplate.contenuto?.includes(`{{${key}}}`)).map(key => <Field key={key} label={key === 'note_fornitore' ? 'Note / appunti / segnalazioni' : key.replaceAll('_', ' ')} name={key} fields={fields} setFields={setFields} multiline={key === 'oggetto_assemblea' || key === 'ordine_del_giorno' || key === 'delibere' || key === 'partecipanti' || key === 'note_fornitore'} maxLength={key === 'note_fornitore' ? 5000 : undefined} />)}
              </div>
            </div>
            <div className="flex min-h-0 flex-col border-t border-slate-200 bg-slate-50 p-7 lg:border-l lg:border-t-0 lg:p-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Anteprima</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => void copyTemplate()} className="btn-secondary text-xs"><Copy className="w-3.5 h-3.5" /> Copia verbale</button>
                  <button type="button" onClick={downloadTemplate} className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Scarica documento</button>
                </div>
              </div>
              <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 font-sans text-sm leading-relaxed text-slate-700">{renderTemplate()}</pre>
              <p className="mt-3 text-[10px] text-slate-400">Modello operativo da verificare e adattare al caso concreto, soprattutto per comunicazioni legali.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, fields, setFields, multiline = false, maxLength }: { label: string; name: string; fields: Record<string, string>; setFields: (fields: Record<string, string>) => void; multiline?: boolean; maxLength?: number }) {
  return (
    <div>
      <label className="input-label capitalize">{label}</label>
      {multiline ? (
        <textarea className={`input resize-y ${name === 'note_fornitore' ? 'min-h-[180px]' : 'min-h-[90px]'}`} maxLength={maxLength} value={fields[name] || ''} onChange={e => setFields({ ...fields, [name]: e.target.value })} />
      ) : (
        <input className="input" value={fields[name] || ''} onChange={e => setFields({ ...fields, [name]: e.target.value })} />
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
