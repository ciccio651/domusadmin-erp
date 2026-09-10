import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { fmtEur, fmtNum, newId, statoBadgeClass, statoLabel, sumBy } from '@/utils/helpers';
import type { Unita } from '@/types';

type Tab = 'unita' | 'spese' | 'rate';

export default function CondominioDetail() {
  const { id } = useParams<{ id: string }>();
  const { condomini, unita, spese, rate, addUnita, deleteUnita } = useStore();

  const condo = condomini.find(c => c.id === id);
  const myUnita  = useMemo(() => unita.filter(u => u.condominio_id === id), [unita, id]);
  const mySpese  = useMemo(() => spese.filter(s => s.condominio_id === id), [spese, id]);
  const myRate   = useMemo(() => rate.filter(r => r.condominio_id === id), [rate, id]);

  const [tab, setTab]   = useState<Tab>('unita');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Unita,'id'|'condominio_id'>>({
    interno: '', proprietario: '', email: '', telefono: '',
    millesimi_proprieta: 0, millesimi_ascensore: 0, millesimi_riscaldamento: 0,
    mq: 0, tipo: 'appartamento',
  });

  if (!condo) return (
    <div className="text-center py-20 text-slate-400">
      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p>Condominio non trovato.</p>
      <Link to="/condomini" className="text-blue-700 text-sm hover:underline mt-2 inline-block">← Torna all'elenco</Link>
    </div>
  );

  const totMillProp = sumBy(myUnita, u => u.millesimi_proprieta);
  const totSpese    = sumBy(mySpese, s => s.importo);
  const debiti      = sumBy(myRate.filter(r => r.stato !== 'pagata'), r => r.importo - r.pagato);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    addUnita({ ...form, id: newId(), condominio_id: id!, mq: Number(form.mq) || undefined });
    toast.success('Unità creata');
    setOpen(false);
    setForm({ interno:'', proprietario:'', email:'', telefono:'', millesimi_proprieta:0, millesimi_ascensore:0, millesimi_riscaldamento:0, mq:0, tipo:'appartamento' });
  };

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'unita', label: 'Unità immobiliari', count: myUnita.length },
    { key: 'spese', label: 'Spese', count: mySpese.length },
    { key: 'rate',  label: 'Rate condòmini',    count: myRate.length },
  ];

  return (
    <div className="space-y-6">
      <Link to="/condomini" className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline" data-testid="link-back">
        <ArrowLeft className="w-4 h-4" /> Torna all'elenco
      </Link>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">{condo.nome}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{condo.indirizzo} · {condo.citta} {condo.cap}</p>
              {condo.codice_fiscale && (
                <p className="text-[11px] text-slate-400 font-mono-num mt-0.5">CF: {condo.codice_fiscale}</p>
              )}
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Unità</p>
              <p className="font-mono-num text-2xl font-extrabold text-slate-900">{myUnita.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Spese anno</p>
              <p className="font-mono-num text-2xl font-extrabold text-blue-700">{fmtEur(totSpese)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Debiti</p>
              <p className="font-mono-num text-2xl font-extrabold text-rose-700">{fmtEur(debiti)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            data-testid={`tab-${key}`}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              tab === key ? 'bg-slate-100 text-slate-600' : 'bg-slate-200/60 text-slate-500'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Unità ── */}
      {tab === 'unita' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Totale millesimi proprietà: <span className="font-mono-num font-bold text-slate-700">{fmtNum(totMillProp)}</span> / 1.000
            </p>
            <button onClick={() => setOpen(true)} className="btn-primary" data-testid="btn-add-unita">
              <Plus className="w-4 h-4" /> Nuova unità
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="th text-left">Int.</th>
                  <th className="th text-left">Proprietario</th>
                  <th className="th text-right">Mill. Proprietà</th>
                  <th className="th text-right">Mill. Ascens.</th>
                  <th className="th text-right">Mill. Risc.</th>
                  <th className="th text-right">mq</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myUnita.map(u => (
                  <tr key={u.id} className="tr-hover">
                    <td className="td font-mono-num font-bold text-slate-800">{u.interno}</td>
                    <td className="td font-medium">{u.proprietario}<br/><span className="text-[11px] text-slate-400">{u.email}</span></td>
                    <td className="td text-right font-mono-num">{fmtNum(u.millesimi_proprieta)}</td>
                    <td className="td text-right font-mono-num text-slate-500">{fmtNum(u.millesimi_ascensore)}</td>
                    <td className="td text-right font-mono-num text-slate-500">{fmtNum(u.millesimi_riscaldamento)}</td>
                    <td className="td text-right text-slate-500">{u.mq ?? '—'}</td>
                    <td className="td text-right">
                      <button onClick={() => { deleteUnita(u.id); toast.success('Unità eliminata'); }}
                              className="btn-icon text-rose-500 hover:bg-rose-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Spese ── */}
      {tab === 'spese' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="th text-left">Data</th>
                <th className="th text-left">Descrizione</th>
                <th className="th text-left">Categoria</th>
                <th className="th text-right">Importo</th>
                <th className="th text-left">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mySpese.map(s => (
                <tr key={s.id} className="tr-hover">
                  <td className="td font-mono-num text-xs text-slate-500">{s.data}</td>
                  <td className="td">{s.descrizione}</td>
                  <td className="td capitalize text-slate-500 text-xs">{s.categoria}</td>
                  <td className="td text-right font-mono-num font-semibold">{fmtEur(s.importo)}</td>
                  <td className="td"><span className={statoBadgeClass(s.stato)}>{statoLabel(s.stato)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Rate ── */}
      {tab === 'rate' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="th text-left">Scadenza</th>
                <th className="th text-left">Unità / Proprietario</th>
                <th className="th text-right">Importo</th>
                <th className="th text-right">Pagato</th>
                <th className="th text-left">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRate.map(r => {
                const u = myUnita.find(x => x.id === r.unita_id);
                return (
                  <tr key={r.id} className="tr-hover">
                    <td className="td font-mono-num text-xs text-slate-500">{r.scadenza}</td>
                    <td className="td">{u ? `Int. ${u.interno} — ${u.proprietario}` : r.descrizione}</td>
                    <td className="td text-right font-mono-num">{fmtEur(r.importo)}</td>
                    <td className="td text-right font-mono-num text-emerald-700">{fmtEur(r.pagato)}</td>
                    <td className="td"><span className={statoBadgeClass(r.stato)}>{statoLabel(r.stato)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuova unità */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-4 animate-fade-up">
            <h2 className="font-display font-bold text-xl">Nuova unità immobiliare</h2>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="input-label">Interno*</label><input required className="input" value={form.interno} onChange={e => setForm({...form, interno: e.target.value})} /></div>
                <div><label className="input-label">Proprietario*</label><input required className="input" value={form.proprietario} onChange={e => setForm({...form, proprietario: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="input-label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><label className="input-label">Telefono</label><input className="input" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="input-label">Mill. Proprietà</label><input type="number" step="0.01" className="input font-mono-num" value={form.millesimi_proprieta} onChange={e => setForm({...form, millesimi_proprieta: Number(e.target.value)})} /></div>
                <div><label className="input-label">Mill. Ascens.</label><input type="number" step="0.01" className="input font-mono-num" value={form.millesimi_ascensore} onChange={e => setForm({...form, millesimi_ascensore: Number(e.target.value)})} /></div>
                <div><label className="input-label">Mill. Risc.</label><input type="number" step="0.01" className="input font-mono-num" value={form.millesimi_riscaldamento} onChange={e => setForm({...form, millesimi_riscaldamento: Number(e.target.value)})} /></div>
              </div>
              <div><label className="input-label">mq</label><input type="number" className="input" value={form.mq} onChange={e => setForm({...form, mq: Number(e.target.value)})} /></div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn-primary flex-1" data-testid="btn-save-unita">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
