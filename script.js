// Enhanced News Viewer Application JavaScript

class NewsViewer {
    constructor() {
        this.currentPage = 1;
        this.currentSearch = '';
        this.currentCategory = '';
        this.currentCountry = 'us';
        this.articles = [];
        this.bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
        this.readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        this.isLoading = false;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.isReadingMode = false;
        this.currentArticle = null;
        this.voiceRecognition = null;
        this.offlineArticles = JSON.parse(localStorage.getItem('offlineArticles') || '[]');
        
        // Multiple API Configuration
        this.apis = {
            newsapi: {
                key: 'demo',
                baseUrl: 'https://newsapi.org/v2',
                endpoint: '/top-headlines'
            },
            gnews: {
                key: 'demo',
                baseUrl: 'https://gnews.io/api/v4',
                endpoint: '/top-headlines'
            }
        };
        
        this.currentApi = 'newsapi';
        
        this.initializeElements();
        this.bindEvents();
        this.applyTheme();
        this.loadNews();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.categorySelect = document.getElementById('categorySelect');
        this.countrySelect = document.getElementById('countrySelect');
        this.newsGrid = document.getElementById('newsGrid');
        this.loading = document.getElementById('loading');
        this.noResults = document.getElementById('noResults');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.bookmarksBtn = document.getElementById('bookmarksBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.shareBtn = document.getElementById('shareBtn');
        this.filterBtn = document.getElementById('filterBtn');
        this.filterPanel = document.getElementById('filterPanel');
        
        // New elements for advanced features
        this.voiceSearchBtn = document.getElementById('voiceSearchBtn');
        this.readingModeBtn = document.getElementById('readingModeBtn');
        this.historyBtn = document.getElementById('historyBtn');
        this.offlineBtn = document.getElementById('offlineBtn');
        this.advancedFiltersBtn = document.getElementById('advancedFiltersBtn');
        this.notificationsBtn = document.getElementById('notificationsBtn');
    }

    bindEvents() {
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Category and country filter
        this.categorySelect.addEventListener('change', () => this.handleCategoryChange());
        this.countrySelect.addEventListener('change', () => this.handleCountryChange());

        // Load more button
        this.loadMoreBtn.addEventListener('click', () => this.loadMoreNews());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Bookmarks
        this.bookmarksBtn.addEventListener('click', () => this.toggleBookmarksView());

        // Share functionality
        this.shareBtn.addEventListener('click', () => this.shareCurrentView());

        // Filter panel
        this.filterBtn.addEventListener('click', () => this.toggleFilterPanel());

        // New feature buttons
        if (this.voiceSearchBtn) {
            this.voiceSearchBtn.addEventListener('click', () => this.toggleVoiceSearch());
        }
        if (this.readingModeBtn) {
            this.readingModeBtn.addEventListener('click', () => this.toggleReadingMode());
        }
        if (this.historyBtn) {
            this.historyBtn.addEventListener('click', () => this.toggleHistoryView());
        }
        if (this.offlineBtn) {
            this.offlineBtn.addEventListener('click', () => this.toggleOfflineView());
        }
        if (this.advancedFiltersBtn) {
            this.advancedFiltersBtn.addEventListener('click', () => this.toggleAdvancedFilters());
        }
        if (this.notificationsBtn) {
            this.notificationsBtn.addEventListener('click', () => this.toggleNotifications());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
            }
            if (e.key === 'Escape') {
                this.closeFilterPanel();
                if (this.isReadingMode) {
                    this.exitReadingMode();
                }
            }
            if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.toggleReadingMode();
            }
        });
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.searchInput.value = transcript;
                this.handleSearch();
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.showNotification('Voice recognition failed. Please try again.');
            };
        }
    }

    toggleVoiceSearch() {
        if (!this.voiceRecognition) {
            this.showNotification('Voice search is not supported in your browser.');
            return;
        }
        
        if (this.voiceRecognition.state === 'recording') {
            this.voiceRecognition.stop();
            this.voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            this.voiceSearchBtn.classList.remove('recording');
        } else {
            this.voiceRecognition.start();
            this.voiceSearchBtn.innerHTML = '<i class="fas fa-stop"></i>';
            this.voiceSearchBtn.classList.add('recording');
            this.showNotification('Listening... Speak now!');
        }
    }

    selectArticle(article) {
        this.currentArticle = article;
        if (this.isReadingMode) {
            this.enterReadingMode();
        }
    }

    toggleReadingMode() {
        if (!this.currentArticle) {
            this.showNotification('Please select an article to enter reading mode.');
            return;
        }
        
        this.isReadingMode = !this.isReadingMode;
        if (this.isReadingMode) {
            this.enterReadingMode();
        } else {
            this.exitReadingMode();
        }
    }

    enterReadingMode(article = null) {
        if (article) {
            this.currentArticle = article;
        }
        
        if (!this.currentArticle) {
            this.showNotification('Please select an article to enter reading mode.');
            return;
        }
        
        this.isReadingMode = true;
        document.body.classList.add('reading-mode');
        this.createReadingModeView();
        this.addToReadingHistory(this.currentArticle);
    }

    enterReadingMode() {
        document.body.classList.add('reading-mode');
        this.createReadingModeView();
        this.addToReadingHistory(this.currentArticle);
    }

    exitReadingMode() {
        document.body.classList.remove('reading-mode');
        this.removeReadingModeView();
        this.isReadingMode = false;
        this.currentArticle = null;
    }

    createReadingModeView() {
        const readingContainer = document.createElement('div');
        readingContainer.id = 'readingModeContainer';
        readingContainer.className = 'reading-mode-container';
        
        const article = this.currentArticle;
        const readingTime = this.calculateReadingTime(article.description || '');
        
        readingContainer.innerHTML = `
            <div class="reading-header">
                <button class="close-reading-btn" onclick="newsViewer.exitReadingMode()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="reading-meta">
                    <span class="reading-category">${this.getCategoryFromTitle(article.title)}</span>
                    <span class="reading-time"><i class="fas fa-clock"></i> ${readingTime} min read</span>
                </div>
            </div>
            <div class="reading-content">
                <h1 class="reading-title">${article.title}</h1>
                <div class="reading-source-date">
                    <span class="reading-source">${article.source?.name || 'Unknown source'}</span>
                    <span class="reading-date">${this.formatDate(article.publishedAt)}</span>
                </div>
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" class="reading-image">` : ''}
                <div class="reading-description">${article.description || 'No description available.'}</div>
                <div class="reading-actions">
                    <button class="reading-action-btn" onclick="newsViewer.saveForOffline(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                        <i class="fas fa-download"></i> Save Offline
                    </button>
                    <button class="reading-action-btn" onclick="newsViewer.shareArticle(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                    <button class="reading-action-btn" onclick="newsViewer.toggleBookmark(null, ${JSON.stringify(article).replace(/"/g, '&quot;')})">
                        <i class="fas fa-bookmark"></i> Bookmark
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(readingContainer);
        setTimeout(() => readingContainer.classList.add('show'), 100);
    }

    removeReadingModeView() {
        const container = document.getElementById('readingModeContainer');
        if (container) {
            container.classList.remove('show');
            setTimeout(() => {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }, 300);
        }
    }

    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    }

    addToReadingHistory(article) {
        const existingIndex = this.readingHistory.findIndex(item => 
            item.title === article.title && item.source?.name === article.source?.name
        );
        
        if (existingIndex > -1) {
            this.readingHistory.splice(existingIndex, 1);
        }
        
        this.readingHistory.unshift({
            ...article,
            readAt: new Date().toISOString()
        });
        
        // Keep only last 50 articles
        if (this.readingHistory.length > 50) {
            this.readingHistory = this.readingHistory.slice(0, 50);
        }
        
        localStorage.setItem('readingHistory', JSON.stringify(this.readingHistory));
    }

    toggleHistoryView() {
        const isHistoryView = this.historyBtn.classList.contains('active');
        
        if (isHistoryView) {
            this.historyBtn.classList.remove('active');
            this.loadNews();
        } else {
            this.historyBtn.classList.add('active');
            this.articles = this.readingHistory;
            this.displayNews();
        }
    }

    toggleOfflineView() {
        const isOfflineView = this.offlineBtn.classList.contains('active');
        
        if (isOfflineView) {
            this.offlineBtn.classList.remove('active');
            this.loadNews();
        } else {
            this.offlineBtn.classList.add('active');
            this.articles = this.offlineArticles;
            this.displayNews();
        }
    }

    saveForOffline(article) {
        const existingIndex = this.offlineArticles.findIndex(item => 
            item.title === article.title && item.source?.name === article.source?.name
        );
        
        if (existingIndex > -1) {
            this.offlineArticles.splice(existingIndex, 1);
            this.showNotification('Article removed from offline storage');
        } else {
            this.offlineArticles.push({
                ...article,
                savedAt: new Date().toISOString()
            });
            this.showNotification('Article saved for offline reading');
        }
        
        localStorage.setItem('offlineArticles', JSON.stringify(this.offlineArticles));
    }

    toggleAdvancedFilters() {
        const isAdvancedView = this.advancedFiltersBtn.classList.contains('active');
        
        if (isAdvancedView) {
            this.advancedFiltersBtn.classList.remove('active');
            this.hideAdvancedFilters();
        } else {
            this.advancedFiltersBtn.classList.add('active');
            this.showAdvancedFilters();
        }
    }

    showAdvancedFilters() {
        if (!document.getElementById('advancedFiltersPanel')) {
            const advancedPanel = document.createElement('div');
            advancedPanel.id = 'advancedFiltersPanel';
            advancedPanel.className = 'advanced-filters-panel';
            
            advancedPanel.innerHTML = `
                <div class="advanced-filters-content">
                    <h3>Advanced Filters</h3>
                    <div class="advanced-filter-group">
                        <label for="dateFrom">From Date</label>
                        <input type="date" id="dateFrom" class="advanced-filter-input">
                    </div>
                    <div class="advanced-filter-group">
                        <label for="dateTo">To Date</label>
                        <input type="date" id="dateTo" class="advanced-filter-input">
                    </div>
                    <div class="advanced-filter-group">
                        <label for="sortBy">Sort By</label>
                        <select id="sortBy" class="advanced-filter-select">
                            <option value="publishedAt">Date</option>
                            <option value="relevancy">Relevancy</option>
                            <option value="popularity">Popularity</option>
                        </select>
                    </div>
                    <div class="advanced-filter-group">
                        <label for="language">Language</label>
                        <select id="language" class="advanced-filter-select">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                        </select>
                    </div>
                    <button class="apply-filters-btn" onclick="newsViewer.applyAdvancedFilters()">
                        Apply Filters
                    </button>
                </div>
            `;
            
            this.filterPanel.appendChild(advancedPanel);
        }
        
        document.getElementById('advancedFiltersPanel').style.display = 'block';
    }

    hideAdvancedFilters() {
        const advancedPanel = document.getElementById('advancedFiltersPanel');
        if (advancedPanel) {
            advancedPanel.style.display = 'none';
        }
    }

    applyAdvancedFilters() {
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const sortBy = document.getElementById('sortBy').value;
        const language = document.getElementById('language').value;
        
        // Apply filters logic here
        this.showNotification('Advanced filters applied!');
        this.loadNews();
    }

    toggleNotifications() {
        if (!('Notification' in window)) {
            this.showNotification('Notifications are not supported in your browser.');
            return;
        }
        
        if (Notification.permission === 'granted') {
            Notification.permission = 'denied';
            this.notificationsBtn.classList.remove('active');
            this.showNotification('Notifications disabled');
        } else if (Notification.permission === 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.notificationsBtn.classList.add('active');
                    this.showNotification('Notifications enabled!');
                }
            });
        } else {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.notificationsBtn.classList.add('active');
                    this.showNotification('Notifications enabled!');
                }
            });
        }
    }

    checkForNotifications() {
        if ('Notification' in window && Notification.permission === 'granted') {
            // Check for breaking news every 30 minutes
            setInterval(() => {
                this.checkBreakingNews();
            }, 30 * 60 * 1000);
        }
    }

    async checkBreakingNews() {
        try {
            const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=demo');
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                const latestArticle = data.articles[0];
                const hoursAgo = (new Date() - new Date(latestArticle.publishedAt)) / (1000 * 60 * 60);
                
                if (hoursAgo < 2) { // Breaking news within 2 hours
                    new Notification('Breaking News!', {
                        body: latestArticle.title,
                        icon: latestArticle.urlToImage || '/favicon.ico'
                    });
                }
            }
        } catch (error) {
            console.error('Error checking breaking news:', error);
        }
    }

    async loadNews() {
        try {
            this.showLoading(true);
            this.currentPage = 1;
            
            const url = this.buildApiUrl();
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }
            
            const data = await response.json();
            
            if (data.status === 'error' || data.errors) {
                // Handle API errors (like rate limiting)
                this.showDemoNews();
                return;
            }
            
            this.articles = this.parseApiResponse(data);
            this.displayNews();
            
        } catch (error) {
            console.error('Error loading news:', error);
            this.showDemoNews();
        } finally {
            this.showLoading(false);
        }
    }

    parseApiResponse(data) {
        if (this.currentApi === 'newsapi') {
            return data.articles || [];
        } else if (this.currentApi === 'gnews') {
            return data.articles || [];
        }
        return [];
    }

    buildApiUrl() {
        const api = this.apis[this.currentApi];
        const params = new URLSearchParams({
            apiKey: api.key,
            page: this.currentPage,
            pageSize: 12
        });

        if (this.currentSearch) {
            params.append('q', this.currentSearch);
        } else if (this.currentCategory) {
            params.append('category', this.currentCategory);
        } else {
            params.append('country', this.currentCountry);
        }

        return `${api.baseUrl}${api.endpoint}?${params}`;
    }

    showDemoNews() {
        // Enhanced demo news data
        this.articles = [
            {
                title: "Breaking: Major Tech Innovation Announced",
                description: "A revolutionary new technology has been unveiled that promises to transform the industry landscape and improve efficiency across multiple sectors.",
                urlToImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop",
                source: { name: "Tech Daily" },
                publishedAt: "2024-01-15T10:30:00Z",
                category: "technology",
                url: "#"
            },
            {
                title: "Global Markets Show Strong Recovery",
                description: "Financial markets worldwide are experiencing a significant upturn, with major indices reaching new highs and investor confidence on the rise.",
                urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
                source: { name: "Business Times" },
                publishedAt: "2024-01-15T09:15:00Z",
                category: "business",
                url: "#"
            },
            {
                title: "Championship Finals Set for Record Attendance",
                description: "The upcoming championship game is expected to draw the largest crowd in history, with fans from around the world securing their tickets.",
                urlToImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
                source: { name: "Sports Central" },
                publishedAt: "2024-01-15T08:45:00Z",
                category: "sports",
                url: "#"
            },
            {
                title: "New Health Guidelines Released",
                description: "Health authorities have issued updated guidelines that could significantly impact public health policies and individual wellness practices.",
                urlToImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop",
                source: { name: "Health News" },
                publishedAt: "2024-01-15T07:30:00Z",
                category: "health",
                url: "#"
            },
            {
                title: "Entertainment Industry Celebrates Record Year",
                description: "The entertainment sector has reported unprecedented growth, with streaming services and live events driving the industry to new heights.",
                urlToImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=200&fit=crop",
                source: { name: "Entertainment Weekly" },
                publishedAt: "2024-01-15T06:20:00Z",
                category: "entertainment",
                url: "#"
            },
            {
                title: "Scientific Breakthrough in Renewable Energy",
                description: "Researchers have made a groundbreaking discovery in renewable energy technology that could accelerate the transition to clean energy sources.",
                urlToImage: "https://images.unsplash.com/photo-1509391366360-2e959784f276?w=400&h=200&fit=crop",
                source: { name: "Science Daily" },
                publishedAt: "2024-01-15T05:10:00Z",
                category: "science",
                url: "#"
            },
            {
                title: "Climate Change Summit Yields Historic Agreement",
                description: "World leaders have reached a landmark agreement on climate action, setting ambitious targets for carbon reduction and renewable energy adoption.",
                urlToImage: "https://images.unsplash.com/photo-1569163131107-9eb3a97c4a8c?w=400&h=200&fit=crop",
                source: { name: "Global News" },
                publishedAt: "2024-01-15T04:30:00Z",
                category: "general",
                url: "#"
            },
            {
                title: "Space Exploration: New Mars Mission Announced",
                description: "NASA has announced plans for a groundbreaking Mars mission that will search for signs of ancient life on the red planet.",
                urlToImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=200&fit=crop",
                source: { name: "Space Today" },
                publishedAt: "2024-01-15T03:45:00Z",
                category: "science",
                url: "#"
            }
        ];
        
        this.displayNews();
    }

    displayNews() {
        if (this.articles.length === 0) {
            this.showNoResults();
            return;
        }

        this.hideNoResults();
        
        const newsHTML = this.articles.map(article => this.createNewsCard(article)).join('');
        
        if (this.currentPage === 1) {
            this.newsGrid.innerHTML = newsHTML;
        } else {
            this.newsGrid.insertAdjacentHTML('beforeend', newsHTML);
        }

        this.showLoadMoreButton();
        this.updateBookmarksCount();
    }

    createNewsCard(article) {
        const imageUrl = article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
        const title = article.title || 'No title available';
        const description = article.description || 'No description available';
        const source = article.source?.name || 'Unknown source';
        const date = this.formatDate(article.publishedAt);
        const category = this.getCategoryFromTitle(title);
        const isBookmarked = this.isArticleBookmarked(article);
        const readingTime = this.calculateReadingTime(description);
        const categoryIcon = this.getCategoryIcon(category);

        return `
            <article class="news-card" data-url="${article.url || '#'}">
                <div class="card-image-container">
                    <img src="${imageUrl}" alt="${title}" class="news-image" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'">
                    <div class="card-overlay">
                        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="event.stopPropagation(); newsViewer.toggleBookmark(this, ${JSON.stringify(article).replace(/"/g, '&quot;')})">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="share-btn" onclick="event.stopPropagation(); newsViewer.shareArticle(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="news-content">
                    <div class="news-header">
                        <span class="news-category">
                            <i class="fas ${categoryIcon}"></i>
                            ${category}
                        </span>
                        <span class="reading-time">
                            <i class="fas fa-clock"></i>
                            ${readingTime} min read
                        </span>
                    </div>
                    <h3 class="news-title">${title}</h3>
                    <p class="news-description">${description}</p>
                    <div class="news-meta">
                        <span class="news-source">${source}</span>
                        <span class="news-date">${date}</span>
                    </div>
                </div>
            </article>
        `;
    }

    isArticleBookmarked(article) {
        return this.bookmarkedArticles.some(bookmarked => 
            bookmarked.title === article.title && 
            bookmarked.source?.name === article.source?.name
        );
    }

    toggleBookmark(button, article) {
        const isBookmarked = this.isArticleBookmarked(article);
        
        if (isBookmarked) {
            this.bookmarkedArticles = this.bookmarkedArticles.filter(bookmarked => 
                !(bookmarked.title === article.title && bookmarked.source?.name === article.source?.name)
            );
            button.classList.remove('bookmarked');
        } else {
            this.bookmarkedArticles.push(article);
            button.classList.add('bookmarked');
        }
        
        localStorage.setItem('bookmarkedArticles', JSON.stringify(this.bookmarkedArticles));
        this.updateBookmarksCount();
    }

    updateBookmarksCount() {
        const count = this.bookmarkedArticles.length;
        const badge = this.bookmarksBtn.querySelector('.badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    toggleBookmarksView() {
        const isBookmarksView = this.bookmarksBtn.classList.contains('active');
        
        if (isBookmarksView) {
            this.bookmarksBtn.classList.remove('active');
            this.loadNews();
        } else {
            this.bookmarksBtn.classList.add('active');
            this.articles = this.bookmarkedArticles;
            this.displayNews();
        }
    }

    shareArticle(article) {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.description,
                url: article.url
            });
        } else {
            const text = `${article.title}\n\n${article.description}\n\nRead more: ${article.url}`;
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Article link copied to clipboard!');
            });
        }
    }

    

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    applyTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        this.themeToggle.innerHTML = this.isDarkMode ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
    }

    toggleFilterPanel() {
        this.filterPanel.classList.toggle('show');
        this.filterBtn.classList.toggle('active');
    }

    closeFilterPanel() {
        this.filterPanel.classList.remove('show');
        this.filterBtn.classList.remove('active');
    }

    getCategoryFromTitle(title) {
        const titleLower = title.toLowerCase();
        const categories = {
            'tech': 'technology',
            'ai': 'technology',
            'business': 'business',
            'market': 'business',
            'sport': 'sports',
            'health': 'health',
            'medical': 'health',
            'science': 'science',
            'space': 'science',
            'entertainment': 'entertainment',
            'movie': 'entertainment',
            'climate': 'general',
            'environment': 'general'
        };

        for (const [keyword, category] of Object.entries(categories)) {
            if (titleLower.includes(keyword)) {
                return category;
            }
        }
        return 'general';
    }

    getCategoryIcon(category) {
        const icons = {
            'technology': 'fa-microchip',
            'business': 'fa-chart-line',
            'sports': 'fa-futbol',
            'health': 'fa-heartbeat',
            'science': 'fa-flask',
            'entertainment': 'fa-film',
            'general': 'fa-newspaper'
        };
        return icons[category] || 'fa-newspaper';
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    async handleSearch() {
        const searchTerm = this.searchInput.value.trim();
        if (searchTerm === this.currentSearch) return;
        
        this.currentSearch = searchTerm;
        this.currentCategory = '';
        this.currentCountry = 'us';
        this.categorySelect.value = '';
        this.countrySelect.value = 'us';
        await this.loadNews();
    }

    async handleCategoryChange() {
        const category = this.categorySelect.value;
        if (category === this.currentCategory) return;
        
        this.currentCategory = category;
        this.currentSearch = '';
        this.currentCountry = 'us';
        this.searchInput.value = '';
        this.countrySelect.value = 'us';
        await this.loadNews();
    }

    async handleCountryChange() {
        const country = this.countrySelect.value;
        if (country === this.currentCountry) return;
        
        this.currentCountry = country;
        this.currentSearch = '';
        this.currentCategory = '';
        this.searchInput.value = '';
        this.categorySelect.value = '';
        await this.loadNews();
    }

    async loadMoreNews() {
        if (this.isLoading) return;
        
        this.currentPage++;
        this.isLoading = true;
        this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        try {
            const url = this.buildApiUrl();
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'error' || data.errors) {
                // Add more demo news
                const moreDemoNews = [
                    {
                        title: "Additional Tech News: AI Breakthrough",
                        description: "Artificial intelligence researchers have achieved a major milestone that could revolutionize how we interact with technology.",
                        urlToImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
                        source: { name: "AI Weekly" },
                        publishedAt: "2024-01-15T04:00:00Z",
                        category: "technology",
                        url: "#"
                    },
                    {
                        title: "Market Analysis: Investment Trends",
                        description: "Financial analysts are reporting new investment patterns that could reshape the global economy in the coming years.",
                        urlToImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
                        source: { name: "Finance Today" },
                        publishedAt: "2024-01-15T03:30:00Z",
                        category: "business",
                        url: "#"
                    }
                ];
                
                this.articles = [...this.articles, ...moreDemoNews];
            } else {
                const newArticles = this.parseApiResponse(data);
                this.articles = [...this.articles, ...newArticles];
            }
            
            this.displayNews();
            
        } catch (error) {
            console.error('Error loading more news:', error);
        } finally {
            this.isLoading = false;
            this.loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More News';
        }
    }

    showLoading(show) {
        this.loading.style.display = show ? 'flex' : 'none';
        this.newsGrid.style.display = show ? 'none' : 'grid';
    }

    showNoResults() {
        this.noResults.style.display = 'block';
        this.newsGrid.style.display = 'none';
        this.loadMoreBtn.style.display = 'none';
    }

    hideNoResults() {
        this.noResults.style.display = 'none';
        this.newsGrid.style.display = 'grid';
    }

    showLoadMoreButton() {
        if (this.articles.length >= 6) {
            this.loadMoreBtn.style.display = 'inline-flex';
        } else {
            this.loadMoreBtn.style.display = 'none';
        }
    }
}

    // Initialize the application when DOM is loaded
    let newsViewer;
    document.addEventListener('DOMContentLoaded', () => {
        newsViewer = new NewsViewer();

        // Simple click handler: open article in new tab
        document.addEventListener('click', (e) => {
            const newsCard = e.target.closest('.news-card');
            if (newsCard) {
                const url = newsCard.dataset.url;
                if (url && url !== '#') {
                    window.open(url, '_blank');
                }
            }
        });

        // Smooth scroll to top when clicking on logo
        const logo = document.querySelector('.logo');
        logo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Add loading animation to search button
        const searchBtn = document.getElementById('searchBtn');
        searchBtn.addEventListener('click', () => {
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            setTimeout(() => {
                searchBtn.innerHTML = '<i class="fas fa-search"></i>';
            }, 1000);
        });
    }); 