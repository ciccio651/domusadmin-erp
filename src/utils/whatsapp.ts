// ── WhatsApp Web utility ──────────────────────────────────────────────────
//
// Apre WhatsApp Web / app con un messaggio pre-compilato.
// Il numero deve essere in formato internazionale senza + né spazi.
// Esempio: '393331234567' per +39 333 1234567

/**
 * Normalizza un numero di telefono italiano al formato E.164 senza '+'
 * Esempi: '333 1234567' → '39333123456', '3331234567' → '393331234567'
 */
export function normalizePhoneIT(raw: string): string {
  // Rimuovi tutto tranne le cifre
  const digits = raw.replace(/\D/g, '');
  // Se già inizia con 39 lascia stare, altrimenti aggiungi prefisso IT
  if (digits.startsWith('39')) return digits;
  if (digits.startsWith('0039')) return digits.slice(2);
  return '39' + digits;
}

/**
 * Apre WhatsApp con un messaggio pre-compilato.
 * @param phone  numero grezzo (es. '+39 333 1234567' o '3331234567')
 * @param message  testo del messaggio
 */
export function openWhatsApp(phone: string, message: string): void {
  const num = normalizePhoneIT(phone);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${num}?text=${encoded}`, '_blank', 'noopener,noreferrer');
}

/**
 * Genera il testo del sollecito di pagamento per WhatsApp.
 */
export function messaggioSollecito(params: {
  proprietario: string;
  condominio: string;
  descrizione: string;
  residuo: number;
  scadenza: string;
}): string {
  const { proprietario, condominio, descrizione, residuo, scadenza } = params;
  const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(residuo);
  return [
    `Gentile ${proprietario},`,
    ``,
    `La contatto in merito al condominio *${condominio}*.`,
    `Risulta un importo non saldato di *${eur}* relativo a: _${descrizione}_ (scadenza ${scadenza}).`,
    ``,
    `La preghiamo di provvedere al pagamento entro i prossimi 15 giorni tramite bonifico bancario sul conto corrente condominiale.`,
    ``,
    `Per qualsiasi chiarimento siamo a disposizione.`,
    ``,
    `Cordiali saluti,`,
    `L'Amministratore — DomusAdmin ERP`,
  ].join('\n');
}

/**
 * Genera testo generico per condividere un documento via WhatsApp.
 */
export function messaggioDocumento(nomeDoc: string, condominio: string): string {
  return [
    `Buongiorno,`,
    ``,
    `Le invio il documento *${nomeDoc}* relativo al condominio *${condominio}*.`,
    ``,
    `Cordiali saluti,`,
    `L'Amministratore — DomusAdmin ERP`,
  ].join('\n');
}
