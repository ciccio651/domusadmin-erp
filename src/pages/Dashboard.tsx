import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Building2, Wallet, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useStore } from '@/store/appStore';
import { fmtEur, fmtNum, sumBy } from '@/utils/helpers';

const CAT_COLORS = [
  '#1D4ED8','#0891B2','#059669','#D97706','#DC2626',
  '#7C3AED','#DB2777','#0284C7','#65A30D','#EA580C',
];

function KpiCard({
  icon: Icon, label, value, sub, tone = 'slate', testid,
}: {
  icon: React.ElementType; label: string; value: string;
  sub?: string; tone?: string; testid?: string;
}) {
  const colors: Record<string,string> = {
    slate: 'text-slate-900', green: 'text-emerald-700',
    red: 'text-rose-700',    blue: 'text-blue-700',
  };
  return (
    <div
      className="card p-5 hover:shadow-card-md transition-all duration-150 group"
      data-testid={testid}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-slate-100
                        flex items-center justify-center transition-colors shrink-0">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
      </div>
      <p className={`kpi-val text-3xl font-extrabold ${colors[tone] ?? colors.slate}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// Custom tooltip for recharts
function CashTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-md p-3 text-xs">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="font-mono-num">
          {p.name}: {fmtEur(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { condomini, unita, fornitori, rate, movimenti, spese } = useStore();

  const kpi = useMemo(() => {
    const anno = 2025;
    const speseTot = sumBy(spese.filter(s => s.data.startsWith(String(anno))), s => s.importo);
    const entrate  = sumBy(movimenti.filter(m => m.tipo === 'entrata'), m => m.importo);
    const uscite   = sumBy(movimenti.filter(m => m.tipo === 'uscita'),  m => m.importo);
    const debiti   = sumBy(rate.filter(r => r.stato !== 'pagata'), r => r.importo - r.pagato);

    const perCat: Record<string,number> = {};
    spese.filter(s => s.data.startsWith(String(anno)))
         .forEach(s => { perCat[s.categoria] = (perCat[s.categoria] ?? 0) + s.importo; });

    const MESI = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
    const cashFlow = MESI.map((mese, i) => {
      const m = String(i + 1).padStart(2,'0');
      const e = sumBy(movimenti.filter(x => x.tipo==='entrata' && x.data.startsWith(`${anno}-${m}`)), x => x.importo);
      const u = sumBy(movimenti.filter(x => x.tipo==='uscita'  && x.data.startsWith(`${anno}-${m}`)), x => x.importo);
      return { mese, entrate: Math.round(e), uscite: Math.round(u) };
    });

    return {
      speseTot, saldo: entrate - uscite, debiti,
      perCat: Object.entries(perCat).map(([c,t]) => ({ categoria: c, totale: t })),
      cashFlow, anno,
    };
  }, [spese, movimenti, rate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Panoramica generale — Esercizio {kpi.anno}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4" data-testid="kpi-grid">
        <KpiCard
          icon={Building2} label="Condomini attivi"
          value={fmtNum(condomini.length, 0)}
          sub={`${fmtNum(unita.length, 0)} unità · ${fmtNum(fornitori.length, 0)} fornitori`}
          testid="kpi-condomini"
        />
        <KpiCard
          icon={Wallet} label="Saldo bancario"
          value={fmtEur(kpi.saldo)}
          tone={kpi.saldo >= 0 ? 'green' : 'red'}
          sub="Entrate − Uscite totali"
          testid="kpi-saldo"
        />
        <KpiCard
          icon={AlertTriangle} label="Debiti condòmini"
          value={fmtEur(kpi.debiti)}
          tone="red"
          sub="Rate scadute o parziali"
          testid="kpi-debiti"
        />
        <KpiCard
          icon={TrendingUp} label={`Spese ${kpi.anno}`}
          value={fmtEur(kpi.speseTot)}
          tone="blue"
          sub={`${kpi.perCat.length} categorie di spesa`}
          testid="kpi-spese"
        />
      </div>

      {condomini.length === 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-4 border-amber-200 bg-amber-50 p-5">
          <div>
            <p className="font-display font-bold text-amber-900">Nessun condominio nell'archivio di questo browser</p>
            <p className="mt-1 text-sm text-amber-800">Inserisci il primo condominio per attivare unità, spese, rate e consuntivi.</p>
          </div>
          <Link to="/condomini" className="btn-primary" data-testid="link-dashboard-add-condominio">
            + Nuovo condominio
          </Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Cash flow bar chart */}
        <div className="card xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-slate-800">Flusso di cassa mensile</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Entrate vs Uscite — {kpi.anno}</p>
            </div>
            <Users className="w-4 h-4 text-slate-300" />
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpi.cashFlow} margin={{ top: 5, right: 5, left: 0, bottom: 5 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="mese" stroke="#94A3B8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={v => `${Math.round(v/1000)}k`} axisLine={false} tickLine={false} />
                <Tooltip content={<CashTooltip />} />
                <Bar dataKey="entrate" fill="#059669" name="Entrate" radius={[3,3,0,0]} maxBarSize={28} />
                <Bar dataKey="uscite"  fill="#BE123C" name="Uscite"  radius={[3,3,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-slate-800 mb-4">Spese per categoria</h2>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpi.perCat} dataKey="totale" nameKey="categoria"
                  innerRadius={52} outerRadius={78} paddingAngle={2}
                >
                  {kpi.perCat.map((_, i) => (
                    <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtEur(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-3 max-h-44 overflow-y-auto">
            {kpi.perCat.sort((a,b) => b.totale - a.totale).map((c, i) => (
              <div key={c.categoria} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm shrink-0"
                       style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                  <span className="capitalize text-slate-600">{c.categoria}</span>
                </div>
                <span className="font-mono-num font-semibold text-slate-700">{fmtEur(c.totale)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Rate pagate', value: fmtNum(rate.filter(r => r.stato==='pagata').length, 0), tone: 'text-emerald-700' },
          { label: 'Rate aperte', value: fmtNum(rate.filter(r => r.stato==='aperta').length, 0),   tone: 'text-rose-700'   },
          { label: 'Spese da pagare', value: fmtNum(spese.filter(s => s.stato==='da_pagare').length, 0), tone: 'text-amber-700' },
          { label: 'Movimenti registrati', value: fmtNum(movimenti.length, 0), tone: 'text-blue-700' },
        ].map(({ label, value, tone }) => (
          <div key={label} className="card px-4 py-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">{label}</span>
            <span className={`font-mono-num font-bold text-lg ${tone}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
