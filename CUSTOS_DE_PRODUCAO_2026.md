# Wanelle Studio — mão de obra, energia, água e lucro (Salvador, 14/10/2026)

**Status:** pesquisa documental verificada, com parâmetros de produção **a confirmar** nas contas e equipamentos da Wanelle. Os valores de ingredientes e rendimentos na demonstração continuam fictícios; nenhum preço representa orçamento comercial pronto.

## 1. Valor do trabalho

- Salário-base mediano de confeiteiro CLT em Salvador: **R$ 2.357/mês**, ou **R$ 12,36 por hora** (jornada 44h/semana, dados CAGED/eSocial, levantamento de 10/10/2026). Salário CLT **não é tarifa praticada por confeiteiras autônomas**. Fonte: https://mentoring.com.vc/painel/Quanto-ganha-Confeiteiro-%28CBO-848310%29-em-Salvador-BA---Mercadometro.html
- No Studio, para **simulações iniciais**, configuramos **R$ 25/h de preparo** e **R$ 35/h de decoração elaborada**. São parâmetros gerenciais sugeridos, não taxas de mercado comprovadas.
- Cada ficha tem `Tempo total de trabalho` e `Desse total, minutos de decoração`. O sistema divide os minutos entre preparação e decoração **sem somar o tempo duas vezes**.
- **O pagamento da mão de obra é custo da torta; lucro é o resultado depois de remunerar esse trabalho**. O adicional de criação é uma reserva adicional de personalização e pode ser ajustado/zerado para evitar cobrança em duplicidade.

## 2. Energia elétrica na Coelba

- Neoenergia Coelba — B1 residencial convencional: **R$ 0,87773/kWh**, tarifa base sem impostos e adicionais, vigência 22/04/2026 a 21/04/2027 (Resolução 3.578/2026). Referência: https://www.neoenergia.com/documents/d/bahia/01_neoenergia-coelba_tarifas-de-energia-eletrica_abr2026_reh_n-3-578_grupo-b?download=true
- Fórmula: `potência em watts ÷ 1.000 × minutos ligados ÷ 60 × R$/kWh`.
- Exemplo, não medição da Wanelle: batedeira 500 W por 15 min = 0,125 kWh = **R$ 0,11** com tarifa-base; forno elétrico 2.000 W por 45 min = 1,5 kWh = **R$ 1,32** com tarifa-base, se a resistência operar a potência máxima por todo o período.
- O Studio permite selecionar **forno elétrico (1) ou forno a gás (0)**. O primeiro entra em energia e zera a rubrica gás; o segundo contabiliza gasto de gás. Geladeira: kWh/mês dividido pelo número previsto de tortas vendidas ao mês. Pode haver parcela da refrigeração doméstica que não pertence à confeitaria: informe apenas a atribuível ao negócio.
- Para obter custo **cobrado na fatura**, o ideal é usar o custo variável efetivo por kWh conforme a conta e as regras aplicáveis (impostos, iluminação pública e encargos precisam ser tratados corretamente); não tomar a tarifa-base como custo final de energia.

## 3. Água e esgoto Embasa

- A tarifa mínima residencial normal para até 6 m³ foi reajustada para **R$ 44,77** a partir de 20/07/2026, segundo notícia que reporta o reajuste Agersa/Embasa: https://www.correio24horas.com.br/bahia/conta-de-agua-fica-r-154-mais-cara-na-bahia-apos-reajuste-anual-0626
- A Embasa informa **até 80% referente aos serviços de esgoto** nos casos aplicáveis (por ex., ligação à rede): https://atendimentovirtual.embasa.ba.gov.br/perguntasfrequentes-servicos
- Para a demonstração, e **somente provisoriamente**, `44,77 ÷ 6 = R$ 7,46167/m³ de água`; o multiplicador de esgoto é 80%. Isso é **custo médio implícito da tarifa mínima**, não a tarifa marginal aplicável acima dos 6 m³, nem preço específico verificado na conta da Wanelle.
- A demonstração pressupõe **15 litros por torta-base**, chegando a `0,015 m³ × 7,46167 × 1,80 = R$ 0,20` por torta-base. Quinze litros é um parâmetro fictício a ser aferido (lavagem de utensílios, higiene, ingredientes e bancada).
- A fatura real determina categoria residencial/comercial, consumo por faixa, cobrança de esgoto e o custo mais adequado. Água da residência compartilhada: ratear consumo adicional atribuível à confeitaria ou contabilizar parcela proporcional, sem contar o mesmo gasto duas vezes.

## 4. Outras rubricas

- Gás: **R$ 4 por torta-base no exemplo anterior**, sem validação de preço de botijão nem de consumo. Atualizar usando preço real do botijão e horas reais de cozimento, ou medição de consumo, sem somar forno elétrico e forno a gás simultaneamente.
- Limpeza e pequenos insumos: **R$ 3 por torta-base (exemplo)**.
- Geladeira: **40 kWh por mês e 40 tortas por mês** ilustrativos; o sistema rateia energia entre tortas vendidas.
- Custos fixos mensais: inicialmente R$ 0 **não medido**; cadastrar internet da empresa, aluguel proporcional, equipamentos, manutenção e demais despesas que ainda não entraram nas rubricas.
- Impostos de venda: inicialmente **0% = NÃO CONFIGURADO**; informe tributação aplicável antes de decidir preço final. Taxas de cartão também são separadas.

## 5. Fórmula aplicada

- Custo de produção = ingredientes + embalagem + mão de obra (preparo e decoração) + energia (batedeira, forno, geladeira) + água/esgoto + gás + limpeza/outros + despesas fixas rateadas + reserva indireta + criação extra + entrega.
- `Preço sugerido = custo de produção ÷ [1 − (margem desejada% + taxa de recebimento% + tributos sobre vendas%)/100]`, arredondado para cima ao passo configurado.
- `Resultado previsto = preço de venda − custo total − taxa de recebimento − imposto cadastrado`.
- Se os custos medidos (equipamentos, faturas, impostos) ou ingredientes reais não estiverem cadastrados, **resultado é projeção, não lucro contábil realizado**.
- A margem é **lucro ÷ faturamento**, e não percentual acrescido ao custo. A mão de obra já foi subtraída no custo, não deve ser confundida com a margem.

## 6. Dados que precisamos validar na Wanelle

1. Foto da etiqueta de potência da **batedeira** e minutos médios de uso por torta-base;
2. **Forno elétrico ou a gás**, potência/capacidade ou valor do botijão e rendimento, além do tempo médio;
3. Uma **fatura da Neoenergia Coelba** (pode ocultar nome, endereço, CPF, contrato), com valores e consumo kWh visíveis;
4. Uma **fatura da Embasa** (também com dados pessoais ocultos), com consumo m³, água e esgoto;
5. Tempo gasto **na massa/recheio/montagem** e tempo específico **na decoração**, além da média de encomendas por mês;
6. Quais custos da casa pertencem só à Wanelle, para não duplicar rateios; e regime de tributação.

**Atenção:** os componentes de consumo de equipamentos são modelos de orçamento, não telemetria. Para medir consumo real, usar medidor de tomada adequado e seguro para a potência do equipamento ou dados confiáveis do fabricante.