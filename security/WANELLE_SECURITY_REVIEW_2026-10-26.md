# WANELLE — revisão inicial de segurança (26/10/2026)

Status: auditoria estática parcial com GitHub e leitura de metadados da Vercel; NÃO é pentest, revisão completa de infraestrutura nem prova de ausência de vulnerabilidades. Nenhuma tentativa agressiva foi executada, nenhum segredo foi lido e nenhuma alteração de produção foi feita.

## Contexto verificado

Repositório: leleca7/wanelle-studio — visibilidade PUBLIC; branch principal main (SHA e73828b94c882ba83de26bd8840157f11448767f).
Vercel: wanelle-site (ID prj_F89vOXuqkMEKC2anGaGQjIlcV38A); produção recente READY derivada de main; previews READY em hotfix/ocultar-documentos-comerciais-20261019.
Stack: frontend estático JavaScript, Node.js serverless /api/wanelle.js, PostgreSQL Neon, Vercel.

## Matriz inicial

| ID | Gravidade | Estado | Evidência | Risco / ação |
|---|---|---|---|---|
| WAN-01 | ALTA (se documentos forem confidenciais) | VISIBILIDADE CONFIRMADA | Repositório público contém POLITICA_PRECOS_WANELLE.md, CUSTOS_DE_PRODUCAO_2026.md, cotações, arquivos neon/*.json | Validar classificação dos documentos; migrar privados para repositório/armazenamento privado e avaliar histórico Git. Ocultar no build não resolve acesso ao GitHub. |
| WAN-02 | ALTA | DIFERENÇA DE RELEASE CONFIRMADA | main/vercel.json não especifica outputDirectory; hotfix/vercel.json tem build allowlist e script de regressão, mas branch hotfix não foi incorporada à main de produção | Revisar e aplicar hotfix de publicação apenas após testar links e páginas; verificar artefato real gerado em produção. |
| WAN-03 | MÉDIA/ALTA | LACUNA EM CÓDIGO CONFIRMADA | /api/wanelle.js: reset-password aplica scryptSync a token de formato válido antes de confirmar token no banco; não há limitação global de volume nessa rota | Adicionar barreira antiabuso antes da operação custosa e reduzir CPU em tokens inválidos; testes em ambiente isolado. |
| WAN-04 | MÉDIA | LACUNA EM CÓDIGO CONFIRMADA | login bloqueia por chave hash(email|IP), não limita tentativas globais por IP | Adicionar limitação por IP + conta e WAF; aplicar quota distribuída, sem permitir contorno por rotação de email. |
| WAN-05 | MÉDIA | PARCIAL | request-password-reset limita solicitações para o email configurado, mas não tem limite por IP e depende da presença de credenciais | Aplicar limitação por rota/IP, retornar mensagens homogêneas e monitorar tentativas. |
| WAN-06 | MÉDIA | NÃO VERIFICADO | Não foi auditada configuração efetiva de Vercel Firewall/Bot Protection | Inspecionar regras ativas, WAF, monitoramento e tráfego; não pressupor ativação a partir de capacidades da plataforma. |
| WAN-07 | MÉDIA | LACUNA DE CONFIGURAÇÃO | vercel.json usa nosniff, Referrer-Policy e X-Frame-Options; não há CSP nem Permissions-Policy definidas | Construir CSP compatível com scripts/styles/fontes atuais, em report-only antes de exigir bloqueio; acrescentar headers apropriados. |
| WAN-08 | BAIXA | INFORMAÇÃO EXPOSTA | GET /api/wanelle?action=health retorna adminReady/intakeReady/emailResetReady | Minimizar diagnóstico público quando não necessário; preservar compatibilidade com storefront-intake.js. |
| WAN-09 | MÉDIA | A REVISAR | Inventário de env na Vercel inclui WANELLE_ADMIN_INITIAL_PASSWORD no preview, variável não identificada como usada pelo código lido | Validar necessidade e ciclo de vida; não inspecionar valor; remover variável legada mediante confirmação do proprietário. |
| WAN-10 | ALTA se acesso indevido | NÃO VERIFICADO | Rotas de admin exigem authenticate + authorized; dados e pedidos retornam no bootstrap | Testar autorização e isolamento com contas fictícias; verificar se admin email e hash estão configurados e MFA/gestão de sessão. |

## Proteções observadas (sem atestado de suficiência)

- Uso de tagged SQL da biblioteca Neon em /api/wanelle.js — redução de risco de SQL injection no trecho revisado.
- Scrypt com sal para senha, cookie HttpOnly/Secure/SameSite=Strict, tokens reset hash SHA-256 de uso único e expiração — detalhes requerem teste em runtime.
- Autenticação server-side nas rotas administrativas; whitelist de nomes de seção; limite de corpo e algumas validações.
- Sanitização HTML auxiliar esc() em assets/wanelle-admin.js, mas a análise de TODOS os sinks e campos não foi concluída.
- Mensagens genéricas nos erros HTTP 500 e cabeçalhos básicos de proteção.
- Quota de pedidos públicos por hora, mas WANELLE_ENABLE_ONLINE_INTAKE não constava no inventário de nomes do projeto quando consultado — pode estar desligado. Isso NÃO substitui WAF.

## Plano por prioridade

P0 — decidir confidencialidade dos documentos do repositório público; corrigir publicação de artefatos internos; confirmar que nenhum segredo ativo constou de commits antigos.

P1 — limitar globalmente login/reset/submit, evitar cálculo scrypt antes de checar a validade do token, verificar permissões e cookies no ambiente de teste.

P2 — inventariar todos os sinks HTML/atributos/links, CSP report-only, headers, WAF/CDN, alertas, dependências e testes automatizados.

P3 — teste de restauração, rotina de atualização, resposta a incidentes, LGPD e governança de documentos.

## Gate para publicação

Não promover PR para produção até que: (a) build allowlist e navegação sejam testados, (b) acesso aos dados internos seja validado, (c) testes unitários e integração passem, (d) variáveis requeridas sejam apenas confirmadas por NOME/PRESENÇA, (e) WAF/limites sejam checados no dashboard, (f) se prepare rollback. Não tratar PR aberto como correção já publicada.

## Nota sobre versão

Este arquivo registra a inspeção em 26/10/2026. Antes de cada nova release, compare o commit ativo no Vercel com a branch examinada; o status pode mudar.
