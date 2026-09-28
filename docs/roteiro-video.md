# Cola da gravação

Siga esta página de cima para baixo. Não precisa improvisar.

## Antes de apertar o botão de gravar

1. Confirme que o Docker está aberto.
2. Deixe o terminal mostrando os dois contêineres ativos.
3. Abra a loja: `http://localhost:3000`.
4. Abra o painel: `http://localhost:3000/admin.html`.
5. Abra o Swagger: `http://localhost:8000/docs`.
6. Entre na conta da loja.
7. Deixe o carrinho vazio.
8. Copie o JSON do POST que está no final desta página.
9. Feche notificações e outras janelas.

Agora comece a gravar.

## Passo 1 - Apresentar a loja

**Mostre:** página inicial da loja.

**Fale:**

> Esse é o Vitrine, uma loja online com uma área de gestão. O cliente pode pesquisar produtos, usar categorias, controlar o orçamento, montar o carrinho e finalizar o pedido. O administrador controla produtos, estoque, vendas e despesas.

Quando terminar essa frase, vá para o terminal.

## Passo 2 - Explicar as três partes

**Mostre:** terminal com os contêineres ativos.

**Fale:**

> O sistema tem três partes: a interface da loja, uma API própria que salva os dados em SQLite e a Fake Store, usada para buscar o catálogo inicial. A comunicação é feita por REST, e o frontend e a API estão rodando pelo Docker.

Quando terminar, abra o painel.

## Passo 3 - Sincronizar os produtos

**Mostre:** painel administrativo.

**Faça:** clique em **Sincronizar produtos** e espere a mensagem de sucesso.

**Fale:**

> Esse botão chama a minha API. Ela consulta a Fake Store, trata os dados e salva os produtos no banco local, sem tirar o usuário da aplicação.

Quando aparecer a confirmação, abra o Swagger.

## Passo 4 - Testar quatro rotas no Swagger

**Mostre:** `http://localhost:8000/docs`.

Role a página rapidamente para mostrar os grupos de rotas. Depois faça exatamente isto:

### 4.1 Listar

1. Abra `GET /api/products`.
2. Clique em **Try it out**.
3. Clique em **Execute**.
4. Mostre o código `200`.

### 4.2 Cadastrar

1. Abra `POST /api/products`.
2. Clique em **Try it out**.
3. Cole o JSON do final desta página.
4. Clique em **Execute**.
5. Mostre o código `201`.
6. Copie ou anote o número do campo `id` da resposta.

### 4.3 Editar

1. Abra `PATCH /api/products/{product_id}`.
2. Clique em **Try it out**.
3. Coloque o ID recebido no campo `product_id`.
4. Cole o JSON do PATCH.
5. Clique em **Execute**.
6. Mostre o código `200`.

### 4.4 Excluir

1. Abra `DELETE /api/products/{product_id}`.
2. Clique em **Try it out**.
3. Coloque o mesmo ID.
4. Clique em **Execute**.
5. Mostre o código `204`.

Enquanto faz essas quatro operações, fale:

> Aqui eu demonstro os quatro métodos principais: GET para consultar, POST para cadastrar, PATCH para editar e DELETE para excluir. A API também possui rotas para categorias, pedidos, despesas, sincronização e relatórios.

Depois do DELETE, volte para a loja.

## Passo 5 - Fazer uma compra

**Mostre:** loja.

Faça nesta ordem:

1. Pesquise `SSD`.
2. Adicione o primeiro produto ao carrinho.
3. Abra o carrinho.
4. Mostre o controle de orçamento.
5. Clique em **Finalizar compra**.
6. Preencha os campos obrigatórios.
7. Escolha Pix.
8. Confirme o pedido.
9. Mostre o número do pedido.

**Fale:**

> Na loja, o cliente pesquisa, adiciona o produto ao carrinho e acompanha o orçamento. Na finalização, a API confere o preço e o estoque, registra o pedido e reduz a quantidade disponível.

Quando o número do pedido aparecer, abra o painel.

## Passo 6 - Mostrar o resultado no painel

**Mostre:** painel administrativo.

Faça nesta ordem:

1. Mostre os indicadores da visão geral.
2. Clique em **Produtos** e mostre rapidamente o estoque.
3. Clique em **Vendas e financeiro**.
4. Mostre faturamento, despesas, saldo e pedido recente.

**Fale:**

> No painel eu gerencio produtos, categorias e estoque. A área financeira mostra faturamento, despesas, saldo, ticket médio, formas de pagamento, produtos vendidos e pedidos recentes. A compra que acabei de fazer já aparece aqui.

## Passo 7 - Encerrar

**Fale:**

> O Vitrine reúne loja, API própria, banco de dados, integração externa, documentação Swagger e execução em Docker. Obrigado.

Pare a gravação.

## JSON do POST

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

## JSON do PATCH

```json
{
  "price": 44.9,
  "stock": 12
}
```

## O que precisa aparecer no vídeo

- Loja funcionando.
- Docker com frontend e API ativos.
- Sincronização da Fake Store.
- GET com código 200.
- POST com código 201.
- PATCH com código 200.
- DELETE com código 204.
- Compra concluída.
- Pedido no relatório financeiro.
- Vídeo com menos de 6 minutos.
