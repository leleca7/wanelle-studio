# Instruções para agentes — Wanelle Studio

> Estas orientações se aplicam somente a `leleca7/wanelle-studio`. Antes de mudanças, leia também `README.md`, `package.json` e `docs/governanca-wanelle/README.md`.

## Contexto do projeto — conferir antes de alterar
- Vitrine em `index.html`, links em `links.html` e painel de encomendas em `admin.html` com JavaScript/CSS em `assets/`.
- API privada de encomendas e autenticação em `api/wanelle.js`, banco Neon PostgreSQL (`neon/schema.sql`) e hospedagem prevista na Vercel (`vercel.json`).
- O `package.json` declara Node.js 20+ e `npm test` para testes de fluxo, reserva de preço e sintaxe da API. Confirmar versões, scripts e estado atual do repositório.
- O README de 14/10/2026 informa pendências de configuração do Vercel e proteção anti-spam/LGPD. Não afirmar que estão resolvidas sem confirmação atual e autenticada.

## Alterações seguras e governança
1. Criar ou vincular issue com problema, riscos, critérios de aceite e testes. Trabalhar em branch isolada; enviar PR revisável referenciando a issue.
2. Não mudar `index.html`, `admin.html`, `api/`, `neon/`, `config.js`, `vercel.json`, variáveis ou dados de produção sem escopo e testes específicos.
3. Nunca copiar valores de `DATABASE_URL`, `WANELLE_ADMIN_EMAIL`, `WANELLE_ADMIN_PASSWORD_HASH` nem `WANELLE_SESSION_SECRET` para GitHub, frontend, logs, issues ou respostas do assistente.
4. Revisar o Preview Deployment da Vercel quando existir; não assumir que PR faz deploy, nem promover à produção sem aprovação.
5. Para mudanças de banco, documentar compatibilidade, backup/recuperação, migração reversível e plano de rollback; nunca executar SQL destrutivo automaticamente.
6. Registrar exatamente o que foi testado e o que ainda está pendente. Não dizer que contas, conectores, webhooks ou deploy funcionam sem evidência observável.

## Segurança, privacidade e integridade comercial
- Validar dados recebidos em `api/wanelle.js` no servidor; impor autorização do administrador por operação, limites de tentativa, proteção anti-spam e rate limiting quando apropriado.
- Tratar pedidos e dados de contato conforme LGPD: minimização, retenção, consentimento/base legal, exclusão e acesso restrito. Não usar pedidos reais como fixtures publicáveis.
- Não inventar preços, rendimento, custos, receitas, fichas técnicas, estoque nem margens. Diferenciar *cotação*, *custo previsto*, *custo confirmado* e *preço de venda*.
- Manter os valores originais de pesquisa de mercado e as incertezas identificadas no README; nunca aplicar cotações automaticamente a receitas ou fichas técnicas.
- Evitar imagens de bolos com preço fictício; indicar quando fotos forem apenas inspirações.
- Logs e monitoramento: sem dados pessoais, senhas, segredos de sessão ou payloads completos de encomendas.

## Qualidade e experiência
- Executar `npm test` quando ambiente/dependências permitirem. Se não executar, informar claramente o motivo; não inventar resultado.
- Para alterações em formulários, login, pedidos, status, fichas e precificação: testar estados de erro/vazio/carregamento, dados inválidos, permissões e acessibilidade mobile/teclado.
- Considerar Biome, Knip, Playwright e cobertura **somente** após inventariar compatibilidade com os arquivos HTML/JS e os scripts reais. Não criar CI que referencie scripts inexistentes.
- Usar `prefers-reduced-motion`, contraste adequado e lazy-loading seletivo sem piorar LCP; revisão de design baseada em evidências.

## Conclusão
Concluído apenas após issue/PR revisado, testes e riscos registrados, preview pertinente revisado e deploy explicitamente confirmado por fonte autorizada. Este kit apenas documenta práticas: não substitui implementação, testes, revisão ou publicação.
