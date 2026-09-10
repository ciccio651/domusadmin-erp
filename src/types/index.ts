// ── Domain types for DomusAdmin ERP ──────────────────────────────────────

export type StatoSpesa     = 'da_pagare' | 'pagata' | 'parziale';
export type StatoRata      = 'aperta'   | 'parziale' | 'pagata';
export type TipoMovimento  = 'entrata'  | 'uscita';
export type TipoUnita      = 'appartamento' | 'box' | 'cantina' | 'negozio' | 'ufficio';
export type CategoriaSpesa =
  | 'ordinaria' | 'straordinaria' | 'riscaldamento' | 'ascensore'
  | 'pulizie'   | 'energia'       | 'acqua'          | 'assicurazione'
  | 'amministrazione' | 'altro';
export type CategoriaFornitore =
  | 'manutenzione' | 'pulizie' | 'elettricista' | 'idraulico'
  | 'assicurazione' | 'ascensori' | 'giardinaggio' | 'amministrativo' | 'altro';
export type TabellaMillesimi = 'proprieta' | 'ascensore' | 'riscaldamento';

// ── Core entities ─────────────────────────────────────────────────────────

export interface Condominio {
  id: string;
  nome: string;
  indirizzo: string;
  citta: string;
  cap: string;
  codice_fiscale?: string;
  n_unita: number;
  anno_costruzione?: number;
  note?: string;
  created_at: string;
}

export interface Unita {
  id: string;
  condominio_id: string;
  interno: string;
  proprietario: string;
  email?: string;
  telefono?: string;
  millesimi_proprieta: number;
  millesimi_ascensore: number;
  millesimi_riscaldamento: number;
  mq?: number;
  tipo: TipoUnita;
}

export interface Fornitore {
  id: string;
  ragione_sociale: string;
  piva?: string;
  codice_fiscale?: string;
  categoria: CategoriaFornitore;
  iban?: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  note?: string;
  created_at: string;
}

export interface Spesa {
  id: string;
  condominio_id: string;
  fornitore_id?: string;
  data: string;          // ISO date YYYY-MM-DD
  descrizione: string;
  categoria: CategoriaSpesa;
  importo: number;
  numero_fattura?: string;
  stato: StatoSpesa;
  tabella_millesimi: TabellaMillesimi;
  created_at: string;
}

export interface MovimentoBancario {
  id: string;
  condominio_id: string;
  data: string;
  descrizione: string;
  tipo: TipoMovimento;
  importo: number;
  causale?: string;
  iban_controparte?: string;
  spesa_id?: string;
  unita_id?: string;
  created_at: string;
}

export interface Rata {
  id: string;
  condominio_id: string;
  unita_id: string;
  esercizio: string;   // e.g. "2025-2026"
  scadenza: string;    // ISO date
  importo: number;
  pagato: number;
  stato: StatoRata;
  descrizione: string;
  data_pagamento?: string;
  created_at: string;
}

// ── Aggregate / view types ────────────────────────────────────────────────

export interface KpiDashboard {
  n_condomini: number;
  n_unita: number;
  n_fornitori: number;
  spese_totali_anno: number;
  saldo_bancario: number;
  debiti_totali: number;
  spese_per_categoria: { categoria: string; totale: number }[];
  cash_flow_mensile: { mese: string; entrate: number; uscite: number }[];
  anno: number;
}

export interface RigaConsuntivo {
  unita_id: string;
  interno: string;
  proprietario: string;
  millesimi_proprieta: number;
  quota_dovuta: number;
}

export interface Consuntivo {
  condominio: Condominio;
  anno: number;
  totale_spese: number;
  per_categoria: { categoria: string; totale: number }[];
  per_tabella: { tabella: string; totale: number }[];
  ripartizione: RigaConsuntivo[];
  n_spese: number;
  n_unita: number;
}

// ── Checklist ────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  completato: boolean;
  obbligatorio?: boolean;
  note?: string;
}

// ── App state ─────────────────────────────────────────────────────────────

export interface AppState {
  condomini:  Condominio[];
  unita:      Unita[];
  fornitori:  Fornitore[];
  spese:      Spesa[];
  movimenti:  MovimentoBancario[];
  rate:       Rata[];
}
