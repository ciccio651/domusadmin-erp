import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Condominio, Unita, Fornitore, Spesa,
  MovimentoBancario, Rata,
  Avvocato, AttoLegale,
} from '@/types';
import {
  MOCK_CONDOMINI, MOCK_UNITA, MOCK_FORNITORI,
  MOCK_SPESE, MOCK_MOVIMENTI, MOCK_RATE,
} from '@/data/mockData';

interface Store {
  // State
  condomini:  Condominio[];
  unita:      Unita[];
  fornitori:  Fornitore[];
  spese:      Spesa[];
  movimenti:  MovimentoBancario[];
  rate:       Rata[];
  avvocati:   Avvocato[];
  attiLegali: AttoLegale[];

  // Avvocati
  addAvvocato:    (a: Avvocato) => void;
  updateAvvocato: (id: string, patch: Partial<Avvocato>) => void;
  deleteAvvocato: (id: string) => void;

  // Atti legali
  addAttoLegale:    (a: AttoLegale) => void;
  updateAttoLegale: (id: string, patch: Partial<AttoLegale>) => void;
  deleteAttoLegale: (id: string) => void;

  // Condomini
  addCondominio:    (c: Condominio)            => void;
  updateCondominio: (id: string, patch: Partial<Condominio>) => void;
  deleteCondominio: (id: string)               => void;

  // Unità
  addUnita:    (u: Unita)            => void;
  deleteUnita: (id: string)          => void;

  // Fornitori
  addFornitore:    (f: Fornitore)            => void;
  updateFornitore: (id: string, patch: Partial<Fornitore>) => void;
  deleteFornitore: (id: string)              => void;

  // Spese
  addSpesa:    (s: Spesa)             => void;
  updateSpesa: (id: string, patch: Partial<Spesa>) => void;
  deleteSpesa: (id: string)           => void;

  // Movimenti
  addMovimento:    (m: MovimentoBancario) => void;
  deleteMovimento: (id: string)           => void;

  // Rate
  addRata:    (r: Rata)                   => void;
  pagaRata:   (id: string, importo: number, data: string) => void;
  deleteRata: (id: string)                => void;
}

export const useStore = create<Store>()(persist((set) => ({
  condomini:  MOCK_CONDOMINI,
  unita:      MOCK_UNITA,
  fornitori:  MOCK_FORNITORI,
  spese:      MOCK_SPESE,
  movimenti:  MOCK_MOVIMENTI,
  rate:       MOCK_RATE,
  avvocati:   [],
  attiLegali: [],

  addCondominio: (c) =>
    set((s) => ({ condomini: [...s.condomini, c] })),
  updateCondominio: (id, patch) =>
    set((s) => ({ condomini: s.condomini.map(c => c.id === id ? { ...c, ...patch } : c) })),
  deleteCondominio: (id) =>
    set((s) => ({
      condomini: s.condomini.filter(c => c.id !== id),
      unita:     s.unita.filter(u => u.condominio_id !== id),
      spese:     s.spese.filter(sp => sp.condominio_id !== id),
      movimenti: s.movimenti.filter(m => m.condominio_id !== id),
      rate:      s.rate.filter(r => r.condominio_id !== id),
    })),

  addUnita: (u) =>
    set((s) => ({
      unita: [...s.unita, u],
      condomini: s.condomini.map(c =>
        c.id === u.condominio_id ? { ...c, n_unita: c.n_unita + 1 } : c
      ),
    })),
  deleteUnita: (id) =>
    set((s) => ({
      unita: s.unita.filter(u => u.id !== id),
      rate:  s.rate.filter(r => r.unita_id !== id),
    })),

  addFornitore:    (f) => set((s) => ({ fornitori: [...s.fornitori, f] })),
  updateFornitore: (id, patch) =>
    set((s) => ({ fornitori: s.fornitori.map(f => f.id === id ? { ...f, ...patch } : f) })),
  deleteFornitore: (id) =>
    set((s) => ({ fornitori: s.fornitori.filter(f => f.id !== id) })),

  addAvvocato: (a) => set((s) => ({ avvocati: [...s.avvocati, a] })),
  updateAvvocato: (id, patch) =>
    set((s) => ({ avvocati: s.avvocati.map(a => a.id === id ? { ...a, ...patch } : a) })),
  deleteAvvocato: (id) =>
    set((s) => ({ avvocati: s.avvocati.filter(a => a.id !== id) })),

  addAttoLegale: (a) => set((s) => ({ attiLegali: [a, ...s.attiLegali] })),
  updateAttoLegale: (id, patch) =>
    set((s) => ({ attiLegali: s.attiLegali.map(a => a.id === id ? { ...a, ...patch } : a) })),
  deleteAttoLegale: (id) =>
    set((s) => ({ attiLegali: s.attiLegali.filter(a => a.id !== id) })),

  addSpesa:    (sp) => set((s) => ({ spese: [sp, ...s.spese] })),
  updateSpesa: (id, patch) =>
    set((s) => ({ spese: s.spese.map(sp => sp.id === id ? { ...sp, ...patch } : sp) })),
  deleteSpesa: (id) => set((s) => ({ spese: s.spese.filter(sp => sp.id !== id) })),

  addMovimento:    (m) => set((s) => ({ movimenti: [m, ...s.movimenti] })),
  deleteMovimento: (id) =>
    set((s) => ({ movimenti: s.movimenti.filter(m => m.id !== id) })),

  addRata:  (r) => set((s) => ({ rate: [...s.rate, r] })),
  pagaRata: (id, importo, data) =>
    set((s) => {
      const r = s.rate.find(r => r.id === id);
      if (!r) return s;
      const nuovoPagato = r.pagato + importo;
      const stato: Rata['stato'] = nuovoPagato >= r.importo ? 'pagata' : 'parziale';
      const mov: MovimentoBancario = {
        id: crypto.randomUUID(),
        condominio_id: r.condominio_id,
        unita_id: r.unita_id,
        data,
        descrizione: `Pagamento ${r.descrizione}`,
        tipo: 'entrata',
        importo,
        causale: 'Rata condominiale',
        created_at: new Date().toISOString(),
      };
      return {
        rate: s.rate.map(x => x.id === id
          ? { ...x, pagato: nuovoPagato, stato, data_pagamento: data }
          : x),
        movimenti: [mov, ...s.movimenti],
      };
    }),
  deleteRata: (id) => set((s) => ({ rate: s.rate.filter(r => r.id !== id) })),
}), {
  name: 'domusadmin-store',
  partialize: (state) => ({
    condomini: state.condomini,
    unita: state.unita,
    avvocati: state.avvocati,
    attiLegali: state.attiLegali,
  }),
}));
