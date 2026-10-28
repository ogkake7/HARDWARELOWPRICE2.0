# Hardware Low Price — Contexto do Projeto

## Objetivo

A Hardware Low Price é uma loja online brasileira de hardware, smartphones, games, consoles e eletrônicos. O objetivo principal é permitir que o cliente navegue pelo catálogo, encontre produtos, adicione itens à sacola, preencha o checkout e envie o pedido para confirmação pelo WhatsApp.

A operação trabalha com produtos da Atacado Connect, no Paraguai, e atende clientes no Brasil. O site não deve afirmar que o pagamento foi concluído automaticamente. O pedido é criado pela loja e a equipe confirma disponibilidade, preço final, forma de pagamento e entrega pelo WhatsApp.

## Estado atual

O projeto já possui:

- Servidor Node.js com Express em `server.js`.
- Interface pública em `public/index.html`.
- Estilos em `public/styles.css`.
- Lógica da loja em `public/app.js`.
- Catálogo importado em `data/atacado-catalog.json`.
- Seed configurado em `seed-products.js`.
- Importador reproduzível em `tools/import_atacado_catalog.py`.
- Rotas públicas declaradas em `public/manus-routes.json`.
- Checkout com endereço, consulta de CEP, escolha de PIX ou cartão e abertura do WhatsApp.
- Carrinho lateral com quantidade, remoção de itens e total recalculado.
- Conta de cliente opcional com cadastro, login e histórico de pedidos.
- Carregamento progressivo do catálogo para evitar renderizar milhares de cards de uma só vez.

O catálogo atual possui aproximadamente 3.004 produtos únicos importados das categorias fornecidas da Atacado Connect.

## Regra importante: projeto cliente-only

Esta versão é exclusivamente uma loja para clientes. Não criar ou reintroduzir:

- Painel administrativo.
- Rota `/admin`.
- APIs `/api/admin/*`.
- Senha administrativa padrão.
- Login administrativo.
- Formulários administrativos visíveis ao cliente.

Qualquer futura administração de produtos deverá ser tratada separadamente e não deve ser adicionada sem uma nova decisão explícita.

## Identidade visual

A aparência deve seguir um marketplace claro inspirado na Atacado Connect:

- Fundo branco e cinza muito claro.
- Verde forte como cor de ação e conversão.
- Cabeçalho limpo com logotipo, busca, cotação do dólar, moeda, conta e sacola.
- Cards de produto brancos, com bordas finas, cantos arredondados e sombra discreta.
- Destaques de preço em verde.
- Exibição de preço em dólar e conversão em reais.
- Navegação horizontal por categorias.
- Tipografia condensada e forte nos títulos, combinada com uma fonte simples para textos.
- Layout responsivo para desktop e celular.

A referência visual principal é:

- https://atacadoconnect.com/

Não copiar marca, logotipo ou textos proprietários da Atacado Connect. Usar a referência somente para entender a hierarquia visual de marketplace, catálogo, busca, filtros, moeda e cards.

## Categorias atuais

O catálogo importado utiliza estas categorias internas:

- `smartphones` — Smartphones e celulares.
- `consoles` — Games, consoles, controles e acessórios de jogos.
- `smartwatches` — Smartwatches e relógios inteligentes.
- `eletronicos` — Eletrônicos em geral.

O projeto também mantém categorias legadas para compatibilidade visual, como `hardware`, `notebooks` e `audio`.

## Fonte dos produtos e imagens

Os produtos foram coletados das páginas públicas da Atacado Connect. As imagens não foram inventadas nem geradas por IA. Cada produto importado possui:

- Nome do produto.
- Marca.
- Preço em dólar quando disponível.
- Preço em reais.
- ID de origem.
- URL da página original.
- URL pública da imagem no CDN.
- Categoria correspondente.

As fontes usadas foram:

- Games: https://atacadoconnect.com/categoria/games
- Smartphones: https://atacadoconnect.com/categoria/smartphones
- Smartwatch: https://atacadoconnect.com/categoria/smartphones/smartwatch
- Consoles: https://atacadoconnect.com/categoria/games/consoles
- Eletrônicos: https://atacadoconnect.com/categoria/eletronicos

Os URLs das imagens ficam registrados em `data/atacado-catalog.json`. Eles normalmente apontam para:

```text
https://cdn.atacadoconnect.com/produtos/<id>/capa/<arquivo>.webp
https://cdn.atacadoconnect.com/produtos/<id>/thumb/<arquivo>.webp
```

As imagens são exibidas remotamente pelo navegador. Não remover o campo `image` nem substituir essas URLs por placeholders sem necessidade.

A reutilização comercial das imagens deve ser feita somente com autorização do responsável pela loja de origem.

## Como executar

Na pasta do projeto:

```bash
npm install
npm start
```

Depois, abrir:

```text
http://localhost:3000
```

Para validar rapidamente:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products
curl http://localhost:3000/manus-routes.json
```

## Como atualizar o catálogo

O catálogo já está salvo no projeto. Para repetir a coleta das páginas públicas:

```bash
python3 -m pip install -r requirements-import.txt
python3 tools/import_atacado_catalog.py --merge-db
```

O importador deduplica os produtos pelo ID original. Não colocar login ou senha dentro do código, do Markdown, do Git ou de variáveis públicas do frontend.

## Fluxo esperado do cliente

1. O cliente entra na home.
2. Pesquisa um produto ou escolhe uma categoria.
3. Visualiza imagem, nome, marca, preço em USD e preço convertido em BRL.
4. Adiciona o produto à sacola.
5. Abre o checkout.
6. Informa endereço e CEP.
7. Escolhe PIX ou cartão como condição pretendida.
8. O servidor recalcula os itens, preços e total.
9. O pedido é registrado.
10. O WhatsApp é aberto com uma mensagem contendo o número do pedido, itens, total e endereço.
11. A equipe confirma disponibilidade, pagamento e envio manualmente.

## Ideias de evolução

As próximas melhorias podem incluir:

- Criar páginas individuais para cada produto usando `sourceUrl` como referência de origem.
- Adicionar zoom e galeria com várias imagens quando existirem imagens adicionais no CDN.
- Implementar filtros por marca, faixa de preço, condição e disponibilidade.
- Adicionar busca por ID original do produto.
- Criar botão para copiar o código do produto.
- Melhorar a ordenação por menor preço, maior preço, relevância e marca.
- Adicionar favoritos locais no navegador.
- Melhorar o resumo do pedido antes da abertura do WhatsApp.
- Exibir aviso claro de que preço e disponibilidade precisam ser confirmados.
- Adicionar SEO básico, meta tags, Open Graph e sitemap para as páginas públicas.
- Otimizar o catálogo para conexão lenta usando lazy loading e paginação.
- Baixar imagens para storage próprio somente se houver autorização e necessidade operacional.
- Configurar o número oficial do WhatsApp antes da publicação.
- Definir cotação real do dólar e revisar preços antes de vender.
- Revisar requisitos fiscais, garantia, importação, entrega e política de troca antes do lançamento.

## Instrução inicial para o Claude

Use este arquivo como contexto antes de alterar o projeto. Leia também `RODAR_NO_CLAUDE.md`, `plan.md` e `TODO.md`. Execute o projeto antes de editar qualquer arquivo.

Mantenha o site cliente-only, preserve o catálogo importado e as fontes de imagem em `data/atacado-catalog.json`, não crie painel administrativo e não invente preços, estoque, depoimentos, disponibilidade ou número de WhatsApp.
