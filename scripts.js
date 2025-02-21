const apiKey = '00b29c021b7344748bbd91c2949d812b'; // Using one of the provided keys
let page = 1;
let loading = false;
let currentCategory = 'all';

async function fetchNews(category = 'all', page = 1) {
    document.querySelector('.loading-spinner').style.display = 'block';
    let url = `https://newsapi.org/v2/top-headlines?country=us&page=${page}&apiKey=${apiKey}`;
    if (category !== 'all') {
        url += `&category=${category}`;
    }
    try {
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.articles.map(article => ({ ...article, category }));
        document.querySelector('.loading-spinner').style.display = 'none';
        return articles;
    } catch (error) {
        console.error('Error fetching news:', error);
        document.querySelector('.loading-spinner').style.display = 'none';
        return [];
    }
}

function displayNews(articles, append = false) {
    const newsContainer = document.querySelector('.news-container');
    if (!append) {
        newsContainer.innerHTML = '';
    }
    if (articles.length === 0) {
        newsContainer.innerHTML = '<p>No articles found.</p>';
        return;
    }
    articles.forEach((article, index) => {
        const articleElement = document.createElement('div');
        articleElement.classList.add('news-article');
        articleElement.setAttribute('data-category', article.category);
        articleElement.style.animationDelay = `${index * 0.1}s`;
        articleElement.innerHTML = `
            <span class="category-label">${article.category}</span>
            <img src="${article.urlToImage || 'https://via.placeholder.com/300x200'}" alt="${article.title}">
            <h2>${article.title}</h2>
            <p>${article.description || 'No description available.'}</p>
            <a href="${article.url}" target="_blank" class="read-more">Read More</a>
            <div class="social-share">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}&quote=${encodeURIComponent(article.title)}" target="_blank" class="share-facebook">Facebook</a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(article.url)}&text=${encodeURIComponent(article.title)}" target="_blank" class="share-twitter">X</a>
                <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title)}" target="_blank" class="share-linkedin">LinkedIn</a>
                <a href="https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.url)}" target="_blank" class="share-whatsapp">WhatsApp</a>
            </div>
        `;
        newsContainer.appendChild(articleElement);
    });
}

// Initial load
fetchNews().then(articles => displayNews(articles));

// Search functionality
document.querySelector('.search-bar button').addEventListener('click', async () => {
    document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
    document.querySelector('nav a[data-category="all"]').classList.add('active');
    currentCategory = 'all';
    page = 1;
    const query = document.querySelector('.search-bar input').value;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}`;
    try {
        document.querySelector('.loading-spinner').style.display = 'block';
        const response = await fetch(url);
        const data = await response.json();
        document.querySelector('.loading-spinner').style.display = 'none';
        displayNews(data.articles);
    } catch (error) {
        console.error('Error searching news:', error);
        document.querySelector('.loading-spinner').style.display = 'none';
    }
});

// Dark mode toggle with smooth animation
document.getElementById('dark-mode-btn').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('dark-mode-btn').textContent = isDark ? 'Light Mode' : 'Dark Mode';
});

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('dark-mode-btn').textContent = 'Light Mode';
}

// Category filtering with AJAX
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.getAttribute('data-category');
        page = 1;
        const articles = await fetchNews(currentCategory, page);
        displayNews(articles);
    });
});

// Infinite scroll
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && !loading) {
        loading = true;
        const spinner = document.createElement('div');
        spinner.classList.add('loading-spinner');
        spinner.textContent = 'Loading more...';
        document.querySelector('.news-container').appendChild(spinner);
        page++;
        fetchNews(currentCategory, page).then(articles => {
            displayNews(articles, true);
            spinner.remove();
            loading = false;
        }).catch(() => {
            spinner.remove();
            loading = false;
        });
    }
});

// Hamburger menu toggle
document.getElementById('hamburger-btn').addEventListener('click', () => {
    document.getElementById('nav-menu').classList.toggle('show');
});

// Back to top button
window.addEventListener('scroll', () => {
    document.getElementById('back-to-top').style.display = window.scrollY > 300 ? 'block' : 'none';
});

document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});