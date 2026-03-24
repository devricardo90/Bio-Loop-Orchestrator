# [DONE] INFRA-02 - Repository hygiene and watch:done tooling

## Endpoints implemented
- N/A

## O que foi feito
- Adicionei `**/*.tsbuildinfo` ao `.gitignore` para parar de sujar o status com artefatos de build.
- Consolidei o watcher `watch:done` em `tools/watch-done.ps1` com caminhos relativos ao script e mensagens mais estaveis.
- Mantive o install opcional de toast como `tools/install-toast.ps1`.
- Registrei a etapa como concluida no backlog e no status operacional.

## Arquivos alterados
Criados:
- [docs/ops/done/INFRA-02.done.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/done/INFRA-02.done.md)

Alterados:
- [.gitignore](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/.gitignore)
- [package.json](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/package.json)
- [tools/watch-done.ps1](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/tools/watch-done.ps1)
- [docs/ops/BACKLOG.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/BACKLOG.md)
- [docs/ops/STATUS.md](C:/Users/ricardodev/Desktop/Bio-Loop-Orchestrator/docs/ops/STATUS.md)

## Como verificar
```bash
pnpm watch:done
git status --short
```

## Gate
- Gate: workspace hygiene
- Resultado: PASS se `git status` nao mostrar `*.tsbuildinfo` apos rodar build/typecheck/test

## Riscos / pendencias
- `watch:done` depende de PowerShell no Windows e do modulo BurntToast ser opcional.
- O workspace ainda tem outras mudancas nao relacionadas ao hygiene que devem ser tratadas separadamente.

## Proxima task sugerida
- `WEB-04`
