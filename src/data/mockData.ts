import type {
  Condominio, Unita, Fornitore, Spesa,
  MovimentoBancario, Rata,
} from '@/types';

// ── Dati azzerati — inserisci i tuoi dati dall'applicazione ───────────────

export const MOCK_CONDOMINI: Condominio[]       = [];
export const MOCK_UNITA: Unita[]                = [];
export const MOCK_FORNITORI: Fornitore[]        = [];
export const MOCK_SPESE: Spesa[]                = [];
export const MOCK_MOVIMENTI: MovimentoBancario[]= [];
export const MOCK_RATE: Rata[]                  = [];

export const MOCK_KPI = {
  n_condomini: 0,
  n_unita:     0,
  n_fornitori: 0,
  spese_totali_anno: 0,
  saldo_bancario: 0,
  debiti_totali: 0,
  spese_per_categoria: [] as { categoria: string; totale: number }[],
  cash_flow_mensile: [] as { mese: string; entrate: number; uscite: number }[],
  anno: new Date().getFullYear(),
};
