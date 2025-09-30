const fs = require('fs');
const path = require('path');

// Criar diretório dist se não existir
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copiar arquivos estáticos
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copiar pasta public
copyDir(path.join(__dirname, '..', 'public'), distDir);

// Copiar index-static.html como index.html
fs.copyFileSync(
    path.join(distDir, 'index-static.html'),
    path.join(distDir, 'index.html')
);

// Criar dados mockados
const mockData = {
    products: [
        {
            id: 1,
            name: "Smartphone Galaxy S24",
            description: "O mais novo smartphone da Samsung com tecnologia de ponta",
            price: 2999.99,
            category: "Eletrônicos",
            stock: 50,
            image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
            is_active: true,
            created_at: "2024-01-15T10:00:00Z"
        },
        {
            id: 2,
            name: "Notebook Dell Inspiron",
            description: "Notebook ideal para trabalho e estudos",
            price: 2499.99,
            category: "Eletrônicos",
            stock: 30,
            image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
            is_active: true,
            created_at: "2024-01-14T15:30:00Z"
        },
        {
            id: 3,
            name: "Camiseta Polo Masculina",
            description: "Camiseta polo de algodão, confortável e elegante",
            price: 89.99,
            category: "Roupas",
            stock: 100,
            image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
            is_active: true,
            created_at: "2024-01-13T09:15:00Z"
        },
        {
            id: 4,
            name: "Tênis Nike Air Max",
            description: "Tênis esportivo com tecnologia de amortecimento",
            price: 399.99,
            category: "Esportes",
            stock: 75,
            image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            is_active: true,
            created_at: "2024-01-12T14:20:00Z"
        },
        {
            id: 5,
            name: "Mesa de Escritório",
            description: "Mesa de escritório em madeira maciça",
            price: 599.99,
            category: "Casa",
            stock: 25,
            image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
            is_active: true,
            created_at: "2024-01-11T11:45:00Z"
        },
        {
            id: 6,
            name: "Fone de Ouvido Bluetooth",
            description: "Fone sem fio com cancelamento de ruído",
            price: 199.99,
            category: "Eletrônicos",
            stock: 60,
            image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            is_active: true,
            created_at: "2024-01-10T16:30:00Z"
        },
        {
            id: 7,
            name: "Vestido Floral Feminino",
            description: "Vestido elegante para ocasiões especiais",
            price: 159.99,
            category: "Roupas",
            stock: 40,
            image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400",
            is_active: true,
            created_at: "2024-01-09T13:15:00Z"
        },
        {
            id: 8,
            name: "Bicicleta Mountain Bike",
            description: "Bicicleta para trilhas e aventuras",
            price: 1299.99,
            category: "Esportes",
            stock: 15,
            image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
            is_active: true,
            created_at: "2024-01-08T08:00:00Z"
        }
    ],
    categories: ["Eletrônicos", "Roupas", "Esportes", "Casa"],
    users: [
        {
            id: 1,
            name: "João Silva",
            email: "joao@email.com",
            role: "Cliente"
        },
        {
            id: 2,
            name: "Maria Santos",
            email: "maria@email.com",
            role: "Vendedor"
        },
        {
            id: 3,
            name: "Admin Sistema",
            email: "admin@email.com",
            role: "Admin"
        }
    ]
};

// Salvar dados mockados
fs.writeFileSync(
    path.join(distDir, 'data.json'),
    JSON.stringify(mockData, null, 2)
);

// Criar arquivo .nojekyll para desabilitar Jekyll
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

// Criar arquivo _config.yml para configuração do Jekyll
const jekyllConfig = `# Configuração do Jekyll para GitHub Pages
# Este arquivo desabilita o Jekyll para servir arquivos estáticos puros

include: []
exclude:
  - README.md
  - package.json
  - package-lock.json
  - node_modules
  - scripts
  - .github
  - server.js
  - database.db
  - db
  - controllers
  - middleware
  - routes
  - swagger-docs
  - swagger.js

# Desabilitar processamento Jekyll
plugins: []
markdown: kramdown
highlighter: rouge`;

fs.writeFileSync(path.join(distDir, '_config.yml'), jekyllConfig);

console.log('✅ Build estático concluído!');
console.log('📁 Arquivos gerados em:', distDir);
console.log('🌐 Para testar localmente: npm run preview:static');
console.log('🚀 Para deploy: git add dist/ && git commit -m "Deploy" && git push');
