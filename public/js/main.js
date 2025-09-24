// Gerenciador principal da aplicação
class AppManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPageContent();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path.includes('index')) return 'home';
        if (path.includes('products')) return 'products';
        if (path.includes('cart')) return 'cart';
        if (path.includes('checkout')) return 'checkout';
        if (path.includes('account')) return 'account';
        if (path.includes('admin')) return 'admin';
        return 'home';
    }

    bindEvents() {
        // Eventos globais
        document.addEventListener('click', (e) => this.handleGlobalClick(e));
        
        // Eventos de busca
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Eventos de filtro
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.handleCategoryFilter(e));
        }

        // Eventos de ordenação
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.handleSort(e));
        }
    }

    handleGlobalClick(e) {
        const target = e.target;
        
        // Adicionar ao carrinho
        if (target.classList.contains('add-to-cart')) {
            e.preventDefault();
            const productId = target.dataset.productId;
            const quantity = parseInt(target.dataset.quantity) || 1;
            this.addToCart(productId, quantity);
        }

        // Ver detalhes do produto
        if (target.classList.contains('view-product')) {
            e.preventDefault();
            const productId = target.dataset.productId;
            this.viewProduct(productId);
        }

        // Adicionar estoque (admin)
        if (target.classList.contains('add-stock')) {
            e.preventDefault();
            const productId = target.dataset.productId;
            this.showAddStockModal(productId);
        }

        // Confirmar adição de estoque
        if (target.classList.contains('confirm-add-stock')) {
            e.preventDefault();
            this.confirmAddStock();
        }

        // Atualizar status do pedido
        if (target.classList.contains('update-order-status')) {
            e.preventDefault();
            const orderId = target.dataset.orderId;
            const status = target.dataset.status;
            this.updateOrderStatus(orderId, status);
        }

        // Cancelar pedido
        if (target.classList.contains('cancel-order')) {
            e.preventDefault();
            const orderId = target.dataset.orderId;
            this.showCancelOrderModal(orderId);
        }

        // Confirmar cancelamento
        if (target.classList.contains('confirm-cancel-order')) {
            e.preventDefault();
            this.confirmCancelOrder();
        }
    }

    async loadPageContent() {
        switch (this.currentPage) {
            case 'home':
                await this.loadHomePage();
                break;
            case 'products':
                await this.loadProductsPage();
                break;
            case 'cart':
                await this.loadCartPage();
                break;
            case 'checkout':
                await this.loadCheckoutPage();
                break;
            case 'account':
                await this.loadAccountPage();
                break;
            case 'admin':
                await this.loadAdminPage();
                break;
        }
    }

    async loadHomePage() {
        try {
            // Carregar produtos em destaque
            const response = await api.getProducts({ limit: 8, sort: 'created_at' });
            this.renderFeaturedProducts(response.data.products);
        } catch (error) {
            console.error('Erro ao carregar produtos em destaque:', error);
            console.error('Erro ao carregar produtos em destaque.');
        }
    }

    async loadProductsPage() {
        try {
            // Carregar categorias
            const categoriesResponse = await api.getCategories();
            this.renderCategoryFilter(categoriesResponse.data);

            // Carregar produtos
            await this.loadProducts();
        } catch (error) {
            console.error('Erro ao carregar página de produtos:', error);
            console.error('Erro ao carregar produtos.');
        }
    }

    async loadProducts(page = 1) {
        try {
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');
            const sortSelect = document.getElementById('sortSelect');

            const params = {
                page,
                limit: 12,
                q: searchInput ? searchInput.value : '',
                category: categoryFilter ? categoryFilter.value : '',
                sort: sortSelect ? sortSelect.value : 'name'
            };

            // Mostrar loading
            const container = document.getElementById('productsContainer');
            if (container) {
                container.innerHTML = '<div class="loading">Carregando produtos...</div>';
            }

            const response = await api.getProducts(params);
            this.renderProducts(response.data.products);
            this.renderPagination(response.data.pagination);

        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            console.error('Erro ao carregar produtos.');
        }
    }

    async loadCartPage() {
        // O carrinho já é gerenciado pelo CartManager
        cart.renderCartItems();
    }

    async loadCheckoutPage() {
        if (!auth.requireLogin()) {
            return;
        }

        if (cart.items.length === 0) {
            console.warn('Seu carrinho está vazio.');
            window.location.href = '/products.html';
            return;
        }

        try {
            // Carregar endereços do usuário
            const addressesResponse = await api.getAddresses();
            this.renderAddresses(addressesResponse.data);
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
            console.error('Erro ao carregar endereços.');
        }
    }

    async loadAccountPage() {
        if (!auth.requireLogin()) {
            return;
        }

        try {
            // Carregar pedidos do usuário
            const ordersResponse = await api.getOrders();
            this.renderUserOrders(ordersResponse.data.orders);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            console.error('Erro ao carregar pedidos.');
        }
    }

    async loadAdminPage() {
        if (!auth.requirePermission('Vendedor')) {
            return;
        }

        try {
            // Carregar produtos para administração
            const productsResponse = await api.getProducts({ limit: 50 });
            this.renderAdminProducts(productsResponse.data.products);

            // Carregar pedidos se for admin
            if (auth.isAdmin()) {
                const ordersResponse = await api.getOrders({ limit: 20 });
                this.renderAdminOrders(ordersResponse.data.orders);
            }
        } catch (error) {
            console.error('Erro ao carregar página admin:', error);
            console.error('Erro ao carregar dados administrativos.');
        }
    }

    renderFeaturedProducts(products) {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhum produto em destaque encontrado.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        '📦'
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${Formatters.truncate(product.description || '', 80)}</p>
                    <div class="product-price">${Formatters.currency(product.price)}</div>
                    <div class="product-stock">Estoque: ${product.stock} unidades</div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small view-product" data-product-id="${product.id}">
                            Ver Detalhes
                        </button>
                        <button class="btn btn-success btn-small add-to-cart" data-product-id="${product.id}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderProducts(products) {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhum produto encontrado.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        '📦'
                    }
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${Formatters.truncate(product.description || '', 100)}</p>
                    <div class="product-price">${Formatters.currency(product.price)}</div>
                    <div class="product-stock">Estoque: ${product.stock} unidades</div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small view-product" data-product-id="${product.id}">
                            Ver Detalhes
                        </button>
                        <button class="btn btn-success btn-small add-to-cart" data-product-id="${product.id}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCategoryFilter(categories) {
        const container = document.getElementById('categoryFilter');
        if (!container) return;

        container.innerHTML = `
            <option value="">Todas as categorias</option>
            ${categories.map(category => `
                <option value="${category}">${category}</option>
            `).join('')}
        `;
    }

    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container || pagination.totalPages <= 1) return;

        let html = '<div class="pagination">';
        
        // Botão anterior
        if (pagination.hasPrev) {
            html += `<button class="btn btn-outline" onclick="app.loadProducts(${pagination.page - 1})">Anterior</button>`;
        }

        // Páginas
        for (let i = 1; i <= pagination.totalPages; i++) {
            if (i === pagination.page) {
                html += `<button class="btn btn-primary" disabled>${i}</button>`;
            } else {
                html += `<button class="btn btn-outline" onclick="app.loadProducts(${i})">${i}</button>`;
            }
        }

        // Botão próximo
        if (pagination.hasNext) {
            html += `<button class="btn btn-outline" onclick="app.loadProducts(${pagination.page + 1})">Próximo</button>`;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    renderUserOrders(orders) {
        const container = document.getElementById('userOrders');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p class="text-center">Você ainda não fez nenhum pedido.</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Data</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${Formatters.date(order.created_at)}</td>
                                <td>${Formatters.currency(order.total)}</td>
                                <td>
                                    <span class="status-badge status-${Formatters.status(order.status)}">
                                        ${order.status}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-primary btn-small" onclick="app.viewOrder(${order.id})">
                                        Ver Detalhes
                                    </button>
                                    ${['Aguardando Pagamento', 'Pago'].includes(order.status) ? `
                                        <button class="btn btn-danger btn-small cancel-order" data-order-id="${order.id}">
                                            Cancelar
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderAdminProducts(products) {
        const container = document.getElementById('adminProducts');
        if (!container) return;

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.id}</td>
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td>${Formatters.currency(product.price)}</td>
                                <td>${product.stock}</td>
                                <td>
                                    <span class="status-badge ${product.is_active ? 'status-pago' : 'status-cancelado'}">
                                        ${product.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-warning btn-small add-stock" data-product-id="${product.id}">
                                        Adicionar Estoque
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderAdminOrders(orders) {
        const container = document.getElementById('adminOrders');
        if (!container) return;

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${order.user_name}</td>
                                <td>${Formatters.date(order.created_at)}</td>
                                <td>${Formatters.currency(order.total)}</td>
                                <td>
                                    <span class="status-badge status-${Formatters.status(order.status)}">
                                        ${order.status}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-primary btn-small" onclick="app.viewOrder(${order.id})">
                                        Ver Detalhes
                                    </button>
                                    ${this.getStatusTransitionButtons(order.status, order.id)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    getStatusTransitionButtons(currentStatus, orderId) {
        const transitions = {
            'Aguardando Pagamento': ['Pago', 'Cancelado'],
            'Pago': ['Em Transporte', 'Cancelado'],
            'Em Transporte': ['Entregue'],
            'Entregue': [],
            'Cancelado': []
        };

        const validTransitions = transitions[currentStatus] || [];
        
        return validTransitions.map(status => `
            <button class="btn btn-success btn-small update-order-status" 
                    data-order-id="${orderId}" 
                    data-status="${status}">
                ${status}
            </button>
        `).join('');
    }

    renderAddresses(addresses) {
        const container = document.getElementById('addresses');
        if (!container) return;

        if (addresses.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhum endereço cadastrado.</p>';
            return;
        }

        container.innerHTML = addresses.map(address => `
            <div class="address-card">
                <input type="radio" name="address" value="${address.id}" id="address-${address.id}">
                <label for="address-${address.id}">
                    <strong>${address.type}</strong><br>
                    ${address.street}, ${address.number}<br>
                    ${address.complement ? address.complement + '<br>' : ''}
                    CEP: ${address.cep}
                </label>
            </div>
        `).join('');
    }

    // Event handlers
    handleSearch(e) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadProducts(1);
        }, 500);
    }

    handleCategoryFilter(e) {
        this.loadProducts(1);
    }

    handleSort(e) {
        this.loadProducts(1);
    }

    // Ações
    async addToCart(productId, quantity = 1) {
        try {
            const product = await api.getProduct(productId);
            cart.addItem(product.data, quantity);
            console.log(`${product.data.name} adicionado ao carrinho!`);
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            console.error('Erro ao adicionar produto ao carrinho.');
        }
    }

    viewProduct(productId) {
        window.location.href = `/product.html?id=${productId}`;
    }

    async viewOrder(orderId) {
        try {
            const order = await api.getOrder(orderId);
            this.showOrderModal(order.data);
        } catch (error) {
            console.error('Erro ao carregar pedido:', error);
            console.error('Erro ao carregar detalhes do pedido.');
        }
    }

    showOrderModal(order) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Pedido #${order.order.id}</h2>
                <div class="order-details">
                    <p><strong>Cliente:</strong> ${order.order.user_name}</p>
                    <p><strong>Data:</strong> ${Formatters.date(order.order.created_at)}</p>
                    <p><strong>Status:</strong> 
                        <span class="status-badge status-${Formatters.status(order.order.status)}">
                            ${order.order.status}
                        </span>
                    </p>
                    <p><strong>Total:</strong> ${Formatters.currency(order.order.total)}</p>
                    
                    <h3>Itens:</h3>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <strong>${item.product_name}</strong> - 
                                ${item.qty}x ${Formatters.currency(item.unit_price)} = 
                                ${Formatters.currency(item.qty * item.unit_price)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fechar modal
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    showAddStockModal(productId) {
        this.currentProductId = productId;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Adicionar Estoque</h2>
                <form id="addStockForm">
                    <div class="form-group">
                        <label for="stockAmount">Quantidade (múltiplos de 10):</label>
                        <select id="stockAmount" required>
                            <option value="">Selecione...</option>
                            <option value="10">10 unidades</option>
                            <option value="20">20 unidades</option>
                            <option value="30">30 unidades</option>
                            <option value="40">40 unidades</option>
                            <option value="50">50 unidades</option>
                            <option value="100">100 unidades</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Adicionar Estoque</button>
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Fechar modal
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };

        // Form submit
        modal.querySelector('#addStockForm').onsubmit = (e) => {
            e.preventDefault();
            this.confirmAddStock();
        };
    }

    async confirmAddStock() {
        const amount = parseInt(document.getElementById('stockAmount').value);
        
        if (!amount || amount % 10 !== 0) {
            console.error('Quantidade deve ser múltipla de 10.');
            return;
        }

        try {
            await api.addStock(this.currentProductId, amount);
            console.log(`Estoque adicionado com sucesso! (+${amount} unidades)`);
            
            // Fechar modal
            document.querySelector('.modal').remove();
            
            // Recarregar página admin
            if (this.currentPage === 'admin') {
                await this.loadAdminPage();
            }
        } catch (error) {
            console.error('Erro ao adicionar estoque:', error);
            console.error(error.message || 'Erro ao adicionar estoque.');
        }
    }

    async updateOrderStatus(orderId, status) {
        if (!confirm(`Deseja alterar o status do pedido #${orderId} para "${status}"?`)) {
            return;
        }

        try {
            await api.updateOrderStatus(orderId, status);
            console.log(`Status do pedido #${orderId} atualizado para "${status}".`);
            
            // Recarregar página admin
            if (this.currentPage === 'admin') {
                await this.loadAdminPage();
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            console.error(error.message || 'Erro ao atualizar status do pedido.');
        }
    }

    showCancelOrderModal(orderId) {
        this.currentOrderId = orderId;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Cancelar Pedido #${orderId}</h2>
                <form id="cancelOrderForm">
                    <div class="form-group">
                        <label for="cancelReason">Motivo do cancelamento:</label>
                        <textarea id="cancelReason" required placeholder="Digite o motivo do cancelamento..."></textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-danger">Cancelar Pedido</button>
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Voltar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Fechar modal
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };

        // Form submit
        modal.querySelector('#cancelOrderForm').onsubmit = (e) => {
            e.preventDefault();
            this.confirmCancelOrder();
        };
    }

    async confirmCancelOrder() {
        const reason = document.getElementById('cancelReason').value.trim();
        
        if (!reason) {
            console.error('Motivo do cancelamento é obrigatório.');
            return;
        }

        try {
            await api.cancelOrder(this.currentOrderId, reason);
            console.log(`Pedido #${this.currentOrderId} cancelado com sucesso.`);
            
            // Fechar modal
            document.querySelector('.modal').remove();
            
            // Recarregar página
            if (this.currentPage === 'account') {
                await this.loadAccountPage();
            } else if (this.currentPage === 'admin') {
                await this.loadAdminPage();
            }
        } catch (error) {
            console.error('Erro ao cancelar pedido:', error);
            console.error(error.message || 'Erro ao cancelar pedido.');
        }
    }
}

// Instância global do gerenciador da aplicação
const app = new AppManager();

// Funções globais para compatibilidade
function loadProducts(page) {
    app.loadProducts(page);
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há erros na URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');
    
    if (error) {
        console.error(decodeURIComponent(error));
    }
    
    if (success) {
        console.log(decodeURIComponent(success));
    }
});
