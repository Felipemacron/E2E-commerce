/**
 * API Client Estático para E2E-Commerce (GitHub Pages)
 * Usa dados mockados em vez de chamadas para o backend
 */

class StaticAPIClient {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('auth_token');
        this.mockData = null;
        this.loadMockData();
    }

    async loadMockData() {
        try {
            const response = await fetch('/data.json');
            this.mockData = await response.json();
        } catch (error) {
            console.error('Erro ao carregar dados mockados:', error);
            // Dados de fallback
            this.mockData = {
                products: [],
                categories: [],
                users: []
            };
        }
    }

    // Simular delay de rede
    async delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Headers padrão
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Autenticação (simulada)
    async login(email, password) {
        await this.delay();
        
        const user = this.mockData.users.find(u => u.email === email);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Simular senha (em produção seria verificação real)
        if (password !== '123456') {
            throw new Error('Senha incorreta');
        }

        const token = 'mock_token_' + Date.now();
        this.token = token;
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_data', JSON.stringify(user));

        return {
            error: false,
            message: 'Login realizado com sucesso',
            data: {
                token,
                user
            }
        };
    }

    async register(userData) {
        await this.delay();
        
        // Verificar se email já existe
        const existingUser = this.mockData.users.find(u => u.email === userData.email);
        if (existingUser) {
            throw new Error('Email já cadastrado');
        }

        const newUser = {
            id: this.mockData.users.length + 1,
            ...userData
        };

        this.mockData.users.push(newUser);

        return {
            error: false,
            message: 'Usuário cadastrado com sucesso',
            data: newUser
        };
    }

    async logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }

    async refreshToken() {
        await this.delay();
        
        if (!this.token) {
            throw new Error('Token não encontrado');
        }

        return {
            error: false,
            message: 'Token renovado',
            data: {
                token: this.token
            }
        };
    }

    // Produtos
    async getProducts(params = {}) {
        await this.delay();
        
        let products = [...this.mockData.products];

        // Filtros
        if (params.q) {
            const query = params.q.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        if (params.category) {
            products = products.filter(p => p.category === params.category);
        }

        // Ordenação
        if (params.sort) {
            switch (params.sort) {
                case 'price_asc':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'created_at':
                    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'name':
                default:
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }

        // Paginação
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedProducts = products.slice(startIndex, endIndex);
        
        const pagination = {
            page,
            limit,
            total: products.length,
            totalPages: Math.ceil(products.length / limit),
            hasPrev: page > 1,
            hasNext: endIndex < products.length
        };

        return {
            error: false,
            message: 'Produtos carregados com sucesso',
            data: {
                products: paginatedProducts,
                pagination
            }
        };
    }

    async getProduct(id) {
        await this.delay();
        
        const product = this.mockData.products.find(p => p.id === parseInt(id));
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        return {
            error: false,
            message: 'Produto carregado com sucesso',
            data: product
        };
    }

    async addStock(productId, amount) {
        await this.delay();
        
        const product = this.mockData.products.find(p => p.id === parseInt(productId));
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        product.stock += amount;

        return {
            error: false,
            message: `Estoque adicionado com sucesso (+${amount} unidades)`,
            data: product
        };
    }

    // Pedidos (simulados)
    async createOrder(orderData) {
        await this.delay();
        
        const orderId = Date.now();
        const order = {
            id: orderId,
            user_id: 1,
            user_name: 'Usuário Demo',
            status: 'Aguardando Pagamento',
            total: orderData.total,
            items: orderData.items,
            created_at: new Date().toISOString()
        };

        return {
            error: false,
            message: 'Pedido criado com sucesso',
            data: order
        };
    }

    async getOrders() {
        await this.delay();
        
        // Simular pedidos existentes
        const orders = [
            {
                id: 1,
                user_id: 1,
                user_name: 'Usuário Demo',
                status: 'Entregue',
                total: 2999.99,
                created_at: '2024-01-10T10:00:00Z'
            },
            {
                id: 2,
                user_id: 1,
                user_name: 'Usuário Demo',
                status: 'Em Transporte',
                total: 1599.98,
                created_at: '2024-01-12T14:30:00Z'
            }
        ];

        return {
            error: false,
            message: 'Pedidos carregados com sucesso',
            data: {
                orders
            }
        };
    }

    async getOrder(id) {
        await this.delay();
        
        const order = {
            id: parseInt(id),
            user_id: 1,
            user_name: 'Usuário Demo',
            status: 'Entregue',
            total: 2999.99,
            created_at: '2024-01-10T10:00:00Z',
            items: [
                {
                    product_name: 'Smartphone Galaxy S24',
                    qty: 1,
                    unit_price: 2999.99
                }
            ]
        };

        return {
            error: false,
            message: 'Pedido carregado com sucesso',
            data: {
                order,
                items: order.items
            }
        };
    }

    async updateOrderStatus(orderId, status) {
        await this.delay();
        
        return {
            error: false,
            message: `Status do pedido #${orderId} atualizado para "${status}"`,
            data: {
                orderId,
                status
            }
        };
    }

    async cancelOrder(orderId, reason) {
        await this.delay();
        
        return {
            error: false,
            message: `Pedido #${orderId} cancelado com sucesso`,
            data: {
                orderId,
                status: 'Cancelado',
                reason
            }
        };
    }

    async requestReturn(orderId, returnData) {
        await this.delay();
        
        return {
            error: false,
            message: 'Solicitação de devolução enviada',
            data: {
                orderId,
                returnData
            }
        };
    }

    // Endereços (simulados)
    async getAddresses() {
        await this.delay();
        
        const addresses = [
            {
                id: 1,
                type: 'Residencial',
                street: 'Rua das Flores',
                number: '123',
                complement: 'Apto 45',
                cep: '01234-567'
            }
        ];

        return {
            error: false,
            message: 'Endereços carregados com sucesso',
            data: addresses
        };
    }

    async createAddress(addressData) {
        await this.delay();
        
        const address = {
            id: Date.now(),
            ...addressData
        };

        return {
            error: false,
            message: 'Endereço criado com sucesso',
            data: address
        };
    }

    async updateAddress(id, addressData) {
        await this.delay();
        
        return {
            error: false,
            message: 'Endereço atualizado com sucesso',
            data: {
                id,
                ...addressData
            }
        };
    }

    async deleteAddress(id) {
        await this.delay();
        
        return {
            error: false,
            message: 'Endereço removido com sucesso',
            data: { id }
        };
    }

    // Pagamentos (simulados)
    async confirmPayment(orderId, paymentData) {
        await this.delay();
        
        return {
            error: false,
            message: 'Pagamento confirmado com sucesso',
            data: {
                orderId,
                status: 'Pago',
                paymentData
            }
        };
    }

    // Logística (simulada)
    async getLogistics(orderId) {
        await this.delay();
        
        return {
            error: false,
            message: 'Informações de logística carregadas',
            data: {
                orderId,
                status: 'Em Transporte',
                tracking: 'BR123456789',
                estimatedDelivery: '2024-01-20'
            }
        };
    }

    async updateLogistics(orderId, logisticsData) {
        await this.delay();
        
        return {
            error: false,
            message: 'Logística atualizada com sucesso',
            data: {
                orderId,
                ...logisticsData
            }
        };
    }

    // Usuários
    async getUser(id) {
        await this.delay();
        
        const user = this.mockData.users.find(u => u.id === parseInt(id));
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        return {
            error: false,
            message: 'Usuário carregado com sucesso',
            data: user
        };
    }

    async updateUser(id, userData) {
        await this.delay();
        
        return {
            error: false,
            message: 'Usuário atualizado com sucesso',
            data: {
                id,
                ...userData
            }
        };
    }

    async deleteUser(id, confirmation) {
        await this.delay();
        
        return {
            error: false,
            message: 'Usuário removido com sucesso',
            data: { id }
        };
    }

    // Jobs (simulados)
    async runPendingCancellations() {
        await this.delay();
        
        return {
            error: false,
            message: 'Job de cancelamento executado',
            data: {
                cancelledOrders: 0
            }
        };
    }

    async cleanupExpiredTokens() {
        await this.delay();
        
        return {
            error: false,
            message: 'Limpeza de tokens executada',
            data: {
                removedTokens: 0
            }
        };
    }

    // Health check
    async healthCheck() {
        await this.delay(100);
        
        return {
            error: false,
            message: 'E2E-Commerce API está funcionando (modo estático)',
            timestamp: new Date().toISOString(),
            version: '1.0.0-static'
        };
    }

    // Método para obter categorias
    async getCategories() {
        await this.delay();
        
        return {
            error: false,
            message: 'Categorias carregadas com sucesso',
            data: this.mockData.categories
        };
    }
}

// Instância global da API estática
window.api = new StaticAPIClient();
