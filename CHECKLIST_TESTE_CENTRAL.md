# Checklist de homologação — Central de pedidos Wanelle
Data: 17/10/2026. Escopo: branch de teste `feature/wanelle-pedidos-diretos`. NÃO liberar em `main` sem revisão humana.

## Segurança e honestidade comercial
- [ ] Aba Bolos no pote comunica pré-lançamento; nenhuma unidade reservada/vendida.
- [ ] Os três sabores aparecem como consulta de interesse: chocolate com brigadeiro, morango com creme, maracujá.
- [ ] Mensagem de WhatsApp diz claramente que não é pedido, reserva, preço ou prazo prometido.
- [ ] Nenhum endereço é exibido como ponto ativo antes do aceite comercial.
- [ ] Fotos de tortas são reais e preservadas; não inventar produtos.

## Experiência no celular e computador
- [ ] Abrir `/pedidos.html` em tela pequena e larga; testar todas as abas.
- [ ] Selecionar interesse em 1 sabor e preencher nome/WhatsApp: verificar texto a abrir no WhatsApp SEM enviar mensagem de teste a clientes.
- [ ] Testar WhatsApp vazio / sem DDD e confirmação do erro.
- [ ] Selecionar inspiração por botão “Quero nesse estilo”: a aba tortas deve abrir e preservar o nome de inspiração uma única vez.
- [ ] Inserir data passada: formulário deve bloquear.
- [ ] Selecionar tamanho 18/20/25 cm, preferência de massa, recheio, decoração, entrega/bairro: conferir mensagem pré-preenchida ao WhatsApp.
- [ ] Confirmar legibilidade, foco de teclado, fotos, botões, imagens locais e links.
- [ ] Testar um contato real com a equipe e perguntar se a solicitação chega completa.
- [ ] Marcar separadamente se a solicitação ficou apenas no WhatsApp (padrão atual), sem afirmar que apareceu no Neon.

## Infraestrutura antes da produção
- [ ] Abrir o endereço oficial e confirmar qual commit está em produção.
- [ ] Atestar login do admin com usuário real (sem compartilhar senha); revisar sessão e acesso.
- [ ] Configurar e testar recuperação de senha por e-mail em provedor autorizado.
- [ ] Validar proteção contra spam e aviso de privacidade ANTES de registrar pedidos públicos automaticamente no banco.
- [ ] Migrar imagens temporárias para armazenamento final.
- [ ] Aprovar acesso a retirada/entrega e localização com parceiros.
- [ ] Apenas após aprovação, publicar branch no endereço oficial.

## Operação do pedido real
Status: formulário comercial via WhatsApp. Atendimento registra manualmente a solicitação no fluxo interno. Sem confirmação explícita da equipe, não há pedido fechado e não há cobrança. Sem dados de estoque validados, a loja não promete prazo ou valor.
