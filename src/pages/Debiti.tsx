import { useState, useMemo } from 'react';
import { Wallet, FileText, AlertTriangle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/appStore';
import { fmtEur, fmtNum, nowIso, sumBy } from '@/utils/helpers';
import { openWhatsApp, messaggioSollecito } from '@/utils/whatsapp';

type Livello = 1 | 2 | 3;
const LIVELLI: Record<Livello, { label: string; cls: string }> = {
  1: { label: '1° Sollecito bonario', cls: 'badge badge-amber' },
  2: { label: '2° Sollecito',         cls: 'badge badge-blue'  },
  3: { label: 'Diffida ad adempiere', cls: 'badge badge-red'   },
};

export default function Debiti() {
  const { rate, unita, condomini, pagaRata } = useStore();
  const [condoFilter, setCondoFilter] = useState('all');
  const [payRata,  setPayRata]  = useState<typeof rate[0] | null>(null);
  const [payForm,  setPayForm]  = useState({ importo: 0, data: nowIso() });
  const [solForm,  setSolForm]  = useState<{ rata: typeof rate[0]; livello: Livello } | null>(null);

  const insolute = useMemo(() => {
    let r = rate.filter(x => x.stato !== 'pagata');
    if (condoFilter !== 'all') r = r.filter(x => x.condominio_id === condoFilter);
    return r.sort((a, b) => a.scadenza.localeCompare(b.scadenza));
  }, [rate, condoFilter]);

  const totale = useMemo(() => sumBy(insolute, r => r.importo - r.pagato), [insolute]);

  const cName = (id: string) => condomini.find(c => c.id === id)?.nome ?? '—';
  const uInfo = (id: string) => {
    const u = unita.find(x => x.id === id);
    return u ? `Int. ${u.interno} — ${u.proprietario}` : '—';
  };

  const openPay = (r: typeof rate[0]) => {
    setPayRata(r);
    setPayForm({ importo: Math.round((r.importo - r.pagato) * 100) / 100, data: nowIso() });
  };

  const confirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payRata) return;
    pagaRata(payRata.id, Number(payForm.importo), payForm.data);
    toast.success('Pagamento registrato — movimento bancario creato');
    setPayRata(null);
  };

  const generaSollecito = () => {
    if (!solForm) return;
    const { rata, livello } = solForm;
    const u = unita.find(x => x.id === rata.unita_id);
    const c = condomini.find(x => x.id === rata.condominio_id);
    const residuo = rata.importo - rata.pagato;
    const titolo  = LIVELLI[livello].label;

    // Generate printable sollecito
    const html = `
      <html><head><title>${titolo}</title>
      <style>body{font-family:serif;margin:3cm 2.5cm;font-size:11pt;line-height:1.7}
      h1{text-align:center;font-size:14pt;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #000;padding-bottom:8px}
      .label{font-size:9pt;text-transform:uppercase;letter-spacing:.1em;color:#666}
      .amount{font-size:18pt;font-weight:bold}</style></head>
      <body>
        <h1>${titolo}</h1>
        <br/>
        <p class="label">Condominio</p>
        <p><strong>${c?.nome ?? '—'}</strong><br/>${c?.indirizzo ?? ''}, ${c?.citta ?? ''}</p>
        <br/>
        <p class="label">Destinatario</p>
        <p><strong>${u?.proprietario ?? '—'}</strong> — Interno ${u?.interno ?? '—'}</p>
        <br/>
        <p>La presente per comunicarLe che risulta a Suo carico il seguente importo insoluto:</p>
        <br/>
        <p class="amount">€ ${residuo.toFixed(2)}</p>
        <p>relativo a: <em>${rata.descrizione}</em><br/>Scadenza: ${rata.scadenza} — Esercizio ${rata.esercizio}</p>
        <br/>
        <p>La invitiamo a regolarizzare la posizione entro <strong>15 giorni</strong> dal ricevimento della presente,
        tramite bonifico bancario sul conto corrente del condominio indicando in causale nome e interno.</p>
        <br/><br/>
        <p>Data: ${new Date().toLocaleDateString('it-IT')}</p>
        <br/><br/>
        <p>L'Amministratore</p>
        <p>________________________________</p>
      </body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
    toast.success(`${titolo} generato`);
    setSolForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Debiti & Solleciti</h1>
          <p className="page-sub">
            {fmtNum(insolute.length, 0)} rate insolute ·
            Totale <span className="font-mono-num font-bold text-rose-700">{fmtEur(totale)}</span>
          </p>
        </div>
        <select className="select w-64" value={condoFilter} onChange={e => setCondoFilter(e.target.value)} data-testid="filter-debiti-condo">
          <option value="all">Tutti i condomini</option>
          {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <Link to="/condomini" className="btn-secondary text-xs" data-testid="link-add-debiti-condo">
          + Nuovo condominio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Rate aperte',   n: insolute.filter(r => r.stato==='aperta').length,   cls: 'text-rose-700'  },
          { label: 'Rate parziali', n: insolute.filter(r => r.stato==='parziale').length, cls: 'text-amber-700' },
          { label: 'Totale residuo',n: null, val: totale, cls: 'text-rose-700'  },
        ].map(({ label, n, val, cls }) => (
          <div key={label} className="card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            <span className={`font-mono-num font-bold text-lg ${cls}`}>
              {n !== null ? fmtNum(n, 0) : fmtEur(val!)}
            </span>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
              <tr>
                <th className="th text-left">Scadenza</th>
                <th className="th text-left">Condominio</th>
                <th className="th text-left">Unità / Proprietario</th>
                <th className="th text-right">Importo</th>
                <th className="th text-right">Pagato</th>
                <th className="th text-right">Residuo</th>
                <th className="th text-center">Stato</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {insolute.slice(0, 500).map(r => (
                <tr key={r.id} className="tr-hover">
                  <td className="td font-mono-num text-xs text-slate-500">{r.scadenza}</td>
                  <td className="td text-xs text-slate-600 max-w-[130px] truncate">{cName(r.condominio_id)}</td>
                  <td className="td text-sm">{uInfo(r.unita_id)}</td>
                  <td className="td text-right font-mono-num">{fmtEur(r.importo)}</td>
                  <td className="td text-right font-mono-num text-emerald-700">{fmtEur(r.pagato)}</td>
                  <td className="td text-right font-mono-num font-bold text-rose-700">
                    {fmtEur(r.importo - r.pagato)}
                  </td>
                  <td className="td text-center">
                    <span className={r.stato==='parziale' ? 'badge badge-amber' : 'badge badge-red'}>
                      {r.stato}
                    </span>
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openPay(r)}
                        className="btn-secondary text-xs py-1 px-2 gap-1"
                        data-testid={`btn-pay-${r.id}`}
                      >
                        <Wallet className="w-3 h-3" /> Paga
                      </button>
                      <button
                        onClick={() => setSolForm({ rata: r, livello: 1 })}
                        className="btn-ghost text-xs py-1 px-2 gap-1"
                        data-testid={`btn-sollecito-${r.id}`}
                      >
                        <FileText className="w-3 h-3" /> Sollecito
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {insolute.length === 0 && (
                <tr><td colSpan={8} className="td text-center py-12 text-slate-400">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p>Nessuna rata insoluta</p>
                  {condomini.length === 0 && <Link to="/condomini" className="mt-2 inline-block text-blue-700 hover:underline">Aggiungi il primo condominio</Link>}
                </td></tr>
              )}
            </tbody>
          </table>
          {insolute.length > 500 && <p className="text-center py-2 text-xs text-slate-400">Mostrando 500 di {insolute.length}</p>}
        </div>
      </div>

      {/* Modal: Paga rata */}
      {payRata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPayRata(null)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-4 animate-fade-up">
            <h2 className="font-display font-bold text-xl">Registra pagamento</h2>
            <p className="text-sm text-slate-500">{uInfo(payRata.unita_id)}</p>
            <form onSubmit={confirmPay} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Importo (€)*</label>
                  <input required type="number" step="0.01" className="input font-mono-num"
                    value={payForm.importo} onChange={e => setPayForm({...payForm, importo: Number(e.target.value)})}
                    data-testid="input-pay-importo" />
                </div>
                <div>
                  <label className="input-label">Data*</label>
                  <input required type="date" className="input" value={payForm.data}
                    onChange={e => setPayForm({...payForm, data: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setPayRata(null)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn-primary flex-1" data-testid="btn-save-pagamento">Conferma</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sollecito */}
      {solForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSolForm(null)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-4 animate-fade-up">
            <h2 className="font-display font-bold text-xl">Genera sollecito</h2>
            <p className="text-sm text-slate-500">{uInfo(solForm.rata.unita_id)}</p>
            <p className="text-sm font-mono-num font-bold text-rose-700">
              Residuo: {fmtEur(solForm.rata.importo - solForm.rata.pagato)}
            </p>
            <div>
              <label className="input-label">Livello sollecito</label>
              <div className="space-y-2 mt-1">
                {([1,2,3] as Livello[]).map(lv => (
                  <label key={lv} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="livello" value={lv} checked={solForm.livello === lv}
                      onChange={() => setSolForm({...solForm, livello: lv})} />
                    <span className={LIVELLI[lv].cls}>{LIVELLI[lv].label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => setSolForm(null)} className="btn-secondary flex-1">Annulla</button>
                <button type="button" onClick={generaSollecito} className="btn-primary flex-1">
                  <FileText className="w-4 h-4" /> Stampa
                </button>
              </div>
              {(() => {
                const u = unita.find(x => x.id === solForm.rata.unita_id);
                const c = condomini.find(x => x.id === solForm.rata.condominio_id);
                if (!u?.telefono) return null;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const msg = messaggioSollecito({
                        proprietario: u.proprietario,
                        condominio: c?.nome ?? '—',
                        descrizione: solForm.rata.descrizione,
                        residuo: solForm.rata.importo - solForm.rata.pagato,
                        scadenza: solForm.rata.scadenza,
                      });
                      openWhatsApp(u.telefono!, msg);
                      toast.success('WhatsApp aperto');
                      setSolForm(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
                               bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold text-sm transition-colors"
                    data-testid={`btn-wa-sollecito-${solForm.rata.id}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Invia su WhatsApp ({u.telefono})
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
