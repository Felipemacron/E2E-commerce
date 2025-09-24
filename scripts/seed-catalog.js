const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function seedCatalog() {
  console.log('Iniciando seed do catálogo...');
  
  const dbPath = path.join(__dirname, '..', 'database.db');
  const db = new sqlite3.Database(dbPath);

  // Limpar produtos existentes
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Erro ao limpar produtos:', err);
      return;
    }
    console.log('Produtos existentes removidos');

    // Categorias de exemplo
    const categories = [
      'eletrônicos', 'casa', 'roupas', 'livros', 'esportes', 
      'beleza', 'automotivo', 'jardinagem', 'brinquedos', 'saúde'
    ];

    // Marcas de exemplo
    const brands = [
      'TechMax', 'HomeStyle', 'FashionPro', 'BookWorld', 'SportLife',
      'BeautyCare', 'AutoTech', 'GardenPro', 'ToyLand', 'HealthPlus'
    ];

    let inserted = 0;
    const total = 500;

    // Inserir produtos
    for (let i = 1; i <= total; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const price = (Math.random() * 1000 + 10).toFixed(2);
      const stock = Math.floor(Math.random() * 100) + 1;
      
      const product = {
        name: `Produto ${i}`,
        description: `Descrição detalhada do produto ${i}. Um excelente produto da categoria ${category} com qualidade premium.`,
        price: parseFloat(price),
        category: category,
        stock: stock,
        is_active: 1
      };

      db.run(`
        INSERT INTO products (name, description, price, category, stock, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [product.name, product.description, product.price, product.category, product.stock, product.is_active], (err) => {
        if (err) {
          console.error('Erro ao inserir produto:', err);
          return;
        }
        
        inserted++;
        if (inserted === total) {
          console.log(`${total} produtos inseridos com sucesso!`);
          console.log('Seed do catálogo concluído!');
          db.close();
        }
      });
    }
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  seedCatalog();
}

module.exports = seedCatalog;