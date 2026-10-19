# Vercel + Neon — validação operacional (não executada)

1. Confirme que `leleca7/wanelle-studio` está vinculado ao projeto correto da Vercel e verifique as branches de Preview e Production.
2. Confira no painel privado da Vercel **somente a presença e o escopo** de `DATABASE_URL`, `WANELLE_ADMIN_EMAIL`, `WANELLE_ADMIN_PASSWORD_HASH`, `WANELLE_SESSION_SECRET`. Não copie os valores para chat, commit, print ou issue.
3. Verifique o banco Neon de destino e o estado do esquema em `neon/schema.sql`. Não execute migração automaticamente.
4. Valide com conta e dados de teste: health da API (`/api/wanelle?action=health`), envio de encomenda, autenticação em `admin.html`, mudança de status e leitura persistente.
5. Confirme CAPTCHA/anti-spam, limites de volume e política de privacidade antes de expor formulários publicamente.
6. Execute `npm test` em ambiente configurado; liste resultados reais e pendências, sem prometer cobertura.
7. Para futuros PRs, revise Preview e registre rollback antes de aprovar merge; use mecanismo aprovado para promover à produção.

O `README.md` público de 14/10/2026 documenta configuração pendente. O domínio listado no GitHub não comprova que o backend esteja pronto ou os dados integrados.
