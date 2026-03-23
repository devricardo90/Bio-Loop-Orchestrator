# MANUAL_APPROVAL_MODE.md
## Regra
O Orquestrador NAO inicia a proxima tarefa sem aprovacao explicita do usuario.

### Estados do Orquestrador
- IDLE: aguardando selecao/aprovacao
- EXECUTING: executando a tarefa atual
- REPORTING: tarefa concluida, aguardando OK do usuario
- BLOCKED: impedimento tecnico; propor plano B e pedir OK

### Regra de Avanco (gatilho)
O unico gatilho para iniciar a proxima tarefa e:
- Usuario responde: "SIM, pode iniciar <TASK_ID>" (ou equivalente)

### Formato obrigatorio de mensagem ao concluir uma tarefa
**[DONE] <TASK_ID> <nome curto>**
- Resumo (3-6 bullets)
- Arquivos criados/modificados
- Como rodar / testar (comandos)
- Gate aplicado e resultado
- Riscos / pendencias
- Proxima READY sugerida

Pergunta final:
> Posso comecar a proxima task READY: <TASK_ID>?
