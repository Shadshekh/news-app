# 🗞️ Enhanced News Viewer App

A modern, feature-rich news application built with vanilla JavaScript, HTML, and CSS. This app provides a comprehensive news reading experience with advanced features for power users.

## ✨ Features

### 🔍 Core News Features
- **Real-time News**: Fetch latest news from multiple sources
- **Smart Search**: Search across all news articles with instant results
- **Category Filtering**: Filter news by business, technology, sports, entertainment, health, science, and general
- **Country Selection**: Get localized news from 10+ countries
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### 🎯 Advanced Features

#### 📖 Reading Mode
- **Distraction-free Reading**: Full-screen reading experience with optimized typography
- **Reading Time Estimation**: Shows estimated reading time for each article
- **Reading History**: Automatically tracks articles you've read
- **Keyboard Shortcuts**: Use `Ctrl+R` (or `Cmd+R` on Mac) to enter reading mode

#### 🎤 Voice Search
- **Speech Recognition**: Search news using your voice
- **Multi-language Support**: Works with English and other supported languages
- **Visual Feedback**: Real-time recording indicators
#### 📚 Content Management
- **Bookmarks**: Save favorite articles for later reading
- **Offline Storage**: Download articles for offline access
- **Reading History**: Track your reading journey
- **Smart Categories**: Automatic category detection with visual icons

#### 🔧 Advanced Filters
- **Date Range**: Filter news by specific date ranges
- **Sorting Options**: Sort by date, relevancy, or popularity
- **Language Filtering**: Filter by article language
- **Multiple API Support**: Fallback to demo data when APIs are unavailable

#### 📱 Enhanced Sharing
- **QR Code Generation**: Generate shareable QR codes for articles
- **Multiple Platforms**: Share via email, Twitter, or copy to clipboard
- **Rich Previews**: Include article title, description, and source

#### ⚖️ News Comparison
- **Side-by-side Comparison**: Compare two articles simultaneously
- **Detailed Analysis**: View source, date, category, and reading time side by side
- **Interactive Selection**: Click to select articles for comparison

#### 🔔 Smart Notifications
- **Breaking News Alerts**: Get notified of fresh breaking news
- **Browser Notifications**: Desktop notifications for important updates
- **Configurable Settings**: Enable/disable notifications as needed

### 🎨 User Experience Features
- **Dark/Light Theme**: Toggle between themes with persistent settings
- **Smooth Animations**: Beautiful transitions and hover effects
- **Keyboard Navigation**: Full keyboard support for power users
- **Responsive Layout**: Adapts to any screen size
- **Loading States**: Visual feedback during data fetching
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for news fetching
- Microphone access for voice search (optional)

### Installation
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Start exploring news!

### Usage Tips
- **Quick Search**: Press `Ctrl+K` to focus the search bar
- **Reading Mode**: Click the book icon on any article or press `Ctrl+R`
- **Voice Search**: Click the microphone icon and speak your search terms
- **Article Comparison**: Click the scale icon on an article, then select another to compare
- **Offline Reading**: Use the download icon to save articles for offline access
- **Theme Toggle**: Click the moon/sun icon to switch themes

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Advanced styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: ES6+ features and modern APIs
- **Font Awesome**: Beautiful icons for enhanced UI
- **Google Fonts**: Optimized typography with Inter font family

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### APIs Used
- **NewsAPI**: Primary news source
- **GNews**: Secondary news source
- **Web Speech API**: Voice recognition
- **Local Storage**: Data persistence
- **Web Share API**: Native sharing (when available)

## 📱 Responsive Design

The app is fully responsive and optimized for:
- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Touch-friendly interface with adapted layouts
- **Mobile**: Optimized for small screens with gesture support

## 🔧 Customization

### Adding New Categories
Edit the `getCategoryFromTitle()` method in `script.js` to add custom category detection rules.

### Modifying API Sources
Update the `apis` object in the constructor to add or modify news sources.

### Theme Customization
Modify the CSS variables in `styles.css` to create custom color schemes.

## 🚧 Future Enhancements

- [ ] Real-time news updates with WebSockets
- [ ] Advanced analytics and reading insights
- [ ] Social features and user accounts
- [ ] AI-powered news recommendations
- [ ] Podcast and video news integration
- [ ] Multi-language news support
- [ ] Advanced search filters (sentiment, bias detection)
- [ ] News summarization and key points extraction

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- NewsAPI and GNews for providing news data
- Font Awesome for the beautiful icons
- Google Fonts for the typography
- The open-source community for inspiration and tools

---

**Happy News Reading! 📰✨** 