# Roteiro do vídeo - Vitrine

Tempo-alvo: **5 minutos e 20 segundos**. O limite da entrega é de 6 minutos.

## 1. Problema e objetivo - 35 segundos

“A Vitrine é uma loja virtual acadêmica que reúne um catálogo externo e uma gestão local. O cliente pesquisa produtos, filtra categorias, monta o carrinho e acompanha uma meta de orçamento. O administrador importa produtos da Fake Store, cadastra itens próprios e controla preço, estoque e visibilidade.”

## 2. Arquitetura e comunicação - 45 segundos

Mostrar o fluxograma do README principal.

- Interface em HTML, CSS e JavaScript.
- API própria em Python com FastAPI.
- Persistência em SQLite.
- Integração REST com a Fake Store API.
- Componentes executados em contêineres Docker separados.

## 3. API externa - 35 segundos

- Abrir `https://fakestoreapi.com/products` rapidamente.
- Explicar que a API fornece os produtos públicos em JSON.
- Mostrar o botão “Sincronizar produtos” no painel administrativo.
- Executar a sincronização e mostrar a mensagem de sucesso.

## 4. API própria e Swagger - 1 minuto e 30 segundos

Abrir `http://localhost:8000/docs` e executar:

1. `GET /api/products` para listar.
2. `POST /api/products` para cadastrar.
3. `PATCH /api/products/{id}` para alterar preço ou estoque.
4. `DELETE /api/products/{id}` para excluir.
5. `GET /api/dashboard` para mostrar as métricas.
6. `POST /api/products/sync` para demonstrar a integração externa.

## 5. Interface principal - 1 minuto e 45 segundos

1. Pesquisar um produto.
2. Filtrar por categoria e ordenar por preço.
3. Abrir detalhes, favoritar e adicionar ao carrinho.
4. Alterar a quantidade, remover um item e editar a meta de orçamento.
5. Abrir o painel administrativo.
6. Mostrar a visão geral, o gráfico por categoria e os alertas de estoque.
7. Criar uma categoria e uma subcategoria.
8. Cadastrar um produto usando essa classificação.
9. Editar preço e estoque e depois excluir o produto temporário.
10. Voltar à loja e mostrar a atualização do catálogo.

## Encerramento - 10 segundos

“Assim, a Vitrine demonstra componentes independentes, integração externa, persistência, CRUD completo, documentação Swagger e execução em Docker.”
