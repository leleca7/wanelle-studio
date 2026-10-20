# Checklist — segurança, dados e encomendas

- [ ] Nenhum valor privado `DATABASE_URL`, `WANELLE_ADMIN_PASSWORD_HASH` ou `WANELLE_SESSION_SECRET` exposto em GitHub, HTML/JS público, logs ou relatórios.
- [ ] Endpoints de leitura/alteração de pedidos exigem autorização real, além do login.
- [ ] Login tem proteção contra abuso e sessão segura; cookies, CSRF e CORS revisados conforme implementação.
- [ ] Validação de entradas de pedido, status, preços e quantidades feita no servidor.
- [ ] Há medidas anti-spam/captcha/rate limiting na entrada pública, comprovadas por testes.
- [ ] Dados pessoais de clientes têm finalidade, base legal, aviso adequado, retenção, exclusão e acesso limitado nos termos da LGPD.
- [ ] Logs, prints, traces, testes e issues não incluem pedidos reais, e-mails, telefones, senhas ou payloads sensíveis.
- [ ] Credenciais geradas por `scripts/gerar-hash-senha.mjs` permanecem privadas e são gerenciadas no Vercel.
- [ ] Mudanças de `neon/schema.sql` incluem backup, compatibilidade e plano de rollback.
- [ ] Pesquisa de preços, custos, lucro, receita e preço sugerido não são confundidos; nenhuma cotação é aplicada sem confirmação.
- [ ] Checklist de riscos, testes e rollback preenchido para cada PR sensível.

A presença deste checklist não significa que os controles estejam implementados.
