// ── Formatting helpers ────────────────────────────────────────────────────

export const fmtEur = (n: number): string =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n ?? 0);

export const fmtNum = (n: number, decimals = 2): string =>
  Number(n ?? 0).toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const fmtDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

// ── ID generator ──────────────────────────────────────────────────────────

export const newId = (): string => crypto.randomUUID();

export const nowIso = (): string => new Date().toISOString().slice(0, 10);

// ── Financial status helpers ──────────────────────────────────────────────

export const statoBadgeClass = (stato: string): string => {
  switch (stato) {
    case 'pagata':   return 'badge badge-green';
    case 'da_pagare':return 'badge badge-amber';
    case 'parziale': return 'badge badge-blue';
    case 'aperta':   return 'badge badge-red';
    case 'entrata':  return 'badge badge-green';
    case 'uscita':   return 'badge badge-red';
    default:         return 'badge badge-slate';
  }
};

export const statoLabel = (stato: string): string => {
  const map: Record<string,string> = {
    pagata: 'Pagata', da_pagare: 'Da pagare', parziale: 'Parziale',
    aperta: 'Aperta', entrata: 'Entrata', uscita: 'Uscita',
  };
  return map[stato] ?? stato;
};

// ── Array/data utils ──────────────────────────────────────────────────────

export const groupBy = <T>(arr: T[], key: (x: T) => string): Record<string, T[]> =>
  arr.reduce((acc, x) => {
    const k = key(x);
    (acc[k] ??= []).push(x);
    return acc;
  }, {} as Record<string, T[]>);

export const sumBy = <T>(arr: T[], fn: (x: T) => number): number =>
  arr.reduce((a, x) => a + fn(x), 0);

export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
