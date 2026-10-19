# Acesso administrativo — Wanelle Studio

O painel fica em `/admin.html`. A autenticação é controlada no servidor; não existe senha padrão segura e não se deve colocar senha no HTML, em `config.js`, no GitHub ou em mensagens.

## Variáveis de ambiente do Vercel

No projeto **wanelle-site**, configure em **Settings → Environment Variables** para Preview e Production conforme o ambiente:

- `DATABASE_URL` (ou a variável já existente `wanellestudio_DATABASE_URL`): URL privada do Neon.
- `WANELLE_ADMIN_EMAIL`: e-mail autorizado a entrar no painel.
- `WANELLE_SESSION_SECRET`: segredo aleatório forte, exclusivo da aplicação (recomendado 32 bytes ou mais).
- `WANELLE_ADMIN_PASSWORD_HASH`: hash no formato `salt:hash` compatível com Node.js `scrypt`, quando a senha inicial ainda não foi definida no registro `wanelle_password_recovery`.
- `RESEND_API_KEY` e `WANELLE_RESET_FROM_EMAIL`: necessários para recuperação por e-mail.
- `WANELLE_ENABLE_ONLINE_INTAKE=true`: habilita o registro automático de solicitações públicas; habilitar só depois de testar schema, consentimento e controles antiabuso.

**Importante:** `WANELLE_ADMIN_PASSWORD_HASH` não é uma senha em texto puro. Não gere nem publique hash ou segredo no repositório. O registro de recuperação no Neon tem precedência sobre o hash de ambiente depois que a senha for alterada.

## Banco de dados e sessão

1. Confira que o schema `neon/schema.sql` foi aplicado ao banco correto. A API também cria a tabela de recuperação, mas o restante das tabelas precisa existir.
2. Em Vercel, verifique se as variáveis estão presentes sem copiar valores para logs, issues ou chat.
3. Configure primeiro Preview e teste login, sessão, logout e recuperação. A recuperação precisa de Resend configurado e de um endereço remetente verificado.
4. Só depois de validar o Preview, configure/atualize Production e faça deploy conscientemente.

## Diagnóstico seguro

- `/api/wanelle?action=health` deve responder com `status: "ok"` e campos booleanos de prontidão. Esse endpoint não retorna credenciais.
- `adminReady: false`: confira e-mail autorizado, hash de senha válido e segredo de sessão.
- `database` indisponível: confira a URL privada do Neon e as tabelas.
- `emailResetReady: false`: configure a chave e o remetente do Resend.
- Se você não tiver uma senha inicial, configure uma senha forte localmente e gere o hash com Node.js `scrypt`; não envie a senha para o assistente nem a comite. Como alternativa, depois de configurar Resend, use “Esqueci minha senha” com o e-mail autorizado.

Este documento não altera credenciais nem ativa o atendimento automático. Nenhuma credencial é criada por esta alteração.
