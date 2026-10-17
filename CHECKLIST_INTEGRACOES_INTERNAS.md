# Fluxo interno Wanelle — homologação no novo layout (17/10/2026)

### Integrações restauradas
- A vitrine mantém o HTML aprovado, mas agora reutiliza o WanelleCore, o Neon e a API privada do Vercel.
- Salvar inspirações mantém favoritos entre visitas (neste navegador) e envia IDs de referência ao formulário.
- O formulário recolhe nome, WhatsApp, data, pessoas, tamanho, massa, recheio, camadas, decoração, bairro e consentimento.
- A API só habilita submissões públicas quando a senha hash administrativa, o e-mail e o segredo de sessão estiverem configurados.
- Após habilitar, limite de 4 solicitações por IP pseudonimizado a cada hora, honeypot de formulário e verificação de tempo; nenhuma captura de IP bruto nas tabelas.
- Se a API estiver indisponível, o cliente recebe um link de WhatsApp; o site não afirma que a solicitação foi salva.
- Ao registrar o orçamento, a esteira do painel mostra pedido NOVO sem custo ou venda confirmada.
- Panel antigo: admin.html, receitas, ingredientes, pesquisa de preços, esteira, produção e cálculos permanecem separados sob login.

### Condições de ativação e testes
- [ ] Executar `neon/schema.sql` atualizado no banco wanelle-studio; conferir tabela wanelle_public_limits.
- [ ] Configurar `WANELLE_ADMIN_PASSWORD_HASH` em Production sem compartilhar senha no chat ou repositório.
- [ ] GET `/api/wanelle?action=health`: conferir flags adminReady e intakeReady.
- [ ] Abrir `admin.html`, efetuar login real, sair e confirmar que um usuário não autenticado não acessa os dados.
- [ ] Abrir vitrine, salvar e retirar inspirações, recarregar, conferir persistência.
- [ ] Enviar 1 orçamento real de forma acompanhada e consentida; verificar ID e a esteira (NÃO criar pedido fictício sem autorização).
- [ ] Sem credenciais, confirmar fallback ao WhatsApp, sem gravar no banco e sem mensagem falsa.
- [ ] Conferir mobile, navegabilidade, preenchimento, segurança e aviso de privacidade; política LGPD completa ainda pendente.
- [ ] Nenhum preço automático sem ficha técnica e custos reais validados.

### Limitações atuais
Apenas hash e autenticação administrativa podem liberar gravação automática. O consentimento básico do formulário não substitui uma política completa de privacidade, e o limitador simples não é substituto definitivo de CAPTCHA/Turnstile em uma campanha pública de grande escala. Planejar retenção/deleção da tabela de rate limit, review anti-spam e privacidade antes do lançamento massivo.