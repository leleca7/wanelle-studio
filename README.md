# Wanelle Studio

Site interativo para clientes e painel de encomendas da **Wanelle Tortas**, integrado ao **Neon PostgreSQL** por uma API privada do **Vercel**. Repositório: [`leleca7/wanelle-studio`](https://github.com/leleca7/wanelle-studio).

## Situação em 14/10/2026

- ✅ GitHub criado e código do site salvo.
- ✅ Projeto Neon existente: **wanelle-studio**, região **São Paulo**. Esquema SQL em `neon/schema.sql` aplicado ao banco.
- ✅ API Vercel preparada em `api/wanelle.js` e frontend adaptado para o Neon.
- 🔒 **Pendente:** configurar variáveis privadas no Vercel, vincular repositório, publicar e testar de ponta a ponta.
- 🔒 Antes de abrir ao público: proteção anti-spam/captcha e política de privacidade adequadas à LGPD.

## Catálogo e orçamentos

As fotografias são **apenas inspirações**; nenhuma criação antiga tem preço/receita fictícios. O cliente solicita orçamento, e a confeiteira cadastra uma ficha técnica real: ingredientes, quantidades, tempo de trabalho, camadas, embalagem, água, luz, gás, despesas e lucro.

A referência inicial confirmada é **torta simples de abacaxi com coco**. Tamanhos da própria confeiteira:

| Forma | Fatias aproximadas | Peso aproximado |
| --- | ---: | ---: |
| 18 cm | 15–18 | 1,5 kg |
| 20 cm | 20–24 | 2,0 kg |
| 25 cm | 30–35 | 3,0 kg |

Os dados NÃO determinam o custo sozinhos. Falta cadastrar a receita real, os preços atuais e o tempo de preparo. Não associe os R$ 160 / 210 / 290 de simulações anteriores a custos confirmados.


## Pesquisa de preços do iFood (14/10/2026)

Foram registrados **67 valores narrados pelo responsável** (Assaí, Atacadão, Atakarejo, Mercantil e Hiperideal), além das **12 referências anteriores**. As anotações originais organizadas estão em `neon/cotacoes_ifood_2026-10-14.json` e `assets/market-prices.json`. Os 67 preços também estão em `wanelle_market_quotes` no Neon e são carregados na aba **Pesquisa de mercado** após o login. Nenhuma cotação é aplicada automaticamente às fichas técnicas.

- Verificar embalagem, marca, tipo de farinha (com/sem fermento), teor de cacau, datas e eventuais descontos por quantidade. Entradas contraditórias ou incertas foram marcadas como pendentes de confirmação e não podem ser aplicadas na interface.
- Frete informado no iFood: Atakarejo aproximadamente **R$ 21–21,50** por pedido e Assaí possivelmente grátis acima de **R$ 50**; dependem do carrinho, endereço e promoção. Não atribuir uma taxa inteira a cada bolo indiscriminadamente.
- Ainda faltam cotações e consumo real de abacaxi, coco, ovos, leite condensado, chantilly, embalagem, gás, energia, água e horas. R$ 160 é apenas **proposta de preço**, não margem comprovada.

## Precificação com proteção contra oscilação semanal (14/10/2026)

Para não subestimar gastos entre a pesquisa e a compra, o painel usa por padrão uma **proteção de 10% sobre o preço cotado da embalagem**, arredondada para cima ao múltiplo de **R$ 0,50**. Esses dois parâmetros são editáveis em **Custos & preços → Reserva contra aumento semanal**.

- **Preço pesquisado** permanece idêntico ao registro original: fonte, mercado, data e embalagem.
- **Custo protegido** serve apenas para previsão de compra e custo dos ingredientes no orçamento. Ex.: farinha R$ 4,64/kg → **R$ 5,50/kg**.
- **Lucro, mão de obra, embalagem, frete, tributos e despesas indiretas** são parcelas separadas. Não cobrar a folga duas vezes.
- Descontos por volume só contam quando a quantidade mínima for efetivamente comprada. Cotações narradas, ambíguas e vencidas devem ser reconfirmadas antes de vincular à ficha técnica.
- Os preços por grama mantêm precisão no cálculo; o arredondamento é aplicado **na embalagem**.

Ver política e exemplos em [`POLITICA_PRECOS_WANELLE.md`](POLITICA_PRECOS_WANELLE.md).

## Acesso administrativo e ambiente de Preview

- O painel administrativo não deve ser divulgado por um link na vitrine pública. A equipe abre `/admin.html` diretamente e informa o e-mail autorizado e a senha.
- A sessão usa cookie `HttpOnly`, `Secure` e `SameSite=Strict`, com validade limitada; ao sair, o cookie é invalidado. Uma sessão já aberta pode permanecer válida até expirar ou até o logout.
- O ambiente de teste usa o banco isolado `wanelle-preview-test`. Não use dados reais de clientes nos testes.
- A redefinição de senha por e-mail está **adiada**: não configure nem exija Resend nesta etapa. O botão deve informar que a recuperação por e-mail ainda não está habilitada, sem impedir o login normal. Quando for retomada, configurar Resend e remetente autorizado será uma tarefa separada.
- Não habilite pedidos online públicos até concluir e validar os testes de autenticação e de pedidos fictícios no Preview.

## Auditoria de segurança e publicação

- O painel (`/admin.html`) e a página de redefinição são `noindex`; isso é controle de indexação, não controle de acesso. Os endpoints administrativos precisam validar sessão no servidor.
- Logout revoga sessões emitidas anteriormente no servidor, não apenas apaga o cookie local.
- A pesquisa de preços, custos, fichas e documentos internos deve ficar em armazenamento privado e ser entregue somente pela API autenticada. Arquivos que já estiveram num repositório público podem continuar acessíveis no histórico Git; removê-los da árvore atual não apaga esse histórico.
- A CSP é uma camada de defesa adicional. Como o site ainda contém scripts e estilos inline, a política mantém `unsafe-inline` para scripts/estilos; a migração para nonce/hash CSP permanece uma melhoria de segurança.
- A política de privacidade precisa ser revisada pelo responsável antes da publicação, incluindo prazos reais de retenção e canal de exercício de direitos.

## Configurar Vercel e Neon

1. Importe **`leleca7/wanelle-studio`** no Vercel, usando **Framework Preset: Other** e `Root Directory: /`.
2. No Neon, abra o projeto `wanelle-studio` e obtenha a connection string **pooled** da branch de produção.
3. No Vercel → Projeto → Settings → Environment Variables, adicione estas variáveis privadas, para **Production**:
   - `DATABASE_URL`: connection string pooled do Neon.
   - `WANELLE_ADMIN_EMAIL`: e-mail que poderá acessar o painel.
   - `WANELLE_ADMIN_PASSWORD_HASH`: hash gerado pela instrução abaixo.
   - `WANELLE_SESSION_SECRET`: segredo aleatório gerado pela instrução abaixo.
4. Para criar hash da senha e segredo no seu computador, execute `node scripts/gerar-hash-senha.mjs` e copie as duas linhas para as variáveis **privadas** do Vercel. Use senha forte e **não compartilhe** a senha no chat ou no GitHub.
5. Publique e teste `https://<seu-dominio>/api/wanelle?action=health`, o envio de um **pedido teste** pelo site, o login e a atualização do status pelo painel `admin.html`.
6. Ative anti-spam no envio público (CAPTCHA/Turnstile e limitação de volume), configure política de privacidade e teste novamente antes de divulgar.

**Segurança:** o `DATABASE_URL`, a senha e o segredo de sessão não podem aparecer em `config.js`, HTML, GitHub ou em respostas ao cliente. O arquivo `config.js` contém somente o caminho público da API. A API valida pedidos anônimos e exige autenticação do administrador para ler, editar ou excluir dados.

## Rodar a demonstração no computador

Abra a pasta do projeto e execute:

```bash
python -m http.server 8080
```

Em `http://localhost:8080/` e `http://localhost:8080/admin.html` o sistema usa uma demonstração local no navegador, sem sincronização externa. A produção (Vercel) exige API e banco conectados. Essa distinção impede a exposição de pedidos de teste aos clientes.

## Organização

- `index.html`, `assets/` — vitrine, fotos e coleta de pedidos.
- `admin.html`, `assets/wanelle-admin.js` — esteira, receitas e custos.
- `api/wanelle.js` — API protegida e autenticação no Vercel.
- `neon/schema.sql` — estrutura do Neon (pedidos, dados da cozinha, proteção de tentativas de login).
- `scripts/gerar-hash-senha.mjs` — hash de senha e segredo seguro, gerados localmente.
- `config.js` — somente configuração pública.

O site e a API são protótipos a serem testados. O banco foi criado, mas o Vercel e as credenciais de administração ainda precisam ser configurados para que o sistema opere em produção.
