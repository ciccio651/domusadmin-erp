import { useMemo, useState } from 'react';
import { FileBarChart2, FileCheck2, Mail, ClipboardList, Receipt, FileText, Gavel, BookOpen, X, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { fmtEur, fmtNum } from '@/utils/helpers';

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
    link: '/templates',
    linkLabel: 'Compila il verbale →',
    status: 'disponibile',
  },
  {
    icon: FileCheck2,
    title: 'Convocazione Assemblea',
    desc: 'Convocazione con ordine del giorno e modalità di voto.',
    link: '/templates',
    linkLabel: 'Compila la convocazione →',
    status: 'disponibile',
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
  const { condomini, unita, rate } = useStore();
  const [activeModule, setActiveModule] = useState<'estratto' | 'detrazioni' | 'millesimi' | null>(null);
  const [condoId, setCondoId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [detrazione, setDetrazione] = useState({ lavori: '', impresa: '', importo: '', anno: String(new Date().getFullYear()), aliquota: '50', note: '' });

  const selectedCondo = condomini.find(c => c.id === condoId);
  const selectedUnit = unita.find(u => u.id === unitId);
  const condoUnits = useMemo(() => unita.filter(u => u.condominio_id === condoId), [unita, condoId]);
  const unitRates = useMemo(() => rate.filter(r => r.unita_id === unitId), [rate, unitId]);

  const openModule = (module: typeof activeModule) => {
    setCondoId(condomini[0]?.id ?? '');
    setUnitId('');
    setActiveModule(module);
  };

  const printDocument = (title: string, content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:2.5cm;font-size:11pt;line-height:1.6;color:#111}h1{text-align:center;font-size:18pt;border-bottom:1px solid #222;padding-bottom:12px}h2{font-size:13pt;margin-top:24px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #aaa;padding:7px;text-align:left}th{background:#eee}.right{text-align:right}.signature{margin-top:70px;display:flex;justify-content:space-between}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const printEstratto = () => {
    if (!selectedCondo || !selectedUnit) return;
    const totale = unitRates.reduce((sum, rata) => sum + rata.importo, 0);
    const pagato = unitRates.reduce((sum, rata) => sum + rata.pagato, 0);
    printDocument('Estratto conto individuale', `<h1>Estratto conto individuale</h1><p><strong>${selectedCondo.nome}</strong><br/>${selectedCondo.indirizzo}, ${selectedCondo.citta}</p><p>Unità: <strong>${selectedUnit.interno}</strong><br/>Condòmino: <strong>${selectedUnit.proprietario}</strong></p><h2>Riepilogo</h2><p>Totale rate: ${fmtEur(totale)}<br/>Totale pagato: ${fmtEur(pagato)}<br/><strong>Saldo residuo: ${fmtEur(totale - pagato)}</strong></p><table><tr><th>Descrizione</th><th>Scadenza</th><th>Importo</th><th>Pagato</th><th>Stato</th></tr>${unitRates.map(r => `<tr><td>${r.descrizione}</td><td>${r.scadenza}</td><td class="right">${fmtEur(r.importo)}</td><td class="right">${fmtEur(r.pagato)}</td><td>${r.stato}</td></tr>`).join('')}</table><div class="signature"><span>Data: ____________________</span><span>L'Amministratore</span></div>`);
    toast.success('Estratto conto pronto per la stampa');
  };

  const printDetrazione = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCondo) return;
    printDocument('Certificazione detrazioni fiscali', `<h1>Certificazione detrazioni fiscali</h1><p>Il/La sottoscritto/a, in qualità di amministratore del condominio <strong>${selectedCondo.nome}</strong>, certifica i dati relativi all'intervento indicato.</p><table><tr><th>Condominio</th><td>${selectedCondo.nome}</td></tr><tr><th>Intervento</th><td>${detrazione.lavori}</td></tr><tr><th>Impresa</th><td>${detrazione.impresa}</td></tr><tr><th>Anno</th><td>${detrazione.anno}</td></tr><tr><th>Importo complessivo</th><td>${fmtEur(Number(detrazione.importo) || 0)}</td></tr><tr><th>Aliquota indicata</th><td>${detrazione.aliquota}%</td></tr></table><p><strong>Note:</strong><br/>${detrazione.note || '—'}</p><p>Il presente documento è una bozza operativa: verificare requisiti, pagamenti e documentazione con il consulente fiscale.</p><div class="signature"><span>Data: ____________________</span><span>L'Amministratore</span></div>`);
    toast.success('Certificazione pronta per la stampa');
  };

  const printMillesimi = () => {
    if (!selectedCondo) return;
    printDocument('Tabella millesimale', `<h1>Tabella millesimale</h1><p><strong>${selectedCondo.nome}</strong><br/>${selectedCondo.indirizzo}, ${selectedCondo.citta}</p><table><tr><th>Interno</th><th>Proprietario</th><th>Proprietà</th><th>Ascensore</th><th>Riscaldamento</th><th>Mq</th></tr>${condoUnits.map(u => `<tr><td>${u.interno}</td><td>${u.proprietario}</td><td class="right">${fmtNum(u.millesimi_proprieta)}</td><td class="right">${fmtNum(u.millesimi_ascensore)}</td><td class="right">${fmtNum(u.millesimi_riscaldamento)}</td><td class="right">${u.mq ?? '—'}</td></tr>`).join('')}</table><div class="signature"><span>Data: ____________________</span><span>L'Amministratore</span></div>`);
    toast.success('Tabella millesimale pronta per la stampa');
  };

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
                  {doc.title === 'Estratto Conto Individuale' ? (
                    <button type="button" onClick={() => openModule('estratto')} className="text-xs font-bold text-blue-700 hover:underline">Compila e stampa →</button>
                  ) : doc.title === 'Detrazioni Fiscali 50%/65%' ? (
                    <button type="button" onClick={() => openModule('detrazioni')} className="text-xs font-bold text-blue-700 hover:underline">Compila e stampa →</button>
                  ) : doc.title === 'Tabella Millesimi' ? (
                    <button type="button" onClick={() => openModule('millesimi')} className="text-xs font-bold text-blue-700 hover:underline">Genera tabella →</button>
                  ) : doc.status === 'disponibile' && doc.link ? (
                    <Link to={doc.link} className="text-xs font-bold text-blue-700 hover:underline">
                      {doc.linkLabel ?? 'Apri →'}
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

      {activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModule(null)} />
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Modulistica compilabile</p>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-1">{activeModule === 'estratto' ? 'Estratto conto individuale' : activeModule === 'detrazioni' ? 'Certificazione detrazioni fiscali' : 'Tabella millesimi'}</h2>
              </div>
              <button type="button" onClick={() => setActiveModule(null)} className="btn-ghost p-1" aria-label="Chiudi"><X className="w-4 h-4" /></button>
            </div>

            <div className="mb-5">
              <label className="input-label">Condominio *</label>
              <select className="select" value={condoId} onChange={e => { setCondoId(e.target.value); setUnitId(''); }}>
                <option value="">Seleziona condominio</option>
                {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {activeModule === 'estratto' && (
              <div className="space-y-4">
                <div><label className="input-label">Condòmino / unità *</label><select className="select" value={unitId} onChange={e => setUnitId(e.target.value)} disabled={!condoId}><option value="">Seleziona unità</option>{condoUnits.map(u => <option key={u.id} value={u.id}>Int. {u.interno} — {u.proprietario}</option>)}</select></div>
                {selectedUnit && <div className="rounded-xl bg-slate-50 p-4 text-sm"><p>Rate: {unitRates.length}</p><p>Saldo residuo: <strong>{fmtEur(unitRates.reduce((sum, r) => sum + r.importo - r.pagato, 0))}</strong></p></div>}
                <button type="button" onClick={printEstratto} disabled={!selectedUnit} className="btn-primary"><Printer className="w-4 h-4" /> Stampa / salva PDF</button>
              </div>
            )}

            {activeModule === 'detrazioni' && (
              <form onSubmit={printDetrazione} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="input-label">Descrizione lavori *</label><input required className="input" value={detrazione.lavori} onChange={e => setDetrazione({ ...detrazione, lavori: e.target.value })} /></div><div><label className="input-label">Impresa *</label><input required className="input" value={detrazione.impresa} onChange={e => setDetrazione({ ...detrazione, impresa: e.target.value })} /></div><div><label className="input-label">Importo complessivo (€) *</label><input required type="number" step="0.01" className="input" value={detrazione.importo} onChange={e => setDetrazione({ ...detrazione, importo: e.target.value })} /></div><div><label className="input-label">Anno *</label><input required className="input" value={detrazione.anno} onChange={e => setDetrazione({ ...detrazione, anno: e.target.value })} /></div><div><label className="input-label">Aliquota indicata</label><select className="select" value={detrazione.aliquota} onChange={e => setDetrazione({ ...detrazione, aliquota: e.target.value })}><option value="50">50%</option><option value="65">65%</option><option value="altro">Altra / da verificare</option></select></div></div><div><label className="input-label">Note</label><textarea className="input min-h-[100px] resize-y" value={detrazione.note} onChange={e => setDetrazione({ ...detrazione, note: e.target.value })} /></div><button type="submit" disabled={!selectedCondo} className="btn-primary"><Printer className="w-4 h-4" /> Stampa / salva PDF</button><p className="text-xs text-amber-700">La certificazione deve essere verificata dal consulente fiscale prima dell’utilizzo.</p>
              </form>
            )}

            {activeModule === 'millesimi' && <div className="space-y-4">{selectedCondo && <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full"><thead className="bg-slate-50"><tr><th className="th text-left">Int.</th><th className="th text-left">Proprietario</th><th className="th text-right">Proprietà</th><th className="th text-right">Ascensore</th><th className="th text-right">Riscaldamento</th></tr></thead><tbody className="divide-y divide-slate-100">{condoUnits.map(u => <tr key={u.id}><td className="td font-mono-num">{u.interno}</td><td className="td">{u.proprietario}</td><td className="td text-right font-mono-num">{fmtNum(u.millesimi_proprieta)}</td><td className="td text-right font-mono-num">{fmtNum(u.millesimi_ascensore)}</td><td className="td text-right font-mono-num">{fmtNum(u.millesimi_riscaldamento)}</td></tr>)}</tbody></table></div>}<button type="button" onClick={printMillesimi} disabled={!selectedCondo} className="btn-primary"><Printer className="w-4 h-4" /> Stampa / salva PDF</button></div>}
          </div>
        </div>
      )}
    </div>
  );
}
