const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function seedRealProducts() {
  console.log('🛍️ Iniciando seed de produtos reais...');
  
  const dbPath = path.join(__dirname, '..', 'database.db');
  const db = new sqlite3.Database(dbPath);

  // Limpar produtos existentes
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Erro ao limpar produtos:', err);
      return;
    }
    console.log('✅ Produtos existentes removidos');

    // Produtos reais com imagens
    const realProducts = [
      // ELETRÔNICOS
      {
        name: 'iPhone 15 Pro Max',
        description: 'O mais avançado iPhone com chip A17 Pro, câmera de 48MP e tela Super Retina XDR de 6.7". Disponível em Titânio Natural, Titânio Azul, Titânio Branco e Titânio Preto.',
        category: 'eletrônicos',
        price: 8999.00,
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&q=80',
        brand: 'Apple'
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Smartphone premium com S Pen, câmera de 200MP, tela Dynamic AMOLED 2X de 6.8" e processador Snapdragon 8 Gen 3.',
        category: 'eletrônicos',
        price: 7999.00,
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80',
        brand: 'Samsung'
      },
      {
        name: 'MacBook Pro 14" M3',
        description: 'Laptop profissional com chip M3, tela Liquid Retina XDR de 14.2", 16GB RAM e 512GB SSD. Perfeito para profissionais criativos.',
        category: 'eletrônicos',
        price: 12999.00,
        stock: 15,
        image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop&q=80',
        brand: 'Apple'
      },
      {
        name: 'AirPods Pro 2ª Geração',
        description: 'Fones sem fio com cancelamento ativo de ruído, áudio espacial e resistência à água. Até 6 horas de reprodução.',
        category: 'eletrônicos',
        price: 1899.00,
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop&q=80',
        brand: 'Apple'
      },
      {
        name: 'PlayStation 5',
        description: 'Console de videogame de nova geração com SSD ultra-rápido, ray tracing e suporte a 4K. Inclui controle DualSense.',
        category: 'eletrônicos',
        price: 4499.00,
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop&q=80',
        brand: 'Sony'
      },

      // CASA E DECORAÇÃO
      {
        name: 'Sofá 3 Lugares Cinza',
        description: 'Sofá confortável em tecido cinza, estrutura em madeira maciça e almofadas removíveis. Perfeito para sala de estar.',
        category: 'casa',
        price: 1899.00,
        stock: 12,
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
        brand: 'HomeStyle'
      },
      {
        name: 'Mesa de Jantar 6 Lugares',
        description: 'Mesa de jantar em madeira maciça de eucalipto, acomoda 6 pessoas. Design moderno e elegante.',
        category: 'casa',
        price: 1299.00,
        stock: 8,
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
        brand: 'WoodCraft'
      },
      {
        name: 'Cama King Size Premium',
        description: 'Cama king size com cabeceira estofada, estrutura em madeira maciça e sistema de gavetas. Inclui colchão.',
        category: 'casa',
        price: 2499.00,
        stock: 6,
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
        brand: 'SleepWell'
      },
      {
        name: 'Luminária de Mesa LED',
        description: 'Luminária moderna com LED regulável, carregamento wireless e design minimalista. Perfeita para escritório.',
        category: 'casa',
        price: 299.00,
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop&q=80',
        brand: 'LightPro'
      },

      // ROUPAS E MODA
      {
        name: 'Tênis Nike Air Max 270',
        description: 'Tênis esportivo com tecnologia Air Max, solado em borracha e cabedal em mesh respirável. Disponível em várias cores.',
        category: 'roupas',
        price: 599.00,
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        brand: 'Nike'
      },
      {
        name: 'Jaqueta Jeans Masculina',
        description: 'Jaqueta jeans clássica em denim azul, corte regular e bolsos frontais. Feita com algodão 100% orgânico.',
        category: 'roupas',
        price: 199.00,
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
        brand: 'DenimCo'
      },
      {
        name: 'Vestido Floral Feminino',
        description: 'Vestido elegante com estampa floral, tecido leve e fluido. Perfeito para ocasiões especiais e uso diário.',
        category: 'roupas',
        price: 149.00,
        stock: 28,
        image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
        brand: 'FashionStyle'
      },
      {
        name: 'Relógio Smartwatch',
        description: 'Smartwatch com monitoramento de saúde, GPS, resistência à água e bateria de longa duração. Compatível com iOS e Android.',
        category: 'roupas',
        price: 899.00,
        stock: 22,
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        brand: 'TechWatch'
      },

      // ESPORTES E FITNESS
      {
        name: 'Bicicleta Mountain Bike',
        description: 'Bicicleta mountain bike com 21 marchas, freios a disco e suspensão dianteira. Ideal para trilhas e cidade.',
        category: 'esportes',
        price: 1299.00,
        stock: 15,
        image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        brand: 'BikePro'
      },
      {
        name: 'Kit de Musculação Completo',
        description: 'Kit completo com halteres ajustáveis, barra, anilhas e banco de exercícios. Perfeito para home gym.',
        category: 'esportes',
        price: 899.00,
        stock: 10,
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        brand: 'FitLife'
      },
      {
        name: 'Tênis de Corrida Adidas',
        description: 'Tênis de corrida com tecnologia Boost, solado em borracha Continental e cabedal em mesh respirável.',
        category: 'esportes',
        price: 399.00,
        stock: 45,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        brand: 'Adidas'
      },

      // LIVROS E EDUCAÇÃO
      {
        name: 'Livro: Clean Code',
        description: 'Livro essencial para desenvolvedores sobre como escrever código limpo e manutenível. Edição em português.',
        category: 'livros',
        price: 89.00,
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        brand: 'TechBooks'
      },
      {
        name: 'Kindle Paperwhite',
        description: 'Leitor de e-books com tela de 6.8", luz frontal ajustável e bateria de longa duração. Resistente à água.',
        category: 'livros',
        price: 499.00,
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
        brand: 'Amazon'
      },

      // BELEZA E CUIDADOS
      {
        name: 'Kit de Maquiagem Profissional',
        description: 'Kit completo com base, pó, blush, sombras, batom e pincéis. Marca premium com produtos de alta qualidade.',
        category: 'beleza',
        price: 299.00,
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        brand: 'BeautyPro'
      },
      {
        name: 'Perfume Masculino Premium',
        description: 'Perfume masculino com notas de madeira e especiarias. Fragrância duradoura e elegante.',
        category: 'beleza',
        price: 199.00,
        stock: 18,
        image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
        brand: 'FragranceCo'
      },

      // AUTOMOTIVO
      {
        name: 'Pneu Aro 17 Premium',
        description: 'Pneu de alta performance para carros esportivos. Excelente aderência em pista seca e molhada.',
        category: 'automotivo',
        price: 399.00,
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        brand: 'TireMax'
      },
      {
        name: 'Kit de Ferramentas Automotivas',
        description: 'Kit completo com 120 peças, chaves, alicates e ferramentas especiais. Ideal para mecânicos e entusiastas.',
        category: 'automotivo',
        price: 199.00,
        stock: 15,
        image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        brand: 'ToolPro'
      },

      // JARDINAGEM
      {
        name: 'Kit de Jardinagem Completo',
        description: 'Kit com pá, enxada, tesoura de poda, regador e luvas. Perfeito para cuidar do seu jardim.',
        category: 'jardinagem',
        price: 149.00,
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
        brand: 'GardenPro'
      },
      {
        name: 'Vaso de Cerâmica Grande',
        description: 'Vaso de cerâmica artesanal, ideal para plantas grandes. Design moderno e drenagem otimizada.',
        category: 'jardinagem',
        price: 79.00,
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
        brand: 'CeramicArt'
      },

      // BRINQUEDOS
      {
        name: 'Lego Creator Expert',
        description: 'Kit de montagem Lego com 2000+ peças. Perfeito para crianças e adultos que gostam de construir.',
        category: 'brinquedos',
        price: 299.00,
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        brand: 'Lego'
      },
      {
        name: 'Boneca Interativa',
        description: 'Boneca que fala, canta e interage com a criança. Inclui acessórios e roupas para trocar.',
        category: 'brinquedos',
        price: 199.00,
        stock: 18,
        image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
        brand: 'ToyLand'
      },

      // SAÚDE E BEM-ESTAR
      {
        name: 'Termômetro Digital Infravermelho',
        description: 'Termômetro digital sem contato, ideal para medir temperatura corporal. Leitura rápida e precisa.',
        category: 'saúde',
        price: 89.00,
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
        brand: 'HealthTech'
      },
      {
        name: 'Suplemento Vitamina D3',
        description: 'Suplemento de vitamina D3 em cápsulas, 60 unidades. Essencial para saúde óssea e imunidade.',
        category: 'saúde',
        price: 49.00,
        stock: 60,
        image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
        brand: 'VitaLife'
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO products (name, description, category, price, stock, image_url, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    let inserted = 0;
    realProducts.forEach(product => {
      stmt.run(
        product.name,
        product.description,
        product.category,
        product.price,
        product.stock,
        product.image_url,
        1, // is_active
        (err) => {
          if (err) {
            console.error('Erro ao inserir produto:', err);
          } else {
            inserted++;
            console.log(`✅ Produto inserido: ${product.name}`);
          }
        }
      );
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Erro ao finalizar inserção:', err);
      } else {
        console.log(`🎉 Seed concluído! ${inserted} produtos reais inseridos com sucesso!`);
        console.log('📱 Acesse http://localhost:3000/products.html para ver os produtos');
      }
      db.close();
    });
  });
}

if (require.main === module) {
  seedRealProducts();
}

module.exports = seedRealProducts;
