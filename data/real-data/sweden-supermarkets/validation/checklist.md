# Validation Checklist

- [ ] Arquivos de origem colocados em `incoming/`
- [ ] Snapshot original preservado sem edicao manual
- [ ] `stores` recebido
- [ ] `store_contacts` recebido
- [ ] `pickup_windows` recebido
- [ ] `categories` recebido
- [ ] `buyers` recebido ou marcado como fora de escopo
- [ ] `lots_initial` recebido ou marcado como fora de escopo
- [ ] IDs externos estaveis presentes
- [ ] Datas em formato ISO-8601 ou regra de conversao documentada
- [ ] Timezone consistente
- [ ] Pesos com unidade explicita
- [ ] Enum de status/storage condition mapeado
- [ ] `mapping/field-mapping.md` preenchido
- [ ] `validation/open-issues.md` preenchido
- [ ] Pacote pronto para validacao em banco limpo
