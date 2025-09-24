const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

// Importar rotas
const catalogRoutes = require('./routes/catalog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const logisticsRoutes = require('./routes/logistics');
const jobRoutes = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    error: true,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E2E-Commerce API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/jobs', jobRoutes);

// Rotas específicas do catálogo (API simplificada)
app.use('/api/catalog', catalogRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    error: false,
    message: 'E2E-Commerce API está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(500).json({
    error: true,
    code: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    code: 'NOT_FOUND',
    message: 'Rota não encontrada'
  });
});

// Rota para servir o frontend (deve ser a última)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Importar job controller para execução automática
const jobController = require('./controllers/jobController');

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor E2E-Commerce rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
});

// Configurar jobs automáticos
console.log('⏰ Configurando jobs automáticos...');

// Job para cancelar pedidos não pagos (executa a cada hora)
setInterval(async () => {
  try {
    await jobController.executePendingCancellations();
  } catch (error) {
    console.error('Erro no job automático de cancelamento:', error);
  }
}, 60 * 60 * 1000); // 1 hora

// Job para limpar tokens expirados (executa a cada 6 horas)
setInterval(async () => {
  try {
    await jobController.cleanupExpiredTokens();
  } catch (error) {
    console.error('Erro no job de limpeza de tokens:', error);
  }
}, 6 * 60 * 60 * 1000); // 6 horas

console.log('✅ Jobs automáticos configurados:');
console.log('   - Cancelamento de pedidos não pagos: a cada 1 hora');
console.log('   - Limpeza de tokens expirados: a cada 6 horas');

module.exports = app;
