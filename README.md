# Vitrine - loja e painel de gestão

A Vitrine é uma plataforma de compras planejadas e gestão comercial. Clientes podem pesquisar produtos, usar filtros, favoritar itens, acompanhar uma meta de orçamento, entrar em sua conta e concluir pedidos. Administradores gerenciam catálogo e estoque e acompanham vendas, despesas e resultado financeiro persistidos pela API própria.

![Arquitetura da aplicação](docs/arquitetura.svg)

## Componentes

1. **Interface Vitrine:** HTML, CSS e JavaScript, servidos pelo Nginx.
2. **API Vitrine:** FastAPI e SQLite, mantida em repositório separado.
3. **Fake Store API:** serviço público externo usado para obter o catálogo inicial.

## Repositórios

- Interface: [github.com/GabrielMoraes02/vitrine-frontend](https://github.com/GabrielMoraes02/vitrine-frontend)
- API: [github.com/GabrielMoraes02/vitrine-api](https://github.com/GabrielMoraes02/vitrine-api)

## Funcionalidades

- Catálogo responsivo com pesquisa, categorias e ordenação.
- Vitrine de categorias, seções promocionais, planejamento de orçamento e rodapé completo.
- Detalhes de produto, favoritos e carrinho persistente no navegador.
- Login do cliente e checkout completo com entrega e formas de pagamento.
- Pedidos persistidos, baixa automática de estoque e número de pedido.
- Meta de orçamento com indicador de progresso.
- Painel com visão geral, distribuição por categoria, atividade recente e alertas de estoque baixo.
- Gestão independente de categorias e subcategorias, com vínculo aos produtos.
- Relatório financeiro com faturamento, despesas, saldo líquido e ticket médio.
- Gráficos de vendas, formas de pagamento, produtos mais vendidos e pedidos recentes.
- Cadastro e exclusão de despesas por categoria e período.
- Cadastro, edição e exclusão de produtos pela API própria.
- Sincronização de produtos da Fake Store.
- Mensagens de carregamento, sucesso e erro.

## Diferenciais do projeto

O projeto vai além da exibição de um catálogo externo. A sincronização importa e normaliza os dados para a base local, enquanto a jornada de compra registra pedidos no domínio da aplicação e reduz o estoque de forma transacional. O painel transforma esses registros em indicadores comerciais e financeiros por período.

- Planejamento de compra com meta de orçamento e acompanhamento visual.
- Checkout integrado ao estoque persistido, com validação dos valores no servidor.
- Gestão hierárquica de categorias e subcategorias.
- Visão administrativa de estoque baixo, vendas, despesas e saldo líquido.
- Relatórios de ticket médio, formas de pagamento e produtos mais vendidos.

## Execução com Docker

Clone os repositórios do front-end e da API na mesma pasta, mantendo a estrutura:

```text
pasta-do-projeto/
├── vitrine-frontend/
└── vitrine-api/
```

Na raiz deste repositório, execute:

```bash
docker compose up --build
```

Depois, acesse:

- Interface: `http://localhost:3000`
- Painel administrativo: `http://localhost:3000/admin.html`
- Swagger da API: `http://localhost:8000/docs`

O volume `vitrine-data` preserva o banco SQLite mesmo após reiniciar os contêineres.

## Execução local sem Docker

Com a API rodando na porta 8000, execute na raiz do front-end:

```bash
python3 -m http.server 3000
```

Acesse `http://localhost:3000`. Para usar outra URL de API, altere `config.js`.

## Métodos HTTP usados pela interface

| Método | Rota | Uso |
|---|---|---|
| GET | `/api/products` | Listar e pesquisar produtos |
| POST | `/api/products` | Cadastrar produto |
| PATCH | `/api/products/{id}` | Editar preço, estoque, status e demais dados |
| DELETE | `/api/products/{id}` | Excluir produto |
| POST | `/api/products/sync` | Importar e atualizar o catálogo externo |
| GET | `/api/dashboard` | Carregar as métricas administrativas |
| POST | `/api/orders` | Registrar a compra e atualizar o estoque |
| GET | `/api/orders` | Listar pedidos recentes |
| GET | `/api/reports/sales` | Gerar o relatório de vendas e financeiro |
| POST/DELETE | `/api/expenses` | Registrar e excluir despesas |

## API externa

A aplicação utiliza a [Fake Store API](https://fakestoreapi.com/) por meio da rota pública `GET /products`. Não há redirecionamento para o serviço externo: a API Vitrine consulta os dados, normaliza a resposta e salva os produtos no SQLite.

- Serviço gratuito voltado a testes e protótipos.
- Não exige cadastro nem chave para consultar produtos.
- O projeto de referência possui [licença MIT](https://github.com/keikaavousi/fake-store-api/blob/master/LICENSE).
- Rota consumida: `https://fakestoreapi.com/products`.

## Estrutura

```text
.
├── docs/
│   ├── arquitetura.svg
│   ├── checklist-entrega.md
│   └── roteiro-video.md
├── app.js
├── admin.html
├── admin.js
├── login.html
├── login.js
├── checkout.html
├── checkout.js
├── config.js
├── index.html
├── styles.css
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

## Materiais de entrega

- [Roteiro do vídeo](docs/roteiro-video.md)
- [Checklist final](docs/checklist-entrega.md)
- [Mensagem de entrega](docs/mensagem-entrega.md)
- [Relatório de validação](docs/relatorio-validacao.md)

## Pagamentos

A aplicação registra pedidos e formas de pagamento para fins de demonstração, mas não processa cobranças reais nem armazena dados de cartão.
