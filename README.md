# E2E-Commerce

Sistema de e-commerce com duas implementações: **Sistema Completo** e **Catálogo Simples**.

## 🚀 Duas Opções Disponíveis

### 1. 🛍️ **Catálogo Simples** (Recomendado)
- **API simplificada** seguindo padrão do [catalogo-products](https://github.com/repoe2e/catalogo-products)
- **Sem autenticação** - Foco em simplicidade
- **500 produtos** pré-populados
- **Interface moderna** e responsiva
- **Acesso**: `http://localhost:3000/catalog.html`

### 2. 🏢 **Sistema Completo**
- **Autenticação JWT** com roles (Cliente/Vendedor/Admin)
- **Gestão completa** de produtos, pedidos e usuários
- **Fluxo de pedidos** com status sequenciais
- **Painel administrativo**
- **Acesso**: `http://localhost:3000`

## 🏗️ Arquitetura

- **Backend**: Node.js + Express
- **Frontend**: HTML + CSS + JavaScript (Vanilla)
- **Banco**: SQLite
- **Documentação**: Swagger/OpenAPI

## 📁 Estrutura do Projeto

```
sistema simples/
├── controllers/          # Lógica de negócio
├── db/                   # Configuração do banco
├── middleware/           # Middlewares (auth, etc)
├── public/               # Frontend estático
│   ├── css/             # Estilos
│   ├── js/              # JavaScript
│   └── *.html           # Páginas
├── routes/               # Rotas da API
├── scripts/              # Scripts de migração/seed
├── swagger-docs/         # Documentação da API
├── server.js             # Servidor principal
└── swagger.js            # Configuração Swagger
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco
```bash
npm run migrate
npm run seed-catalog
```

### 3. Iniciar Servidor
```bash
npm start
```

### 4. Acessar Sistema
- **Catálogo Simples**: http://localhost:3000/catalog.html
- **Sistema Completo**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api-docs

## 🛍️ Catálogo Simples - API

### Endpoints Principais
```bash
# Listar produtos
GET /api/products?page=1&pageSize=10

# Criar pedido
POST /api/orders
{
  "buyer": {
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "items": [
    {
      "productId": "PROD-0001",
      "qty": 2
    }
  ]
}
```

## 🏢 Sistema Completo - Usuários de Teste

- **Admin**: `admin@e2ecommerce.com` / `Admin123!@#`
- **Vendedor**: `vendedor@e2ecommerce.com` / `Vendedor123!@#`
- **Cliente**: `cliente@e2ecommerce.com` / `Cliente123!@#`

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor
- `npm run dev` - Modo desenvolvimento
- `npm run migrate` - Executa migrações
- `npm run seed-catalog` - Popula catálogo com 500 produtos

## 📚 Documentação

- **Swagger**: http://localhost:3000/api-docs
- **README**: Este arquivo

## 🛡️ Segurança

- **Helmet** para headers de segurança
- **CORS** configurado
- **Rate Limiting** (100 req/15min)
- **Validação** de entrada
- **JWT** para autenticação (sistema completo)

## 📝 Licença

MIT License