# Hardware Low Price — Plano de implementação

## Escopo

Entregar uma primeira versão funcional da loja virtual da Hardware Low Price, com catálogo público, carrinho, autenticação local por cookie JWT, checkout que registra o pedido e prepara a conversa no WhatsApp, além de painel administrativo para manutenção de produtos, pedidos, depoimentos e configurações.

## Implementação

- **Servidor:** Node.js + Express, servindo os arquivos estáticos e uma API REST em `/api`.
- **Persistência inicial:** `data/db.json`, com criação automática e seed de dados demonstrativos seguros; a estrutura fica isolada para futura migração a Postgres.
- **Autenticação:** usuários com senha bcrypt, sessão JWT em cookie `hlp_session`, perfil `admin` protegido por middleware. O cookie usa `SameSite=None; Secure` quando o proxy público informa HTTPS e comportamento compatível com HTTP local.
- **Uploads:** Multer em `public/uploads`, com limite de 5 MB e validação de JPG, PNG e WEBP.
- **Frontend:** HTML, CSS e JavaScript sem etapa de build, com a loja em `/` e o painel em `/admin`.
- **Integridade comercial:** preços, estoque e totais são recalculados no servidor; o navegador apenas envia IDs e quantidades.
- **Privacidade e confiança:** depoimentos não são inventados; produtos de disponibilidade não confirmada não entram no catálogo inicial; configurações comerciais pendentes ficam editáveis no admin.

## Estrutura

```text
server.js              API, autenticação, pedidos, upload e seed
seed-products.js       catálogo demonstrativo inicial
package.json           dependências e scripts
data/db.json            persistência local criada na primeira execução
public/index.html       loja
public/app.js           catálogo, carrinho, auth e checkout
public/admin.html       painel
public/admin.js         gestão de produtos, pedidos e configurações
public/styles.css       identidade Dark Tech Gamer responsiva
public/manus-routes.json rotas visíveis do site
```

## Direção visual escolhida

### Estilos considerados

- **Neon Commerce / Tech Gamer (0,68):** interface escura, ciano elétrico, grids técnicos e foco direto em preço e confiança.
- **Cyberpunk Editorial (0,08):** mais experimental, angular e contrastado, com maior carga de efeitos.
- **Premium Minimal Hardware (0,05):** mais sóbrio, com grandes áreas de respiro e menos informação simultânea.

### Design Movement

Neon Commerce, inspirado em dashboards de hardware e interfaces de performance, aplicado a uma operação comercial acessível.

### Princípios

1. **Conversão sem ruído:** preço PIX, desconto e CTA aparecem antes de detalhes secundários.
2. **Confiança visível:** selos, garantia, embalagem e rastreio são apresentados como parte do produto.
3. **Precisão técnica:** labels, divisores, monoespaçado auxiliar e microinterações remetem a inventário e performance.
4. **Acessibilidade operacional:** contraste forte, foco visível, navegação por teclado e layout responsivo.

### Filosofia de cor

O fundo quase preto cria profundidade e concentra a atenção nos produtos. O ciano neon identifica a marca e as ações primárias; o verde reserva a sensação de economia real do PIX; o dourado sinaliza confiança e curadoria. Cores de estado continuam sem competir com o CTA principal.

### Paradigma de layout

A página funciona como um painel de compra: uma barra de status no topo, hero em duas zonas assimétricas, faixa de confiança, oportunidades em destaque e catálogo filtrável. O admin usa navegação lateral fixa e áreas de trabalho modulares.

### Elementos assinatura

- **Marca HLP em monograma:** um símbolo `//` ciano ao lado do wordmark, como trilha de circuito.
- **Linhas de varredura:** gradientes e bordas luminosas discretas em hero e cards.
- **Badges de operação:** pequenos chips de status para estoque, desconto, PIX e entrega.

### Interação e animação

Hover de cards com brilho ciano contido, elevação de 3px e transição de 180ms. O carrinho lateral entra pela direita; modais usam fade/scale curto. Contagem regressiva atualiza a cada segundo sem deslocar o layout. Respeitar `prefers-reduced-motion`.

### Tipografia

Rajdhani para títulos, números e preços; Inter para leitura contínua, formulários e mensagens. Títulos em caixa alta somente em labels curtas; textos explicativos permanecem em sentence case.

### Essência da marca

**Peças importadas do Paraguai, com atendimento direto e preço de atacado para quem quer montar ou atualizar seu setup.** Personalidade: direta, técnica e confiável.

### Voz da marca

CTAs são objetivos e orientados à ação: “Adicionar ao setup” e “Fechar pedido pelo WhatsApp”. Microcopy explica o próximo passo sem prometer o que depende de confirmação do atendimento.

### Wordmark

Wordmark condensado em Rajdhani Bold com monograma `//` em ciano, acompanhado do descriptor pequeno “IMPORTADOS • GAMER • ORIGINAL”.

### Cor proprietária

Ciano neon `#00E5FF`, aplicado como linha de energia, foco e assinatura visual, nunca como preenchimento dominante de grandes áreas.

## Build e execução

O projeto roda com `npm install` e `npm start`, escutando em `0.0.0.0:3000` (ou `PORT`). A rota `/manus-routes.json` é estática e declara `/` e `/admin`. O banco JSON e os uploads ficam fora do controle de versão em uma instalação real e podem ser substituídos pelos serviços gerenciados antes da publicação.


## Atualização visual baseada no site-mãe

A referência visual principal passou a ser o marketplace público da Atacado Connect, analisado em `https://atacadoconnect.com/`. A loja pública foi ajustada para uma linguagem clara e comercial: cabeçalho branco com busca central, cotação do dólar, seletor de moeda, ações de favoritos/conta/sacola, navegação horizontal por categorias, cards brancos arredondados, filtros por categoria e exibição simultânea de USD e BRL. A marca Hardware Low Price permanece própria, mas comunica explicitamente sua relação operacional com a Atacado Connect.

A identidade de produto agora prioriza o padrão de compra observado na referência: nome e marca/categoria, preço em dólar, conversão em real, botão de adicionar à sacola, condições de PIX e aviso de cotação configurável. A cotação inicial é R$ 5,10 e pode ser atualizada pelo administrador. Não foi copiado texto que afirmasse entrega direta do site-mãe; a operação HLP mantém suas próprias regras de atendimento, envio e confirmação pelo WhatsApp.


## Escopo cliente-only

A entrega atual não expõe painel administrativo, rota `/admin` nem credencial padrão. O objetivo é a jornada do cliente: navegar pelo catálogo, adicionar produtos à sacola, preencher o checkout e abrir o WhatsApp com o pedido pronto para confirmação humana. Alterações futuras devem preservar esse escopo e não criar login administrativo ou opções de administração na interface pública.


## Catálogo sincronizado da Atacado Connect

Foram importados 3.004 produtos únicos das categorias Games, Smartphones, Smartwatch, Consoles e Eletrônicos. A deduplicação usa o ID do produto da origem. Cada item mantém preço em real, referência em dólar, marca, URL do produto e URL pública da imagem no CDN da Atacado Connect. A interface carrega inicialmente 48 resultados e oferece carregamento progressivo para manter a home responsiva com milhares de itens.
