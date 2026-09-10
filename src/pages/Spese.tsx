import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { fmtEur, fmtNum, newId, nowIso, statoBadgeClass, statoLabel, sumBy } from '@/utils/helpers';
import type { Spesa, CategoriaSpesa, StatoSpesa, TabellaMillesimi } from '@/types';

const CATS: CategoriaSpesa[]        = ['ordinaria','straordinaria','riscaldamento','ascensore','pulizie','energia','acqua','assicurazione','amministrazione','altro'];
const STATI: StatoSpesa[]           = ['da_pagare','pagata','parziale'];
const TAB: TabellaMillesimi[]       = ['proprieta','ascensore','riscaldamento'];

export default function Spese() {
  const { spese, condomini, fornitori, addSpesa, deleteSpesa } = useStore();
  const [condoFilter, setCondoFilter]   = useState('all');
  const [statoFilter, setStatoFilter]   = useState('all');
  const [open, setOpen]                 = useState(false);
  const [form, setForm] = useState<Omit<Spesa,'id'|'created_at'>>({
    condominio_id: '', fornitore_id: undefined, data: nowIso(),
    descrizione: '', categoria: 'ordinaria', importo: 0,
    numero_fattura: '', stato: 'da_pagare', tabella_millesimi: 'proprieta',
  });

  const filtered = useMemo(() => {
    let r = spese;
    if (condoFilter !== 'all') r = r.filter(s => s.condominio_id === condoFilter);
    if (statoFilter !== 'all') r = r.filter(s => s.stato === statoFilter);
    return r;
  }, [spese, condoFilter, statoFilter]);

  const totale = useMemo(() => sumBy(filtered, s => s.importo), [filtered]);
  const cName  = (id?: string) => condomini.find(c => c.id === id)?.nome ?? '—';
  const fName  = (id?: string) => fornitori.find(f => f.id === id)?.ragione_sociale ?? '—';

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.condominio_id) { toast.error('Seleziona un condominio'); return; }
    addSpesa({ ...form, id: newId(), importo: Number(form.importo), created_at: nowIso() });
    toast.success('Spesa registrata');
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Contabilità Spese</h1>
          <p className="page-sub">{fmtNum(filtered.length, 0)} spese · Totale <span className="font-mono-num font-bold text-slate-800">{fmtEur(totale)}</span></p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="select w-56" value={condoFilter} onChange={e => setCondoFilter(e.target.value)} data-testid="filter-condo">
            <option value="all">Tutti i condomini</option>
            {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select className="select w-40" value={statoFilter} onChange={e => setStatoFilter(e.target.value)} data-testid="filter-stato">
            <option value="all">Tutti gli stati</option>
            {STATI.map(s => <option key={s} value={s}>{statoLabel(s)}</option>)}
          </select>
          <button onClick={() => setOpen(true)} className="btn-primary" data-testid="btn-add-spesa">
            <Plus className="w-4 h-4" /> Nuova spesa
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pagate', val: sumBy(filtered.filter(s=>s.stato==='pagata'), s=>s.importo), cls: 'text-emerald-700' },
          { label: 'Da pagare', val: sumBy(filtered.filter(s=>s.stato==='da_pagare'), s=>s.importo), cls: 'text-amber-700' },
          { label: 'Parziali', val: sumBy(filtered.filter(s=>s.stato==='parziale'), s=>s.importo), cls: 'text-blue-700' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            <span className={`font-mono-num font-bold ${cls}`}>{fmtEur(val)}</span>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
              <tr>
                <th className="th text-left">Data</th>
                <th className="th text-left">Condominio</th>
                <th className="th text-left">Descrizione</th>
                <th className="th text-left">Fornitore</th>
                <th className="th text-left">Cat.</th>
                <th className="th text-right">Importo</th>
                <th className="th text-left">Stato</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 400).map(s => (
                <tr key={s.id} className="tr-hover">
                  <td className="td font-mono-num text-xs text-slate-500">{s.data}</td>
                  <td className="td text-xs text-slate-600 max-w-[140px] truncate">{cName(s.condominio_id)}</td>
                  <td className="td text-sm">{s.descrizione}</td>
                  <td className="td text-xs text-slate-500 max-w-[120px] truncate">{fName(s.fornitore_id)}</td>
                  <td className="td text-xs text-slate-500 capitalize">{s.categoria}</td>
                  <td className="td text-right font-mono-num font-semibold">{fmtEur(s.importo)}</td>
                  <td className="td"><span className={statoBadgeClass(s.stato)}>{statoLabel(s.stato)}</span></td>
                  <td className="td text-right">
                    <button onClick={() => { deleteSpesa(s.id); toast.success('Eliminata'); }} className="btn-icon text-rose-500 hover:bg-rose-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 400 && <p className="text-center py-2 text-xs text-slate-400">Mostrando 400 di {filtered.length} righe — usa i filtri per restringere</p>}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl p-6 space-y-4 animate-fade-up">
            <h2 className="font-display font-bold text-xl">Nuova spesa</h2>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Condominio*</label>
                  <select required className="select" value={form.condominio_id}
                    onChange={e => setForm({...form, condominio_id: e.target.value})} data-testid="select-condo">
                    <option value="">Seleziona…</option>
                    {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Fornitore</label>
                  <select className="select" value={form.fornitore_id ?? ''}
                    onChange={e => setForm({...form, fornitore_id: e.target.value || undefined})}>
                    <option value="">Nessuno</option>
                    {fornitori.map(f => <option key={f.id} value={f.id}>{f.ragione_sociale}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Descrizione*</label>
                <input required className="input" value={form.descrizione} onChange={e => setForm({...form, descrizione: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div><label className="input-label">Data*</label><input required type="date" className="input" value={form.data} onChange={e => setForm({...form, data: e.target.value})} /></div>
                <div><label className="input-label">Importo (€)*</label><input required type="number" step="0.01" className="input font-mono-num" value={form.importo} onChange={e => setForm({...form, importo: Number(e.target.value)})} /></div>
                <div><label className="input-label">N. Fattura</label><input className="input font-mono-num" value={form.numero_fattura} onChange={e => setForm({...form, numero_fattura: e.target.value})} /></div>
                <div>
                  <label className="input-label">Stato</label>
                  <select className="select" value={form.stato} onChange={e => setForm({...form, stato: e.target.value as StatoSpesa})}>
                    {STATI.map(s => <option key={s} value={s}>{statoLabel(s)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Categoria</label>
                  <select className="select" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value as CategoriaSpesa})}>
                    {CATS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Tabella millesimi</label>
                  <select className="select" value={form.tabella_millesimi} onChange={e => setForm({...form, tabella_millesimi: e.target.value as TabellaMillesimi})}>
                    {TAB.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn-primary flex-1" data-testid="btn-save-spesa">Registra</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
