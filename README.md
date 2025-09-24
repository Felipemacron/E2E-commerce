# 🛍️ E2E-Commerce - Sistema Completo de E-commerce

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-lightblue.svg)](https://sqlite.org/)
[![Jest](https://img.shields.io/badge/Jest-Testing-red.svg)](https://jestjs.io/)
[![Swagger](https://img.shields.io/badge/Swagger-API%20Docs-green.svg)](https://swagger.io/)

## 🚀 Visão Geral

Sistema completo de e-commerce desenvolvido com Node.js, Express e SQLite. Inclui autenticação JWT, API REST completa, frontend responsivo, sistema de carrinho, painel administrativo e muito mais.

## ✨ Funcionalidades Principais

### 🔐 Autenticação & Usuários
- **JWT Authentication** com expiração de 30 minutos
- **Validação de senha** (mínimo 10 caracteres, letras, números, símbolos)
- **Sistema de roles** (Cliente, Vendedor, Admin)
- **Reset de senha** com tokens expiráveis
- **Gestão completa de usuários** (CRUD)

### 🛒 Produtos & Catálogo
- **Listagem de produtos** com filtros e paginação
- **Busca por nome/categoria**
- **Detalhes do produto** com modal interativo
- **Gestão de estoque** (múltiplos de 10)
- **Auditoria de estoque**
- **Validação de produtos inativos**
- **28 produtos reais** com imagens de alta qualidade

### 🛍️ Carrinho & Pedidos
- **Sistema de carrinho** funcional com localStorage
- **Criação de pedidos** com status sequenciais
- **Status**: Aguardando Pagamento → Pago → Em Transporte → Entregue
- **Cancelamento** com motivo obrigatório
- **Histórico de logística**
- **Sistema de devoluções** (7 dias sem defeito, 30 dias com defeito)
- **Cancelamento automático** de pedidos não pagos (72h)

### 🚚 Frete & Pagamentos
- **Frete grátis** para pedidos ≥ R$ 399,00
- **Frete R$ 100,00** para pedidos < R$ 399,00
- **Simulação de pagamentos** (Cartão, PIX, Boleto)
- **Confirmação automática** de pagamentos

### 👨‍💼 Administração
- **Painel administrativo** para vendedores/admins
- **Gestão de produtos**
- **Atualização de status** de pedidos
- **Relatórios e auditoria**
- **Gestão de fornecedores**

### ⚙️ Automação & Jobs
- **Job automático** para cancelar pedidos não pagos (1 hora)
- **Limpeza automática** de tokens expirados (6 horas)
- **Gestão de fornecedores**

### 📚 Documentação & Testes
- **Swagger/OpenAPI** completo em `/api-docs`
- **Testes automatizados** com Jest
- **Cobertura de testes** com relatórios
- **Testes E2E** com Supertest

## 🏗️ Arquitetura

### Backend
- **Node.js** com Express
- **SQLite** como banco de dados
- **JWT** para autenticação
- **Helmet** para segurança
- **CORS** configurado
- **Rate Limiting** implementado
- **Validação** e sanitização de dados

### Frontend
- **HTML5** semântico
- **CSS3** responsivo com Flexbox/Grid
- **JavaScript** vanilla (ES6+)
- **Design responsivo** para mobile/desktop
- **Componentes modulares**

### API
- **RESTful API** completa
- **API simplificada** de catálogo (`/api/catalog`)
- **Documentação Swagger** automática
- **Versionamento** de endpoints
- **Tratamento de erros** padronizado

## 🚀 Instalação & Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/Felipemacron/E2E-commerce.git
cd E2E-commerce
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Execute as migrações
```bash
npm run migrate
```

### 4. Popule o banco com produtos
```bash
npm run seed:real
```

### 5. Inicie o servidor
```bash
npm start
```

### 6. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Documentação Swagger**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## 📱 Páginas Disponíveis

- **`/`** - Página inicial com produtos em destaque
- **`/products.html`** - Catálogo completo de produtos
- **`/catalog.html`** - API simplificada de catálogo
- **`/cart.html`** - Carrinho de compras
- **`/account.html`** - Área do usuário
- **`/admin.html`** - Painel administrativo

## 🔧 Scripts Disponíveis

```bash
npm start          # Inicia o servidor em produção
npm run dev        # Inicia o servidor em desenvolvimento
npm run migrate    # Executa migrações do banco
npm run seed       # Popula o banco com dados de teste
npm run seed:real  # Popula com produtos reais
npm test           # Executa todos os testes
npm run test:watch # Executa testes em modo watch
npm run test:coverage # Executa testes com cobertura
```

## 🧪 Testes

O projeto inclui testes abrangentes:

- **Testes unitários** para controllers e models
- **Testes de integração** para APIs
- **Testes E2E** para fluxos completos
- **Cobertura de código** com relatórios

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage

# Executar em modo watch
npm run test:watch
```

## 📊 Estrutura do Projeto

```
E2E-commerce/
├── 📁 controllers/          # Lógica de negócio
├── 📁 middleware/           # Middlewares (auth, validation)
├── 📁 models/              # Modelos de dados
├── 📁 routes/              # Rotas da API
├── 📁 scripts/             # Scripts de migração e seed
├── 📁 swagger-docs/        # Documentação Swagger
├── 📁 public/              # Frontend estático
│   ├── 📁 css/            # Estilos
│   ├── 📁 js/             # JavaScript
│   ├── 📁 header/         # Componentes do header
│   └── 📄 *.html          # Páginas
├── 📄 server.js            # Servidor principal
├── 📄 swagger.js           # Configuração Swagger
├── 📄 database.db          # Banco SQLite
└── 📄 package.json         # Dependências
```

## 🔐 Segurança

- **Helmet** para headers de segurança
- **CORS** configurado adequadamente
- **Rate Limiting** para prevenir abuso
- **Validação** de entrada de dados
- **Sanitização** de dados
- **JWT** com expiração
- **Senhas** com hash bcrypt

## 🌐 Deploy

O sistema está pronto para deploy em:

- **Heroku**
- **Railway**
- **Vercel**
- **DigitalOcean**
- **AWS**
- **Qualquer VPS**

### Variáveis de Ambiente
```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_aqui
```

## 📈 Performance

- **SQLite** para desenvolvimento e pequenas aplicações
- **Índices** otimizados no banco
- **Paginação** em todas as listagens
- **Cache** de sessões
- **Compressão** de respostas
- **Minificação** de assets

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

- Express.js pela framework robusta
- SQLite pela simplicidade
- Jest pela excelente ferramenta de testes
- Swagger pela documentação automática
- Unsplash pelas imagens dos produtos

---

## 🎯 Status do Projeto

✅ **Sistema 100% Funcional**
- ✅ Autenticação completa
- ✅ API REST documentada
- ✅ Frontend responsivo
- ✅ Sistema de carrinho
- ✅ Painel administrativo
- ✅ Testes automatizados
- ✅ Deploy ready

**Pronto para produção!** 🚀