# Monitoramento proposto — Wanelle Studio

**Sem ativação automática.** Antes de instalar ferramenta paga, avalie uso, privacidade, custo e compatibilidade com a Vercel serverless.

- API `api/wanelle.js`: taxa de erros por ação, duração de respostas, falhas 401/403/429, disponibilidade e erros com banco Neon.
- Frontend: falhas JavaScript, métricas de experiência mobile e formulários de pedido que falham, sempre sem detalhes pessoais.
- Administrativo: alertar sobre falhas recorrentes de login e erros de atualização de status, sem registrar credenciais ou encomendas.
- Sanitização: não registrar `DATABASE_URL`, tokens de sessão, nome, e-mail, telefone, endereço, notas de pedido ou corpo completo de requisições.
- Em piloto, testar logs e alertas existentes na Vercel. Considerar OpenTelemetry e destino (Datadog **ou** New Relic) apenas se justificado.

Critérios: métricas e alertas observados na ferramenta aprovada, custo estimado, retenção definida, responsável e processo de resposta a incidente.
