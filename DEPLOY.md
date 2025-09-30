# 🚀 Deploy para GitHub Pages

Este guia explica como fazer o deploy do sistema E2E-Commerce para o GitHub Pages.

## 📋 Pré-requisitos

- Conta no GitHub
- Repositório criado no GitHub
- Git configurado localmente
- Node.js 18+ instalado

## 🔧 Configuração Inicial

### 1. Preparar o Repositório

```bash
# 1. Inicializar git (se ainda não foi feito)
git init

# 2. Adicionar remote do GitHub
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# 3. Fazer build estático
npm run build:static

# 4. Adicionar arquivos ao git
git add .
git commit -m "Initial commit: E2E-Commerce MVP"

# 5. Fazer push para o GitHub
git push -u origin main
```

### 2. Configurar GitHub Pages

1. **Acesse seu repositório no GitHub**
2. **Vá para Settings** (aba superior)
3. **Role até "Pages"** na barra lateral esquerda
4. **Em "Source"**, selecione **"GitHub Actions"**
5. **Salve as configurações**

## 🚀 Deploy Automático

O sistema já está configurado para deploy automático! A cada push na branch `main`, o GitHub Actions irá:

1. ✅ Fazer build do projeto
2. ✅ Gerar arquivos estáticos
3. ✅ Fazer deploy para GitHub Pages

### Comandos para Deploy

```bash
# 1. Fazer build (opcional, o GitHub Actions faz automaticamente)
npm run build:static

# 2. Adicionar mudanças
git add .

# 3. Fazer commit
git commit -m "Deploy: Atualização do sistema"

# 4. Fazer push (dispara deploy automático)
git push origin main
```

## 🌐 Acessar o Site

Após o deploy, seu site estará disponível em:
```
https://SEU-USUARIO.github.io/SEU-REPOSITORIO
```

**Exemplo:** Se seu usuário é `joao` e o repositório é `ecommerce-demo`:
```
https://joao.github.io/ecommerce-demo
```

## 🔍 Verificar Deploy

### 1. Status do Deploy
- Vá para a aba **"Actions"** no seu repositório
- Verifique se o workflow "Deploy to GitHub Pages" foi executado com sucesso
- Se houver erro, clique no workflow para ver os detalhes

### 2. Testar o Site
- Acesse a URL do seu site
- Teste as funcionalidades principais:
  - ✅ Navegação entre páginas
  - ✅ Busca de produtos
  - ✅ Adicionar ao carrinho
  - ✅ Login com credenciais de teste
  - ✅ Interface responsiva

## 🛠️ Deploy Manual (Alternativo)

Se preferir fazer deploy manual:

```bash
# 1. Fazer build
npm run build:static

# 2. Entrar na pasta dist
cd dist

# 3. Inicializar git na pasta dist
git init

# 4. Adicionar arquivos
git add .

# 5. Fazer commit
git commit -m "Deploy manual"

# 6. Adicionar remote (substitua pela sua URL)
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# 7. Fazer push para branch gh-pages
git push -f origin main:gh-pages
```

## 🔧 Configurações Avançadas

### Domínio Personalizado

Para usar um domínio personalizado:

1. **Crie um arquivo `CNAME` na pasta `dist/`**:
   ```
   meusite.com
   ```

2. **Configure o DNS do seu domínio**:
   ```
   CNAME meusite.com SEU-USUARIO.github.io
   ```

3. **Atualize o script de build** para incluir o CNAME:
   ```javascript
   // Adicionar no scripts/build-static.js
   fs.writeFileSync(path.join(distDir, 'CNAME'), 'meusite.com');
   ```

### Variáveis de Ambiente

Para configurar variáveis específicas do ambiente:

1. **Vá para Settings > Secrets and variables > Actions**
2. **Adicione as variáveis necessárias**
3. **Use no workflow** (`.github/workflows/deploy.yml`)

## 🐛 Solução de Problemas

### Erro: "Page build failed"
- Verifique se todos os arquivos foram commitados
- Confirme que o build estático foi executado
- Verifique os logs na aba Actions

### Erro: "404 Not Found"
- Confirme que o GitHub Pages está habilitado
- Verifique se a branch correta está configurada
- Aguarde alguns minutos para propagação

### Erro: "Jekyll build failed"
- O arquivo `.nojekyll` deve estar presente
- Verifique se não há arquivos com nomes inválidos
- Confirme que o `_config.yml` está correto

### Site não carrega
- Verifique se a URL está correta
- Confirme que o deploy foi bem-sucedido
- Teste em modo incógnito
- Verifique o console do navegador para erros

## 📱 Teste de Responsividade

Após o deploy, teste em diferentes dispositivos:

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Tablet**: iPad, Android tablets
- **Mobile**: iPhone, Android phones

## 🔄 Atualizações

Para atualizar o site:

```bash
# 1. Fazer mudanças no código
# 2. Fazer build
npm run build:static

# 3. Commit e push
git add .
git commit -m "Update: Descrição da mudança"
git push origin main
```

O deploy automático irá atualizar o site em alguns minutos.

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** na aba Actions do GitHub
2. **Teste localmente** com `npm run preview:static`
3. **Consulte a documentação** do GitHub Pages
4. **Abra uma issue** no repositório

---

**🎉 Parabéns! Seu sistema E2E-Commerce está no ar!**
