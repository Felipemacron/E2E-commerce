/**
 * API Client para E2E-Commerce
 * Gerencia todas as chamadas para o backend
 */

class APIClient {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('auth_token');
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

    // Método genérico para requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Autenticação
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.data?.token) {
            this.token = response.data.token;
            localStorage.setItem('auth_token', this.token);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
        
        return response;
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }

    async refreshToken() {
        const response = await this.request('/auth/refresh', {
            method: 'POST'
        });
        
        if (response.data?.token) {
            this.token = response.data.token;
            localStorage.setItem('auth_token', this.token);
        }
        
        return response;
    }

    // Produtos
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/products${queryString ? `?${queryString}` : ''}`);
    }

    async getProduct(id) {
        return await this.request(`/products/${id}`);
    }

    async addStock(productId, amount) {
        return await this.request(`/products/${productId}/stock-add`, {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    }

    // Pedidos
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return await this.request('/orders');
    }

    async getOrder(id) {
        return await this.request(`/orders/${id}`);
    }

    async updateOrderStatus(orderId, status) {
        return await this.request(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    async cancelOrder(orderId, reason) {
        return await this.request(`/orders/${orderId}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    async requestReturn(orderId, returnData) {
        return await this.request(`/orders/${orderId}/return`, {
            method: 'POST',
            body: JSON.stringify(returnData)
        });
    }

    // Endereços
    async getAddresses() {
        return await this.request('/addresses');
    }

    async createAddress(addressData) {
        return await this.request('/addresses', {
            method: 'POST',
            body: JSON.stringify(addressData)
        });
    }

    async updateAddress(id, addressData) {
        return await this.request(`/addresses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(addressData)
        });
    }

    async deleteAddress(id) {
        return await this.request(`/addresses/${id}`, {
            method: 'DELETE'
        });
    }

    // Pagamentos
    async confirmPayment(orderId, paymentData) {
        return await this.request(`/payments/${orderId}/confirm`, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // Logística
    async getLogistics(orderId) {
        return await this.request(`/logistics/${orderId}`);
    }

    async updateLogistics(orderId, logisticsData) {
        return await this.request(`/logistics/${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify(logisticsData)
        });
    }

    // Usuários
    async getUser(id) {
        return await this.request(`/users/${id}`);
    }

    async updateUser(id, userData) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id, confirmation) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({ confirmation })
        });
    }

    // Jobs
    async runPendingCancellations() {
        return await this.request('/jobs/run-pending-cancellations');
    }

    async cleanupExpiredTokens() {
        return await this.request('/jobs/cleanup-expired-tokens');
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }
}

// Instância global da API
window.api = new APIClient();