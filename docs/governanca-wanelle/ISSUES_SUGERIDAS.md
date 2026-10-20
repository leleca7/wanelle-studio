# Issues sugeridas para Wanelle

Execute primeiro `python3 scripts/governanca_wanelle/criar_issues.py` para **simular** a criação de issues. Use `--apply` somente após revisão e autenticação no repositório correto.

## Operação e segurança (priorizar)
- **Auditar ambiente Vercel + Neon**: conferir vinculação, nomes das variáveis, ambiente de produção, saúde da API e demonstração local, sem exibir segredos.
- **Validar ponta a ponta uma encomenda de teste**: formulário, persistência, painel e status com dados fictícios.
- **Revisar login, sessões e autorização de admin**: proteger leitura/edição/exclusão de dados, limitar ataques de força bruta.
- **Aplicar proteção anti-spam e LGPD**: controles de volume, finalidade, privacidade, retenção e exclusão.

## Qualidade e evolução
- **Instalar governança**: AGENTS, templates, branch, issue e PR.
- **Testar reserva de preços, fichas técnicas e margens**: separar cotações de custo real e impedir valores fictícios.
- **Revisar acessibilidade/mobile e desempenho**: com evidência e sem regressões.
- **Configurar testes/CI compatíveis**: aproveitar `npm test`, considerar Playwright/Biome depois da auditoria.
- **Padronizar releases e observabilidade**: preview, aprovação, rollback e alertas sem dados de clientes.

Backlog detalhado: `scripts/governanca_wanelle/backlog.json`. Essas são propostas, **não** issues já existentes no GitHub.
