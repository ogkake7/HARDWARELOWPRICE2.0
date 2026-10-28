# Hardware Low Price — Entregas cliente-only

## Loja pública funcional

- [x] A loja serve `/` com visual marketplace claro inspirado no Atacado Connect: cabeçalho branco, busca central, cotação USD/BRL, categorias, cards arredondados, ofertas, catálogo, FAQ e rodapé.
- [x] A página inclui barra de anúncio, chamada para Instagram, quatro selos de confiança, vitrine de oportunidades com preço antigo, desconto e contagem regressiva.
- [x] A seção de depoimentos só aparece quando existem depoimentos reais retornados pela API.
- [x] O cliente consegue buscar, filtrar por categoria e adicionar produtos à sacola.

## Carrinho e checkout

- [x] O checkout permite informar endereço manualmente ou por CEP usando ViaCEP.
- [x] O checkout permite escolher PIX ou cartão como forma pretendida de pagamento e abre o WhatsApp com a mensagem pronta após registrar o pedido.
- [x] O servidor recalcula preços, estoque e total usando os produtos persistidos; o cliente não consegue definir o total final.
- [x] O fluxo não afirma que o pagamento foi concluído: a equipe confirma disponibilidade, condições e pagamento no WhatsApp.

## Cliente-only e segurança

- [x] Não existe painel administrativo público, rota `/admin` ou credencial administrativa padrão publicada.
- [x] A entrega anexada ao Claude contém somente a loja pública, o servidor, o catálogo e o checkout.
- [x] O número de WhatsApp não é inventado; quando não configurado, a loja informa que o atendimento ainda precisa ser definido.
- [x] O servidor mantém validações de entrada, limite de tentativas de autenticação existente e recálculo de valores.

## Execução e manutenção

- [x] O projeto contém `package.json`, `server.js`, `seed-products.js`, `public/` e `data/`, roda com `npm install` e `npm start` e escuta a porta 3000 por padrão.
- [x] Existe `public/manus-routes.json` declarando somente a página pública `/`.
- [x] O guia `RODAR_NO_CLAUDE.md` explica como executar e continuar o desenvolvimento sem criar opções administrativas.
- [ ] Antes da publicação, migrar `data/db.json` para banco persistente, mover imagens para storage persistente, definir `JWT_SECRET` forte, configurar o número real do WhatsApp e revisar requisitos fiscais e aduaneiros.

## Direção baseada no site-mãe Atacado Connect

- [x] A loja pública foi alinhada ao padrão marketplace do site-mãe: fundo claro, cabeçalho branco com busca central, cotação do dólar, seletor de moeda, ações de favoritos/conta/sacola, navegação horizontal e cards arredondados.
- [x] Os cards mostram preço em USD e conversão em BRL, com cotação inicial de R$ 5,10.
- [x] A relação com a Atacado Connect é comunicada sem substituir as regras próprias da Hardware Low Price de atendimento, envio e confirmação via WhatsApp.


## Catálogo Atacado Connect importado

- [x] Importadas as categorias Games, Smartphones, Smartwatch, Consoles e Eletrônicos, com deduplicação por ID.
- [x] Catálogo local preparado com 3.004 produtos únicos, preços em USD/BRL, marcas, links de origem e imagens públicas do CDN.
- [x] Frontend ajustado para Smartwatch e Eletrônicos, com carregamento progressivo de 48 cards por vez para evitar renderizar milhares de produtos de uma só vez.
- [x] Importador reproduzível salvo em `tools/import_atacado_catalog.py`; nenhuma credencial foi gravada no projeto.
