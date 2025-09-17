// E-Commerce Brasil - JavaScript Functions
document.addEventListener('DOMContentLoaded', function() {
    
    // Cart functionality - Initialize from localStorage first
    const cartCountElement = document.querySelector('.cart-count');
    const savedCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    let cartCount = savedCartItems.length;
    
    // Helpers de cupom (novo)
    function getAppliedCoupon() {
        try {
            const raw = localStorage.getItem('appliedCoupon');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function calculateCouponDiscount(subtotal, coupon) {
        if (!coupon) return 0;
        // Suporta cupom percentual (ex.: { type: 'percent', value: 10 }) e fixo ({ type: 'fixed', value: 100 })
        if (coupon.type === 'percent') {
            return Math.max(0, Math.min(subtotal, (subtotal * (coupon.value || 0)) / 100));
        }
        if (coupon.type === 'fixed') {
            return Math.max(0, Math.min(subtotal, coupon.value || 0));
        }
        return 0;
    }
    
    // Update cart display on all pages
    function updateCartDisplay() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = cartCount;
        });
        
        // Update cart total if on cart page
        if (window.location.pathname.includes('cart.html')) {
            updateCartTotal();
            renderCartItems();
        }
    }
    
    // Render cart items dynamically
    function renderCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartSummary = document.querySelector('.cart-summary');
        const itemCountElement = document.querySelector('.item-count');
        
        if (!cartItemsContainer) return;
    
        // Garantir IDs e quantidades válidas antes de renderizar
        ensureCartItemIds();
    
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>Seu carrinho está vazio</h3>
                    <p>Adicione produtos para começar suas compras!</p>
                    <a href="products.html" class="btn btn-primary">Continuar Comprando</a>
                </div>
            `;
            if (itemCountElement) itemCountElement.textContent = '0 itens';
            return;
        }
        
        cartItemsContainer.innerHTML = cartItems.map((item, index) => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image || 'https://via.placeholder.com/120x120/FF6B6B/FFFFFF?text=Produto'}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3 class="item-title">${item.name}</h3>
                    <div class="item-specs">
                        <span>Produto</span>
                    </div>
                    <div class="item-rating">
                        <div class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                        <span class="rating-count">(${Math.floor(Math.random() * 1000) + 100})</span>
                    </div>
                    <div class="item-price">
                        <span class="current-price">${item.price}</span>
                    </div>
                    <div class="item-shipping">
                        <i class="fas fa-truck"></i>
                        <span>Frete grátis</span>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-item-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity || 1}" min="1" max="10" class="quantity-input" data-item-id="${item.id}">
                        <button class="quantity-btn plus" data-item-id="${item.id}">+</button>
                    </div>
                    <div class="item-total">
                        <span class="total-label">Subtotal:</span>
                        <span class="total-value">${formatPrice(parsePrice(item.price) * (item.quantity || 1))}</span>
                    </div>
                    <div class="item-buttons">
                        <button class="btn btn-outline btn-save" data-item-id="${item.id}">
                            <i class="far fa-heart"></i>
                            Salvar para depois
                        </button>
                        <button class="btn btn-outline btn-remove" data-item-id="${item.id}">
                            <i class="fas fa-trash"></i>
                            Remover
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Update item count
        if (itemCountElement) {
            itemCountElement.textContent = `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'itens'}`;
        }
        
        // Add event listeners for cart actions
        addCartEventListeners();
    }
    
    // Add event listeners for cart functionality
    function addCartEventListeners() {
        // Remove item buttons
        document.querySelectorAll('.btn-remove').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.itemId || this.closest('.cart-item')?.dataset.itemId;
                if (itemId !== undefined && itemId !== null) {
                    removeFromCart(itemId);
                }
            });
        });
        
        // Quantity controls
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.itemId || this.closest('.cart-item')?.dataset.itemId;
                const isPlus = this.classList.contains('plus');
                updateQuantity(itemId, isPlus);
            });
        });
        
        // Quantity input changes
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const itemId = this.dataset.itemId || this.closest('.cart-item')?.dataset.itemId;
                const newQuantity = parseInt(this.value);
                setQuantity(itemId, newQuantity);
            });
        });
    
        // Botão "Finalizar Compra" (cart.html) → vai para checkout.html
        const checkoutBtn = document.querySelector('.btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                if (!cartItems.length) {
                    showNotification('Seu carrinho está vazio.', 'error');
                    return;
                }
    
                // Garante que os totais estejam atualizados antes de seguir
                updateCartTotal();
                window.location.href = 'checkout.html';
            });
        }
    
        // Botão "Aplicar Cupom" (ajustado para persistir cupom válido)
        const couponBtn = document.querySelector('.coupon-btn');
        if (couponBtn) {
            couponBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const couponField = document.querySelector('.coupon-field');
                const couponCode = couponField?.value.trim();

                if (!couponCode) {
                    showNotification('Digite um código de cupom válido.', 'error');
                    return;
                }

                // Validação simples de exemplo
                if (couponCode.toLowerCase() === 'desconto10') {
                    const appliedCoupon = { code: couponCode, type: 'percent', value: 10 };
                    localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
                    showNotification('Cupom aplicado com sucesso! 10% de desconto.', 'success');
                    updateCartTotal(); // recalc com desconto
                } else {
                    localStorage.removeItem('appliedCoupon');
                    showNotification('Cupom inválido ou expirado.', 'error');
                    updateCartTotal(); // garante remoção do desconto
                }
            });
        }
    
        // Botão "Continuar Comprando"
        const continueBtn = document.querySelector('.btn-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'products.html';
            });
        }
    }
    
    // Remove item from cart
    function removeFromCart(itemId) {
        let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const target = String(itemId);
        cartItems = cartItems.filter(item => String(item.id) !== target);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        cartCount = cartItems.length;
        updateCartDisplay();
        showNotification('Item removido do carrinho!', 'success');
    }
    
    // Update quantity
    function updateQuantity(itemId, increase) {
        let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const itemIndex = cartItems.findIndex(item => String(item.id) === String(itemId));
        
        if (itemIndex !== -1) {
            const currentQuantity = cartItems[itemIndex].quantity || 1;
            const newQuantity = increase ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
            cartItems[itemIndex].quantity = newQuantity;
            
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            updateCartDisplay();
        }
    }
    
    // Set specific quantity
    function setQuantity(itemId, quantity) {
        if (quantity < 1) quantity = 1;
        if (quantity > 10) quantity = 10;
        
        let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const itemIndex = cartItems.findIndex(item => String(item.id) === String(itemId));
        
        if (itemIndex !== -1) {
            cartItems[itemIndex].quantity = quantity;
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            updateCartDisplay();
        }
    }

    // Garante que todos os itens tenham id e quantity válidos
    function ensureCartItemIds() {
        let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        let changed = false;
        const now = Date.now();
        
        cartItems = cartItems.map((item, idx) => {
            // id ausente, nulo, vazio ou string "undefined"
            if (item.id === undefined || item.id === null || item.id === '' || String(item.id) === 'undefined') {
                item.id = `${now}-${idx}-${Math.floor(Math.random() * 100000)}`;
                changed = true;
            }
            if (item.quantity === undefined || item.quantity === null || Number.isNaN(Number(item.quantity))) {
                item.quantity = 1;
                changed = true;
            }
            return item;
        });
    
        if (changed) {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }
    }
    
    // Recalcula e atualiza subtotal, frete e total no carrinho
    function updateCartTotal() {
        const savedCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        let subtotal = 0;
        let quantityCount = 0;
        const distinctCount = savedCartItems.length;

        savedCartItems.forEach(item => {
            const price = parsePrice(item.price);
            const quantity = item.quantity || 1;
            subtotal += price * quantity;
            quantityCount += quantity;
        });

        const SHIPPING_THRESHOLD = 399;
        const SHIPPING_FIXED = 100;
        const shipping = (subtotal === 0 || subtotal >= SHIPPING_THRESHOLD) ? 0 : SHIPPING_FIXED;

        // Novo: calcula desconto com base no cupom salvo
        const appliedCoupon = getAppliedCoupon();
        const discount = calculateCouponDiscount(subtotal, appliedCoupon);

        const grandTotal = subtotal + shipping - discount;

        // Atualiza total exibido no cabeçalho do carrinho
        const totalElements = document.querySelectorAll('.total-price');
        totalElements.forEach(element => {
            element.textContent = `Total: ${formatPrice(grandTotal)}`;
        });

        // Atualiza contagem de itens distinta no header do carrinho
        const headerItemCountEl = document.querySelector('.item-count');
        if (headerItemCountEl) {
            headerItemCountEl.textContent = `${distinctCount} ${distinctCount === 1 ? 'item' : 'itens'}`;
        }

        // Atualiza o “Resumo do Pedido”
        const summarySubtotalItemsEl = document.querySelector('.summary-subtotal-items');
        const summarySubtotalAmountEl = document.querySelector('.summary-subtotal-amount');
        const summaryShippingAmountEl = document.querySelector('.summary-shipping-amount');
        const summaryDiscountAmountEl = document.querySelector('.summary-discount-amount');
        const summaryTotalAmountEl = document.querySelector('.summary-total-amount');

        if (summarySubtotalItemsEl) summarySubtotalItemsEl.textContent = quantityCount;
        if (summarySubtotalAmountEl) summarySubtotalAmountEl.textContent = formatPrice(subtotal);
        if (summaryShippingAmountEl) {
            summaryShippingAmountEl.textContent = shipping === 0 ? 'Grátis' : formatPrice(shipping);
            summaryShippingAmountEl.classList.toggle('free-shipping', shipping === 0);
        }
        if (summaryDiscountAmountEl) summaryDiscountAmountEl.textContent = formatPrice(discount);
        if (summaryTotalAmountEl) summaryTotalAmountEl.textContent = formatPrice(grandTotal);

        // Sincroniza os rótulos na seção “Informações de Envio” (cart.html)
        // Atualiza APENAS o Frete Padrão conforme regra do MVP.
        const standardPriceEl = document.querySelector('.shipping-info .shipping-option.standard .shipping-price');
        if (standardPriceEl) {
            standardPriceEl.textContent = shipping === 0 ? 'Grátis' : formatPrice(SHIPPING_FIXED);
            standardPriceEl.classList.toggle('free-shipping', shipping === 0);
        }

        // Mantém o Frete Expresso fixo em R$ 15,90 (do layout original).
        const expressPriceEl = document.querySelector('.shipping-info .shipping-option.express .shipping-price');
        if (expressPriceEl) {
            expressPriceEl.textContent = 'R$ 15,90';
            expressPriceEl.classList.remove('free-shipping');
        }

        // Persiste os totais para uso no checkout
        localStorage.setItem('cartTotals', JSON.stringify({
            subtotal,
            shipping,
            discount,
            total: grandTotal,
            items: quantityCount
        }));
    }
    
    // Checkout functionality
    if (window.location.pathname.includes('checkout.html')) {
        // Initialize checkout
        initializeCheckout();
        
        // Freight calculation
        function calculateFreight(subtotal) {
            return subtotal >= 399 ? 0 : 100;
        }
        
        // Update order summary with freight e cupom
        function updateOrderSummary() {
            const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
            const subtotal = cart.reduce((total, item) => total + (parsePrice(item.price) * (item.quantity || 1)), 0);
            const freight = calculateFreight(subtotal);

            const appliedCoupon = getAppliedCoupon();
            const discount = calculateCouponDiscount(subtotal, appliedCoupon);

            const total = subtotal + freight - discount;
            
            // Update display
            const subtotalElement = document.querySelector('.order-subtotal .price');
            const freightElement = document.querySelector('.order-freight .price');
            const discountElement = document.querySelector('.order-discount .price');
            const totalElement = document.querySelector('.order-total .price');
            
            if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
            if (freightElement) {
                freightElement.textContent = freight === 0 ? 'Grátis' : formatPrice(freight);
                if (freightElement.parentElement) {
                    freightElement.parentElement.style.color = freight === 0 ? '#28a745' : '';
                }
            }
            // No checkout mostramos com sinal negativo quando houver desconto
            if (discountElement) discountElement.textContent = discount > 0 ? `-${formatPrice(discount)}` : formatPrice(0);
            if (totalElement) totalElement.textContent = formatPrice(total);
            
            return { subtotal, freight, discount, total };
        }
        
        // Chamada inicial para refletir o estado atual
        updateOrderSummary();
        
        // Form validation functions
        function validatePersonalData() {
            const name = document.getElementById('fullName')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            
            const errors = [];
            
            if (!name || name.length < 2) {
                errors.push('Nome completo é obrigatório (mínimo 2 caracteres)');
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                errors.push('Email válido é obrigatório');
            }
            
            const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
            if (!phone || !phoneRegex.test(phone)) {
                errors.push('Telefone válido é obrigatório');
            }
            
            return errors;
        }
        
        function validateAddress() {
            const cep = document.getElementById('cep')?.value.trim();
            const street = document.getElementById('street')?.value.trim();
            const number = document.getElementById('number')?.value.trim();
            const neighborhood = document.getElementById('neighborhood')?.value.trim();
            const city = document.getElementById('city')?.value.trim();
            const state = document.getElementById('state')?.value.trim();
            
            const errors = [];
            
            const cepRegex = /^\d{5}-?\d{3}$/;
            if (!cep || !cepRegex.test(cep)) {
                errors.push('CEP válido é obrigatório');
            }
            
            if (!street) errors.push('Endereço é obrigatório');
            if (!number) errors.push('Número é obrigatório');
            if (!neighborhood) errors.push('Bairro é obrigatório');
            if (!city) errors.push('Cidade é obrigatória');
            if (!state) errors.push('Estado é obrigatório');
            
            return errors;
        }
        
        function validatePaymentMethod() {
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
            const errors = [];
            
            if (!selectedMethod) {
                errors.push('Selecione um método de pagamento');
            }
            
            if (selectedMethod === 'creditCard' || selectedMethod === 'debitCard') {
                const cardNumber = document.getElementById('cardNumber')?.value.trim();
                const cardName = document.getElementById('cardName')?.value.trim();
                const expiryDate = document.getElementById('expiryDate')?.value.trim();
                const cvv = document.getElementById('cvv')?.value.trim();
                
                if (!cardNumber || cardNumber.length < 16) {
                    errors.push('Número do cartão inválido');
                }
                
                if (!cardName || cardName.length < 2) {
                    errors.push('Nome no cartão é obrigatório');
                }
                
                const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                if (!expiryDate || !expiryRegex.test(expiryDate)) {
                    errors.push('Data de validade inválida (MM/AA)');
                }
                
                if (!cvv || cvv.length < 3) {
                    errors.push('CVV inválido');
                }
            }
            
            return errors;
        }
        
        function validateTerms() {
            const agreeTerms = document.getElementById('agreeTerms')?.checked;
            return agreeTerms ? [] : ['Você deve concordar com os termos de uso'];
        }
        
        // Generate unique order ID
        function generateOrderId() {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            return `PED${timestamp}${random.toString().padStart(3, '0')}`;
        }
        
        // Process order
        function processOrder() {
            const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
            const { subtotal, freight, total } = updateOrderSummary();
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
            
            const order = {
                id: generateOrderId(),
                date: new Date().toISOString(),
                status: 'Aguardando Pagamento',
                logisticStatus: 'Aguardando Envio',
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1,
                    image: item.image
                })),
                customer: {
                    name: document.getElementById('fullName')?.value,
                    email: document.getElementById('email')?.value,
                    phone: document.getElementById('phone')?.value
                },
                address: {
                    cep: document.getElementById('cep')?.value,
                    street: document.getElementById('street')?.value,
                    number: document.getElementById('number')?.value,
                    complement: document.getElementById('complement')?.value,
                    neighborhood: document.getElementById('neighborhood')?.value,
                    city: document.getElementById('city')?.value,
                    state: document.getElementById('state')?.value
                },
                payment: {
                    method: selectedMethod,
                    subtotal: subtotal,
                    freight: freight,
                    total: total
                },
                history: [{
                    date: new Date().toISOString(),
                    status: 'Aguardando Pagamento',
                    description: 'Pedido criado com sucesso'
                }]
            };
            
            // Save order
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Clear cart
            localStorage.removeItem('cartItems');
            
            return order;
        }
        
        // Payment processing simulation
        function processPayment(order) {
            const method = order.payment.method;
            
            switch (method) {
                case 'creditCard':
                case 'debitCard':
                    // Simulate card processing
                    setTimeout(() => {
                        alert(`Pagamento processado com sucesso!\nPedido: ${order.id}\nTotal: ${formatPrice(order.payment.total)}`);
                        window.location.href = 'index.html';
                    }, 1500);
                    break;
                    
                case 'pix':
                    // Simulate PIX redirect
                    alert(`Redirecionando para pagamento PIX...\nPedido: ${order.id}\nTotal: ${formatPrice(order.payment.total)}`);
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                    break;
                    
                case 'boleto':
                    // Simulate boleto generation
                    alert(`Boleto gerado com sucesso!\nPedido: ${order.id}\nTotal: ${formatPrice(order.payment.total)}\n\nO boleto foi enviado para seu email.`);
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                    break;
            }
        }
        
        // Initialize checkout page
        function initializeCheckout() {
            // Update order summary on load
            updateOrderSummary();
            
            // Load cart items in order summary
            const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
            const orderItemsContainer = document.querySelector('.order-items');
            
            if (orderItemsContainer && cart.length > 0) {
                orderItemsContainer.innerHTML = cart.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <span class="quantity">Qtd: ${item.quantity || 1}</span>
                        </div>
                        <span class="price">${formatPrice(parsePrice(item.price) * (item.quantity || 1))}</span>
                    </div>
                `).join('');
            }
            
            // Add place order button listener
            const placeOrderBtn = document.querySelector('.btn-place-order');
            if (placeOrderBtn) {
                placeOrderBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Validate all form sections
                    const personalErrors = validatePersonalData();
                    const addressErrors = validateAddress();
                    const paymentErrors = validatePaymentMethod();
                    const termsErrors = validateTerms();
                    
                    const allErrors = [...personalErrors, ...addressErrors, ...paymentErrors, ...termsErrors];
                    
                    if (allErrors.length > 0) {
                        alert('Erro na validação:\n\n' + allErrors.join('\n'));
                        return;
                    }
                    
                    // Check if cart is not empty
                    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
                    if (cart.length === 0) {
                        alert('Seu carrinho está vazio!');
                        window.location.href = 'products.html';
                        return;
                    }
                    
                    // Process order
                    try {
                        const order = processOrder();
                        
                        // Show loading
                        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
                        placeOrderBtn.disabled = true;
                        
                        // Process payment
                        processPayment(order);
                        
                    } catch (error) {
                        console.error('Erro ao processar pedido:', error);
                        alert('Erro ao processar pedido. Tente novamente.');
                        placeOrderBtn.innerHTML = '<i class="fas fa-lock"></i> Finalizar Pedido';
                        placeOrderBtn.disabled = false;
                    }
                });
            }
            
            // Auto-fill CEP (simulation)
            const cepInput = document.getElementById('cep');
            if (cepInput) {
                cepInput.addEventListener('blur', function() {
                    const cep = this.value.replace(/\D/g, '');
                    if (cep.length === 8) {
                        // Simulate CEP lookup
                        setTimeout(() => {
                            document.getElementById('street').value = 'Rua Exemplo';
                            document.getElementById('neighborhood').value = 'Centro';
                            document.getElementById('city').value = 'São Paulo';
                            document.getElementById('state').value = 'SP';
                        }, 500);
                    }
                });
            }
            
            // Format card number input
            const cardNumberInput = document.getElementById('cardNumber');
            if (cardNumberInput) {
                cardNumberInput.addEventListener('input', function() {
                    let value = this.value.replace(/\D/g, '');
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    this.value = value;
                });
            }
            
            // Format expiry date input
            const expiryInput = document.getElementById('expiryDate');
            if (expiryInput) {
                expiryInput.addEventListener('input', function() {
                    let value = this.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    this.value = value;
                });
            }
        }
    }

    // Initialize cart display
    updateCartDisplay();
    
    // Listen for storage changes (when cart is updated in another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'cartItems') {
            cartCount = JSON.parse(e.newValue || '[]').length;
            updateCartDisplay();
        }
    });
    
    // Initialize checkout if on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        initializeCheckout();
    }

});
    
    // Add to cart functionality
    function addToCart(productName, price) {
        cartCount++;
        updateCartDisplay();
        
        // Show success message
        showNotification(`${productName} adicionado ao carrinho!`, 'success');
        
        // Store cart data in localStorage
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        cartItems.push({ 
            name: productName, 
            price: price, 
            id: Date.now(),
            quantity: 1,
            image: 'https://via.placeholder.com/120x120/FF6B6B/FFFFFF?text=Produto'
        });
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.current-price').textContent;
            addToCart(productName, productPrice);
        });
    });

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Enhanced search functionality
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('.search-input');
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // If we're on products page, filter products
                if (window.location.pathname.includes('products.html')) {
                    filterProducts(searchTerm);
                } else {
                    // Redirect to products page with search term
                    window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
    }
    
    // Enhanced search with debounce
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        const debouncedSearch = debounce((searchTerm) => {
            if (window.location.pathname.includes('products.html') && searchTerm.length > 2) {
                filterProducts(searchTerm);
            }
        }, 300);
        
        searchInput.addEventListener('input', function() {
            debouncedSearch(this.value.trim());
        });
    }
    
    // Product filtering function
    function filterProducts(searchTerm) {
        const products = document.querySelectorAll('.product-card');
        const searchLower = searchTerm.toLowerCase();
        let visibleCount = 0;
        
        products.forEach(product => {
            const title = product.querySelector('.product-title')?.textContent.toLowerCase() || '';
            const description = product.querySelector('.product-description')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchLower) || description.includes(searchLower)) {
                product.style.display = 'block';
                visibleCount++;
            } else {
                product.style.display = 'none';
            }
        });
        
        // Show no results message if needed
        let noResultsMsg = document.querySelector('.no-results-message');
        if (visibleCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.innerHTML = `<p>Nenhum produto encontrado para "${searchTerm}"</p>`;
                document.querySelector('.products-grid')?.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
    
    function filterProductsByCategory(category) {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const productCategory = product.dataset.category;
            if (!category || productCategory === category) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }
    
    // Handle search from URL parameters
    function handleSearchFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        const categoryParam = urlParams.get('category');
        
        if (searchParam) {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.value = decodeURIComponent(searchParam);
            }
            if (window.location.pathname.includes('products.html')) {
                filterProducts(searchParam);
            }
        }
        
        if (categoryParam) {
            filterProductsByCategory(categoryParam);
        }
    }
    
    // Initialize search from URL on page load
    handleSearchFromURL();
    
    // Mobile menu functionality - Fixed selector
    const mobileMenuBtn = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
            
            // Update aria-expanded for accessibility
            const isExpanded = mainNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mainNav.contains(e.target)) {
                mainNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when window is resized to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                mainNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && isValidEmail(emailInput.value)) {
                showNotification('Inscrição realizada com sucesso!', 'success');
                emailInput.value = '';
            } else {
                showNotification('Por favor, insira um e-mail válido.', 'error');
            }
        });
    }
    
    // Quantity controls
    const quantityControls = document.querySelectorAll('.quantity-control');
    quantityControls.forEach(control => {
        const decreaseBtn = control.querySelector('.quantity-decrease');
        const increaseBtn = control.querySelector('.quantity-increase');
        const quantityInput = control.querySelector('.quantity-input');
        
        if (decreaseBtn && increaseBtn && quantityInput) {
            decreaseBtn.addEventListener('click', function() {
                let currentValue = parseInt(quantityInput.value) || 1;
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                    updateCartTotal();
                }
            });
            
            increaseBtn.addEventListener('click', function() {
                let currentValue = parseInt(quantityInput.value) || 1;
                quantityInput.value = currentValue + 1;
                updateCartTotal();
            });
            
            quantityInput.addEventListener('change', function() {
                let value = parseInt(this.value) || 1;
                if (value < 1) value = 1;
                this.value = value;
                updateCartTotal();
            });
        }
    });
    
    // Password strength indicator - Enhanced
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        // Only add strength indicator to registration forms
        if (input.name === 'password' || input.id === 'password') {
            const strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            strengthIndicator.innerHTML = '<div class="strength-bar"></div><span class="strength-text"></span>';
            input.parentNode.appendChild(strengthIndicator);
            
            input.addEventListener('input', function() {
                const password = this.value;
                const strength = calculatePasswordStrength(password);
                updatePasswordStrength(strengthIndicator, strength);
            });
        }
    });
    
    function calculatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        // Calculate score based on criteria met
        Object.values(checks).forEach(check => {
            if (check) score++;
        });
        
        // Determine strength level
        if (score < 2) return { level: 'weak', text: 'Fraca', percentage: 20 };
        if (score < 4) return { level: 'medium', text: 'Média', percentage: 60 };
        return { level: 'strong', text: 'Forte', percentage: 100 };
    }
    
    function updatePasswordStrength(indicator, strength) {
        const bar = indicator.querySelector('.strength-bar');
        const text = indicator.querySelector('.strength-text');
        
        if (bar && text) {
            bar.style.width = strength.percentage + '%';
            bar.className = `strength-bar ${strength.level}`;
            text.textContent = strength.text;
        }
    }
    
    // Enhanced form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
    
    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showFieldError(field, 'Este campo é obrigatório');
                isValid = false;
            } else {
                clearFieldError(field);
                
                // Specific validations
                if (field.type === 'email' && !isValidEmail(field.value)) {
                    showFieldError(field, 'E-mail inválido');
                    isValid = false;
                } else if (field.name === 'cpf' && !isValidCPF(field.value)) {
                    showFieldError(field, 'CPF inválido');
                    isValid = false;
                } else if (field.name === 'phone' && !isValidPhone(field.value)) {
                    showFieldError(field, 'Telefone inválido');
                    isValid = false;
                } else if (field.name === 'cep' && !isValidCEP(field.value)) {
                    showFieldError(field, 'CEP inválido');
                    isValid = false;
                }
            }
        });
        
        // Password confirmation
        const passwordField = form.querySelector('#password');
        const confirmPasswordField = form.querySelector('#confirmPassword');
        if (passwordField && confirmPasswordField) {
            if (passwordField.value !== confirmPasswordField.value) {
                showFieldError(confirmPasswordField, 'Senhas não coincidem');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Show field error
    function showFieldError(field, message) {
        clearFieldError(field);
        field.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px;';
        
        field.parentElement.appendChild(errorDiv);
    }
    
    // Clear field error
    function clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // Enhanced validation functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        return remainder === parseInt(cpf.charAt(10));
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
        return phoneRegex.test(phone);
    }
    
    function isValidCEP(cep) {
        const cepRegex = /^\d{5}-?\d{3}$/;
        return cepRegex.test(cep);
    }
    
    // Enhanced notification system
    let notificationContainer = null;
    
    function showNotification(message, type = 'info') {
        // Create container if it doesn't exist
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            cursor: pointer;
        `;
        notification.textContent = message;
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            removeNotification(notification);
        }, 3000);
        
        // Remove on click
        notification.addEventListener('click', () => {
            removeNotification(notification);
        });
    }
    
    function removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }
    
    // Image error handling
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/300x200/CCCCCC/666666?text=Imagem+Indisponível';
            this.alt = 'Imagem indisponível';
        });
    });
    
    // Product image gallery
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('#mainImage');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const imageUrl = this.dataset.image;
            if (mainImage && imageUrl) {
                mainImage.src = imageUrl;
                
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            const targetPanel = document.querySelector(`#${targetTab}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const creditCardForm = document.querySelector('#creditCardForm');
    const pixForm = document.querySelector('#pixForm');
    const boletoForm = document.querySelector('#boletoForm');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all forms
            if (creditCardForm) creditCardForm.style.display = 'none';
            if (pixForm) pixForm.style.display = 'none';
            if (boletoForm) boletoForm.style.display = 'none';
            
            // Show selected form
            if (this.value === 'creditCard' && creditCardForm) {
                creditCardForm.style.display = 'block';
            } else if (this.value === 'pix' && pixForm) {
                pixForm.style.display = 'block';
            } else if (this.value === 'boleto' && boletoForm) {
                boletoForm.style.display = 'block';
            }
        });
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Accessibility improvements
    function improveAccessibility() {
        // Add ARIA labels to interactive elements
        const cartLinks = document.querySelectorAll('.cart-link');
        cartLinks.forEach(link => {
            link.setAttribute('aria-label', 'Ir para carrinho de compras');
        });
        
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.setAttribute('aria-label', 'Buscar produtos');
        }
        
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.setAttribute('aria-label', 'Abrir menu de navegação');
            navToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Add keyboard navigation
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = this.querySelector('a');
                    if (link) link.click();
                }
            });
        });
    }
    
    improveAccessibility();




    
    document.addEventListener("DOMContentLoaded", () => {
    // Add CSS animations and mobile styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .nav-menu.active {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #232f3e;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            z-index: 1000;
        }

        .password-strength {
            margin-top: 5px;
        }

        .strength-bar {
            height: 4px;
            border-radius: 2px;
            transition: all 0.3s ease;
            background-color: #e0e0e0;
        }

        .strength-bar.weak {
            background-color: #f44336;
        }

        .strength-bar.medium {
            background-color: #ff9800;
        }

        .strength-bar.strong {
            background-color: #4caf50;
        }

        .strength-text {
            font-size: 12px;
            margin-left: 5px;
        }

        @media (max-width: 768px) {
            .nav-menu {
                display: none;
            }

            .nav-toggle {
                display: block;
            }
        }

        @media (min-width: 769px) {
            .nav-menu {
                display: flex !important;
                position: static;
                flex-direction: row;
                background: none;
                padding: 0;
                box-shadow: none;
            }
        }
    `;
    document.head.appendChild(style);
});

// Utility functions - Enhanced
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

function parsePrice(priceString) {
    if (typeof priceString === 'number') return priceString;
    
    // Remove currency symbols and convert to number
    const cleanPrice = priceString.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleanPrice) || 0;
}
