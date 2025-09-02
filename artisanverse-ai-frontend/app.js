// ArtisanVerse - Complete AI-Powered Cultural Heritage Marketplace (Fixed Version)
class ArtisanVerseApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.currentSection = null;
        this.cart = [];
        this.wishlist = [];
        this.isAuthenticated = false;
        this.aiConversations = {
            shopper: [],
            mentor: []
        };
        this.notifications = [];
        
        this.apiBaseUrl = 'http://localhost:5002/api';
        
        // Initialize app
        this.init();
    }

    async init() {
        console.log('🎨 Initializing ArtisanVerse - AI-Powered Cultural Heritage Marketplace...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            await this.setupApp();
        }
    }

    async setupApp() {
        try {
            await this.initializeCulturalData();
            this.bindEvents();
            this.checkAuthState();
            this.updateCartUI();
            this.startCulturalAnimations();
            this.initializeAIAssistants();
            this.loadCulturalStories();
            
            console.log('✨ ArtisanVerse app fully initialized!');
            this.showNotification('Welcome to ArtisanVerse - Where Culture Meets Technology! 🎨', 'success');
        } catch (error) {
            console.error('Setup error:', error);
            this.showNotification('App initialized with basic functionality', 'info');
        }
    }

    async initializeCulturalData() {
        try {
            const [artisansRes, productsRes, workshopsRes] = await Promise.all([
                fetch(`${this.apiBaseUrl}/artisans`),
                fetch(`${this.apiBaseUrl}/products`),
                fetch(`${this.apiBaseUrl}/workshops`)
            ]);

            const artisans = await artisansRes.json();
            const products = await productsRes.json();
            const workshops = await workshopsRes.json();

            this.culturalData = {
                artisans: artisans.data.artisans,
                products: products.data.products,
                workshops: workshops.data
            };
        } catch (error) {
            console.error('Error initializing cultural data:', error);
            this.showNotification('Could not load cultural data from the server.', 'error');
        }
    }

    bindEvents() {
        try {
            // Navigation events with error handling
            this.bindNavigationEvents();
            
            // Authentication events
            this.bindAuthEvents();
            
            // Hero and CTA events
            this.bindHeroEvents();
            
            // Modal events
            this.bindModalEvents();
            
            // Cart events
            this.bindCartEvents();
            
            // AI demo events
            this.bindAIDemoEvents();
            
            console.log('✅ All events bound successfully');
        } catch (error) {
            console.error('❌ Error binding events:', error);
        }
    }

    bindNavigationEvents() {
        // Main navigation
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                console.log('Navigating to:', page);
                this.navigateTo(page);
            });
        });

        // Language selector
        const languageBtn = document.getElementById('languageBtn');
        if (languageBtn) {
            languageBtn.addEventListener('click', () => {
                this.showNotification('Language selector activated! 🌍 (Multi-language support coming soon)', 'info');
            });
        }

        // AI Search
        const aiSearchBtn = document.getElementById('aiSearchBtn');
        const aiSearch = document.getElementById('aiSearch');
        if (aiSearchBtn) {
            aiSearchBtn.addEventListener('click', () => this.performAISearch());
        }
        if (aiSearch) {
            aiSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performAISearch();
            });
        }
    }

    bindAuthEvents() {
        // Auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal('login');
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal('register');
            });
        }

        // Auth forms
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Profile menu
        const profileMenuBtn = document.getElementById('profileMenuBtn');
        if (profileMenuBtn) {
            profileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const profileMenu = document.getElementById('profileMenu');
                if (profileMenu) {
                    profileMenu.classList.toggle('hidden');
                }
            });
        }

        // Logout - using event delegation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    bindHeroEvents() {
        // Hero buttons
        const heroExplore = document.getElementById('heroExplore');
        const heroAI = document.getElementById('heroAI');
        const ctaJoin = document.getElementById('ctaJoin');
        const ctaLearn = document.getElementById('ctaLearn');
        
        if (heroExplore) {
            heroExplore.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Hero explore clicked');
                this.navigateTo('products');
            });
        }
        
        if (heroAI) {
            heroAI.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Hero AI clicked');
                this.demoAIAssistant();
            });
        }
        
        if (ctaJoin) {
            ctaJoin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal('register');
            });
        }
        
        if (ctaLearn) {
            ctaLearn.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection('ai-features');
            });
        }
    }

    bindModalEvents() {
        // Close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Modal background clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Auth toggle - using event delegation for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.id === 'toggleAuth') {
                e.preventDefault();
                console.log('Auth toggle clicked');
                const loginForm = document.getElementById('loginForm');
                const isLogin = loginForm && !loginForm.classList.contains('hidden');
                this.showAuthModal(isLogin ? 'register' : 'login');
            }
        });
    }

    bindCartEvents() {
        const cartButton = document.getElementById('cartButton');
        const closeCart = document.getElementById('closeCart');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (cartButton) {
            cartButton.addEventListener('click', () => this.toggleCart());
        }
        
        if (closeCart) {
            closeCart.addEventListener('click', () => this.toggleCart());
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }
    }

    bindAIDemoEvents() {
        // AI demo buttons using event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('demo-btn')) {
                e.preventDefault();
                const parent = e.target.closest('.ai-card');
                if (parent) {
                    const demoType = parent.querySelector('h3').textContent;
                    console.log('Demo triggered:', demoType);
                    this.triggerAIDemo(demoType);
                }
            }
        });

        // AI Assistant floating button
        const aiAssistantBtn = document.getElementById('aiAssistantBtn');
        if (aiAssistantBtn) {
            aiAssistantBtn.addEventListener('click', () => this.toggleAIAssistant());
        }

        // Cultural story clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.story-card')) {
                const storyCard = e.target.closest('.story-card');
                const storyTitle = storyCard.querySelector('h3')?.textContent || 'Cultural Story';
                console.log('Story clicked:', storyTitle);
                this.openCulturalStory(storyTitle);
            }
        });

        // Make functions globally available for onclick handlers
        window.app = this;
    }

    // Authentication Methods
    checkAuthState() {
        const savedUser = localStorage.getItem('artisanverse_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
                this.showUserInterface();
                console.log('✅ User authenticated:', this.currentUser.name);
            } catch (e) {
                localStorage.removeItem('artisanverse_user');
                console.log('❌ Invalid user data, cleared storage');
            }
        }
    }

    showAuthModal(type = 'login') {
        console.log('Showing auth modal:', type);
        
        const modal = document.getElementById('authModal');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authTitle = document.getElementById('authTitle');
        const authToggleText = document.getElementById('authToggleText');

        if (!modal) {
            console.error('Auth modal not found');
            return;
        }

        if (type === 'login') {
            if (loginForm) loginForm.classList.remove('hidden');
            if (registerForm) registerForm.classList.add('hidden');
            if (authTitle) authTitle.textContent = 'Welcome Back to ArtisanVerse';
            if (authToggleText) {
                authToggleText.innerHTML = 'Don\'t have an account? <a href=\'#\' id=\'toggleAuth\'>Join our cultural community</a>';
            }
        } else {
            if (loginForm) loginForm.classList.add('hidden');
            if (registerForm) registerForm.classList.remove('hidden');
            if (authTitle) authTitle.textContent = 'Join ArtisanVerse';
            if (authToggleText) {
                authToggleText.innerHTML = 'Already have an account? <a href=\'#\' id=\'toggleAuth\'>Sign in here</a>';
            }
        }

        modal.classList.remove('hidden');
    }

    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('Handling login...');
        
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            this.showNotification('Please enter email and password', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.data.user;
                this.isAuthenticated = true;
                localStorage.setItem('artisanverse_user', JSON.stringify(data.data.user));
                localStorage.setItem('artisanverse_token', data.data.token);
                this.hideAuthModal();
                this.showUserInterface();
                this.navigateTo('dashboard');
                this.showNotification(`Welcome back, ${data.data.user.name}! 🎨`, 'success');
            } else {
                this.showNotification(data.message || 'Invalid credentials.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('An error occurred during login.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('Handling register...');
        
        const name = document.getElementById('registerName')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const role = document.getElementById('registerRole')?.value;
        const culturalInterest = document.getElementById('culturalInterest')?.value;

        if (!name || !email || !password || !role) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role, culturalInterest })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.data.user;
                this.isAuthenticated = true;
                localStorage.setItem('artisanverse_user', JSON.stringify(data.data.user));
                localStorage.setItem('artisanverse_token', data.data.token);
                this.hideAuthModal();
                this.showUserInterface();
                this.navigateTo('dashboard');
                this.showNotification(`Welcome to ArtisanVerse, ${data.data.user.name}! Your cultural journey begins now! 🌍`, 'success');
            } else {
                this.showNotification(data.message || 'Registration failed.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('An error occurred during registration.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async socialLogin(provider) {
        console.log('Social login with:', provider);
        this.showLoading(true);

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/social-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ provider })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.data.user;
                this.isAuthenticated = true;
                localStorage.setItem('artisanverse_user', JSON.stringify(data.data.user));
                localStorage.setItem('artisanverse_token', data.data.token);
                this.hideAuthModal();
                this.showUserInterface();
                this.navigateTo('dashboard');
                this.showNotification(`Welcome! You've joined through ${provider} 🎉`, 'success');
            } else {
                this.showNotification(data.message || 'Social login failed.', 'error');
            }
        } catch (error) {
            console.error('Social login error:', error);
            this.showNotification('An error occurred during social login.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showUserInterface() {
        const headerActions = document.querySelector('.header-actions');
        const userProfile = document.getElementById('userProfile');
        
        if (headerActions) headerActions.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        
        // Update user info
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const userAvatar = document.getElementById('userAvatar');
        const sidebarName = document.getElementById('sidebarName');
        const sidebarRole = document.getElementById('sidebarRole');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        
        if (userName) userName.textContent = this.currentUser.name;
        if (userRole) userRole.textContent = this.currentUser.role;
        if (userAvatar) userAvatar.src = this.currentUser.avatar || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👤</text></svg>';
        if (sidebarName) sidebarName.textContent = this.currentUser.name;
        if (sidebarRole) sidebarRole.textContent = this.currentUser.role;
        if (sidebarAvatar) sidebarAvatar.src = this.currentUser.avatar || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👤</text></svg>';

        this.setupDashboardNavigation();
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('artisanverse_user');
        localStorage.removeItem('artisanverse_token');
        
        const headerActions = document.querySelector('.header-actions');
        const userProfile = document.getElementById('userProfile');
        
        if (headerActions) headerActions.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
        
        this.navigateTo('home');
        this.showNotification('Logged out successfully. Thank you for visiting! 👋', 'info');
    }

    // Navigation Methods
    navigateTo(page) {
        console.log('🧭 Navigating to:', page);

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });

        // Show appropriate page
        if (page === 'dashboard' && this.isAuthenticated) {
            this.showDashboard();
        } else if (['products', 'workshops', 'community'].includes(page)) {
            if (this.isAuthenticated) {
                this.showDashboard();
                setTimeout(() => {
                    if (page === 'products') this.showDashboardSection('productsPage');
                    else if (page === 'workshops') this.showDashboardSection('workshopsPage');
                    else if (page === 'community') this.showDashboardSection('communitySection');
                }, 100);
            } else {
                this.showAuthModal('login');
                return;
            }
        } else {
            this.showHomePage();
        }

        this.currentPage = page;
    }

    showHomePage() {
        const homePage = document.getElementById('homePage');
        if (homePage) {
            homePage.classList.remove('hidden');
        }

        if (!this.isAuthenticated) {
            return;
        }

        if (this.currentUser.role === 'admin') {
            this.showDashboardSection('adminDashboard');
        } else if (this.currentUser.role === 'artisan') {
            this.showDashboardSection('artisanDashboard');
        } else {
            this.showDashboardSection('buyerDashboard');
        }
    }

    showDashboard() {
        const dashboardPage = document.getElementById('dashboardPage');
        if (dashboardPage) {
            dashboardPage.classList.remove('hidden');
            this.loadDashboardData();
        }
    }

    setupDashboardNavigation() {
        const sidebarNav = document.getElementById('sidebarNav');
        if (!sidebarNav) return; 
        
        sidebarNav.innerHTML = '';

        let navItems = [];
        
        if (this.currentUser.role === 'buyer') {
            navItems = [
                { id: 'buyerDashboard', icon: '🏠', label: 'Cultural Dashboard' },
                { id: 'aiShopperSection', icon: '🤖', label: 'AI Cultural Shopper' },
                { id: 'productsPage', icon: '🎨', label: 'Browse Treasures' },
                { id: 'workshopsPage', icon: '🛠️', label: 'Cultural Workshops' },
                { id: 'communitySection', icon: '👥', label: 'Heritage Community' }
            ];
        } else if (this.currentUser.role === 'artisan') {
            navItems = [
                { id: 'artisanDashboard', icon: '🏠', label: 'Artisan Studio' },
                { id: 'aiMentorSection', icon: '🧠', label: 'AI Business Mentor' },
                { id: 'smartInventorySection', icon: '📦', label: 'Smart Inventory' },
                { id: 'uploadProductPage', icon: '📤', label: 'Upload Product' }
            ];
        } else {
            navItems = [
                { id: 'adminDashboard', icon: '⚡', label: 'Platform Overview' },
                { id: 'fullAnalysisSection', icon: '📊', label: 'Analytics Hub' }
            ];
        }

        navItems.forEach((item, index) => {
            const link = document.createElement('a');
            link.href = '#';
            link.innerHTML = `<span>${item.icon}</span> ${item.label}`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                sidebarNav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
                
                this.showDashboardSection(item.id);
            });
            
            if (index === 0) link.classList.add('active');
            sidebarNav.appendChild(link);
        });
    }

    showDashboardSection(sectionId) {
        console.log('📱 Showing dashboard section:', sectionId);
        
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target section or create basic content
        let targetSection = document.getElementById(sectionId);
        
        if (!targetSection) {
            // Create section if it doesn't exist
            targetSection = document.createElement('section');
            targetSection.id = sectionId;
            targetSection.className = 'dashboard-section';
            
            const dashboardContent = document.querySelector('.dashboard-content');
            if (dashboardContent) {
                dashboardContent.appendChild(targetSection);
            }
        }
        
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.loadSectionData(sectionId);
        }
    }

    loadDashboardData() {
        if (this.currentUser.role === 'buyer') {
            this.showDashboardSection('buyerDashboard');
            this.loadBuyerDashboard();
        } else if (this.currentUser.role === 'artisan') {
            this.showDashboardSection('artisanDashboard');
            this.loadArtisanDashboard();
        } else {
            this.showDashboardSection('adminDashboard');
            this.loadAdminDashboard();
        }
    }

    async loadSectionData(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Clear existing content
        section.innerHTML = '';

        let pageUrl = '';
        switch (sectionId) {
            case 'buyerDashboard':
                this.loadBuyerDashboard();
                return;
            case 'productsPage':
                this.loadProducts();
                return;
            case 'workshopsPage':
                this.loadWorkshops();
                return;
            case 'communitySection':
                this.loadCommunityFeed();
                return;
            case 'aiShopperSection':
                this.loadAIShopperSection();
                return;
            case 'artisanDashboard':
                pageUrl = 'artisan-dashboard.html';
                break;
            case 'aiMentorSection':
                pageUrl = 'ai-mentor.html';
                break;
            case 'uploadProductPage':
                pageUrl = 'upload-product.html';
                break;
            case 'smartInventorySection':
                pageUrl = 'smart-inventory.html';
                break;
            case 'adminDashboard':
                pageUrl = 'admin-dashboard.html';
                break;
            case 'fullAnalysisSection':
                pageUrl = 'full-analysis.html';
                break;
            default:
                section.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <h2>🚧 ${sectionId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h2>
                        <p>This section is being crafted with cultural precision...</p>
                        <button class="btn btn--primary" onclick="app.showNotification('Feature coming soon! 🎨', 'info')">
                            Explore More Features
                        </button>
                    </div>
                `;
                return;
        }

        try {
            const response = await fetch(pageUrl);
            const html = await response.text();
            section.innerHTML = html;
        } catch (error) {
            console.error(`Error loading page: ${pageUrl}`, error);
            section.innerHTML = '<p>Error loading page.</p>';
        }
    }

    loadBuyerDashboard() {
        const section = document.getElementById('buyerDashboard');
        if (!section) return; 

        const culturalPassport = this.currentUser.culturalPassport || {};

        section.innerHTML = `
            <div class="dashboard-welcome">
                <h1>Welcome back, ${this.currentUser.name}!</h1>
                <p>Continue your cultural discovery journey</p>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <h3>${culturalPassport.points || 0}</h3>
                        <p>Cultural Points</p>
                        <small class="stat-trend">+12 this week</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🛍️</div>
                    <div class="stat-info">
                        <h3>0</h3>
                        <p>Cultural Treasures</p>
                        <small class="stat-trend">Ready to start collecting</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">❤️</div>
                    <div class="stat-info">
                        <h3>${this.wishlist.length}</h3>
                        <p>Wishlist Items</p>
                        <small class="stat-trend">Curated for you</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-info">
                        <h3>${culturalPassport.level || 'Newcomer'}</h3>
                        <p>Cultural Level</p>
                        <small class="stat-trend">Keep exploring!</small>
                    </div>
                </div>
            </div>
            
            <div class="recommendations-section">
                <div class="section-header">
                    <h2>AI Recommendations for You</h2>
                    <button class="btn btn--outline" onclick="app.refreshRecommendations()">🤖 Get New Suggestions</button>
                </div>
                <div class="product-grid" id="buyerRecommendations"></div>
            </div>
        `;
        
        this.loadRecommendations();
    }

    async loadProducts() {
        const section = document.getElementById('productsPage');
        if (!section) return; 
        
        section.innerHTML = `
            <div class="products-header">
                <div class="products-title">
                    <h1>Cultural Treasures</h1>
                    <p>Discover authentic crafts from master artisans worldwide</p>
                </div>
            </div>
            <div class="products-grid" id="productsGrid"></div>
        `;
        
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            this.showLoading(true);
            try {
                const response = await fetch(`${this.apiBaseUrl}/products`);
                const data = await response.json();

                if (response.ok) {
                    const products = data.data.products;
                    if (products.length === 0) {
                        productsGrid.innerHTML = '<p>No cultural treasures found yet.</p>';
                        return;
                    }
                    productsGrid.innerHTML = ''; // Clear previous content
                    products.forEach(product => {
                        const card = this.createProductCard(product);
                        productsGrid.appendChild(card);
                    });
                } else {
                    throw new Error(data.message || 'Failed to fetch products');
                }
            } catch (error) {
                console.error('Error loading products:', error);
                this.showNotification(`Failed to load products: ${error.message}`, 'error');
                productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
            } finally {
                this.showLoading(false);
            }
        }
    }

    loadWorkshops() {
        const section = document.getElementById('workshopsPage');
        if (!section) return; 
        
        section.innerHTML = `
            <div class="workshops-header">
                <h1>Cultural Workshops</h1>
                <p>Learn directly from master artisans</p>
            </div>
            <div class="workshops-grid" id="workshopsGrid"></div>
        `;
        
        const workshopsGrid = document.getElementById('workshopsGrid');
        if (workshopsGrid) {
            this.culturalData.workshops.forEach(workshop => {
                const card = document.createElement('div');
                card.className = 'workshop-card';
                const imageUrl = workshop.image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
                card.innerHTML = `
                    <div class="workshop-image"><img src="${imageUrl}" alt="${workshop.title}"></div>
                    <div class="workshop-details">
                        <h3 class="workshop-title">${workshop.title}</h3>
                        <p class="workshop-instructor">Master: ${workshop.instructor}</p>
                        <div class="workshop-meta">
                            <span>📅 ${workshop.date}</span>
                            <span>⏰ ${workshop.duration}</span>
                            <span>👥 ${workshop.currentParticipants}/${workshop.maxParticipants}</span>
                        </div>
                        <p class="workshop-description">${workshop.description}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                            <span class="workshop-price">$${workshop.price}</span>
                            <button class="btn btn--primary" onclick="app.registerWorkshop('${workshop.id}')">
                                Join Workshop
                            </button>
                        </div>
                    </div>
                `;
                workshopsGrid.appendChild(card);
            });
        }
    }

    loadCommunityFeed() {
        const section = document.getElementById('communitySection');
        if (!section) return; 
        
        section.innerHTML = `
            <div class="community-header">
                <h1>Cultural Community</h1>
                <p>Connect with fellow culture enthusiasts and artisans</p>
            </div>
            <div class="community-feed" id="communityFeed">
                <div class="community-post">
                    <div class="post-header">
                        <div class="post-avatar">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face" alt="Sarah">
                        </div>
                        <div class="post-author">
                            <strong>Sarah Johnson</strong>
                            <div class="post-time">2 hours ago</div>
                        </div>
                    </div>
                    <div class="post-content">
                        <h3>My Beautiful Block Print Collection 🎨</h3>
                        <p>Just received these incredible block print pieces from Meera! The craftsmanship is absolutely stunning and each piece tells such a beautiful story.</p>
                    </div>
                    <div class="post-actions">
                        <div class="post-action" onclick="app.likePost()">❤️ <span>34</span></div>
                        <div class="post-action" onclick="app.commentPost()">💬 <span>8</span></div>
                        <div class="post-action" onclick="app.sharePost()">🔗 <span>Share</span></div>
                    </div>
                </div>
                
                <div class="community-post">
                    <div class="post-header">
                        <div class="post-avatar">
                            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face" alt="Kwame">
                        </div>
                        <div class="post-author">
                            <strong>Kwame Asante</strong>
                            <div class="post-time">5 hours ago</div>
                        </div>
                    </div>
                    <div class="post-content">
                        <h3>Teaching the Next Generation 👥</h3>
                        <p>Today I had the honor of teaching young weavers the sacred patterns of Kente. Each thread truly does weave the wisdom of our ancestors! 🧵</p>
                    </div>
                    <div class="post-actions">
                        <div class="post-action" onclick="app.likePost()">❤️ <span>89</span></div>
                        <div class="post-action" onclick="app.commentPost()">💬 <span>15</span></div>
                        <div class="post-action" onclick="app.sharePost()">🔗 <span>Share</span></div>
                    </div>
                </div>
            </div>
        `;
    }

    loadAIShopperSection() {
        const section = document.getElementById('aiShopperSection');
        if (!section) return; 
        
        section.innerHTML = `
            <div class="ai-assistant-full">
                <div class="ai-header">
                    <div class="ai-avatar-large">🤖</div>
                    <div class="ai-intro">
                        <h1>Your AI Cultural Shopper</h1>
                        <p>I'm your personal guide to discovering authentic cultural treasures</p>
                    </div>
                </div>
                
                <div class="chat-container enhanced">
                    <div class="chat-messages" id="shopperChatMessages">
                        <div class="ai-message">
                            <div class="message-avatar">🤖</div>
                            <div class="message-content">
                                <p>Welcome! I'm your AI Cultural Shopper. I can help you discover authentic crafts that resonate with your cultural interests. What kind of cultural art speaks to your soul today?</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input-area">
                        <input type="text" class="chat-input" id="shopperChatInput" placeholder="Tell me about the culture or craft you\'re interested in...">
                        <button class="btn btn--primary" id="shopperSendBtn">Send</button>
                    </div>
                </div>
                
                <div class="quick-suggestions">
                    <h3>Popular Requests</h3>
                    <div class="suggestions-grid">
                        <button class="suggestion-btn" onclick="app.handleSuggestionClick('Traditional Textiles')">🧵 Traditional Textiles</button>
                        <button class="suggestion-btn" onclick="app.handleSuggestionClick('Handmade Pottery')">🏺 Handmade Pottery</button>
                        <button class="suggestion-btn" onclick="app.handleSuggestionClick('Cultural Jewelry')">💎 Cultural Jewelry</button>
                        <button class="suggestion-btn" onclick="app.handleSuggestionClick('Wooden Crafts')">🪵 Wooden Crafts</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupAIChat();
    }

    loadArtisanDashboard() {
        const section = document.getElementById('artisanDashboard');
        if (!section) return; 

        const revenue = this.currentUser.revenue || 0;
        const orders = this.currentUser.orders || 0;
        const rating = this.currentUser.rating || '0.0';

        section.innerHTML = `
            <div class="dashboard-welcome">
                <h1>Artisan Studio</h1>
                <p>Manage your craft business and connect with customers</p>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <h3>${revenue}</h3>
                        <p>This Month</p>
                        <small class="stat-trend">Growing steadily</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-info">
                        <h3>${orders}</h3>
                        <p>Active Orders</p>
                        <small class="stat-trend">Building momentum</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <h3>${rating}</h3>
                        <p>Rating</p>
                        <small class="stat-trend">Excellent quality</small>
                    </div>
                </div>
            </div>
        `;
    }

    loadAIMentorSection() {
        const section = document.getElementById('aiMentorSection');
        if (!section) return; 
        
        section.innerHTML = `
            <div class="ai-assistant-full">
                <div class="ai-header">
                    <div class="ai-avatar-large">🧠</div>
                    <div class="ai-intro">
                        <h1>AI Business Mentor</h1>
                        <p>Get personalized guidance for growing your artisan business</p>
                    </div>
                </div>
                
                <div class="chat-container enhanced">
                    <div class="chat-messages" id="mentorChatMessages">
                        <div class="ai-message">
                            <div class="message-avatar">🧠</div>
                            <div class="message-content">
                                <p>Greetings, talented artisan! I'm here to help you grow your business, improve your craft marketing, and connect better with customers. How can I assist you today?</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input-area">
                        <input type="text" class="chat-input" id="mentorChatInput" placeholder="Ask about pricing, marketing, inventory management...">
                        <button class="btn btn--primary" id="mentorSendBtn">Send</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupAIMentorChat();
    }

    async loadUploadProductPage() {
        const section = document.getElementById('uploadProductPage');
        if (!section) return;

        try {
            const response = await fetch('upload-product.html');
            const html = await response.text();
            section.innerHTML = html;

            const form = document.getElementById('uploadProductForm');
            if (form) {
                form.addEventListener('submit', (e) => this.handleProductUpload(e));
            }
        } catch (error) {
            console.error('Error loading upload product page:', error);
            section.innerHTML = '<p>Error loading page.</p>';
        }
    }

    async handleProductUpload(e) {
        e.preventDefault();
        console.log('Handling product upload...');

        const title = document.getElementById('productTitle').value;
        const description = document.getElementById('productDescription').value;
        const price = document.getElementById('productPrice').value;
        const category = document.getElementById('productCategory').value;
        const imageFile = document.getElementById('productImage').files[0];

        if (!title || !description || !price || !category || !imageFile) {
            this.showNotification('Please fill in all fields and select an image', 'error');
            return;
        }

        this.showLoading(true);

        try {
            // 1. Upload image
            const formData = new FormData();
            formData.append('productImages', imageFile);

            const uploadResponse = await fetch(`${this.apiBaseUrl}/upload/product-images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('artisanverse_token')}`
                },
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Image upload failed');
            }

            const imageUrl = uploadData.data.images[0].url;

            // 2. Create product
            const productData = {
                title,
                description,
                price: parseFloat(price),
                category,
                images: [imageUrl]
            };

            const createResponse = await fetch(`${this.apiBaseUrl}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('artisanverse_token')}`
                },
                body: JSON.stringify(productData)
            });

            const createData = await createResponse.json();

            if (createResponse.ok) {
                this.showNotification('Product uploaded successfully!', 'success');
                await this.initializeCulturalData(); // Refresh data
                this.navigateTo('products');
            } else {
                throw new Error(createData.message || 'Product creation failed');
            }
        } catch (error) {
            console.error('Product upload error:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadSmartInventoryPage() {
        const section = document.getElementById('smartInventorySection');
        if (!section) return;

        try {
            const response = await fetch('smart-inventory.html');
            const html = await response.text();
            section.innerHTML = html;

            const form = document.getElementById('smartInventoryUploadForm');
            if (form) {
                form.addEventListener('submit', (e) => this.handleSmartInventoryUpload(e));
            }

            this.loadInventoryData();
        } catch (error) {
            console.error('Error loading smart inventory page:', error);
            section.innerHTML = '<p>Error loading page.</p>';
        }
    }

    async handleSmartInventoryUpload(e) {
        e.preventDefault();
        console.log('Handling smart inventory product upload...');

        const title = document.getElementById('inventoryProductTitle').value;
        const description = document.getElementById('inventoryProductDescription').value;
        const price = document.getElementById('inventoryProductPrice').value;
        const category = document.getElementById('inventoryProductCategory').value;
        const inStock = document.getElementById('inventoryProductStock').value;
        const imageFile = document.getElementById('inventoryProductImage').files[0];

        if (!title || !description || !price || !category || !inStock || !imageFile) {
            this.showNotification('Please fill in all fields and select an image', 'error');
            return;
        }

        this.showLoading(true);

        try {
            // 1. Upload image
            const formData = new FormData();
            formData.append('productImages', imageFile);

            const uploadResponse = await fetch(`${this.apiBaseUrl}/upload/product-images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('artisanverse_token')}`
                },
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Image upload failed');
            }

            const imageUrl = uploadData.data.images[0].url;

            // 2. Create product
            const productData = {
                title,
                description,
                price: parseFloat(price),
                category,
                inStock: parseInt(inStock),
                images: [imageUrl]
            };

            const createResponse = await fetch(`${this.apiBaseUrl}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('artisanverse_token')}`
                },
                body: JSON.stringify(productData)
            });

            const createData = await createResponse.json();

            if (createResponse.ok) {
                this.showNotification('Product uploaded successfully to inventory!', 'success');
                await this.initializeCulturalData(); // Refresh data
                this.loadInventoryData(); // Refresh inventory list
                e.target.reset(); // Clear form
            } else {
                throw new Error(createData.message || 'Product creation failed');
            }
        } catch (error) {
            console.error('Smart inventory product upload error:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadInventoryData() {
        const inventoryGrid = document.getElementById('inventoryGrid');
        if (!inventoryGrid) return;

        inventoryGrid.innerHTML = '';

        try {
            const response = await fetch(`${this.apiBaseUrl}/products/artisan/my-products`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('artisanverse_token')}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const products = data.data.products;
                if (products.length === 0) {
                    inventoryGrid.innerHTML = '<p>You have no products yet.</p>';
                    return;
                }

                products.forEach(product => {
                    const item = document.createElement('div');
                    item.className = 'inventory-item';
                    item.innerHTML = `
                        <div class="inventory-item-info">
                            <img src="${product.images[0]}" alt="${product.title}" class="inventory-item-image">
                            <div>
                                <h3 class="inventory-item-title">${product.title}</h3>
                                <p class="inventory-item-sku">SKU: ${product.sku}</p>
                            </div>
                        </div>
                        <div class="inventory-item-stock">
                            <input type="number" value="${product.inStock}" class="form-control" min="0">
                            <button class="btn btn--primary" data-product-id="${product.id}">Update</button>
                        </div>
                    `;
                    inventoryGrid.appendChild(item);
                });

                inventoryGrid.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON' && e.target.dataset.productId) {
                        const productId = e.target.dataset.productId;
                        const input = e.target.previousElementSibling;
                        const newStock = parseInt(input.value);
                        this.updateStock(productId, newStock);
                    }
                });
            } else {
                throw new Error(data.message || 'Failed to fetch inventory');
            }
        } catch (error) {
            console.error('Error loading inventory data:', error);
            inventoryGrid.innerHTML = `<p>${error.message}</p>`;
        }
    }

    async updateStock(productId, newStock) {
        this.showLoading(true);
        try {
            const response = await fetch(`${this.apiBaseUrl}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('artisanverse_token')}`
                },
                body: JSON.stringify({ inStock: newStock })
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Stock updated successfully!', 'success');
                this.loadInventoryData(); // Refresh inventory data
            } else {
                throw new Error(data.message || 'Failed to update stock');
            }
        } catch (error) {
            console.error('Stock update error:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        const imageUrl = product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
        card.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.title}" 
                     onerror="this.style.display='none'; this.parentNode.innerHTML='<div style=\"display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;\">🎨</div>';">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-artisan">by ${product.artisanName}</p>
                <div class="product-price">${product.price}</div>
                <div class="product-actions">
                    <button class="btn btn--primary" onclick="app.addToCart('${product.id}')">
                        Add to Collection
                    </button>
                    <button class="btn-icon btn-wishlist" onclick="app.addToWishlist('${product.id}')" title="Add to Wishlist">
                        ❤️
                    </button>
                    <button class="btn-icon btn-ar" onclick="app.openARExperience('${product.id}')" title="AR Try-On">
                        📱
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    loadRecommendations() {
        const recommendationsGrid = document.getElementById('buyerRecommendations');
        if (!recommendationsGrid) return; 
        
        recommendationsGrid.innerHTML = '';
        
        this.culturalData.products.forEach(product => {
            const card = this.createProductCard(product);
            recommendationsGrid.appendChild(card);
        });
    }

    // AI Chat Methods
    initializeAIAssistants() {
        // Initialize AI conversation arrays
        console.log('🤖 AI Assistants initialized');
    }

    setupAIChat() {
        const shopperSendBtn = document.getElementById('shopperSendBtn');
        const shopperInput = document.getElementById('shopperChatInput');
        
        if (shopperSendBtn) {
            shopperSendBtn.addEventListener('click', () => this.sendShopperMessage());
        }
        
        if (shopperInput) {
            shopperInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendShopperMessage();
            });
        }
    }

    setupAIMentorChat() {
        const mentorSendBtn = document.getElementById('mentorSendBtn');
        const mentorInput = document.getElementById('mentorChatInput');
        
        if (mentorSendBtn) {
            mentorSendBtn.addEventListener('click', () => this.sendMentorMessage());
        }
        
        if (mentorInput) {
            mentorInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMentorMessage();
            });
        }
    }

    async sendShopperMessage() {
        const input = document.getElementById('shopperChatInput');
        const chatMessages = document.getElementById('shopperChatMessages');
        
        if (!input || !chatMessages) return; 
        
        const message = input.value.trim();
        if (!message) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'user-message';
        userMsg.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content"><p>${message}</p></div>
        `;
        chatMessages.appendChild(userMsg);
        input.value = '';

        // Generate AI response
        const responses = [
            `Great choice! Based on your interest in ${message.toLowerCase()}, I'd recommend exploring our curated collection of authentic handcrafted pieces. Each item comes with its cultural story and blockchain authenticity certificate! 🎨`,
            `I love your interest in ${message.toLowerCase()}! Our artisans create pieces that honor traditional techniques while fitting beautifully in modern spaces. Would you like me to show you some specific recommendations? ✨`,
            `Wonderful! ${message} represents such rich cultural heritage. I can help you discover pieces that not only look beautiful but also carry deep meaning and support the artisan communities. Let's explore together! 🌍`
        ];
        
        const aiResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setTimeout(() => {
            const aiMsg = document.createElement('div');
            aiMsg.className = 'ai-message';
            aiMsg.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content"><p>${aiResponse}</p></div>
            `;
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async sendMentorMessage() {
        const input = document.getElementById('mentorChatInput');
        const chatMessages = document.getElementById('mentorChatMessages');
        
        if (!input || !chatMessages) return; 
        
        const message = input.value.trim();
        if (!message) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'user-message';
        userMsg.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content"><p>${message}</p></div>
        `;
        chatMessages.appendChild(userMsg);
        input.value = '';

        // Generate AI response
        const responses = [
            `Excellent question! For ${message.toLowerCase()}, I recommend focusing on your unique cultural heritage as your competitive advantage. Your authentic techniques and family traditions cannot be replicated by mass production. 💡`,
            `That's a smart business consideration! When it's about ${message.toLowerCase()}, remember that storytelling is key in the cultural market. Customers buy the heritage and meaning, not just the product. Let's develop a strategy! 📈`,
            `Great thinking! For ${message.toLowerCase()}, consider the premium nature of authentic cultural crafts. Price based on technique complexity, time invested, and cultural significance. Your work deserves proper valuation! 💰`
        ];
        
        const aiResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setTimeout(() => {
            const aiMsg = document.createElement('div');
            aiMsg.className = 'ai-message';
            aiMsg.innerHTML = `
                <div class="message-avatar">🧠</div>
                <div class="message-content"><p>${aiResponse}</p></div>
            `;
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    handleSuggestionClick(suggestion) {
        const shopperInput = document.getElementById('shopperChatInput');
        if (shopperInput) {
            shopperInput.value = `I'm interested in ${suggestion}`;
            this.sendShopperMessage();
        }
    }

    // Shopping Cart Methods
    addToCart(productId) {
        const product = this.culturalData.products.find(p => p.id === productId); 
        if (!product) return; 

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.updateCartUI();
        this.showNotification(`"${product.title}" added to your cultural collection! 🎨`, 'success');
        
        // Update user's cultural points
        if (this.currentUser && this.currentUser.culturalPassport) {
            this.currentUser.culturalPassport.points += 5;
            localStorage.setItem('artisanverse_user', JSON.stringify(this.currentUser));
        }
    }

    addToWishlist(productId) {
        const product = this.culturalData.products.find(p => p.id === productId);
        if (!product) return; 

        if (!this.wishlist.find(item => item.id === productId)) {
            this.wishlist.push(product);
            this.showNotification(`"${product.title}" added to your wishlist! ❤️`, 'success');
        } else {
            this.showNotification('This treasure is already in your wishlist! ❤️', 'info');
        }
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItemCount = document.getElementById('cartItemCount');
        const cartItems = document.getElementById('cartItems');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const impactFee = document.getElementById('impactFee');
        const cartTotal = document.getElementById('cartTotal');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const impact = subtotal * 0.05; // 5% cultural impact fee
        const total = subtotal + impact;
        
        if (cartCount) cartCount.textContent = totalItems;
        if (cartItemCount) cartItemCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
        if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (impactFee) impactFee.textContent = `$${impact.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = total.toFixed(2);
        
        if (cartItems) {
            cartItems.innerHTML = '';
            
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Your cultural collection is empty</p>';
            } else {
                this.cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    const imageUrl = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
                    cartItem.innerHTML = `
                        <div class="cart-item-image"><img src="${imageUrl}" alt="${item.title}"></div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-artisan">by ${item.artisanName}</div>
                            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `;
                    cartItems.appendChild(cartItem);
                });
            }
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('hidden');
        }
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cultural collection is empty! 🛒', 'info');
            return;
        }

        this.showLoading(true);
        
        setTimeout(() => {
            this.showLoading(false);
            
            // Clear cart
            this.cart = [];
            this.updateCartUI();
            this.toggleCart();
            
            // Update user points
            if (this.currentUser && this.currentUser.culturalPassport) {
                this.currentUser.culturalPassport.points += 50;
                if (!this.currentUser.culturalPassport.badges.includes('First Purchase')) {
                    this.currentUser.culturalPassport.badges.push('First Purchase');
                }
                localStorage.setItem('artisanverse_user', JSON.stringify(this.currentUser));
            }
            
            this.showNotification('Purchase successful! Your blockchain certificates are being generated! 🎉', 'success');
        }, 2000);
    }

    // Demo Methods
    triggerAIDemo(demoType) {
        console.log('Triggering AI demo:', demoType);
        
        if (demoType.includes('Craft Twin') || demoType.includes('Storytelling')) {
            this.demoCraftTwin();
        } else if (demoType.includes('AR') || demoType.includes('Try-On')) {
            this.demoAR();
        } else if (demoType.includes('Blockchain') || demoType.includes('Authenticity')) {
            this.demoBlockchain();
        } else if (demoType.includes('Mentor') || demoType.includes('AI Business')) {
            this.demoMentor();
        }
    }

    demoCraftTwin() {
        this.showNotification('🤖 Craft Twin Demo: "Namaste! I am Meera\'s digital twin. Let me tell you the sacred story of block printing..."', 'info');
        setTimeout(() => {
            this.showNotification('🎨 "This art was passed down from my great-great-grandmother, who served the royal court of Jaipur..."', 'info');
        }, 3000);
    }

    demoAR() {
        this.openARExperience('product_001');
    }

    demoBlockchain() {
        this.generateCertificate(this.culturalData.products[0]);
    }

    demoMentor() {
        this.showNotification('🧠 AI Mentor Demo: "Consider pricing your textiles based on technique complexity, time invested, and cultural significance. Your work deserves proper valuation! 💰"', 'info');
    }

    demoAIAssistant() {
        if (this.isAuthenticated) {
            this.navigateTo('dashboard');
            setTimeout(() => this.showDashboardSection('aiShopperSection'), 500);
        } else {
            this.showAuthModal('login');
        }
    }

    // AR Experience
    openARExperience(productId) {
        const product = this.culturalData.products.find(p => p.id === productId) || this.culturalData.products[0];
        
        const arModal = document.getElementById('arModal');
        const arProduct = document.getElementById('arProduct');
        const arProductTitle = document.getElementById('arProductTitle');
        const arProductDescription = document.getElementById('arProductDescription');
        
        if (arModal) {
            arModal.classList.remove('hidden');
            
            if (arProduct) arProduct.textContent = '🎨';
            if (arProductTitle) arProductTitle.textContent = product.title;
            if (arProductDescription) arProductDescription.textContent = product.culturalStory;
            
            // Bind AR controls
            setTimeout(() => {
                const arRotateBtn = document.getElementById('arRotateBtn');
                const arScaleBtn = document.getElementById('arScaleBtn');
                const arCaptureBtn = document.getElementById('arCaptureBtn');
                const arAddToCartBtn = document.getElementById('arAddToCartBtn');
                
                if (arRotateBtn) arRotateBtn.onclick = () => this.rotateARObject();
                if (arScaleBtn) arScaleBtn.onclick = () => this.scaleARObject();
                if (arCaptureBtn) arCaptureBtn.onclick = () => this.captureARPhoto();
                if (arAddToCartBtn) arAddToCartBtn.onclick = () => this.addToCart(productId);
            }, 100);
        }
    }

    rotateARObject() {
        const arProduct = document.getElementById('arProduct');
        if (arProduct) {
            arProduct.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg) scale(1.2)`;
        }
        this.showNotification('AR object rotated! 🔄', 'info');
    }

    scaleARObject() {
        const arProduct = document.getElementById('arProduct');
        if (arProduct) {
            const scale = 0.8 + Math.random() * 0.4;
            arProduct.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }
        this.showNotification('AR object resized! 📏', 'info');
    }

    captureARPhoto() {
        this.showNotification('AR photo captured! Perfect for sharing your cultural style! 📸', 'success');
    }

    generateCertificate(product) {
        const certificateModal = document.getElementById('certificateModal');
        const certId = document.getElementById('certId');
        const certProduct = document.getElementById('certProduct');
        const certArtisan = document.getElementById('certArtisan');
        const certHash = document.getElementById('certHash');
        const certDate = document.getElementById('certDate');
        
        if (certificateModal) {
            certificateModal.classList.remove('hidden');
            
            if (certId) certId.textContent = product.authenticity.certificateId;
            if (certProduct) certProduct.textContent = product.title;
            if (certArtisan) certArtisan.textContent = product.artisanName;
            if (certHash) certHash.textContent = product.authenticity.blockchainHash;
            if (certDate) certDate.textContent = new Date().toLocaleDateString();
            
            // Bind certificate actions
            setTimeout(() => {
                const downloadCertBtn = document.getElementById('downloadCertBtn');
                const verifyCertBtn = document.getElementById('verifyCertBtn');
                
                if (downloadCertBtn) downloadCertBtn.onclick = () => this.downloadCertificate();
                if (verifyCertBtn) verifyCertBtn.onclick = () => this.verifyCertificate();
            }, 100);
        }
    }

    downloadCertificate() {
        this.showNotification('Certificate downloaded! Share your authentic cultural treasure! 📄', 'success');
    }

    verifyCertificate() {
        this.showLoading(true);
        setTimeout(() => {
            this.showLoading(false);
            this.showNotification('✅ Certificate verified on blockchain! Your piece is 100% authentic! 🔗', 'success');
        }, 1500);
    }

    // Utility Methods
    performAISearch() {
        const searchInput = document.getElementById('aiSearch');
        const query = searchInput?.value.trim();
        
        if (!query) {
            this.showNotification('Please enter a search query 🔍', 'info');
            return;
        }
        
        this.showLoading(true);
        
        setTimeout(() => {
            this.showLoading(false);
            this.showNotification(`🔍 AI Search results for "${query}" - Found ${Math.floor(Math.random() * 50) + 10} cultural treasures matching your query!`, 'success');
            
            if (this.isAuthenticated) {
                this.navigateTo('products');
            } else {
                this.showAuthModal('login');
            }
            
            if (searchInput) searchInput.value = '';
        }, 1500);
    }

    scrollToSection(sectionClass) {
        const section = document.querySelector(`.${sectionClass}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    startCulturalAnimations() {
        console.log('🎨 Cultural animations started');
    }

    loadCulturalStories() {
        console.log('📚 Cultural stories loaded');
    }

    openCulturalStory(title) {
        this.showNotification(`📚 Opening cultural story: "${title}". Immersive storytelling experience loading...`, 'info');
        
        if (this.currentUser && this.currentUser.culturalPassport) {
            this.currentUser.culturalPassport.points += 10;
            if (!this.currentUser.culturalPassport.badges.includes('Story Reader')) {
                this.currentUser.culturalPassport.badges.push('Story Reader');
                this.showNotification('🏆 Badge earned: Story Reader! Keep exploring!', 'success');
            }
            localStorage.setItem('artisanverse_user', JSON.stringify(this.currentUser));
        }
    }

    registerWorkshop(workshopId) {
        const workshop = this.culturalData.workshops.find(w => w.id === workshopId); 
        if (!workshop) return; 

        this.showLoading(true);
        
        setTimeout(() => {
            this.showLoading(false);
            this.showNotification(`🎉 Successfully registered for "${workshop.title}"! Check your email for details.`, 'success');
            
            if (this.currentUser && this.currentUser.culturalPassport) {
                this.currentUser.culturalPassport.points += 25;
                if (!this.currentUser.culturalPassport.badges.includes('Workshop Attendee')) {
                    this.currentUser.culturalPassport.badges.push('Workshop Attendee');
                    this.showNotification('🏆 Badge earned: Workshop Attendee! Keep learning!', 'success');
                }
                localStorage.setItem('artisanverse_user', JSON.stringify(this.currentUser));
            }
        }, 1500);
    }

    likePost() {
        this.showNotification('Post liked! ❤️ Spreading cultural appreciation!', 'success');
    }

    commentPost() {
        this.showNotification('Comment added! 💬 Join the cultural conversation!', 'success');
    }

    sharePost() {
        this.showNotification('Post shared! 🔗 Spreading cultural heritage!', 'success');
    }

    toggleAIAssistant() {
        if (this.isAuthenticated) {
            this.showDashboardSection('aiShopperSection');
        } else {
            this.showNotification('🤖 Sign in to access your personal AI Cultural Assistant!', 'info');
            this.showAuthModal('login');
        }
    }

    refreshRecommendations() {
        this.showLoading(true);
        setTimeout(() => {
            this.showLoading(false);
            this.loadRecommendations();
            this.showNotification('🤖 AI recommendations refreshed based on your evolving cultural interests!', 'success');
        }, 1000);
    }

    // Loading and Notification System
    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
    }

    showNotification(message, type = 'info') {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // Remove on click
        notification.addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
}

// Initialize the application
let app;

function initializeApp() {
    if (!app) {
        console.log('🚀 Initializing ArtisanVerse Application...');
        app = new ArtisanVerseApp();
        window.app = app; // Make globally accessible
    }
}

// Multiple initialization strategies
if (document.readyState === 'complete') {
    initializeApp();
} else if (document.readyState === 'interactive') {
    initializeApp();
} else {
    document.addEventListener('DOMContentLoaded', initializeApp);
}

window.addEventListener('load', () => {
    if (!app) {
        initializeApp();
    }
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('🚨 Application error:', event.error);
    if (window.app) {
        window.app.showNotification('Something went wrong, but we\'re handling it! 🔧', 'error');
    }
});

console.log('🎨 ArtisanVerse - AI-Powered Cultural Heritage Marketplace Loaded Successfully! ✨');