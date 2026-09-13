import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { fmtEur, fmtNum, newId, nowIso, statoBadgeClass, statoLabel, sumBy } from '@/utils/helpers';
import type { MovimentoBancario, TipoMovimento } from '@/types';

export default function Banca() {
  const { movimenti, condomini, addMovimento, deleteMovimento } = useStore();
  const [condoFilter, setCondoFilter] = useState('all');
  const [tipoFilter,  setTipoFilter]  = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<MovimentoBancario,'id'|'created_at'>>({
    condominio_id: '', condominio_nome: '', data: nowIso(), descrizione: '',
    tipo: 'entrata', importo: 0, causale: '', iban_controparte: '',
  });

  const filtered = useMemo(() => {
    let r = movimenti;
    if (condoFilter !== 'all') r = r.filter(m => m.condominio_id === condoFilter);
    if (tipoFilter !== 'all')  r = r.filter(m => m.tipo === tipoFilter);
    return r.slice().sort((a,b) => b.data.localeCompare(a.data));
  }, [movimenti, condoFilter, tipoFilter]);

  const entrate = useMemo(() => sumBy(filtered.filter(m => m.tipo==='entrata'), m => m.importo), [filtered]);
  const uscite  = useMemo(() => sumBy(filtered.filter(m => m.tipo==='uscita'),  m => m.importo), [filtered]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.condominio_id && !form.condominio_nome?.trim()) { toast.error('Seleziona o inserisci il nome del condominio'); return; }
    addMovimento({ ...form, id: newId(), importo: Number(form.importo), created_at: nowIso() });
    toast.success('Movimento registrato');
    setOpen(false);
  };

  const cName = (id: string, nome?: string) => condomini.find(c => c.id === id)?.nome ?? nome ?? '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Movimenti Bancari</h1>
          <p className="page-sub">{fmtNum(filtered.length, 0)} movimenti</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="select w-56" value={condoFilter} onChange={e => setCondoFilter(e.target.value)} data-testid="filter-condo-banca">
            <option value="all">Tutti i condomini</option>
            {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select className="select w-36" value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}>
            <option value="all">Tutti i tipi</option>
            <option value="entrata">Solo Entrate</option>
            <option value="uscita">Solo Uscite</option>
          </select>
          <button onClick={() => setOpen(true)} className="btn-primary" data-testid="btn-add-movimento">
            <Plus className="w-4 h-4" /> Nuovo
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card px-5 py-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Entrate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="kpi-val text-2xl text-emerald-700">{fmtEur(entrate)}</p>
        </div>
        <div className="card px-5 py-4 border-l-4 border-rose-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700">Uscite</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="kpi-val text-2xl text-rose-700">{fmtEur(uscite)}</p>
        </div>
        <div className="card px-5 py-4 border-l-4 border-slate-400">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Saldo</span>
          </div>
          <p className={`kpi-val text-2xl ${entrate - uscite >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
            {fmtEur(entrate - uscite)}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
              <tr>
                <th className="th text-left">Data</th>
                <th className="th text-left">Condominio</th>
                <th className="th text-left">Descrizione</th>
                <th className="th text-left">Causale</th>
                <th className="th text-center">Tipo</th>
                <th className="th text-right">Importo</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 400).map(m => (
                <tr key={m.id} className="tr-hover">
                  <td className="td font-mono-num text-xs text-slate-500">{m.data}</td>
                  <td className="td text-xs text-slate-600 max-w-[140px] truncate">{cName(m.condominio_id, m.condominio_nome)}</td>
                  <td className="td text-sm">{m.descrizione}</td>
                  <td className="td text-xs text-slate-400">{m.causale}</td>
                  <td className="td text-center">
                    <span className={statoBadgeClass(m.tipo)}>{statoLabel(m.tipo)}</span>
                  </td>
                  <td className={`td text-right font-mono-num font-bold ${m.tipo==='entrata' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {m.tipo==='entrata' ? '+' : '−'} {fmtEur(m.importo)}
                  </td>
                  <td className="td text-right">
                    <button onClick={() => { deleteMovimento(m.id); toast.success('Eliminato'); }} className="btn-icon text-rose-500 hover:bg-rose-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 400 && <p className="text-center py-2 text-xs text-slate-400">Mostrando 400 di {filtered.length}</p>}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-4 animate-fade-up">
            <h2 className="font-display font-bold text-xl">Nuovo movimento</h2>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="input-label">Condominio*</label>
                <select required={condomini.length > 0 && !form.condominio_nome} className="select" value={form.condominio_id} onChange={e => setForm({...form, condominio_id: e.target.value})}>
                  <option value="">Seleziona…</option>
                  {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                {condomini.length === 0 && <>
                  <input required={!form.condominio_id} className="input mt-2" placeholder="Oppure inserisci il nome del condominio" value={form.condominio_nome} onChange={e => setForm({ ...form, condominio_nome: e.target.value })} />
                  <p className="mt-1 text-xs text-amber-700">Non ci sono ancora condomìni registrati. Puoi inserire il nome manualmente oppure aggiungerlo dalla sezione Condomini.</p>
                </>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="input-label">Data*</label><input required type="date" className="input" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></div>
                <div>
                  <label className="input-label">Tipo*</label>
                  <select required className="select" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as TipoMovimento})}>
                    <option value="entrata">Entrata</option>
                    <option value="uscita">Uscita</option>
                  </select>
                </div>
                <div><label className="input-label">Importo (€)*</label><input required type="number" step="0.01" className="input font-mono-num" value={form.importo} onChange={e => setForm({...form, importo: Number(e.target.value)})} /></div>
              </div>
              <div><label className="input-label">Descrizione*</label><input required className="input" value={form.descrizione} onChange={e => setForm({...form, descrizione: e.target.value})} /></div>
              <div><label className="input-label">Causale / IBAN controparte</label><input className="input font-mono-num" value={form.causale} onChange={e => setForm({...form, causale: e.target.value})} /></div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn-primary flex-1" data-testid="btn-save-movimento">Registra</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
