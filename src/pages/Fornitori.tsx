import { useState, useMemo } from 'react';
import { Plus, Search, Building, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { fmtNum, newId, nowIso } from '@/utils/helpers';
import type { Fornitore, CategoriaFornitore } from '@/types';

const CATS: CategoriaFornitore[] = [
  'manutenzione','pulizie','elettricista','idraulico',
  'assicurazione','ascensori','giardinaggio','amministrativo','altro',
];

const EMPTY: Omit<Fornitore,'id'|'created_at'> = {
  ragione_sociale: '', piva: '', codice_fiscale: '', categoria: 'altro',
  iban: '', email: '', telefono: '', indirizzo: '',
};

const catBadge: Record<CategoriaFornitore, string> = {
  manutenzione: 'badge badge-amber', pulizie: 'badge badge-blue',
  elettricista: 'badge badge-amber', idraulico: 'badge badge-blue',
  assicurazione: 'badge badge-green', ascensori: 'badge badge-blue',
  giardinaggio: 'badge badge-green', amministrativo: 'badge badge-slate',
  altro: 'badge badge-slate',
};

export default function Fornitori() {
  const { fornitori, addFornitore, deleteFornitore } = useStore();
  const [q, setQ]       = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() =>
    q.trim()
      ? fornitori.filter(f =>
          f.ragione_sociale.toLowerCase().includes(q.toLowerCase()) ||
          (f.piva ?? '').includes(q) ||
          f.categoria.includes(q.toLowerCase()))
      : fornitori,
    [fornitori, q]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    addFornitore({ ...form, id: newId(), created_at: nowIso() });
    toast.success(`Fornitore "${form.ragione_sociale}" aggiunto`);
    setOpen(false);
    setForm(EMPTY);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Fornitori</h1>
          <p className="page-sub">{fmtNum(filtered.length, 0)} fornitori registrati</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Cerca fornitore…" className="input pl-9 w-64"
              data-testid="input-search-fornitore" />
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary" data-testid="btn-add-fornitore">
            <Plus className="w-4 h-4" /> Nuovo
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="th text-left">Ragione sociale</th>
              <th className="th text-left">Categoria</th>
              <th className="th text-left">P.IVA</th>
              <th className="th text-left">IBAN</th>
              <th className="th text-left">Contatti</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(f => (
              <tr key={f.id} className="tr-hover" data-testid={`row-fornitore-${f.id}`}>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="font-semibold text-slate-800">{f.ragione_sociale}</span>
                  </div>
                </td>
                <td className="td"><span className={catBadge[f.categoria]}>{f.categoria}</span></td>
                <td className="td font-mono-num text-xs text-slate-600">{f.piva || '—'}</td>
                <td className="td font-mono-num text-xs text-slate-500 max-w-[180px] truncate">{f.iban || '—'}</td>
                <td className="td text-sm text-slate-600">
                  <p>{f.email}</p>
                  <p className="text-xs text-slate-400">{f.telefono}</p>
                </td>
                <td className="td text-right">
                  <button
                    onClick={() => { if(confirm('Eliminare il fornitore?')) { deleteFornitore(f.id); toast.success('Fornitore eliminato'); }}}
                    className="btn-icon text-rose-500 hover:bg-rose-50"
                    data-testid={`btn-del-fornitore-${f.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="td text-center py-12 text-slate-400">Nessun fornitore trovato</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-4 animate-fade-up">
            <h2 className="font-display font-bold text-xl">Nuovo fornitore</h2>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="input-label">Ragione sociale*</label>
                <input required className="input" value={form.ragione_sociale}
                  onChange={e => setForm({...form, ragione_sociale: e.target.value})}
                  data-testid="input-ragione" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">P.IVA</label>
                  <input className="input font-mono-num" value={form.piva}
                    onChange={e => setForm({...form, piva: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Categoria</label>
                  <select className="select" value={form.categoria}
                    onChange={e => setForm({...form, categoria: e.target.value as CategoriaFornitore})}
                    data-testid="select-categoria">
                    {CATS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">IBAN</label>
                <input className="input font-mono-num" value={form.iban}
                  onChange={e => setForm({...form, iban: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="input-label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><label className="input-label">Telefono</label><input className="input" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
              </div>
              <div><label className="input-label">Indirizzo</label><input className="input" value={form.indirizzo} onChange={e => setForm({...form, indirizzo: e.target.value})} /></div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn-primary flex-1" data-testid="btn-save-fornitore">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
