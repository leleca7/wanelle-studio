# Wanelle Studio — Esteira de encomendas e precificação

Projeto baseado no HTML original **Wanelle Tortas — Feito para celebrar**.

## Repositório GitHub: leleca7/wanelle-studio

Catálogo atual contém 12 criações, incluindo **Torta de Chocolate com Raspas** (3 fotos recebidas em 13/10/2026) e **Torta de Formatura Administração** (2 fotos). As duas são **apenas referências visuais**, sem receita ou preço atribuídos.

**PUBLICAÇÃO:** este repositório contém o código do sistema, mas NÃO tem Supabase configurado. O formulário público não aceita efetivamente encomendas online até a ativação do banco; nesta situação, o usuário é encaminhado ao WhatsApp. O painel administrativo online fica bloqueado sem autenticação. Não divulgue o endereço publicamente como um canal de orçamentos automatizados antes de testar e ativar Supabase, anti-spam e política de privacidade.

## Regra atual — criações antigas são portfólio, NÃO produtos com preços

- **Fotos antigas:** continuam no site público em **Criações da Wanelle**, com galeria de fotos; servem exclusivamente para o cliente escolher uma **inspiração**. Não existe tabela de preço histórico para essas imagens.
- **Cadastros iniciais do painel:** nenhuma receita, nenhum pedido fictício, nenhum preço de ingrediente pré-definido. Há uma lista **auxiliar de nomes de ingredientes**, todos com preço e estoque zerados, para facilitar o primeiro cadastro.
- **Primeira encomenda real:** o cliente escolhe uma foto como referência (ou nenhuma), quantidade, sabor, camadas, decoração e data, mas **não recebe preço automático no site público**.
- **No painel:** a nova solicitação aparece como **Aguardando ficha e custos**. Abra o pedido e clique em **+ Criar ficha desta encomenda**; o Studio salva o pedido como rascunho, abre a ficha técnica e, após salvá-la, vincula a nova receita ao pedido.
- **Fichas técnicas:** cadastre os ingredientes e as quantidades reais, o rendimento, a embalagem e o tempo ativo; os preços de compra são informados na aba Ingredientes, ou aplicados da Pesquisa de Mercado após conferir a variedade e a unidade.
- **Regra de proteção:** orçamento só pode ser enviado pelo painel quando **todas as tortas têm ficha técnica, ingredientes com valor registrado e custos operacionais confirmados** na aba Custos & preços. A foto do portfólio nunca é usada como substituta de uma receita.
- **Aprendizado:** depois de cada produção, registre os minutos e extras reais para comparar o resultado ao orçamento. A receita criada pode ser reutilizada com ajustes para encomendas futuras.

**Atenção:** esta versão utiliza uma nova chave de dados locais, para não reaproveitar inadvertidamente receitas e clientes fictícios das versões anteriores. Se havia algum dado REAL lançado numa demonstração anterior, exporte o backup na versão antiga antes de migrar. **Não publique o painel sem banco de dados e login.**

## O que já funciona nesta primeira versão

- `index.html` — site público, com fotos e marca originais, catálogo, carrinho de inspirações e formulário de orçamento (nome, WhatsApp, ocasião, data, pessoas por torta, sabores, recheios, personalização e entrega).
- `admin.html` — painel com visão geral, esteira de pedidos em seis etapas, criação de orçamentos, envio de mensagem para WhatsApp, fichas técnicas, ingredientes, custo de mão de obra, despesas e lucro sugerido.
- **Produção e compras** — lista de ingredientes calculada pelos pedidos confirmados, com desconto do estoque informado.
- **Histórico do orçamento** — ao enviar/aprovar a proposta, o valor calculado é congelado no pedido para não mudar silenciosamente quando os preços dos ingredientes forem atualizados.
- Backup/restauração JSON na demonstração.

## Pesquisa de mercado — 14/10/2026

**Mercado principal:** Atakarejo — Boca do Rio (R. Abelardo Andrade de Carvalho, s/n, Salvador/BA), conforme o [site oficial](https://atakarejo.com.br/nossas-lojas/). A loja está definida como preferência; os preços anunciados nos encartes gerais de Salvador **não foram validados especificamente no caixa ou iFood dessa unidade**, portanto mantenha essa distinção ao precificar.

O painel tem a nova aba **Pesquisa de mercado** com 12 produtos e links individuais para a origem dos preços. Prioridade: **Atakarejo Salvador/Bahia**, com cinco cotações do **encarte oficial 05–18/10/2026**. Complemento: preços expostos nas páginas das unidades do **Atacadão em Salvador**. O iFood exibe a loja Atakarejo Castelo Branco, mas a leitura individual de preços no iFood exigiu acesso não disponibilizado publicamente (acesso bloqueado).

- As cotações são dados reais publicados, porém podem estar indisponíveis ou mudar na loja, inclusive por marca e composição.
- **Nenhum preço foi automaticamente aplicado às receitas.** Para usar um preço, vá a **Pesquisa de mercado → Usar na ficha**, confirme embalagem, variedade e marca. A origem e a data ficarão salvas junto do ingrediente, inclusive se for no Supabase.
- Se o item não existe nas receitas (cacau 100%, açúcar demerara, amido, mistura para bolo), a ação cria um ingrediente separado. Não substitui indevidamente outro.
- `assets/market-prices.json` guarda pesquisa estruturada, e `assets/market-prices.js` carrega os dados no painel e também na demonstração independente. `PESQUISA_DE_PRECOS.md` detalha os registros.
- Os demais ingredientes continuam marcados como **sem fonte**; não emita orçamentos comerciais até conferir quantidades das receitas, ingredientes e despesas.
- Os dados da pesquisa são **estáticos** desta data; atualizar novos encartes/cotações requer nova pesquisa e revisão. Não há consulta automática ao iFood nem a mercados.

## IMPORTANTE: os preços começam vazios

Os modelos de torta antigos **não têm receitas nem preços automáticos**. O cadastro auxiliar de ingredientes começa com preço zero/sem cotação. Os valores por hora de mão de obra e a tarifa-base de energia são apenas parâmetros iniciais de referência; consumos de equipamentos, água, gás e despesas ainda precisam ser informados. A opção **Conferi os custos operacionais reais** deve ser marcada somente depois da conferência de todos esses itens.

### Como o cálculo funciona — revisão 14/10/2026

- Custo unitário de ingrediente = embalagem ÷ quantidade, com perdas; quantidades conforme o rendimento-base da ficha técnica.
- Mão de obra separa **produção** e **decoração**, com valor/hora editável para cada parte.
- Energia = consumo por potência, minutos de batedeira e forno elétrico, mais rateio de geladeira; modo forno a gás exclui aquecimento elétrico.
- Água = litros estimados × custo médio por m³ × multiplicador de esgoto, todos editáveis. A tarifa mínima Embasa não é tarifa marginal.
- Outros custos: embalagem, gás, limpeza, custos fixos mensais rateados, reserva de despesas indiretas, criação e entrega.
- Preço sugerido = custo total ÷ (1 − margem-alvo − taxa de recebimento − tributação de vendas configurada), arredondado para cima.
- Preço manual recalcula lucro e margem; **mão de obra é custo e lucro vem depois**.
- **Importante:** a tarifa base de energia não inclui tributos; a água usa referência média provisória; consumo dos equipamentos, gás, ingredientes e custos mensais são hipóteses. Não use os preços do exemplo em uma venda sem validar os dados.

Veja as fontes e metodologia em [`CUSTOS_DE_PRODUCAO_2026.md`](CUSTOS_DE_PRODUCAO_2026.md).

## Abrir sem instalar nada

Abra `WANELLE_STUDIO_DEMONSTRACAO.html` para conhecer a **interface do painel** e testar seus botões no próprio arquivo. Essa demonstração é independente, não se conecta ao site público e **começa sem pedidos e sem receitas**, para receber os dados que você decidir informar. Para testar o fluxo completo site → painel, siga a seção abaixo.

## Abrir e testar no seu computador

Extraia o ZIP. Em Windows com Python instalado, use `INICIAR_DEMONSTRACAO_WINDOWS.bat`. Ou inicie um servidor local simples na pasta do projeto:

```bash
python -m http.server 8080
```

Em seguida, abrir:

- `http://localhost:8080/index.html` (cliente)
- `http://localhost:8080/admin.html` (painel)

No **modo demonstração**, pedidos e dados ficam no `localStorage` **do mesmo navegador e origem**. Envie um teste no site e atualize o painel para ver o novo cartão na esteira. Isso NÃO sincroniza clientes em outros aparelhos. Para backup, use **Custos & preços → Baixar backup JSON**.

## Conectar ao Supabase (etapa de publicação)

1. Crie um projeto Supabase.
2. Abra o **SQL Editor** e execute `supabase/schema.sql`.
3. Em **Authentication → Users**, crie a conta administrativa; depois cadastre o UUID dela na tabela `public.admin_users` conforme a instrução ao fim do SQL.
4. Em `config.js`, preencha `supabaseUrl` e `supabaseAnonKey` usando a chave **pública/publishable (anon)**. NUNCA use a chave secreta/service_role no código do navegador.
5. Em **Authentication → URL Configuration**, configure a origem/domínio de produção conforme necessário.
6. Teste login, inserção de um pedido pelo site e mudança de status no painel.
7. **Antes de ativar publicidade e receber pedidos reais:** colocar CAPTCHA e proteção contra abuso/rate limit no endpoint público (a política de INSERT permite solicitações anônimas); adicionar política de privacidade/LGPD e gestão de consentimento e retenção dos dados dos clientes.

Quando conectado, o painel exige login da administradora; clientes podem enviar solicitação, mas **não podem consultar pedidos, telefones, receitas ou custos**. Uma instalação publicada sem banco configurado bloqueia o painel em vez de expor dados de demonstração.

## GitHub e Vercel (posteriormente)

Subir os arquivos desta pasta para um repositório GitHub. É um site estático: no Vercel use **Framework Preset: Other**, **Output Directory: raiz do projeto** (sem build) e publique os arquivos. Recomenda-se cadastrar o `config.js` por um processo com variáveis de ambiente antes de implantar, em vez de editar dados manualmente no repositório. A chave pública pode ser disponibilizada ao navegador; segredos **nunca**.

Para produção, considerar separar `index.html` do painel em rotas, configurar domínio próprio e ajustar caching/HTTPS. O código da demonstração **não deve ser tratado como solução final de segurança operacional** antes dos testes reais.

## Arquivos

```text
index.html                   Site público (adaptado do HTML enviado)
admin.html                   Sistema interno
config.js                    Configuração opcional do Supabase
assets/admin.css             Identidade visual do painel
assets/site-intake.js        Cadastro de solicitação pelo site
assets/wanelle-admin.js      Interface e operações do painel
assets/wanelle-core.js       Receita, preços, pedidos e adaptador de dados
assets/media/                Logo e fotografias originais extraídas do HTML
assets/product-map.json      Referência dos produtos do catálogo
supabase/schema.sql          Banco e permissões
```

**Privacidade:** a demonstração começa sem nomes de clientes. Ao registrar pedidos reais, o tratamento de dados deve seguir a LGPD.


## 2026-10-14 — Orçamento inteligente por etapa (nova versão)

O painel passou a ter um assistente com quatro etapas: **cliente → estrutura → tempo ativo → custo e lucro**. Em **Novo orçamento**, preencha as porções, o número de bolos, **camadas de recheio** (referência 2), nível de decoração (simples, trabalhada ou artística) e, opcionalmente, diâmetro aproximado da forma.

- **Tempo automático por etapa:** massa, recheio, montagem, confeitar e finalizar/limpar. O algoritmo parte dos minutos de produção total e decoração registrados na ficha técnica, considera a quantidade de bolos, a variação de porções, as camadas e a complexidade. São estimativas de planejamento **não são tempos observados na cozinha**. Para tempo próprio selecione **Manual** e ajuste cada etapa; esse valor prevalece no cálculo de mão de obra.
- **Recheio por camadas:** ao editar a receita marque cada ingrediente como Massa, Recheio / camadas, Cobertura ou Decoração. Só os ingredientes classificados como recheio são multiplicados pela razão `camadas solicitadas ÷ camadas da ficha-base`. Porções multiplicam todos os ingredientes e os tempos-base. Essa regra pressupõe espessura semelhante de camada e rendimento correto da receita. Não ajusta automaticamente um recheio informado em texto que seja diferente da ficha-base — confira antes do orçamento.
- **Diâmetro em centímetros:** campo apenas informativo, porque o consumo depende também de altura, forma e densidade; o ajuste quantitativo usa o **rendimento em porções informado na ficha**. Verifique a embalagem-base para tamanhos maiores.
- **Forno, batedeira e água:** seguem as potências, durações de uso, consumo e tarifas editáveis em Custos & preços. Os tempos de forno/descanso não são cobrados como trabalho ativo contínuo. Não computar gás e forno elétrico simultaneamente.
- **Valor por hora:** R$25/h de produção e R$35/h de confeitaria são referências **sugeridas**, não preços observados de mercado. Alterar em Custos & preços.
- **Criação:** quando personalizada, a taxa configurada é um *adicional de serviço cobrado na sugestão de venda* — não uma despesa fictícia duplicada. O lucro é o preço efetivo menos custos, taxa e tributo configurados, já com a remuneração por hora no custo.
- **Materiais extras:** campo para topper, laços, caixas adicionais, impressões, decoração e qualquer insumo não mapeado. Também há Outros custos deste pedido e entrega.
- **Mínimo sem prejuízo:** o painel compara o preço digitado ao custo total mais taxas. Bloqueia o envio por WhatsApp quando há prejuízo projetado. Ingredientes sem preço documentado, receitas ausentes e custos operacionais não confirmados impedem envio de orçamento. O cálculo **não garante lucro real** quando valores ainda são ilustrativos ou faltarem perdas, impostos e custos fixos.
- **Compras:** a lista mostra insumo consumido e número de embalagens inteiras que precisariam ser compradas, com desembolso de caixa calculado separadamente do custo da receita.
- **Depois da produção:** dentro do orçamento, em “registrar tempo REAL”, informe os minutos efetivamente trabalhados e gastos inesperados. O painel compara lucro previsto e lucro revisto (os ingredientes ainda permanecem pelo consumo previsto; não é fechamento contábil).

**Compatibilidade:** todas as propriedades novas são opcionais para os dados locais antigos. Para Supabase, reexecute o arquivo `supabase/schema.sql` para adicionar as colunas com `ADD COLUMN IF NOT EXISTS` antes de publicar a nova versão. Faça backup antes de qualquer implantação. O sistema **ainda não foi implantado no GitHub, Supabase ou Vercel**.

**Validação:** `node teste_fluxo_real.cjs` verifica cadastro inicial sem preços, referências visuais desacopladas das receitas, bloqueio de orçamentos incompletos, camadas extras e inserção de uma solicitação. O navegador de teste não permitiu concluir a revisão visual automatizada. Faça teste manual no navegador real antes da publicação.

## Verificação de fluxo sem preços inventados

No projeto, o teste `node teste_fluxo_real.cjs` verifica: painel vazio de pedidos/receitas na primeira execução, fotos como referência sem vínculo com preços antigos, orçamento bloqueado se faltar receita/ingrediente/despesas, e cálculo desbloqueado após preencher a ficha técnica com dados da encomenda. Os números inseridos no teste são apenas dados simulados no ambiente de testes, não são adicionados ao cadastro real do painel.