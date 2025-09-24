/**
 * Gerenciamento de Autenticação
 * Login, registro e controle de sessão
 */

class AuthManager {
    constructor() {
        this.user = this.getStoredUser();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    // Obter usuário armazenado
    getStoredUser() {
        try {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            return null;
        }
    }

    // Obter lista de usuários armazenados (para validação de email duplicado)
    getStoredUsers() {
        try {
            const users = localStorage.getItem('registered_users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Erro ao carregar lista de usuários:', error);
            return [];
        }
    }

    // Armazenar novo usuário na lista
    storeUser(userData) {
        try {
            const users = this.getStoredUsers();
            users.push({
                id: Date.now(), // ID temporário
                name: userData.name,
                email: userData.email,
                role: userData.role,
                created_at: new Date().toISOString()
            });
            localStorage.setItem('registered_users', JSON.stringify(users));
        } catch (error) {
            console.error('Erro ao armazenar usuário:', error);
        }
    }

    // Verificar status de autenticação
    async checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.updateUIForGuest();
            return;
        }

        try {
            // Verificar se token ainda é válido
            await api.refreshToken();
            this.updateUIForUser();
        } catch (error) {
            console.error('Token inválido:', error);
            this.logout();
        }
    }

    // Login
    async login(email, password) {
        try {
            ui.showLoadingOverlay('Fazendo login...');
            
            const response = await api.login(email, password);
            this.user = response.data.user;
            
            this.updateUIForUser();
            ui.showToast(`Bem-vindo, ${this.user.name}!`, 'success');
            
            // Fechar modal de login
            ui.closeModal('loginModal');
            
            return response;
        } catch (error) {
            ui.showToast(error.message, 'error');
            throw error;
        } finally {
            ui.hideLoadingOverlay();
        }
    }

    // Registro
    async register(userData) {
        try {
            ui.showLoadingOverlay('Criando conta...');
            
            // Validar email duplicado localmente
            const existingUsers = this.getStoredUsers();
            if (existingUsers.some(user => user.email === userData.email)) {
                throw new Error('Este email já está cadastrado');
            }
            
            const response = await api.register(userData);
            
            // Armazenar usuário localmente para validação futura
            this.storeUser(userData);
            
            ui.showToast('Conta criada com sucesso! Faça login para continuar.', 'success');
            ui.closeModal('registerModal');
            ui.showModal('loginModal');
            
            return response;
        } catch (error) {
            ui.showToast(error.message, 'error');
            throw error;
        } finally {
            ui.hideLoadingOverlay();
        }
    }

    // Logout
    async logout() {
        try {
            await api.logout();
            this.user = null;
            this.updateUIForGuest();
            ui.showToast('Logout realizado com sucesso', 'info');
            
            // Redirecionar para home se estiver em página protegida
            if (this.isProtectedPage()) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }

    // Verificar se página é protegida
    isProtectedPage() {
        const protectedPages = ['/account.html', '/admin.html'];
        return protectedPages.some(page => window.location.pathname.includes(page));
    }

    // Atualizar UI para usuário logado
    updateUIForUser() {
        // Mostrar/ocultar elementos baseado no status de login
        const guestElements = document.querySelectorAll('.guest-only');
        const userElements = document.querySelectorAll('.user-only');
        const adminElements = document.querySelectorAll('.admin-only');

        guestElements.forEach(el => el.style.display = 'none');
        userElements.forEach(el => el.style.display = 'block');

        // Mostrar elementos de admin se usuário for admin
        if (this.user && this.user.role === 'Admin') {
            adminElements.forEach(el => el.style.display = 'block');
        } else {
            adminElements.forEach(el => el.style.display = 'none');
        }

        // Atualizar nome do usuário
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = this.user ? this.user.name : '';
        });

        // Atualizar botões de login/logout
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';

        // Atualizar link do admin
        const adminLink = document.getElementById('adminLink');
        if (adminLink && this.user && this.user.role === 'Admin') {
            adminLink.style.display = 'block';
        }
    }

    // Atualizar UI para visitante
    updateUIForGuest() {
        const guestElements = document.querySelectorAll('.guest-only');
        const userElements = document.querySelectorAll('.user-only');
        const adminElements = document.querySelectorAll('.admin-only');

        guestElements.forEach(el => el.style.display = 'block');
        userElements.forEach(el => el.style.display = 'none');
        adminElements.forEach(el => el.style.display = 'none');

        // Atualizar botões de login/logout
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';

        // Ocultar link do admin
        const adminLink = document.getElementById('adminLink');
        if (adminLink) adminLink.style.display = 'none';
    }

    // Verificar se usuário está logado
    isLoggedIn() {
        return this.user !== null;
    }

    // Verificar se usuário é admin
    isAdmin() {
        return this.user && this.user.role === 'Admin';
    }

    // Verificar se usuário é operador
    isOperator() {
        return this.user && (this.user.role === 'Admin' || this.user.role === 'Vendedor');
    }

    // Requerer login
    requireLogin() {
        if (!this.isLoggedIn()) {
            ui.showToast('Faça login para acessar esta funcionalidade', 'warning');
            ui.showModal('loginModal');
            return false;
        }
        return true;
    }

    // Requerer permissão de admin
    requireAdmin() {
        if (!this.requireLogin()) return false;
        
        if (!this.isAdmin()) {
            ui.showToast('Acesso negado. Apenas administradores podem acessar esta funcionalidade.', 'error');
            return false;
        }
        return true;
    }

    // Requerer permissão de operador
    requireOperator() {
        if (!this.requireLogin()) return false;
        
        if (!this.isOperator()) {
            ui.showToast('Acesso negado. Apenas operadores podem acessar esta funcionalidade.', 'error');
            return false;
        }
        return true;
    }

    // Event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                if (!email || !password) {
                    ui.showToast('Preencha todos os campos', 'warning');
                    return;
                }
                
                try {
                    await this.login(email, password);
                } catch (error) {
                    // Erro já tratado no método login
                }
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(registerForm);
                const userData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    role: formData.get('role') || 'Cliente'
                };
                
                if (!ui.validateForm(registerForm)) {
                    return;
                }
                
                try {
                    await this.register(userData);
                } catch (error) {
                    // Erro já tratado no método register
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Botões de login/registro
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                ui.showModal('loginModal');
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                ui.showModal('registerModal');
            });
        }

        // Links para trocar entre login e registro
        const showRegisterLink = document.getElementById('showRegister');
        const showLoginLink = document.getElementById('showLogin');

        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                ui.closeModal('loginModal');
                ui.showModal('registerModal');
            });
        }

        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                ui.closeModal('registerModal');
                ui.showModal('loginModal');
            });
        }
    }

    // Validação de senha
    validatePassword(password) {
        const minLength = 10;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return 'Senha deve ter pelo menos 10 caracteres';
        }
        if (!hasLetter) {
            return 'Senha deve conter pelo menos uma letra';
        }
        if (!hasNumber) {
            return 'Senha deve conter pelo menos um número';
        }
        if (!hasSpecial) {
            return 'Senha deve conter pelo menos um caractere especial';
        }

        return null;
    }

    // Redefinir senha
    async forgotPassword(email) {
        try {
            ui.showLoadingOverlay('Enviando email...');
            
            const response = await api.request('/auth/forgot', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            
            ui.showToast('Email de redefinição enviado!', 'success');
            return response;
        } catch (error) {
            ui.showToast(error.message, 'error');
            throw error;
        } finally {
            ui.hideLoadingOverlay();
        }
    }

    // Resetar senha
    async resetPassword(token, newPassword) {
        try {
            ui.showLoadingOverlay('Redefinindo senha...');
            
            const response = await api.request('/auth/reset', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword })
            });
            
            ui.showToast('Senha redefinida com sucesso!', 'success');
            return response;
        } catch (error) {
            ui.showToast(error.message, 'error');
            throw error;
        } finally {
            ui.hideLoadingOverlay();
        }
    }
}

// Instância global do gerenciador de autenticação
window.auth = new AuthManager();