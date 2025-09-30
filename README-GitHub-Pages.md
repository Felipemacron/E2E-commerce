# E2E-Commerce - GitHub Pages

Este é um sistema de e-commerce desenvolvido como MVP (Minimum Viable Product) para demonstração. A versão do GitHub Pages é uma implementação estática que simula todas as funcionalidades do sistema original.

## 🚀 Demo Online

**Acesse a demo:** [https://seu-usuario.github.io/sistema-simples](https://seu-usuario.github.io/sistema-simples)

## 📋 Funcionalidades

### ✅ Implementadas (Modo Estático)
- **Catálogo de Produtos**: Visualização de produtos com filtros e busca
- **Carrinho de Compras**: Adicionar/remover produtos, cálculo de totais
- **Sistema de Autenticação**: Login/registro simulado
- **Interface Responsiva**: Funciona em desktop, tablet e mobile
- **Dados Mockados**: Produtos, usuários e pedidos de demonstração

### 🔄 Simuladas (Sem Backend)
- **Pedidos**: Criação e acompanhamento de pedidos
- **Pagamentos**: Simulação de processo de pagamento
- **Logística**: Rastreamento de entregas
- **Administração**: Painel para vendedores e admins

## 🔑 Credenciais de Teste

Use estas credenciais para testar o sistema:

| Tipo | Email | Senha | Descrição |
|------|-------|-------|-----------|
| Cliente | `joao@email.com` | `123456` | Usuário comum para compras |
| Vendedor | `maria@email.com` | `123456` | Acesso ao painel de vendas |
| Admin | `admin@email.com` | `123456` | Acesso completo ao sistema |

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- Git instalado

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/sistema-simples.git
   cd sistema-simples
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Gere a versão estática**
   ```bash
   npm run build:static
   ```

4. **Visualize localmente**
   ```bash
   npm run preview:static
   ```

5. **Acesse no navegador**
   ```
   http://localhost:8080
   ```

## 📁 Estrutura do Projeto

```
sistema-simples/
├── public/                 # Frontend estático
│   ├── css/               # Estilos
│   ├── js/                # JavaScript
│   ├── images/            # Imagens
│   └── index-static.html  # Página principal estática
├── scripts/
│   └── build-static.js    # Script de build para GitHub Pages
├── .github/workflows/     # CI/CD para GitHub Pages
└── dist/                  # Arquivos gerados (não versionado)
```

## 🔧 Configuração do GitHub Pages

### 1. Habilitar GitHub Pages
1. Vá para **Settings** do seu repositório
2. Role até **Pages** na barra lateral
3. Em **Source**, selecione **GitHub Actions**

### 2. Workflow Automático
O arquivo `.github/workflows/deploy.yml` já está configurado para:
- Fazer build automático a cada push na branch `main`
- Deploy automático para GitHub Pages
- Usar Node.js 18 para compatibilidade

### 3. URL Personalizada (Opcional)
Para usar um domínio personalizado:
1. Adicione um arquivo `CNAME` na pasta `dist/`
2. Configure o DNS do seu domínio

## 🎨 Personalização

### Modificar Dados Mockados
Edite o arquivo `scripts/build-static.js` para alterar:
- Produtos disponíveis
- Usuários de teste
- Categorias
- Preços e descrições

### Alterar Estilos
Modifique os arquivos em `public/css/` para personalizar:
- Cores do tema
- Layout responsivo
- Tipografia
- Componentes visuais

### Adicionar Funcionalidades
Para adicionar novas funcionalidades estáticas:
1. Modifique `public/js/api-static.js` para simular APIs
2. Atualize `public/js/main.js` para nova lógica
3. Adicione estilos em `public/css/style.css`

## 🚀 Deploy Manual

Se preferir fazer deploy manual:

```bash
# 1. Fazer build
npm run build:static

# 2. Fazer commit da pasta dist
git add dist/
git commit -m "Deploy: Build estático para GitHub Pages"
git push origin main

# 3. Configurar GitHub Pages para usar a pasta dist
```

## 📱 Responsividade

O sistema foi desenvolvido com design responsivo:
- **Desktop**: Layout completo com sidebar e múltiplas colunas
- **Tablet**: Layout adaptado com navegação otimizada
- **Mobile**: Interface touch-friendly com menu hambúrguer

## 🔒 Segurança

**⚠️ Importante**: Esta é uma versão de demonstração estática. Não use em produção real pois:
- Não há validação de backend
- Dados são simulados
- Não há processamento real de pagamentos
- Autenticação é apenas visual

## 🐛 Problemas Conhecidos

- **Imagens**: Algumas imagens podem não carregar devido a CORS
- **Performance**: Dados são carregados sincronamente
- **Persistência**: Dados não são salvos entre sessões

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se seguiu todos os passos de instalação
2. Confirme que o Node.js está na versão 18+
3. Verifique os logs do console do navegador
4. Abra uma issue no repositório

## 📄 Licença

Este projeto é para fins educacionais e de demonstração. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para demonstração de MVP de E-commerce**
