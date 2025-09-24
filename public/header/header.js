/**
 * Header E2E-Commerce - JavaScript Modular
 * Funcionalidades: busca, carrinho, mega-menu, mobile, acessibilidade
 */

// Módulo principal do header
class HeaderManager {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            // Inicializar módulos
            this.modules.search = new SearchAutocomplete();
            this.modules.minicart = new Minicart();
            this.modules.megaMenu = new MegaMenu();
            this.modules.mobileDrawer = new MobileDrawer();
            this.modules.accessibility = new Accessibility();
            this.modules.sticky = new StickyHeader();
            
            // Configurar event listeners globais
            this.setupGlobalEvents();
            
            // Inicializar funcionalidades
            await this.initializeModules();
            
            // Inicializar dropdown do usuário
            this.updateUserDropdown();
            
            this.isInitialized = true;
            console.log('Header initialized successfully');
            console.log('Header object:', this);
            
        } catch (error) {
            console.error('Error initializing header:', error);
        }
    }

    async initializeModules() {
        // Inicializar cada módulo
        for (const [name, module] of Object.entries(this.modules)) {
            if (typeof module.init === 'function') {
                await module.init();
            }
        }
    }

    setupGlobalEvents() {
        // Atalhos de teclado globais
        document.addEventListener('keydown', (e) => {
            // Focar na busca com /
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.modules.search.focus();
            }
            
            // Abrir carrinho com c
            if (e.key === 'c' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.modules.minicart.show();
            }
            
            // Abrir login com u
            if (e.key === 'u' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.showLoginModal();
            }
            
            // Fechar dropdowns com Esc
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });

        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cart-wrapper, .user-wrapper, .mega-menu-trigger')) {
                this.closeAllDropdowns();
            }
        });

        // Toggle do dropdown do usuário
        const userToggle = document.querySelector('.user-toggle');
        if (userToggle) {
            userToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('userDropdown');
                if (dropdown) {
                    dropdown.classList.toggle('active');
                }
            });
        }

        // Formulários de login e registro
        this.setupAuthForms();

        // Analytics tracking
        this.setupAnalytics();
    }

    closeAllDropdowns() {
        this.modules.minicart.hide();
        this.modules.megaMenu.hide();
        this.modules.mobileDrawer.hide();
        this.hideUserDropdown();
    }

    showLoginModal() {
        console.log('showLoginModal called');
        const modal = document.getElementById('loginModal');
        console.log('Modal element:', modal);
        
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('Modal opened successfully');
            
            // Focar no primeiro campo
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) {
                setTimeout(() => emailInput.focus(), 100);
            }
            
            this.trackEvent('header_interaction', 'login_modal_opened');
        } else {
            console.error('Modal element not found');
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    hideUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    updateUserDropdown() {
        const userContent = document.getElementById('userContent');
        if (!userContent) return;

        // Verificar se usuário está logado
        const userData = localStorage.getItem('user_data');
        const isLoggedIn = userData !== null;
        
        if (isLoggedIn) {
            try {
                const user = JSON.parse(userData);
                userContent.innerHTML = `
                    <div class="user-info">
                        <h4>Olá, ${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                    <ul class="user-menu">
                        <li><a href="/account.html">👤 Minha Conta</a></li>
                        <li><a href="/orders.html">📦 Meus Pedidos</a></li>
                        <li><a href="/favorites.html">❤️ Favoritos</a></li>
                        <li><a href="/settings.html">⚙️ Configurações</a></li>
                        ${user.role === 'Admin' ? '<li><a href="/admin.html">🔧 Painel Admin</a></li>' : ''}
                        <li><hr></li>
                        <li><a href="#" onclick="header.logout()">🚪 Sair</a></li>
                    </ul>
                `;
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.showGuestUserDropdown();
            }
        } else {
            this.showGuestUserDropdown();
        }
    }

    showGuestUserDropdown() {
        const userContent = document.getElementById('userContent');
        if (!userContent) return;

        userContent.innerHTML = `
            <div class="user-info">
                <h4>Faça login</h4>
                <p>Para acessar sua conta</p>
            </div>
            <ul class="user-menu">
                <li><a href="#" id="loginLink">🔑 Entrar</a></li>
                <li><a href="#" id="registerLink">📝 Cadastrar</a></li>
                <li><hr></li>
                <li><a href="/help.html">❓ Ajuda</a></li>
            </ul>
        `;

        // Adicionar event listeners diretamente
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }
        
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterModal();
            });
        }
    }

    logout() {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        this.updateUserDropdown();
        window.location.reload();
    }

    showRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focar no primeiro campo
            const nameInput = document.getElementById('registerName');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
            
            this.trackEvent('header_interaction', 'register_modal_opened');
        }
    }

    closeRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupAuthForms() {
        // Formulário de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        // Formulário de registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister();
            });
        }

        // Fechar modais ao clicar fora
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeLoginModal();
                this.closeRegisterModal();
            }
        });

        // Fechar modais com Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLoginModal();
                this.closeRegisterModal();
            }
        });

        // Links para trocar entre modais
        const showRegisterFromLogin = document.getElementById('showRegisterFromLogin');
        const showLoginFromRegister = document.getElementById('showLoginFromRegister');
        
        if (showRegisterFromLogin) {
            showRegisterFromLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeLoginModal();
                this.showRegisterModal();
            });
        }
        
        if (showLoginFromRegister) {
            showLoginFromRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeRegisterModal();
                this.showLoginModal();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showMessage('Preencha todos os campos', 'error');
            return;
        }

        try {
            // Simular login (substituir por chamada real da API)
            const response = await this.mockLogin(email, password);
            
            if (response.success) {
                // Salvar dados do usuário
                localStorage.setItem('user_data', JSON.stringify(response.user));
                localStorage.setItem('auth_token', response.token);
                
                this.showMessage('Login realizado com sucesso!', 'success');
                this.closeLoginModal();
                this.updateUserDropdown();
                
                // Limpar formulário
                document.getElementById('loginForm').reset();
            } else {
                this.showMessage(response.message || 'Erro no login', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Erro ao fazer login. Tente novamente.', 'error');
        }
    }

    async handleRegister() {
        const formData = new FormData(document.getElementById('registerForm'));
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role') || 'Cliente'
        };

        if (!userData.name || !userData.email || !userData.password) {
            this.showMessage('Preencha todos os campos', 'error');
            return;
        }

        // Validar senha
        if (userData.password.length < 10) {
            this.showMessage('A senha deve ter pelo menos 10 caracteres', 'error');
            return;
        }

        try {
            // Simular registro (substituir por chamada real da API)
            const response = await this.mockRegister(userData);
            
            if (response.success) {
                this.showMessage('Conta criada com sucesso! Faça login para continuar.', 'success');
                this.closeRegisterModal();
                this.showLoginModal();
                
                // Limpar formulário
                document.getElementById('registerForm').reset();
            } else {
                this.showMessage(response.message || 'Erro no cadastro', 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showMessage('Erro ao criar conta. Tente novamente.', 'error');
        }
    }

    // Funções mock para simular API (substituir por chamadas reais)
    async mockLogin(email, password) {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock de usuários válidos
        const validUsers = [
            { email: 'admin@test.com', password: 'admin123456', name: 'Admin User', role: 'Admin' },
            { email: 'cliente@test.com', password: 'cliente123456', name: 'Cliente Test', role: 'Cliente' },
            { email: 'vendedor@test.com', password: 'vendedor123456', name: 'Vendedor Test', role: 'Vendedor' }
        ];

        const user = validUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            return {
                success: true,
                user: { id: 1, name: user.name, email: user.email, role: user.role },
                token: 'mock-jwt-token-' + Date.now()
            };
        } else {
            return {
                success: false,
                message: 'Email ou senha incorretos'
            };
        }
    }

    async mockRegister(userData) {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular validação de email único
        const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const emailExists = existingUsers.some(u => u.email === userData.email);
        
        if (emailExists) {
            return {
                success: false,
                message: 'Este email já está cadastrado'
            };
        }

        // Salvar usuário mock
        const newUser = { ...userData, id: Date.now() };
        existingUsers.push(newUser);
        localStorage.setItem('registered_users', JSON.stringify(existingUsers));

        return {
            success: true,
            message: 'Conta criada com sucesso'
        };
    }

    showMessage(message, type = 'info') {
        // Criar elemento de mensagem
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        // Cores baseadas no tipo
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(messageEl);

        // Remover após 3 segundos
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    setupAnalytics() {
        // Expor função global para analytics
        window.dataLayer = window.dataLayer || [];
        window.trackHeaderEvent = (action, data = {}) => {
            this.trackEvent('header_interaction', action, data);
        };
    }

    trackEvent(category, action, data = {}) {
        const event = {
            event: category,
            action: action,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        if (window.dataLayer) {
            window.dataLayer.push(event);
        } else {
            console.log('Analytics event:', event);
        }
    }
}

// Módulo de busca com autocomplete
class SearchAutocomplete {
    constructor() {
        this.input = null;
        this.suggestions = null;
        this.debounceTimer = null;
        this.isVisible = false;
        this.currentQuery = '';
    }

    async init() {
        this.input = document.getElementById('searchInput');
        this.suggestions = document.getElementById('searchSuggestions');
        
        if (!this.input || !this.suggestions) return;

        this.setupEventListeners();
        this.loadMockData();
    }

    setupEventListeners() {
        // Input com debounce
        this.input.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        // Foco
        this.input.addEventListener('focus', () => {
            if (this.currentQuery) {
                this.showSuggestions();
            }
        });

        // Clique fora para fechar
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-search')) {
                this.hideSuggestions();
            }
        });

        // Navegação por teclado
        this.input.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Form submit
        const form = this.input.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    handleInput(query) {
        clearTimeout(this.debounceTimer);
        
        this.currentQuery = query.trim();
        
        if (this.currentQuery.length < 2) {
            this.hideSuggestions();
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.searchProducts(this.currentQuery);
        }, 250);
    }

    async searchProducts(query) {
        try {
            // Simular loading
            this.showLoading();
            
            // Buscar produtos (mock ou API real)
            const results = await this.fetchSuggestions(query);
            
            this.displaySuggestions(results);
            this.showSuggestions();
            
        } catch (error) {
            console.error('Search error:', error);
            this.hideSuggestions();
        }
    }

    async fetchSuggestions(query) {
        // Mock data para demonstração
        const mockProducts = [
            {
                id: 1,
                name: 'Smartphone Samsung Galaxy S23',
                price: 2999.99,
                image: 'https://picsum.photos/40/40?random=1',
                category: 'Smartphones'
            },
            {
                id: 2,
                name: 'Notebook Dell Inspiron 15',
                price: 2499.99,
                image: 'https://picsum.photos/40/40?random=2',
                category: 'Notebooks'
            },
            {
                id: 3,
                name: 'Tablet iPad Air',
                price: 3999.99,
                image: 'https://picsum.photos/40/40?random=3',
                category: 'Tablets'
            },
            {
                id: 4,
                name: 'Fone de Ouvido Bluetooth',
                price: 199.99,
                image: 'https://picsum.photos/40/40?random=4',
                category: 'Acessórios'
            },
            {
                id: 5,
                name: 'Smartwatch Apple Watch',
                price: 1999.99,
                image: 'https://picsum.photos/40/40?random=5',
                category: 'Acessórios'
            }
        ];

        // Filtrar produtos baseado na query
        return mockProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }

    displaySuggestions(products) {
        if (!products.length) {
            this.suggestions.innerHTML = `
                <div class="suggestion-item">
                    <span>Nenhum produto encontrado</span>
                </div>
            `;
            return;
        }

        this.suggestions.innerHTML = products.map(product => `
            <a href="/product.html?id=${product.id}" class="suggestion-item">
                <img src="${product.image}" alt="${product.name}" class="suggestion-image" loading="lazy">
                <div class="suggestion-info">
                    <div class="suggestion-name">${product.name}</div>
                    <div class="suggestion-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                    <div class="suggestion-category">${product.category}</div>
                </div>
            </a>
        `).join('');
    }

    showLoading() {
        this.suggestions.innerHTML = `
            <div class="suggestion-item">
                <div class="suggestion-info">
                    <div class="suggestion-name">Buscando...</div>
                </div>
            </div>
        `;
    }

    showSuggestions() {
        this.suggestions.classList.add('active');
        this.isVisible = true;
        this.input.setAttribute('aria-expanded', 'true');
    }

    hideSuggestions() {
        this.suggestions.classList.remove('active');
        this.isVisible = false;
        this.input.setAttribute('aria-expanded', 'false');
    }

    handleKeydown(e) {
        const items = this.suggestions.querySelectorAll('.suggestion-item');
        const currentIndex = Array.from(items).findIndex(item => 
            item === document.activeElement
        );

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                items[nextIndex]?.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                items[prevIndex]?.focus();
                break;
            case 'Enter':
                if (currentIndex >= 0) {
                    e.preventDefault();
                    items[currentIndex].click();
                } else {
                    this.handleSubmit();
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                this.input.blur();
                break;
        }
    }

    handleSubmit() {
        if (this.currentQuery) {
            window.location.href = `/products.html?q=${encodeURIComponent(this.currentQuery)}`;
        }
    }

    focus() {
        this.input?.focus();
    }
}

// Módulo do minicart
class Minicart {
    constructor() {
        this.dropdown = null;
        this.toggle = null;
        this.items = [];
        this.isVisible = false;
    }

    async init() {
        this.dropdown = document.getElementById('cartDropdown');
        this.toggle = document.querySelector('.cart-toggle');
        
        if (!this.dropdown || !this.toggle) return;

        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Toggle dropdown
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Fechar dropdown
        const closeBtn = this.dropdown.querySelector('.cart-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Atualizar quando carrinho mudar
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart_items') {
                this.loadFromStorage();
                this.updateUI();
            }
        });

        // Escutar eventos customizados do carrinho
        window.addEventListener('cartUpdated', () => {
            this.loadFromStorage();
            this.updateUI();
        });
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('cart_items');
            this.items = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.items = [];
        }
    }

    updateUI() {
        this.updateCount();
        this.updateDropdown();
    }

    updateCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        const countElement = document.getElementById('cartCount');
        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'block' : 'none';
        }
    }

    updateDropdown() {
        const itemsContainer = document.getElementById('cartItems');
        const totalElement = document.getElementById('cartTotal');
        
        if (!itemsContainer || !totalElement) return;

        if (this.items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="cart-item">
                    <div class="suggestion-info">
                        <div class="suggestion-name">Carrinho vazio</div>
                    </div>
                </div>
            `;
            totalElement.textContent = 'R$ 0,00';
            return;
        }

        // Mostrar últimos 3 itens
        const recentItems = this.items.slice(0, 3);
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        itemsContainer.innerHTML = recentItems.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                </div>
                <button class="cart-item-remove" onclick="header.modules.minicart.removeItem(${item.id})" title="Remover item">
                    ×
                </button>
            </div>
        `).join('');

        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    toggleDropdown() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.dropdown.classList.add('active');
        this.isVisible = true;
        this.toggle.setAttribute('aria-expanded', 'true');
        
        // Animar badge
        const badge = this.toggle.querySelector('.action-badge');
        if (badge) {
            badge.classList.add('animate-bounce');
            setTimeout(() => badge.classList.remove('animate-bounce'), 600);
        }
    }

    hide() {
        this.dropdown.classList.remove('active');
        this.isVisible = false;
        this.toggle.setAttribute('aria-expanded', 'false');
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image_url || 'https://picsum.photos/50/50?random=' + product.id,
                quantity: quantity
            });
        }

        this.saveToStorage();
        this.updateUI();
        this.show();
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateUI();
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    saveToStorage() {
        try {
            localStorage.setItem('cart_items', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }
}

// Módulo do mega menu
class MegaMenu {
    constructor() {
        this.menu = null;
        this.trigger = null;
        this.isVisible = false;
    }

    async init() {
        this.menu = document.getElementById('megaMenu');
        this.trigger = document.querySelector('.mega-menu-button');
        
        if (!this.menu || !this.trigger) return;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Hover para desktop
        this.trigger.addEventListener('mouseenter', () => {
            this.show();
        });

        this.trigger.addEventListener('mouseleave', () => {
            // Delay para permitir hover no menu
            setTimeout(() => {
                if (!this.menu.matches(':hover')) {
                    this.hide();
                }
            }, 100);
        });

        this.menu.addEventListener('mouseleave', () => {
            this.hide();
        });

        // Click para mobile
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // Fechar com Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    show() {
        this.menu.classList.add('active');
        this.isVisible = true;
        this.trigger.setAttribute('aria-expanded', 'true');
    }

    hide() {
        this.menu.classList.remove('active');
        this.isVisible = false;
        this.trigger.setAttribute('aria-expanded', 'false');
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// Módulo do drawer mobile
class MobileDrawer {
    constructor() {
        this.drawer = null;
        this.toggle = null;
        this.isVisible = false;
    }

    async init() {
        this.drawer = document.getElementById('mobileMenu');
        this.toggle = document.querySelector('.mobile-menu-toggle');
        
        if (!this.drawer || !this.toggle) return;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle drawer
        this.toggle.addEventListener('click', () => {
            this.toggleDrawer();
        });

        // Fechar drawer
        const closeBtn = this.drawer.querySelector('.mobile-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Submenu toggles
        const submenuToggles = this.drawer.querySelectorAll('.mobile-submenu-toggle');
        submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const submenu = toggle.nextElementSibling;
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                
                toggle.setAttribute('aria-expanded', !isExpanded);
                submenu.classList.toggle('active');
            });
        });

        // Fechar com Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Fechar ao clicar no overlay
        this.drawer.addEventListener('click', (e) => {
            if (e.target === this.drawer) {
                this.hide();
            }
        });
    }

    toggleDrawer() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.drawer.classList.add('active');
        this.toggle.classList.add('active');
        this.isVisible = true;
        this.toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro link
        const firstLink = this.drawer.querySelector('.mobile-nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    hide() {
        this.drawer.classList.remove('active');
        this.toggle.classList.remove('active');
        this.isVisible = false;
        this.toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// Módulo de acessibilidade
class Accessibility {
    constructor() {
        this.focusTrap = null;
        this.previousFocus = null;
    }

    async init() {
        this.setupFocusManagement();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
    }

    setupFocusManagement() {
        // Gerenciar foco em modais e dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    setupKeyboardNavigation() {
        // Navegação por teclado no header
        const header = document.querySelector('.header');
        if (header) {
            header.addEventListener('keydown', (e) => {
                this.handleHeaderNavigation(e);
            });
        }
    }

    setupScreenReaderSupport() {
        // Anúncios para screen readers
        this.createLiveRegion();
    }

    handleTabNavigation(e) {
        const activeElement = document.activeElement;
        const modal = activeElement.closest('.mobile-menu, .cart-dropdown, .user-dropdown');
        
        if (modal) {
            this.trapFocus(e, modal);
        }
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    handleHeaderNavigation(e) {
        // Implementar navegação específica do header
    }

    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);
        
        // Expor função para anúncios
        window.announceToScreenReader = (message) => {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };
    }
}

// Módulo de header sticky
class StickyHeader {
    constructor() {
        this.header = null;
        this.lastScrollY = 0;
        this.isHidden = false;
    }

    async init() {
        this.header = document.getElementById('mainHeader');
        if (!this.header) return;

        this.setupScrollListener();
    }

    setupScrollListener() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateHeader();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateHeader() {
        const currentScrollY = window.scrollY;
        
        // Opcional: esconder header ao rolar para baixo
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            if (!this.isHidden) {
                this.header.classList.add('hidden');
                this.isHidden = true;
            }
        } else {
            if (this.isHidden) {
                this.header.classList.remove('hidden');
                this.isHidden = false;
            }
        }
        
        this.lastScrollY = currentScrollY;
    }
}

// Inicializar header quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.header = new HeaderManager();
});

// Exportar para uso global
window.HeaderManager = HeaderManager;
window.SearchAutocomplete = SearchAutocomplete;
window.Minicart = Minicart;
window.MegaMenu = MegaMenu;
window.MobileDrawer = MobileDrawer;
window.Accessibility = Accessibility;
window.StickyHeader = StickyHeader;
