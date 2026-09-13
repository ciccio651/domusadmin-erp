# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Assistente AI

La chat è disponibile in tutte le pagine dell'app tramite il pulsante `Chiedi all'AI`.
L'endpoint `functions/api/chat.ts` usa un provider compatibile con le API OpenAI e riceve
un riepilogo aggiornato dei dati del gestionale per rispondere alle domande su condomini,
rate e scadenze.

Per usare la chiave Anthropic configura queste variabili come secret nell'ambiente Cloudflare Pages:

```text
ANTHROPIC_API_KEY=chiave-anthropic
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

In alternativa sono supportati anche provider compatibili con OpenAI tramite `AI_API_KEY`,
`AI_MODEL` e `AI_BASE_URL`. La chiave non viene mai esposta al browser. Per provare la Pages
Function in locale usa il flusso di sviluppo Cloudflare con i secret configurati.
