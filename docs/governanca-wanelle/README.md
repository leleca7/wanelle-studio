# Governança e qualidade — Wanelle Studio

Kit adaptado do arquivo `kit_valtec_wanelle.zip`, preparado para o repositório `leleca7/wanelle-studio` em 19/10/2026.

**O que é:** instruções para agentes, modelos de issues e pull requests, backlog opcional e guias de segurança/qualidade. **O que não é:** integração ativa, mudança no sistema de encomendas, migração de banco, teste de produção ou deploy.

## Inventário público conferido
- Frontend HTML/JavaScript com `index.html`, `admin.html`, `links.html`, `assets/`.
- API serverless `api/wanelle.js`, banco Neon documentado em `neon/schema.sql`, hospedagem pretendida/associada à Vercel.
- `package.json`: Node >=20, dependência `@neondatabase/serverless`, script `npm test` que executa os dois testes `.cjs` e verifica sintaxe da API.
- `README.md` de 14/10/2026 registra tarefas pendentes para Vercel/Neon, anti-spam e política de privacidade; conferir o estado real antes de anunciar que o serviço está pronto.

## Como trabalhar
1. Leia `AGENTS.md` e abra uma issue específica para a alteração.
2. Faça mudanças em branch própria, rode os testes efetivamente aplicáveis e abra um PR.
3. Revise preview e segurança, documente rollback e só então integre à `main` mediante aprovação.
4. Use `scripts/governanca_wanelle/criar_issues.py` **primeiro em simulação**, sem `--apply`.

## Documentos
- `ROADMAP.md`: ordem de prioridades sugerida.
- `ISSUES_SUGERIDAS.md`: backlog focado no Wanelle.
- `SEGURANCA_E_LGPD.md`: riscos de encomendas e de autenticação.
- `VERCEL_NEON.md`: checklist de publicação, sem segredos.
- `OBSERVABILITY.md`: monitoramento opcional sem PII.
- `FONTE_E_STATUS.md`: itens verificados e não verificados.

Nenhum arquivo de produção (`README.md` principal, `.env`, `vercel.json`, APIs, SQL, HTML) é substituído por este pacote.
