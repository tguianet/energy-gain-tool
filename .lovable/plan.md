# Contratos "ativos" desde a origem

## Por que aparece "pendente" hoje
Em `src/pages/PropostasPage.tsx` (função `handleGerarContrato`), o novo contrato é criado com `status: 'pendente'` fixo. Por isso todo contrato gerado pela proposta cai em Contratos já marcado como pendente.

## Mudança
1. Em `src/pages/PropostasPage.tsx`, no `handleGerarContrato`:
   - Trocar `status: 'pendente'` por `status: 'ativo'`.
   - Ajustar a mensagem do histórico para "Contrato ativado a partir da proposta".
2. Nada mais muda: a página de Contratos continua permitindo editar o status manualmente para `pendente` ou `cancelado` quando necessário, e contratos antigos já salvos como pendente permanecem como estão (podem ser ajustados manualmente pelo botão de editar).

## Resultado esperado
Ao clicar em "Gerar Contrato" numa proposta, o registro aparece imediatamente como **ativo** em `/contratos`, e o cliente vinculado continua sendo promovido a `ativo` como já acontece hoje.
