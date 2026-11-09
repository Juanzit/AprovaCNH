# AprovaCNH

SaaS educacional para preparação para o exame teórico de habilitação, com conteúdo rastreável, questões oficiais do Banco Nacional de Questões (BNQ v1.0) e simulados multidisciplinares.

## Banco Nacional de Questões — Fase 6.1

O seed limpo está em `src/data/bnq-v1.0-clean.json` (1.489 registros). A estrutura distingue:

- `topic`: disciplina clássica;
- `subtopic`: módulo oficial do BNQ;
- `signCode`: código de placa conforme extração-fonte;
- `signAssetCodes`: SVGs disponíveis e auditados em `public/signs/`;
- `approvalMethod`: trilha explícita de autorização do lote, sem afirmar revisão individual.

A migration de metadados é `supabase/migrations/20261108000007_add_bnq_question_metadata.sql`. Depois de aplicar a migration ao projeto Supabase, executar a ingestão com `pnpm ingest:bnq` e as variáveis `SUPABASE_URL` (ou `NEXT_PUBLIC_SUPABASE_URL`) e `SUPABASE_SERVICE_ROLE_KEY` no ambiente do processo.

O script insere em lotes e ignora conflitos existentes; não sobrescreve decisões editoriais futuras.

## Desenvolvimento

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
```

O simulado usa 30 questões BNQ aprovadas, proporcionais à composição do acervo aprovado disponível. Essa composição é regra de treino do AprovaCNH, não quota oficial divulgada pela SENATRAN.
