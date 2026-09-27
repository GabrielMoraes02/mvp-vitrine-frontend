# Roteiro de apresentação - Vitrine

**Duração:** aproximadamente 5 minutos
**Limite:** 6 minutos

Deixe abertas antes de gravar:

1. O fluxograma no README.
2. A loja em `http://localhost:3000`.
3. O painel em `http://localhost:3000/admin.html`.
4. O Swagger em `http://localhost:8000/docs`.

## 0:00 - Abertura

**Mostrar a página inicial.**

> Esse é o Vitrine, uma loja online com uma área completa de gestão. Na loja, o cliente pesquisa produtos, filtra categorias, controla o orçamento e finaliza o pedido. No painel, é possível cuidar do catálogo, do estoque, das vendas e das despesas. A ideia foi reunir a experiência de compra e a gestão do negócio no mesmo sistema.

## 0:30 - Como o sistema funciona

**Mostrar o fluxograma do README.**

> O sistema tem três partes. A primeira é a interface da loja e do painel. A segunda é a API própria, que concentra as regras e salva os dados em SQLite. A terceira é a Fake Store API, usada para buscar o catálogo inicial. A comunicação é feita por REST. O frontend e o backend ficam em repositórios separados e rodam em contêineres Docker.

## 1:05 - Integração externa

**Abrir o painel e clicar em “Sincronizar produtos”.**

> Aqui eu sincronizo o catálogo. O painel chama a minha API, e ela consulta a rota de produtos da Fake Store. Os dados são tratados, traduzidos e salvos no banco local. O usuário continua dentro da aplicação durante todo o processo.

## 1:35 - API e Swagger

**Abrir o Swagger.**

> A API foi feita em FastAPI e todas as rotas estão documentadas no Swagger. Elas estão separadas por produtos, categorias, vendas, relatórios e financeiro.

Demonstrar nesta ordem:

1. `GET /api/products` - listar produtos.
2. `POST /api/products` - cadastrar um produto.
3. `PATCH /api/products/{id}` - alterar preço e estoque.
4. `DELETE /api/products/{id}` - excluir o produto.
5. `GET /api/dashboard` - consultar os indicadores.
6. `GET /api/reports/sales` - consultar o relatório financeiro.

Enquanto demonstra:

> Aqui estão os quatro métodos principais: GET, POST, PATCH e DELETE. Além do cadastro de produtos, a API permite pesquisar, filtrar e ordenar, gerenciar categorias, registrar pedidos, baixar o estoque e calcular os indicadores financeiros. Os dados continuam salvos mesmo depois de reiniciar os contêineres.

## 2:55 - Jornada do cliente

**Voltar para a loja.**

1. Pesquisar um produto.
2. Escolher uma categoria e ordenar por preço.
3. Abrir os detalhes e favoritar.
4. Adicionar ao carrinho.
5. Mostrar a meta de orçamento.
6. Entrar na conta e abrir o checkout.
7. Confirmar o pedido.

> A loja carrega o catálogo pela API e mostra o resultado das ações na hora. O carrinho fica salvo no navegador e pode ser comparado com a meta de orçamento. Na finalização, a API confere os preços e o estoque, registra o pedido, reduz a quantidade disponível e devolve o número da compra.

## 4:05 - Painel administrativo

**Abrir o painel.**

1. Mostrar os indicadores gerais e o estoque baixo.
2. Mostrar categorias e subcategorias.
3. Abrir o gerenciamento de produtos.
4. Abrir “Vendas e financeiro”.
5. Trocar o período do relatório.

> No painel eu consigo cadastrar e editar produtos, organizar categorias e acompanhar o estoque. Na parte financeira aparecem faturamento, despesas, saldo, ticket médio, vendas por dia, formas de pagamento, produtos mais vendidos e pedidos recentes. Também posso registrar e excluir despesas.

## 4:55 - Encerramento

> O Vitrine reúne uma interface responsiva, uma API própria, persistência em banco de dados, integração externa, documentação Swagger e execução em Docker. Além do catálogo, ele cobre a compra, o estoque e o controle financeiro.

## JSON para a demonstração

Use no `POST /api/products`:

```json
{
  "title": "Produto demonstração",
  "description": "Produto criado durante a apresentação.",
  "price": 49.9,
  "category": "Eletrônicos",
  "image": "https://placehold.co/600x600",
  "stock": 8,
  "active": true,
  "rating": 4.8,
  "rating_count": 10
}
```

Use no `PATCH /api/products/{id}`:

```json
{
  "price": 44.9,
  "stock": 12
}
```

## Antes de enviar

- Confirme que o vídeo ficou abaixo de 6 minutos.
- Mostre que a aplicação está rodando pelo Docker.
- Execute GET, POST, PATCH e DELETE no Swagger.
- Mostre a sincronização externa.
- Mostre a compra aparecendo no relatório financeiro.
- Não deixe senhas, tokens ou notificações pessoais visíveis.
