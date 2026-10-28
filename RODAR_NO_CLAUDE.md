# Hardware Low Price no Claude

Guia para executar a versão cliente-only da Hardware Low Price usando Claude Code ou outro ambiente do Claude com acesso ao terminal.

## Objetivo atual

Esta entrega é uma loja pública para clientes. O cliente navega pelo catálogo, filtra produtos, adiciona itens à sacola, informa o endereço no checkout e envia o pedido pronto para o WhatsApp.

Não existe painel administrativo público, rota `/admin` ou credencial de administrador no fluxo desta versão. O projeto não deve publicar senha padrão de admin nem pedir login administrativo ao cliente.

## Requisitos

- Node.js 18 ou superior
- npm
- Git, caso o projeto seja clonado de um repositório
- Navegador para acessar a loja local

Verifique as versões:

```bash
node --version
npm --version
```

## Instalação

Entre na pasta raiz, onde estão `server.js` e `package.json`:

```bash
cd hardwarelowprice
npm install
```

Se o projeto estiver em outro diretório, substitua o caminho acima.

## Variáveis de ambiente

Crie o arquivo `.env` a partir do modelo:

```bash
cp .env.example .env
```

Para executar localmente, use pelo menos:

```env
PORT=3000
PUBLIC_PREVIEW=false
```

Não publique o arquivo `.env` nem compartilhe valores secretos. O WhatsApp e o Instagram são configurados diretamente na configuração do projeto ou no banco local de demonstração; nunca invente um número de WhatsApp.

## Iniciar o projeto

```bash
npm start
```

A loja ficará disponível em:

```text
http://localhost:3000
```

Rotas públicas:

- Loja: `http://localhost:3000/`
- Saúde da API: `http://localhost:3000/api/health`
- Catálogo: `http://localhost:3000/api/products`
- Configurações públicas: `http://localhost:3000/api/settings`
- Manifesto de rotas: `http://localhost:3000/manus-routes.json`

Não existe uma rota pública `/admin` nesta entrega.

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

## Fluxo do cliente

1. O cliente acessa a home e pesquisa ou filtra produtos.
2. O cliente adiciona produtos à sacola.
3. A sacola calcula o total com os dados conferidos pelo servidor.
4. No checkout, o cliente informa CEP, endereço e forma de pagamento pretendida.
5. O site gera o pedido e abre o WhatsApp com a mensagem pronta.
6. A equipe confirma disponibilidade, pagamento e entrega pelo atendimento.

O pagamento não é processado automaticamente pelo site. O fluxo atual é uma solicitação de pedido que continua no WhatsApp.

## Dados locais

Na primeira execução são criados:

```text
data/db.json              Catálogo, pedidos e configurações locais
data/                      Diretório de dados persistentes local
data/atacado-catalog.json  Catálogo importado e URLs públicas das imagens
public/uploads/            Imagens de produtos, se forem adicionadas futuramente
```

O catálogo anexado contém 3.004 produtos únicos das categorias fornecidas da Atacado Connect. As fotos usam os URLs públicos do CDN de origem. Revise nomes, preços, estoque, cotação e disponibilidade antes de qualquer uso comercial.

Para recriar os dados locais durante testes, pare o servidor e remova o banco:

```bash
rm data/db.json
npm start
```

Isso apaga pedidos e alterações locais. Faça backup antes, se necessário.

O catálogo importado acompanha o projeto em `data/atacado-catalog.json`. Para repetir a coleta autorizada das categorias públicas da Atacado Connect, use:

```bash
python3 -m pip install -r requirements-import.txt
python3 tools/import_atacado_catalog.py --merge-db
```

O importador deduplica produtos por ID e mantém as imagens nos URLs públicos do CDN de origem. Ele não salva login ou senha em arquivo.

## Continuar o desenvolvimento com Claude

Abra a pasta do projeto no Claude Code e use um pedido como este:

```text
Leia RODAR_NO_CLAUDE.md, plan.md e TODO.md antes de alterar o projeto.
Execute npm install e npm start.
Mantenha a aplicação cliente-only: catálogo, filtros, sacola e checkout que abre o WhatsApp.
Não crie painel admin, login administrativo, senha padrão ou rota /admin.
Preserve Node.js + Express, o banco local data/db.json e o recálculo de preços e estoque no servidor.
Antes de editar, inspecione os arquivos existentes.
Depois de cada alteração, execute os checks de sintaxe e teste /api/health, /, /api/products e /manus-routes.json.
Não invente depoimentos, preços, estoque, disponibilidade ou número de WhatsApp.
```

Ao pedir uma alteração, descreva o arquivo ou área, o comportamento atual, o comportamento esperado e se a mudança afeta a API ou o banco.

## Estrutura principal

```text
server.js                 API Express, catálogo, pedidos e checkout
seed-products.js          Produtos e configurações iniciais
package.json              Scripts e dependências
public/index.html         Loja pública
public/styles.css         Identidade visual marketplace
public/app.js             Catálogo, filtros, sacola, CEP e checkout
public/manus-routes.json  Rotas públicas
data/db.json              Banco local criado na execução
data/atacado-catalog.json Catálogo importado da Atacado Connect
tools/import_atacado_catalog.py Importador reproduzível do catálogo
requirements-import.txt    Dependência opcional do importador
public/uploads/           Imagens locais de produtos
plan.md                   Plano e decisões visuais
TODO.md                   Entregas e pendências
```

Os arquivos de painel administrativo não fazem parte da versão cliente-only anexada.

## Scripts disponíveis

```bash
npm start      # inicia o servidor na porta 3000
npm run dev    # inicia com node --watch
npm run seed   # cria o banco inicial somente se ele ainda não existir
```

## Validação rápida

Com o servidor rodando, execute em outro terminal:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products
curl -I http://localhost:3000/
curl http://localhost:3000/manus-routes.json
```

A resposta esperada para a saúde da API é:

```json
{"ok":true,"service":"hardwarelowprice"}
```

Valide também a sintaxe:

```bash
node --check server.js
node --check seed-products.js
node --check public/app.js
```

## Limitações atuais

A versão local usa `data/db.json` e `public/uploads/`. Esses arquivos são adequados para demonstração local, mas não são armazenamento persistente para uma publicação serverless.

Antes de publicar, migre os pedidos e catálogo para um banco persistente, mova imagens para storage persistente, configure o número real de WhatsApp e revise as exigências fiscais e aduaneiras da operação.

A cotação do dólar exibida na loja é manual e pode ser atualizada no banco/configuração do projeto. Ela não é consultada automaticamente em uma API externa.

## Regras para o Claude

- Manter o projeto cliente-only.
- Não adicionar painel admin, login administrativo ou senha padrão.
- Não apagar `data/db.json` sem confirmação explícita.
- Não substituir produtos reais por dados inventados.
- Não criar depoimentos fictícios.
- Não confiar em valores enviados pelo navegador para definir o total do pedido.
- Manter recálculo de preço e estoque no servidor.
- Manter o checkout abrindo o WhatsApp sem afirmar que o pagamento foi concluído.
- Depois de qualquer mudança, executar as validações desta documentação.
