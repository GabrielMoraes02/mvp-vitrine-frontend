# Roteiro simples de apresentação

**Tempo estimado:** 4 minutos e 30 segundos
**Limite:** 6 minutos

## Prepare antes de gravar

Deixe três abas abertas:

1. Loja: `http://localhost:3000`.
2. Painel: `http://localhost:3000/admin.html`.
3. Swagger: `http://localhost:8000/docs`.

Não precisa mostrar testes automatizados nem código-fonte. Mostre o terminal apenas por alguns segundos para comprovar que os dois contêineres estão ativos.

Antes de começar, entre na conta da loja e deixe o carrinho vazio. Assim o checkout abre direto durante a gravação.

## 1. Apresentar a loja - 30 segundos

**Mostrar:** início da loja e produtos.

**Falar:**

> Esse é o Vitrine, uma loja online com uma área de gestão. O cliente pode pesquisar produtos, usar categorias, controlar o orçamento, montar o carrinho e finalizar o pedido. No painel, o administrador controla produtos, estoque, vendas e despesas.

## 2. Explicar a arquitetura - 25 segundos

**Mostrar:** terminal com os dois contêineres ativos e depois o Swagger.

**Falar:**

> O sistema tem três partes. A interface da loja, uma API própria que salva os dados em SQLite e a Fake Store, usada para buscar o catálogo inicial. A comunicação é feita por REST. O frontend e a API ficam em repositórios separados e rodam pelo Docker.

## 3. Mostrar a integração externa - 25 segundos

**Mostrar:** painel administrativo.

**Ação:** clicar em **Sincronizar produtos**.

**Falar:**

> Esse botão chama a minha API. Ela consulta a Fake Store, trata os dados e salva os produtos no banco local, sem tirar o usuário da aplicação.

## 4. Testar a API no Swagger - 1 minuto e 20 segundos

**Mostrar:** Swagger.

Primeiro, role a página rapidamente para mostrar os grupos de rotas. Depois teste somente estas quatro:

1. `GET /api/products` - clique em **Try it out** e **Execute**.
2. `POST /api/products` - crie o produto usando o JSON abaixo.
3. `PATCH /api/products/{id}` - use o ID recebido e altere preço e estoque.
4. `DELETE /api/products/{id}` - use o mesmo ID e exclua o produto.

**Falar:**

> A API está documentada no Swagger. Aqui eu demonstro os quatro métodos principais: GET para consultar, POST para cadastrar, PATCH para editar e DELETE para excluir. Também existem rotas para categorias, pedidos, despesas, sincronização e relatórios.

### JSON do POST

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

### JSON do PATCH

```json
{
  "price": 44.9,
  "stock": 12
}
```

## 5. Fazer uma compra - 55 segundos

**Mostrar:** loja.

Faça apenas estas ações:

1. Pesquise um produto.
2. Adicione ao carrinho.
3. Mostre o orçamento.
4. Abra o checkout.
5. Confirme o pedido.

**Falar:**

> Na loja, o cliente pesquisa, adiciona o produto ao carrinho e acompanha o orçamento. Na finalização, a API confere o preço e o estoque, registra o pedido e reduz a quantidade disponível.

## 6. Mostrar o painel - 45 segundos

**Mostrar:** painel administrativo.

Mostre rapidamente:

1. Indicadores e estoque baixo.
2. Produtos e categorias.
3. Aba **Vendas e financeiro**.

**Falar:**

> No painel eu gerencio produtos, categorias e estoque. A parte financeira mostra faturamento, despesas, saldo, ticket médio, formas de pagamento, produtos vendidos e pedidos recentes. A compra que acabei de fazer já aparece aqui.

## Encerramento - 15 segundos

**Falar:**

> O Vitrine reúne loja, API própria, banco de dados, integração externa, documentação Swagger e execução em Docker. Obrigado.

## Ordem resumida

Se esquecer o texto, siga apenas esta sequência:

1. Loja.
2. Docker e arquitetura.
3. Sincronizar produtos.
4. GET, POST, PATCH e DELETE no Swagger.
5. Fazer uma compra.
6. Mostrar o relatório financeiro.
7. Encerrar.
