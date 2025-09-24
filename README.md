# 🛍️ E2E-Commerce - Sistema de E-commerce Completo

Sistema de e-commerce full-stack desenvolvido com Node.js, Express, SQLite e frontend vanilla JavaScript.

## 🚀 Funcionalidades

### 🔐 Autenticação
- ✅ Login e registro de usuários
- ✅ JWT com expiração de 30 minutos
- ✅ Validação de senha (mín. 10 caracteres, letras, números, símbolos)
- ✅ Roles: Cliente, Vendedor, Admin
- ✅ Reset de senha com tokens expiráveis

### 📦 Produtos
- ✅ Catálogo de produtos com paginação
- ✅ Busca por nome e categoria
- ✅ Filtros e ordenação
- ✅ Gestão de estoque (múltiplos de 10)
- ✅ Produtos inativos
- ✅ Imagens reais do Unsplash

### 🛒 Carrinho e Pedidos
- ✅ Carrinho de compras funcional
- ✅ Criação de pedidos
- ✅ Status sequenciais: Aguardando → Pago → Em Transporte → Entregue
- ✅ Cancelamento com motivo obrigatório
- ✅ Histórico de logística
- ✅ Sistema de devoluções (7 dias sem defeito, 30 dias com defeito)

### 💰 Pagamento e Frete
- ✅ Simulação de pagamento (Cartão, PIX, Boleto)
- ✅ Confirmação automática de pagamento
- ✅ Frete grátis para pedidos ≥ R$ 399,00
- ✅ Frete R$ 100,00 para pedidos < R$ 399,00

### 👨‍💼 Administração
- ✅ Painel admin para vendedores/admins
- ✅ Gestão de produtos
- ✅ Atualização de status de pedidos
- ✅ Relatórios e auditoria
- ✅ Gestão de fornecedores

### 🤖 Automação
- ✅ Job automático para cancelar pedidos não pagos (1 hora)
- ✅ Limpeza automática de tokens expirados (6 horas)
- ✅ Gestão de fornecedores

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Helmet** - Segurança
- **CORS** - Cross-origin requests
- **Rate Limiting** - Proteção contra spam

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização responsiva
- **Vanilla JavaScript** - Interatividade
- **LocalStorage** - Carrinho de compras

### Documentação
- **Swagger/OpenAPI** - Documentação da API
- **JSDoc** - Documentação inline

### Testes
- **Jest** - Framework de testes
- **Supertest** - Testes de API
- **Coverage** - Relatórios de cobertura

## 📁 Estrutura do Projeto

```
E2E-Commerce/
├── 📁 controllers/          # Lógica de negócio
├── 📁 middleware/           # Middlewares (auth, validação)
├── 📁 routes/              # Rotas da API
├── 📁 scripts/             # Scripts de migração e seed
├── 📁 swagger-docs/        # Documentação Swagger
├── 📁 public/              # Frontend
│   ├── 📁 css/            # Estilos
│   ├── 📁 js/             # JavaScript
│   ├── 📁 header/         # Componentes do header
│   ├── 📄 index.html      # Página inicial
│   ├── 📄 products.html   # Catálogo de produtos
│   ├── 📄 cart.html       # Carrinho de compras
│   ├── 📄 account.html    # Conta do usuário
│   └── 📄 catalog.html    # Catálogo simplificado
├── 📄 server.js           # Servidor principal
├── 📄 swagger.js          # Configuração Swagger
├── 📄 package.json        # Dependências
└── 📄 README.md           # Este arquivo
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
```bash
npm run migrate
npm run seed
```

### 3. Executar o Servidor
```bash
npm start
# ou para desenvolvimento
npm run dev
```

### 4. Acessar o Sistema
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Documentação Swagger**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 📚 Documentação da API

A documentação completa da API está disponível em:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

### Principais Endpoints

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/forgot-password` - Esqueci minha senha
- `POST /api/auth/reset-password` - Resetar senha

#### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Detalhes do produto
- `POST /api/products` - Criar produto (Admin/Vendedor)
- `PUT /api/products/:id` - Atualizar produto (Admin/Vendedor)

#### Catálogo Simplificado
- `GET /api/catalog/products` - Listar produtos (sem auth)
- `POST /api/catalog/orders` - Criar pedido (sem auth)

#### Pedidos
- `GET /api/orders` - Meus pedidos
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/:id/status` - Atualizar status (Admin/Vendedor)

## 🔒 Segurança

- **Helmet** - Headers de segurança
- **CORS** - Controle de origem
- **Rate Limiting** - Proteção contra spam
- **Validação de entrada** - Sanitização de dados
- **JWT** - Autenticação segura
- **bcrypt** - Hash de senhas

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 📱 **Mobile** (320px+)
- 📱 **Tablet** (768px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Large Desktop** (1440px+)

## 🎨 Interface

- **Design moderno** e limpo
- **Cores consistentes** com tema profissional
- **Animações suaves** para melhor UX
- **Modais responsivos** para detalhes
- **Feedback visual** para ações do usuário

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Felipe Macron**
- GitHub: [@Felipemacron](https://github.com/Felipemacron)

## 🙏 Agradecimentos

- Imagens dos produtos: [Unsplash](https://unsplash.com)
- Ícones: [Heroicons](https://heroicons.com)
- Fontes: [Google Fonts](https://fonts.google.com)

---

**Desenvolvido com ❤️ para demonstração de sistema E2E-Commerce completo**