# Roteiro de apresentação - Vitrine

**Tempo-alvo:** 5 minutos e 30 segundos
**Limite da avaliação:** 6 minutos

Antes de gravar, deixe abertas estas telas, nesta ordem:

1. README do front-end, com o fluxograma visível.
2. Loja em `http://localhost:3000`.
3. Painel em `http://localhost:3000/admin.html`.
4. Swagger em `http://localhost:8000/docs`.

Deixe também um produto temporário cadastrado para demonstrar edição e exclusão.

## 0:00-0:40 - Problema, objetivo e diferencial

**Mostrar:** página inicial da loja e o carrossel.

**Falar:**

> Olá, este é o Vitrine, meu MVP de arquitetura de software. Ele resolve dois problemas de uma loja virtual: facilita a compra planejada para o cliente e centraliza a gestão comercial para o administrador. O cliente pesquisa, filtra, favorita, acompanha seu orçamento e finaliza uma compra simulada. No painel administrativo é possível controlar catálogo, categorias, estoque, vendas, despesas e resultado financeiro. O diferencial em relação a um catálogo simples é integrar a jornada completa de compra com gestão financeira e baixa automática de estoque.

## 0:40-1:20 - Arquitetura e comunicação

**Mostrar:** fluxograma no README.

**Falar:**

> A solução possui três componentes que se comunicam por REST. O primeiro é a interface responsiva, criada com HTML, CSS e JavaScript e servida pelo Nginx. O segundo é uma API própria desenvolvida em Python com FastAPI, responsável pelas regras de negócio e pela persistência em SQLite. O terceiro é a Fake Store API, um serviço público externo usado para obter o catálogo inicial. A interface nunca redireciona o usuário para a API externa: o backend consulta, normaliza e armazena os dados. Frontend e backend possuem repositórios e Dockerfiles separados, e o Docker Compose inicializa os dois serviços e o volume persistente.

## 1:20-1:50 - API externa

**Mostrar:** painel administrativo e botão **Sincronizar produtos**.

**Falar:**

> A integração externa utiliza a rota pública GET products da Fake Store API. Ela é gratuita, não exige cadastro e seu projeto de referência usa licença MIT. Ao selecionar Sincronizar produtos, o frontend faz um POST para a API própria. O backend consulta a Fake Store, traduz categorias e descrições, evita duplicidade pelo identificador externo e persiste o resultado no SQLite.

**Ação:** clicar em **Sincronizar produtos** e mostrar a confirmação.

## 1:50-3:15 - API própria e Swagger

**Mostrar:** `http://localhost:8000/docs`.

**Falar:**

> A documentação da API é gerada automaticamente pelo Swagger. As rotas estão agrupadas por produtos, categorias, subcategorias, vendas, relatórios, financeiro e integrações. Aqui estão presentes os quatro métodos obrigatórios.

Execute rapidamente estas chamadas:

1. **GET `/api/products`** - listar o catálogo.
2. **POST `/api/products`** - criar o produto de demonstração.
3. **PATCH `/api/products/{id}`** - alterar preço ou estoque.
4. **DELETE `/api/products/{id}`** - excluir o produto.
5. **GET `/api/dashboard`** - exibir indicadores administrativos.
6. **GET `/api/reports/sales`** - exibir o relatório financeiro.

Enquanto executa, fale:

> O GET lista e filtra produtos. O POST cadastra e valida um novo item. O PATCH permite atualização parcial, e o DELETE remove o registro. Além do CRUD, a API possui filtros, ordenação, categorias e subcategorias, sincronização externa, registro de pedidos com baixa de estoque, despesas e consolidação financeira por período. Respostas inválidas recebem códigos HTTP adequados, e os dados continuam armazenados após reiniciar os contêineres.

### JSON rápido para o POST

```json
{
  "title": "Produto demonstração",
  "price": 49.9,
  "description": "Produto criado durante a apresentação do MVP.",
  "category": "eletronicos",
  "image": "https://placehold.co/600x600",
  "rating": 4.8,
  "rating_count": 10,
  "stock": 8,
  "active": true
}
```

### JSON rápido para o PATCH

```json
{
  "price": 44.9,
  "stock": 12
}
```

## 3:15-4:35 - Jornada do cliente

**Mostrar:** loja.

**Ações e fala:**

1. Pesquisar por um produto e filtrar uma categoria.
2. Ordenar por preço, abrir os detalhes e favoritar.
3. Adicionar ao carrinho e mostrar a meta de orçamento.
4. Entrar na conta e abrir a finalização da compra.
5. Mostrar endereço, pagamento e resumo; concluir a compra.

> A interface consome a API própria para carregar e pesquisar o catálogo. O cliente recebe feedback visual em todas as ações. O carrinho é persistido no navegador e mostra o impacto na meta de orçamento. No checkout, a compra envia um POST para a API. O backend recalcula o valor usando os preços salvos, valida o estoque, registra o pedido, reduz as unidades e devolve um número de confirmação.

## 4:35-5:20 - Administração e controle financeiro

**Mostrar:** painel administrativo.

**Ações:**

1. Mostrar visão geral, distribuição por categoria e estoque baixo.
2. Abrir categorias e subcategorias.
3. Abrir produtos e mostrar cadastro e edição.
4. Abrir **Vendas e financeiro**.
5. Trocar o período e mostrar faturamento, despesas, saldo, ticket médio, produtos mais vendidos e pedidos recentes.

**Falar:**

> No painel, o administrador acompanha o catálogo e o estoque, gerencia categorias e subcategorias e usa as operações GET, POST, PATCH e DELETE pela própria interface. A área financeira transforma os pedidos registrados em indicadores: faturamento, despesas, saldo líquido, ticket médio, vendas por dia, formas de pagamento e produtos mais vendidos. Também é possível cadastrar e excluir despesas. Isso demonstra funcionalidades além do CRUD básico e torna o projeto uma solução de gestão, não apenas uma cópia de catálogo.

## 5:20-5:35 - Encerramento

**Falar:**

> Assim, o Vitrine demonstra componentização, comunicação REST, integração externa, persistência, documentação Swagger, execução em Docker e uma jornada completa de compra e gestão. Obrigado.

## Conferência da gravação

- O vídeo deve ficar abaixo de 6 minutos.
- O terminal precisa mostrar que a execução foi feita com Docker Compose.
- O fluxograma precisa aparecer de forma legível.
- Mostre a confirmação da sincronização externa.
- Execute GET, POST, PATCH e DELETE no Swagger.
- Mostre pelo menos uma chamada refletida na interface.
- Não deixe senhas, tokens ou notificações pessoais visíveis.
