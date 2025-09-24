const db = require('../db/database');

async function runMigrations() {
  try {
    console.log('Iniciando migrações...');

    // Tabela users
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('Cliente', 'Vendedor', 'Admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )
    `);

    // Tabela products
    await db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        is_active BOOLEAN DEFAULT 1,
        max_stock INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela addresses
    await db.run(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        cep TEXT NOT NULL,
        street TEXT NOT NULL,
        number TEXT NOT NULL,
        complement TEXT,
        type TEXT DEFAULT 'Residencial',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabela orders
    await db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'Aguardando Pagamento' 
          CHECK(status IN ('Aguardando Pagamento', 'Pago', 'Em Transporte', 'Entregue', 'Cancelado')),
        financial_status TEXT DEFAULT 'Pendente',
        shipping_cost DECIMAL(10,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabela order_items
    await db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        qty INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Tabela logistics_history
    await db.run(`
      CREATE TABLE IF NOT EXISTS logistics_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )
    `);

    // Tabela stock_audit
    await db.run(`
      CREATE TABLE IF NOT EXISTS stock_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        previous_stock INTEGER NOT NULL,
        added_amount INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabela payments
    await db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        method TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'Pendente',
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )
    `);

    // Tabela order_cancellations
    await db.run(`
      CREATE TABLE IF NOT EXISTS order_cancellations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        cancelled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )
    `);

    // Tabela password_reset_tokens
    await db.run(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabela order_returns
    await db.run(`
      CREATE TABLE IF NOT EXISTS order_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        items TEXT NOT NULL,
        reason TEXT NOT NULL,
        return_type TEXT NOT NULL CHECK(return_type IN ('defect', 'no_defect')),
        status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Processed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )
    `);

    // Tabela suppliers
    await db.run(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Migrações executadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

runMigrations();
