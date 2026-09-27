# Relatório de validação da entrega

Data da última validação: **27 de setembro de 2026**

## Testes automatizados

- Resultado: `6 passed`.
- CRUD de produtos.
- Integração e sincronização do catálogo externo.
- Categorias e subcategorias.
- Registro de pedidos e baixa de estoque.
- Controle de despesas e relatório financeiro.

## Execução em contêineres

- Docker Desktop instalado e iniciado.
- Imagens do frontend e da API construídas sem erros.
- Serviço `frontend` saudável na porta 3000.
- Serviço `api` ativo na porta 8000.
- Loja retornando HTTP 200.
- Painel administrativo retornando HTTP 200.
- Swagger retornando HTTP 200.
- Rota de saúde retornando `{"status":"ok"}`.

## Integração externa

- Sincronização executada pelo backend.
- 20 produtos recebidos e importados da Fake Store API.
- Catálogo carregado corretamente pela interface executada no Docker.

## Persistência

1. Um produto temporário foi criado pela API.
2. Os contêineres do frontend e da API foram reiniciados.
3. O produto continuou disponível após o reinício.
4. O registro temporário foi excluído ao final do teste.

O resultado confirma que o volume `vitrine-data` preserva o banco SQLite.

## Preparação para a apresentação

O banco usado pelos contêineres contém uma venda e uma despesa demonstrativas. Com isso, a aba **Vendas e financeiro** apresenta faturamento, despesa, saldo líquido, ticket médio, forma de pagamento, produto vendido e pedido recente durante a gravação.
