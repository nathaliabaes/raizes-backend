const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Raízes do Nordeste — API REST',
      version: '1.0.0',
      description: 'API de gestão da rede de lanchonetes Raízes do Nordeste. Cobre autenticação, usuários, produtos, unidades, pedidos, pagamentos e fidelidade.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Erro: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'NOME_DO_ERRO' },
            message: { type: 'string', example: 'Mensagem legível sobre o problema' },
            details: { type: 'array', items: { type: 'object' }, example: [] },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string', example: '/rota' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Cadastro e login' },
      { name: 'Usuários', description: 'Gestão de usuários (ADMIN)' },
      { name: 'Produtos', description: 'Catálogo de produtos' },
      { name: 'Unidades', description: 'Unidades da rede' },
      { name: 'Pedidos', description: 'Criação e acompanhamento de pedidos' },
      { name: 'Pagamentos', description: 'Processamento de pagamento (mock)' },
      { name: 'Estoque', description: 'Consulta e movimentação de estoque por unidade' },
      { name: 'Fidelidade', description: 'Programa de pontos' },
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Cadastra um novo usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nome', 'email', 'senha'],
                  properties: {
                    nome: { type: 'string', example: 'Maria Silva' },
                    email: { type: 'string', format: 'email', example: 'maria@email.com' },
                    senha: { type: 'string', minLength: 6, example: 'senha123' },
                    perfil: { type: 'string', enum: ['ADMIN', 'GERENTE', 'CLIENTE', 'COZINHA', 'ATENDENTE'], example: 'CLIENTE' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Usuário criado com sucesso' },
            409: { description: 'E-mail já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
            422: { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Autentica e retorna token JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'senha'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'maria@email.com' },
                    senha: { type: 'string', example: 'senha123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login realizado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                      perfil: { type: 'string' },
                      nome: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: { description: 'Credenciais inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          },
        },
      },
      '/usuarios': {
        get: {
          tags: ['Usuários'],
          summary: 'Lista todos os usuários (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: { description: 'Lista paginada de usuários' },
            401: { description: 'Token não fornecido' },
            403: { description: 'Acesso negado' },
          },
        },
      },
      '/usuarios/{id}': {
        get: {
          tags: ['Usuários'],
          summary: 'Busca usuário por ID (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Dados do usuário' },
            404: { description: 'Usuário não encontrado' },
          },
        },
        patch: {
          tags: ['Usuários'],
          summary: 'Atualiza perfil ou status do usuário (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    perfil: { type: 'string', enum: ['ADMIN', 'GERENTE', 'CLIENTE', 'COZINHA', 'ATENDENTE'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Usuário atualizado' },
            404: { description: 'Usuário não encontrado' },
          },
        },
      },
      '/produtos': {
        get: {
          tags: ['Produtos'],
          summary: 'Lista produtos ativos com paginação (público)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: { description: 'Lista paginada de produtos' },
          },
        },
        post: {
          tags: ['Produtos'],
          summary: 'Cadastra novo produto (ADMIN, GERENTE)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nome', 'preco'],
                  properties: {
                    nome: { type: 'string', example: 'Baião de Dois' },
                    descricao: { type: 'string', example: 'Arroz com feijão-de-corda e queijo coalho' },
                    preco: { type: 'number', example: 29.90 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Produto criado' },
            401: { description: 'Token não fornecido' },
            403: { description: 'Acesso negado' },
            422: { description: 'Dados inválidos' },
          },
        },
      },
      '/produtos/{id}': {
        get: {
          tags: ['Produtos'],
          summary: 'Busca produto por ID (público)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Dados do produto' },
            404: { description: 'Produto não encontrado' },
          },
        },
        patch: {
          tags: ['Produtos'],
          summary: 'Atualiza produto (ADMIN, GERENTE)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string' },
                    descricao: { type: 'string' },
                    preco: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Produto atualizado' },
            404: { description: 'Produto não encontrado' },
          },
        },
      },
      '/unidades': {
        get: {
          tags: ['Unidades'],
          summary: 'Lista unidades ativas com paginação (público)',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'Lista de unidades' } },
        },
        post: {
          tags: ['Unidades'],
          summary: 'Cadastra nova unidade (ADMIN)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nome', 'endereco', 'cidade'],
                  properties: {
                    nome: { type: 'string', example: 'Unidade Fortaleza Centro' },
                    endereco: { type: 'string', example: 'Rua Major Facundo, 500' },
                    cidade: { type: 'string', example: 'Fortaleza' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Unidade criada' },
            422: { description: 'Dados inválidos' },
          },
        },
      },
      '/unidades/{id}': {
        get: {
          tags: ['Unidades'],
          summary: 'Busca unidade por ID (público)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Dados da unidade' },
            404: { description: 'Unidade não encontrada' },
          },
        },
        patch: {
          tags: ['Unidades'],
          summary: 'Atualiza dados da unidade (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string' },
                    endereco: { type: 'string' },
                    cidade: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Unidade atualizada' },
            404: { description: 'Unidade não encontrada' },
          },
        },
      },
      '/pedidos': {
        post: {
          tags: ['Pedidos'],
          summary: 'Cria novo pedido validando estoque (autenticado)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['usuarioId', 'unidadeId', 'canalPedido', 'itens'],
                  properties: {
                    usuarioId: { type: 'integer', example: 1 },
                    unidadeId: { type: 'integer', example: 1 },
                    canalPedido: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'], example: 'APP' },
                    itens: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          produtoId: { type: 'integer', example: 1 },
                          quantidade: { type: 'integer', example: 2 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Pedido criado com itens e total calculado' },
            404: { description: 'Produto não encontrado' },
            409: { description: 'Estoque insuficiente' },
            422: { description: 'Campos obrigatórios ausentes' },
          },
        },
        get: {
          tags: ['Pedidos'],
          summary: 'Lista pedidos do usuário logado (autenticado)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'canalPedido', in: 'query', description: 'Filtrar por canal de origem', schema: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'] } },
            { name: 'status', in: 'query', description: 'Filtrar por status do pedido', schema: { type: 'string', enum: ['AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'] } },
          ],
          responses: {
            200: { description: 'Lista paginada de pedidos com filtros opcionais' },
            401: { description: 'Token não fornecido' },
          },
        },
      },
      '/pedidos/{id}': {
        get: {
          tags: ['Pedidos'],
          summary: 'Busca pedido por ID com itens e pagamento (autenticado)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Pedido completo' },
            404: { description: 'Pedido não encontrado' },
          },
        },
      },
      '/pedidos/{id}/status': {
        patch: {
          tags: ['Pedidos'],
          summary: 'Atualiza status do pedido (ADMIN, GERENTE, COZINHA)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Status atualizado' },
            403: { description: 'Acesso negado' },
            404: { description: 'Pedido não encontrado' },
          },
        },
      },
      '/pagamentos': {
        post: {
          tags: ['Pagamentos'],
          summary: 'Processa pagamento de um pedido — mock (autenticado)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['pedidoId', 'metodo'],
                  properties: {
                    pedidoId: { type: 'integer', example: 1 },
                    metodo: { type: 'string', example: 'PIX' },
                    simularRecusa: { type: 'boolean', example: false, description: 'true = pagamento recusado (para testes)' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Pagamento registrado (APROVADO ou RECUSADO)' },
            404: { description: 'Pedido não encontrado' },
            409: { description: 'Pedido já possui pagamento' },
          },
        },
      },
      '/estoque': {
        get: {
          tags: ['Estoque'],
          summary: 'Lista estoque por unidade (ADMIN, GERENTE)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'unidadeId', in: 'query', description: 'Filtrar por unidade', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Lista de estoque com produto e unidade' },
            401: { description: 'Token não fornecido' },
            403: { description: 'Acesso negado' },
          },
        },
        patch: {
          tags: ['Estoque'],
          summary: 'Atualiza quantidade em estoque (ADMIN, GERENTE)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['unidadeId', 'produtoId', 'quantidade'],
                  properties: {
                    unidadeId: { type: 'integer', example: 1 },
                    produtoId: { type: 'integer', example: 1 },
                    quantidade: { type: 'integer', example: 30 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Estoque atualizado' },
            422: { description: 'Dados inválidos' },
          },
        },
      },
      '/fidelidade': {
        get: {
          tags: ['Fidelidade'],
          summary: 'Consulta pontos do usuário logado (autenticado)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Saldo de pontos do usuário' },
            401: { description: 'Token não fornecido' },
          },
        },
      },
      '/fidelidade/pontos': {
        patch: {
          tags: ['Fidelidade'],
          summary: 'Adiciona pontos a um usuário (ADMIN, GERENTE)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['usuarioId', 'pontos'],
                  properties: {
                    usuarioId: { type: 'integer', example: 1 },
                    pontos: { type: 'integer', example: 50 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Pontos adicionados' },
            403: { description: 'Acesso negado' },
            422: { description: 'usuarioId e pontos são obrigatórios' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
