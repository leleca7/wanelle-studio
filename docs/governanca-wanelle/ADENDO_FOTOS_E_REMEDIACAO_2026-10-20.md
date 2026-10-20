# Adendo — proteção de fotografias e continuação da auditoria

**Data:** 20/10/2026  
**Branch:** `chore/kit-governanca-wanelle-20261019`  
**Decisão:** não pronto para publicação definitiva.

## Alterações na branch de Preview

- `index.html`: adicionados `draggable=false`, bloqueio de arrastar e bloqueio de menu de contexto somente para imagens de `#gallery` e imagens de destaque `.ph`. CSS restringe o comportamento às imagens e não desabilita o restante da página, os links ou os controles. Isso desencoraja salvamento casual, mas **não é controle de segurança contra acesso direto ao arquivo**.
- Criada `marca-dagua-preview.html`, com três estilos de marca-d’água sobre fotografias reais já existentes no repositório:
  - **A — vinho discreto:** placa translúcida no quadrante inferior direito.
  - **B — branco elegante:** texto branco com sombra suave e linha fina.
  - **C — diagonal suave:** marca central inclinada, mais resistente a simples recorte, com maior impacto visual.
- As opções são camadas CSS para avaliação visual; nenhuma foto original foi alterada e nenhuma marca foi aplicada em lote. A prova de conceito usa o texto WANELLE TORTAS ©; a aprovação da marca e a escolha final continuam pendentes.
- A Vercel reportou deploys Preview como READY para os commits `5542ed3891a87eb79bc91d0bc301254ff85a12f0` (proteção de clique/arraste) e `7616c57d45b5a74e1152bfa1fd22d466ce41a6db` (prévia visual).
- Prévia: https://wanelle-site-eqcsos4bn-blinkojobs.vercel.app/marca-dagua-preview.html
- **Limitação:** o navegador/fetch disponível não conseguiu abrir a URL para inspeção visual funcional. O estado READY é evidência de deploy concluído, não um teste real de navegador em desktop/celular. O CSS reorganiza as opções em uma coluna no celular, mas isso ainda não foi confirmado por browser real.

## Exposição e proteção efetiva das fotos

- A árvore do repositório contém fotografias em `assets/media/`, servidas diretamente pelo site. A maioria já está em WebP e há ao menos um PNG. Isso reduz o tamanho em comparação com originais de câmera, mas **não prova que sejam versões derivadas, sem metadados ou com marca-d’água**.
- Os arquivos do portfólio e o histórico público do GitHub continuam sendo fontes de cópia direta. Bloquear o menu de contexto não torna os arquivos privados.
- Não há evidência suficiente para afirmar que todos os originais de alta resolução foram localizados, inventariados e removidos de hospedagens externas ou de todo o histórico Git. É necessário inventário por hash, dimensões, formato, EXIF/IPTC/XMP e referências do código, além de confirmar quais arquivos são originais e quais são derivados.
- **Ainda não implementado:** armazenamento privado de originais, pipeline de transformação WebP/AVIF, remoção verificada de metadados de localização, geração de versões públicas com marca-d’água rasterizada, migração de referências do portfólio e política de cache. Não declarar essas proteções concluídas.
- Arquitetura recomendada: preservar os arquivos-fonte em armazenamento privado com acesso administrativo e publicar somente derivados dimensionados para a vitrine, com metadados removidos e marca-d’água aprovada. Isso exige confirmar o fluxo de migração e o armazenamento disponível; não foi alterado o banco ou armazenamento de produção.

## Documentos comerciais e histórico Git

- O relatório original registra respostas HTTP 200 na produção para `assets/market-prices.json`, `assets/market-prices.js`, `PESQUISA_DE_PRECOS.md`, `CUSTOS_DE_PRODUCAO_2026.md` e `neon/cotacoes_ifood_2026-10-14.json`.
- Esses arquivos foram removidos da árvore atual da branch do PR, preservando a consulta autenticada do painel. A auditoria anterior observou HTTP 404 para o JSON de preços no Preview. Isso não retira arquivos já servidos pela produção nem elimina blobs de commits antigos.
- A rechecagem HTTP do domínio de produção não pôde ser concluída nesta rodada porque o navegador/fetch disponível não conseguiu acessar as URLs. Portanto, os status atuais em produção permanecem **não revalidados nesta rodada**; a evidência anterior é o último resultado conhecido.
- Pesquisas e custos devem ser preservados em local privado com controle de acesso e backup, não apagados. A árvore atual da branch não contém os documentos listados, mas o histórico Git público pode conter versões integrais. Saneamento de histórico exige reescrita coordenada, rotação de credenciais se algum segredo for encontrado e comunicação a colaboradores/forks; não apaga cópias já clonadas.
- Tornar o repositório privado é uma mitigação recomendável para reduzir acesso futuro ao histórico, mas não foi executada nesta etapa. Nenhuma alteração de visibilidade foi feita sem autorização explícita. A mudança de visibilidade, por si só, não é remediação completa.

## Testes de autenticação e experiência

- Login válido/inválido, cookies duplicados, logout com cookie copiado, expiração, chamadas autenticadas/não autenticadas para leitura e escrita, CSRF, backup/restauração e CRUD ainda não foram executados dinamicamente contra a API Preview nesta rodada. A Vercel reportou o deploy como READY, mas a ferramenta de navegador/fetch não conseguiu executar requisições HTTP à URL.
- Não houve teste real em desktop/celular, leitor de tela, teclado, zoom, desempenho ou Core Web Vitals. A mudança de proteção é restrita às imagens e os estilos são responsivos, mas isso não substitui a verificação real.
- Nenhuma senha, token, segredo, dado real de cliente ou banco de produção foi lido ou alterado.

## Pendências que bloqueiam publicação

1. Mitigar a exposição dos documentos comerciais em produção mediante aprovação explícita para publicar a correção, após confirmar que as pesquisas estão preservadas em local privado.
2. Decidir a visibilidade do repositório e planejar saneamento do histórico Git sem perder as pesquisas.
3. Identificar e migrar originais fotográficos para armazenamento privado; produzir derivados públicos otimizados, sem metadados desnecessários e com marca-d’água aprovada.
4. Obter aprovação do proprietário para uma das três opções antes de aplicar a marca em lote.
5. Executar testes HTTP dinâmicos de autenticação/autorização/sessão e testes visuais reais desktop/mobile.
6. Manter intake público e recuperação por e-mail desabilitados até que os testes e configurações pendentes sejam concluídos.
