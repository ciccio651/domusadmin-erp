import { useState } from 'react';
import { FileBarChart2, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/appStore';
import { fmtEur, fmtNum, sumBy } from '@/utils/helpers';

const ANNI = [2023, 2024, 2025, 2026];

export default function Consuntivi() {
  const { condomini, unita, spese } = useStore();
  const [cid,  setCid]     = useState('');
  const [anno, setAnno]    = useState(2025);
  const [data, setData]    = useState<ReturnType<typeof buildConsuntivo> | null>(null);
  const [loading, setLoading] = useState(false);

  function buildConsuntivo(condoId: string, yr: number) {
    const condo   = condomini.find(c => c.id === condoId)!;
    const mySpese = spese.filter(s => s.condominio_id === condoId && s.data.startsWith(String(yr)));
    const myUnita = unita.filter(u => u.condominio_id === condoId);

    const perCat: Record<string,number> = {};
    const perTab: Record<string,number> = { proprieta: 0, ascensore: 0, riscaldamento: 0 };
    let totale = 0;
    mySpese.forEach(s => {
      perCat[s.categoria] = (perCat[s.categoria] ?? 0) + s.importo;
      perTab[s.tabella_millesimi] = (perTab[s.tabella_millesimi] ?? 0) + s.importo;
      totale += s.importo;
    });

    const totMill = {
      proprieta:     sumBy(myUnita, u => u.millesimi_proprieta) || 1000,
      ascensore:     sumBy(myUnita, u => u.millesimi_ascensore) || 1000,
      riscaldamento: sumBy(myUnita, u => u.millesimi_riscaldamento) || 1000,
    };

    const ripartizione = myUnita.map(u => {
      let quota = 0;
      Object.entries(perTab).forEach(([tab, imp]) => {
        const k = `millesimi_${tab}` as keyof typeof u;
        quota += imp * ((u[k] as number) / totMill[tab as keyof typeof totMill]);
      });
      return { u, quota: Math.round(quota * 100) / 100 };
    });

    return {
      condo, anno: yr, totale,
      perCat: Object.entries(perCat).map(([c,t]) => ({ cat: c, totale: Math.round(t*100)/100 })).sort((a,b) => b.totale-a.totale),
      perTab: Object.entries(perTab).map(([t,v]) => ({ tab: t, totale: Math.round(v*100)/100 })),
      ripartizione,
      nSpese: mySpese.length,
      nUnita: myUnita.length,
    };
  }

  const genera = () => {
    if (!cid) { toast.error('Seleziona un condominio'); return; }
    setLoading(true);
    setTimeout(() => {
      setData(buildConsuntivo(cid, anno));
      setLoading(false);
      toast.success('Consuntivo generato');
    }, 300);
  };

  const scaricaCsv = () => {
    if (!data) return;
    const rows = [
      ['Interno','Proprietario','Millesimi','Quota dovuta (€)'],
      ...data.ripartizione.map(({ u, quota }) => [
        u.interno, u.proprietario, fmtNum(u.millesimi_proprieta), fmtNum(quota),
      ]),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `consuntivo-${anno}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('CSV scaricato');
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Consuntivi Annuali</h1>
        <p className="page-sub">Riepilogo spese, ripartizione millesimi, esportazione</p>
      </div>

      {/* Controls */}
      <div className="card p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <select className="select w-72" value={cid} onChange={e => setCid(e.target.value)} data-testid="select-consuntivo-condo">
            <option value="">Seleziona condominio…</option>
            {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <Link to="/condomini" className="btn-secondary text-xs" data-testid="link-add-consuntivo-condo">
            + Nuovo condominio
          </Link>
          <select className="select w-28" value={anno} onChange={e => setAnno(Number(e.target.value))} data-testid="select-anno">
            {ANNI.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={genera} disabled={loading || !cid} className="btn-primary" data-testid="btn-genera-consuntivo">
            <FileBarChart2 className="w-4 h-4" />
            {loading ? 'Elaborazione…' : 'Genera consuntivo'}
          </button>
          {data && (
            <button onClick={scaricaCsv} className="btn-secondary" data-testid="btn-download-csv">
              <FileDown className="w-4 h-4" /> Scarica CSV
            </button>
          )}
        </div>
        {condomini.length === 0 && (
          <p className="mt-3 text-xs text-amber-700">
            Non hai ancora inserito condomìni. Aggiungine uno per generare il consuntivo e visualizzarlo nella tendina.
          </p>
        )}
      </div>

      {data && (
        <div className="space-y-5 animate-fade-up">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Consuntivo esercizio {data.anno}</p>
                <h2 className="font-display text-2xl font-extrabold text-slate-900">{data.condo.nome}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{data.condo.indirizzo}, {data.condo.citta}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Totale spese</p>
                <p className="kpi-val text-4xl text-blue-700">{fmtEur(data.totale)}</p>
                <p className="text-xs text-slate-400 mt-1">{data.nSpese} voci · {data.nUnita} unità</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Per categoria */}
            <div className="card overflow-hidden">
              <div className="card-header">Riepilogo per categoria</div>
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr><th className="th text-left">Categoria</th><th className="th text-right">Importo</th><th className="th text-right">%</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.perCat.map(r => (
                    <tr key={r.cat} className="tr-hover">
                      <td className="td capitalize">{r.cat}</td>
                      <td className="td text-right font-mono-num font-semibold">{fmtEur(r.totale)}</td>
                      <td className="td text-right font-mono-num text-slate-400 text-xs">{data.totale ? fmtNum(r.totale / data.totale * 100, 1) : 0}%</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="td">TOTALE</td>
                    <td className="td text-right font-mono-num">{fmtEur(data.totale)}</td>
                    <td className="td text-right font-mono-num text-xs">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Per tabella */}
            <div className="card overflow-hidden">
              <div className="card-header">Per tabella millesimi</div>
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr><th className="th text-left">Tabella</th><th className="th text-right">Importo</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.perTab.map(r => (
                    <tr key={r.tab} className="tr-hover">
                      <td className="td capitalize">{r.tab}</td>
                      <td className="td text-right font-mono-num font-semibold">{fmtEur(r.totale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ripartizione */}
          <div className="card overflow-hidden">
            <div className="card-header">Ripartizione per unità immobiliare (millesimi)</div>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                  <tr>
                    <th className="th text-left">Interno</th>
                    <th className="th text-left">Proprietario</th>
                    <th className="th text-right">Mill. Proprietà</th>
                    <th className="th text-right">Quota dovuta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.ripartizione.map(({ u, quota }) => (
                    <tr key={u.id} className="tr-hover">
                      <td className="td font-mono-num font-bold">{u.interno}</td>
                      <td className="td">{u.proprietario}</td>
                      <td className="td text-right font-mono-num text-slate-500">{fmtNum(u.millesimi_proprieta)}</td>
                      <td className="td text-right font-mono-num font-bold text-blue-700">{fmtEur(quota)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
