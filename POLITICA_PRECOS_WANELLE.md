# Wanelle Studio — política de custo protegido (14/10/2026)

## Objetivo
Não deixar um orçamento de hoje dar prejuízo porque a compra será feita em outra semana. O preço pesquisado continua salvo sem alteração; um segundo valor, **custo de proteção**, é usado nas estimativas.

## Regra inicial (ajustável no painel)
1. Conferir o **mesmo ingrediente**, com marca/versão e gramatura adequadas à receita. Não misturar açúcar demerara/refinado, farinha com/sem fermento, nem cacau de teores distintos.
2. Usar a **cotação normal de uma embalagem**, sem descontos que exigem comprar várias unidades quando isso não ocorrer.
3. Calcular `custo_protegido_da_embalagem = ARREDONDAR_PARA_CIMA(preço_cotado × 1,10; múltiplo de R$ 0,50)`.
4. Custo da receita = `quantidade usada / quantidade da embalagem × custo protegido`, multiplicado pelas perdas registradas. Manter casas decimais intermediárias; arredondar só os valores apresentados.
5. Considerar embalagem, energia, água, mão de obra, despesas operacionais, frete rateado, taxas de pagamento e tributos separadamente. **A proteção não substitui a margem de lucro nem a reserva de despesas indiretas.**
6. Exibir preço observado e estimativa com proteção separadamente. Preservar cotação com fonte/data e comparar com comprovante de compra para reajustar a regra.

## Exemplos baseados na pesquisa do iFood registrada no GitHub

| Produto | Observado | Protegido (10% + R$ 0,50) |
|---|---:|---:|
| Farinha Dona Benta tradicional Assaí, 1 kg | R$ 4,64 | R$ 5,50 |
| Farinha Dona Benta Atacadão, 1 kg (versão a confirmar) | R$ 3,82 | R$ 4,50 |
| Margarina Deline Atakarejo, 500 g | R$ 5,14 | R$ 6,00 |
| Chocolate Dmari 50% Atacadão, 1,01 kg | R$ 36,88 | R$ 41,00 |

Esses são **custos simulados de proteção**, não novos preços de mercado. Confirmação de produto e preço pago continua obrigatória antes do uso comercial. Nos exemplos, o custo unitário deriva do preço total protegido e da gramatura real.

## Atenção: proteção de 10% não é garantia contra qualquer aumento
O reajuste pode superar 10%, a embalagem pode mudar e o frete por compra pode subir. Cotações antigas, ambíguas ou promocionais devem ser atualizadas. O cálculo não substitui o fechamento real da produção.
