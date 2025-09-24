const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E2E-Commerce API',
      version: '1.0.0',
      description: 'API completa para sistema de e-commerce com funcionalidades de produtos, pedidos, autenticação e administração.',
      contact: {
        name: 'E2E-Commerce Team',
        email: 'admin@e2ecommerce.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação. Obtenha o token através do endpoint /auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@example.com'
            },
            role: {
              type: 'string',
              enum: ['Cliente', 'Vendedor', 'Admin'],
              description: 'Papel do usuário no sistema'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'category', 'stock'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do produto'
            },
            name: {
              type: 'string',
              description: 'Nome do produto',
              example: 'Smartphone XYZ'
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada do produto',
              example: 'Smartphone com tela de 6.5 polegadas...'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Preço do produto em reais',
              example: 1299.99
            },
            category: {
              type: 'string',
              description: 'Categoria do produto',
              example: 'Eletrônicos'
            },
            stock: {
              type: 'integer',
              description: 'Quantidade em estoque',
              example: 50
            },
            image_url: {
              type: 'string',
              format: 'uri',
              description: 'URL da imagem do produto',
              example: 'https://example.com/image.jpg'
            },
            is_active: {
              type: 'boolean',
              description: 'Status ativo/inativo do produto',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do produto'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['user_id', 'items', 'shipping_address'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do pedido'
            },
            user_id: {
              type: 'integer',
              description: 'ID do usuário que fez o pedido'
            },
            user_name: {
              type: 'string',
              description: 'Nome do usuário',
              example: 'João Silva'
            },
            status: {
              type: 'string',
              enum: ['Aguardando Pagamento', 'Pago', 'Em Transporte', 'Entregue', 'Cancelado'],
              description: 'Status atual do pedido'
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Valor total do pedido',
              example: 1299.99
            },
            shipping_cost: {
              type: 'number',
              format: 'float',
              description: 'Custo do frete',
              example: 100.00
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do pedido'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              }
            }
          }
        },
        OrderItem: {
          type: 'object',
          required: ['product_id', 'qty', 'unit_price'],
          properties: {
            product_id: {
              type: 'integer',
              description: 'ID do produto'
            },
            product_name: {
              type: 'string',
              description: 'Nome do produto',
              example: 'Smartphone XYZ'
            },
            qty: {
              type: 'integer',
              description: 'Quantidade do produto',
              example: 2
            },
            unit_price: {
              type: 'number',
              format: 'float',
              description: 'Preço unitário do produto',
              example: 1299.99
            }
          }
        },
        Address: {
          type: 'object',
          required: ['type', 'cep', 'street', 'number'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do endereço'
            },
            user_id: {
              type: 'integer',
              description: 'ID do usuário proprietário do endereço'
            },
            type: {
              type: 'string',
              enum: ['Residencial', 'Comercial'],
              description: 'Tipo do endereço'
            },
            cep: {
              type: 'string',
              description: 'CEP do endereço',
              example: '01234-567'
            },
            street: {
              type: 'string',
              description: 'Nome da rua',
              example: 'Rua das Flores'
            },
            number: {
              type: 'string',
              description: 'Número do endereço',
              example: '123'
            },
            complement: {
              type: 'string',
              description: 'Complemento do endereço',
              example: 'Apto 45'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'cliente@e2ecommerce.com'
            },
            password: {
              type: 'string',
              description: 'Senha do usuário',
              example: 'Cliente123!@#'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@example.com'
            },
            password: {
              type: 'string',
              description: 'Senha do usuário (mínimo 10 caracteres com letras, números e símbolos)',
              example: 'MinhaSenh@123'
            },
            role: {
              type: 'string',
              enum: ['Cliente', 'Vendedor', 'Admin'],
              description: 'Papel do usuário no sistema',
              example: 'Cliente'
            }
          }
        },
        StockUpdate: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'integer',
              description: 'Quantidade a ser adicionada (deve ser múltiplo de 10)',
              example: 20
            }
          }
        },
        OrderStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['Pago', 'Em Transporte', 'Entregue', 'Cancelado'],
              description: 'Novo status do pedido'
            }
          }
        },
        CancelOrderRequest: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: {
              type: 'string',
              description: 'Motivo do cancelamento',
              example: 'Produto não atendeu às expectativas'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'boolean',
              description: 'Indica se houve erro'
            },
            message: {
              type: 'string',
              description: 'Mensagem de resposta'
            },
            data: {
              type: 'object',
              description: 'Dados da resposta'
            },
            code: {
              type: 'string',
              description: 'Código do erro (quando aplicável)'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Página atual'
            },
            limit: {
              type: 'integer',
              description: 'Itens por página'
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas'
            },
            totalItems: {
              type: 'integer',
              description: 'Total de itens'
            },
            hasNext: {
              type: 'boolean',
              description: 'Se existe próxima página'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Se existe página anterior'
            }
          }
        },
        CatalogProduct: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do produto (formato PROD-XXXX)',
              example: 'PROD-0001'
            },
            title: {
              type: 'string',
              description: 'Nome do produto',
              example: 'Smartphone XYZ'
            },
            slug: {
              type: 'string',
              description: 'Slug do produto para URLs',
              example: 'smartphone-xyz'
            },
            category: {
              type: 'string',
              description: 'Categoria do produto',
              example: 'eletrônicos'
            },
            brand: {
              type: 'string',
              description: 'Marca do produto',
              example: 'TechMax'
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada do produto',
              example: 'Smartphone com tela de 6.5 polegadas...'
            },
            price: {
              type: 'object',
              properties: {
                currency: {
                  type: 'string',
                  description: 'Moeda do preço',
                  example: 'BRL'
                },
                original: {
                  type: 'number',
                  format: 'float',
                  description: 'Preço original',
                  example: 1299.99
                },
                discount_percent: {
                  type: 'number',
                  description: 'Percentual de desconto',
                  example: 0
                },
                final: {
                  type: 'number',
                  format: 'float',
                  description: 'Preço final',
                  example: 1299.99
                }
              }
            },
            stock: {
              type: 'object',
              properties: {
                quantity: {
                  type: 'integer',
                  description: 'Quantidade em estoque',
                  example: 50
                },
                sku: {
                  type: 'string',
                  description: 'SKU do produto',
                  example: 'SKU-PROD-0001'
                },
                warehouse: {
                  type: 'string',
                  description: 'Local do estoque',
                  example: 'RJ'
                }
              }
            },
            rating: {
              type: 'object',
              properties: {
                average: {
                  type: 'number',
                  format: 'float',
                  description: 'Avaliação média',
                  example: 4.5
                },
                count: {
                  type: 'integer',
                  description: 'Número de avaliações',
                  example: 25
                }
              }
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticação e autorização'
      },
      {
        name: 'Users',
        description: 'Gestão de usuários'
      },
      {
        name: 'Products',
        description: 'Gestão de produtos'
      },
      {
        name: 'Orders',
        description: 'Gestão de pedidos'
      },
      {
        name: 'Logistics',
        description: 'Logística e frete'
      },
      {
        name: 'Jobs',
        description: 'Jobs automáticos'
      },
      {
        name: 'System',
        description: 'Endpoints do sistema'
      },
      {
        name: 'Catalog',
        description: 'API simplificada de catálogo (seguindo padrão catalogo-products)'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './swagger-docs/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
