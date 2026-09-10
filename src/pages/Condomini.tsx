import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, MapPin, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { fmtNum, newId, nowIso } from '@/utils/helpers';
import type { Condominio } from '@/types';

const EMPTY: Omit<Condominio, 'id' | 'created_at'> = {
  nome: '', indirizzo: '', citta: '', cap: '',
  codice_fiscale: '', n_unita: 0, anno_costruzione: 2000,
};

export default function Condomini() {
  const { condomini, unita, addCondominio, deleteCondominio } = useStore();
  const [q, setQ]       = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() =>
    q.trim()
      ? condomini.filter(c =>
          c.nome.toLowerCase().includes(q.toLowerCase()) ||
          c.citta.toLowerCase().includes(q.toLowerCase()) ||
          c.indirizzo.toLowerCase().includes(q.toLowerCase()))
      : condomini,
    [condomini, q]);

  const unitaCount = (cid: string) => unita.filter(u => u.condominio_id === cid).length;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.citta.trim()) return;
    addCondominio({ ...form, id: newId(), n_unita: Number(form.n_unita), created_at: nowIso() });
    toast.success(`Condominio "${form.nome}" creato`);
    setOpen(false);
    setForm(EMPTY);
  };

  const del = (c: Condominio) => {
    if (!confirm(`Eliminare "${c.nome}" e tutti i dati associati?`)) return;
    deleteCondominio(c.id);
    toast.success('Condominio eliminato');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Condomini</h1>
          <p className="page-sub">{fmtNum(filtered.length, 0)} di {fmtNum(condomini.length, 0)} condomini</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Cerca per nome, città…"
              className="input pl-9 w-72"
              data-testid="input-search-condo"
            />
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary" data-testid="btn-add-condo">
            <Plus className="w-4 h-4" /> Nuovo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="th text-left">Nome condominio</th>
                <th className="th text-left">Indirizzo</th>
                <th className="th text-left">Città</th>
                <th className="th text-right">Unità</th>
                <th className="th text-right">Anno</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="tr-hover" data-testid={`row-condo-${c.id}`}>
                  <td className="td">
                    <Link
                      to={`/condomini/${c.id}`}
                      className="flex items-center gap-2 font-semibold text-slate-800 hover:text-blue-700 group"
                    >
                      <div className="w-8 h-8 rounded-md bg-slate-100 group-hover:bg-blue-50
                                      flex items-center justify-center shrink-0 transition-colors">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                      </div>
                      <span className="truncate max-w-[220px]">{c.nome}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0" />
                    </Link>
                  </td>
                  <td className="td text-slate-500">{c.indirizzo}</td>
                  <td className="td">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.citta} · <span className="font-mono-num text-xs">{c.cap}</span>
                    </div>
                  </td>
                  <td className="td text-right font-mono-num font-semibold text-slate-800">
                    {unitaCount(c.id)}
                  </td>
                  <td className="td text-right text-slate-500 font-mono-num">
                    {c.anno_costruzione ?? '—'}
                  </td>
                  <td className="td text-right">
                    <button
                      onClick={() => del(c)}
                      className="btn-icon text-rose-500 hover:bg-rose-50"
                      data-testid={`btn-del-condo-${c.id}`}
                      title="Elimina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="td text-center py-12 text-slate-400">
                    Nessun condominio trovato
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-5 animate-fade-up">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">Nuovo condominio</h2>
              <p className="text-sm text-slate-500 mt-1">Inserisci i dati del nuovo edificio</p>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="input-label">Nome*</label>
                <input required className="input" value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Es. Condominio Europa" data-testid="input-nome" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Indirizzo*</label>
                  <input required className="input" value={form.indirizzo}
                    onChange={e => setForm({ ...form, indirizzo: e.target.value })}
                    placeholder="Via Roma 1" />
                </div>
                <div>
                  <label className="input-label">Città*</label>
                  <input required className="input" value={form.citta}
                    onChange={e => setForm({ ...form, citta: e.target.value })}
                    placeholder="Milano" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="input-label">CAP</label>
                  <input className="input" value={form.cap}
                    onChange={e => setForm({ ...form, cap: e.target.value })} placeholder="20100" />
                </div>
                <div>
                  <label className="input-label">N. Unità</label>
                  <input type="number" className="input" value={form.n_unita}
                    onChange={e => setForm({ ...form, n_unita: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="input-label">Anno costr.</label>
                  <input type="number" className="input" value={form.anno_costruzione}
                    onChange={e => setForm({ ...form, anno_costruzione: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="input-label">Codice Fiscale</label>
                <input className="input font-mono-num" value={form.codice_fiscale}
                  onChange={e => setForm({ ...form, codice_fiscale: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn-primary flex-1" data-testid="btn-save-condo">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
