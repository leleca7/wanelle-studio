# Roadmap sugerido — Wanelle Studio

## Prioridade 0 — validar operação com segurança
- Confirmar configuração **privada** das variáveis Vercel, sem expor valores; verificar vínculo do projeto GitHub e Neon.
- Validar `/api/wanelle?action=health`, pedido de teste, acesso ao `admin.html`, atualização de status e persistência no Neon, somente em ambiente autorizado.
- Confirmar anti-spam/rate limiting e política LGPD antes de divulgar o atendimento público; não afirmar que já estão ativados.

## Prioridade 1 — governança e inventário
- Implantar AGENTS/templates em branch e PR; verificar proteção da `main`.
- Mapear contrato da API, permissões, diferenças entre demonstração local e produção, dependências e rollback.

## Prioridade 2 — regras de encomendas e preços
- Criar testes para preço de venda, reserva contra oscilações, cálculos e consultas de preços sem assumir que cotações são custos reais.
- Testar acesso ao painel, tentativas de login, fluxo de pedidos, atualizações, validação e isolamento de informações.

## Prioridade 3 — UX, testes e CI
- Revisar mobile, acessibilidade, loading/erro/vazio, imagens e motion reduzido.
- Preservar `npm test` e avaliar CI/Playwright/Biome/Knip somente depois de validar comandos e compatibilidade.

## Prioridade 4 — observabilidade
- Instrumentar métricas úteis por rota sem dados pessoais, configurar alertas e verificar resultados reais.
- Avaliar OpenTelemetry/Datadog/New Relic apenas se úteis, viáveis e consentidos.

Cada fase exige tarefas menores em issues, testes proporcionais ao risco, preview e rollback registrados. Nenhuma fase se ativa sozinha com a instalação deste kit.
