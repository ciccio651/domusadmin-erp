import { useState, useMemo } from 'react';
import { FileText, FileImage, File, Upload, Search, Trash2, Download, FolderOpen, ScanLine, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/appStore';
import { fmtDate, fmtNum } from '@/utils/helpers';
import { newId, nowIso } from '@/utils/helpers';
import { ScannerModal } from '@/components/ui/ScannerModal';
import type { ScannedFile } from '@/components/ui/ScannerModal';
import { openWhatsApp, messaggioDocumento } from '@/utils/whatsapp';

// ── Types ─────────────────────────────────────────────────────────────────

type TipoDoc = 'verbale' | 'delibera' | 'contratto' | 'planimetria' | 'consuntivo' | 'sollecito' | 'altro';

interface Documento {
  id: string;
  nome: string;
  tipo: TipoDoc;
  condominio_id: string;
  size_kb: number;
  created_at: string;
  dataUrl?: string;   // se acquisito via scanner
}

// ── Helpers ───────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<TipoDoc, string> = {
  verbale: 'Verbale', delibera: 'Delibera', contratto: 'Contratto',
  planimetria: 'Planimetria', consuntivo: 'Consuntivo', sollecito: 'Sollecito', altro: 'Altro',
};

const TIPO_BADGE: Record<TipoDoc, string> = {
  verbale:    'badge badge-blue',
  delibera:   'badge badge-amber',
  contratto:  'badge badge-slate',
  planimetria:'badge badge-green',
  consuntivo: 'badge badge-blue',
  sollecito:  'badge badge-red',
  altro:      'badge badge-slate',
};

function FileIcon({ tipo }: { tipo: TipoDoc }) {
  if (tipo === 'planimetria') return <FileImage className="w-5 h-5 text-blue-400" />;
  if (tipo === 'contratto')   return <File className="w-5 h-5 text-slate-400" />;
  return <FileText className="w-5 h-5 text-slate-500" />;
}

function fmtSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function Documents() {
  const { condomini } = useStore();
  const [docs, setDocs]         = useState<Documento[]>([]);
  const [query, setQuery]       = useState('');
  const [tipoFilter, setTipo]   = useState<'all' | TipoDoc>('all');
  const [condoFilter, setCondo] = useState('all');
  const [showScanner, setShowScanner] = useState(false);

  // Form per aggiunta manuale
  const [showForm, setShowForm] = useState(false);
  const [newDoc, setNewDoc] = useState<{
    nome: string; tipo: TipoDoc; condominio_id: string;
  }>({ nome: '', tipo: 'altro', condominio_id: '' });

  const filtered = useMemo(() => {
    let r = docs;
    if (tipoFilter !== 'all')  r = r.filter(d => d.tipo === tipoFilter);
    if (condoFilter !== 'all') r = r.filter(d => d.condominio_id === condoFilter);
    if (query.trim())          r = r.filter(d => d.nome.toLowerCase().includes(query.toLowerCase()));
    return r.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [docs, tipoFilter, condoFilter, query]);

  // ── Scanner callback ────────────────────────────────────────────────────
  const handleScanned = (scanned: ScannedFile) => {
    const doc: Documento = {
      id: newId(),
      nome: scanned.name,
      tipo: 'altro',
      condominio_id: condoFilter !== 'all' ? condoFilter : (condomini[0]?.id ?? ''),
      size_kb: Math.round(scanned.dataUrl.length * 0.75 / 1024), // approx
      created_at: nowIso(),
      dataUrl: scanned.dataUrl,
    };
    setDocs(prev => [doc, ...prev]);
    toast.success(`"${scanned.name}" acquisito dallo scanner`);
  };

  // ── Manual upload ───────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const doc: Documento = {
        id: newId(),
        nome: file.name.replace(/\.[^.]+$/, ''),
        tipo: 'altro',
        condominio_id: condoFilter !== 'all' ? condoFilter : (condomini[0]?.id ?? ''),
        size_kb: Math.round(file.size / 1024),
        created_at: nowIso(),
        dataUrl: ev.target?.result as string,
      };
      setDocs(prev => [doc, ...prev]);
      toast.success(`"${doc.nome}" caricato`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Manual add (form) ───────────────────────────────────────────────────
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.nome.trim()) return;
    const doc: Documento = {
      id: newId(),
      nome: newDoc.nome.trim(),
      tipo: newDoc.tipo,
      condominio_id: newDoc.condominio_id || (condomini[0]?.id ?? ''),
      size_kb: 0,
      created_at: nowIso(),
    };
    setDocs(prev => [doc, ...prev]);
    setNewDoc({ nome: '', tipo: 'altro', condominio_id: '' });
    setShowForm(false);
    toast.success('Documento aggiunto');
  };

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    toast.success('Documento eliminato');
  };

  const handleDownload = (doc: Documento) => {
    if (doc.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.nome;
      a.click();
    } else {
      toast.info(`Download: ${doc.nome}`);
    }
  };

  const handleWhatsApp = (doc: Documento) => {
    const condo = condomini.find(c => c.id === doc.condominio_id)?.nome ?? 'condominio';
    const msg = messaggioDocumento(doc.nome, condo);
    const phone = prompt('Numero WhatsApp destinatario (es: 3331234567):');
    if (!phone) return;
    openWhatsApp(phone, msg);
  };

  const cName = (id: string) => condomini.find(c => c.id === id)?.nome ?? '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Archivio Documenti</h1>
          <p className="page-sub">{fmtNum(filtered.length, 0)} documenti</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scanner */}
          <button
            onClick={() => setShowScanner(true)}
            className="btn-secondary gap-2"
            data-testid="btn-scanner"
          >
            <ScanLine className="w-4 h-4 text-blue-600" /> Scanner
          </button>
          {/* Upload file */}
          <label className="btn-secondary gap-2 cursor-pointer" data-testid="btn-upload-label">
            <Upload className="w-4 h-4" /> Carica file
            <input type="file" accept="image/*,application/pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
          </label>
          {/* Aggiungi manuale */}
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
            data-testid="btn-add-doc"
          >
            + Aggiungi
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9 w-56"
            placeholder="Cerca documento…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            data-testid="search-docs"
          />
        </div>
        <select className="select w-40" value={tipoFilter} onChange={e => setTipo(e.target.value as typeof tipoFilter)}>
          <option value="all">Tutti i tipi</option>
          {(Object.keys(TIPO_LABEL) as TipoDoc[]).map(t => (
            <option key={t} value={t}>{TIPO_LABEL[t]}</option>
          ))}
        </select>
        {condomini.length > 0 && (
          <select className="select w-52" value={condoFilter} onChange={e => setCondo(e.target.value)}>
            <option value="all">Tutti i condomini</option>
            {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="w-12 h-12 text-slate-200 mb-4" />
          <p className="font-display font-bold text-slate-400">Nessun documento</p>
          <p className="text-sm text-slate-300 mt-1 mb-6">
            {docs.length === 0
              ? 'Carica il primo documento con lo scanner o dal tuo computer'
              : 'Nessun documento corrisponde ai filtri'}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowScanner(true)} className="btn-primary gap-2">
              <ScanLine className="w-4 h-4" /> Scanner
            </button>
            <label className="btn-secondary gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Carica file
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="th text-left">Documento</th>
                  <th className="th text-left">Tipo</th>
                  <th className="th text-left">Condominio</th>
                  <th className="th text-right">Dim.</th>
                  <th className="th text-left">Data</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(doc => (
                  <tr key={doc.id} className="tr-hover" data-testid={`doc-row-${doc.id}`}>
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                          {doc.dataUrl && doc.dataUrl.startsWith('data:image')
                            ? <img src={doc.dataUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />
                            : <FileIcon tipo={doc.tipo} />}
                        </div>
                        <span className="font-medium text-slate-800 truncate max-w-[240px]">{doc.nome}</span>
                      </div>
                    </td>
                    <td className="td"><span className={TIPO_BADGE[doc.tipo]}>{TIPO_LABEL[doc.tipo]}</span></td>
                    <td className="td text-xs text-slate-500">{cName(doc.condominio_id)}</td>
                    <td className="td text-right font-mono-num text-xs text-slate-400">
                      {doc.size_kb > 0 ? fmtSize(doc.size_kb) : '—'}
                    </td>
                    <td className="td text-xs text-slate-400">{fmtDate(doc.created_at)}</td>
                    <td className="td">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          className="btn-icon text-slate-400 hover:text-green-600 hover:bg-green-50"
                          title="Invia via WhatsApp"
                          onClick={() => handleWhatsApp(doc)}
                          data-testid={`btn-wa-doc-${doc.id}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn-icon text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Scarica"
                          onClick={() => handleDownload(doc)}
                          data-testid={`btn-download-doc-${doc.id}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn-icon text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Elimina"
                          onClick={() => handleDelete(doc.id)}
                          data-testid={`btn-delete-doc-${doc.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Form aggiunta manuale ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-up">
            <h2 className="font-display font-bold text-xl">Aggiungi documento</h2>
            <form onSubmit={handleAddManual} className="space-y-3">
              <div>
                <label className="input-label">Nome documento *</label>
                <input
                  required className="input mt-1"
                  placeholder="Verbale assemblea 2025…"
                  value={newDoc.nome}
                  onChange={e => setNewDoc({ ...newDoc, nome: e.target.value })}
                  data-testid="new-doc-nome"
                />
              </div>
              <div>
                <label className="input-label">Tipo</label>
                <select
                  className="select mt-1"
                  value={newDoc.tipo}
                  onChange={e => setNewDoc({ ...newDoc, tipo: e.target.value as TipoDoc })}
                >
                  {(Object.entries(TIPO_LABEL) as [TipoDoc, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              {condomini.length > 0 && (
                <div>
                  <label className="input-label">Condominio</label>
                  <select
                    className="select mt-1"
                    value={newDoc.condominio_id}
                    onChange={e => setNewDoc({ ...newDoc, condominio_id: e.target.value })}
                  >
                    <option value="">— Nessuno —</option>
                    {condomini.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" className="btn-primary flex-1" data-testid="btn-save-doc">Aggiungi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Scanner Modal ── */}
      {showScanner && (
        <ScannerModal
          onCapture={handleScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
